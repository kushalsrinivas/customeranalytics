import 'server-only'
import Database from 'better-sqlite3'
import path from 'path'
import {
  AnomalyDashboardData,
  AnomalyDataPoint,
  AnomalousFeature,
  AnomalyFilters,
  SeverityDistributionItem,
  FeatureContributionSummary,
  AnomalyKPI,
  RegionDistributionItem,
  CategoryDistributionItem,
  SegmentSummaryItem,
  TimeSeriesPoint,
  CustomerComparisonItem,
  RiskAlertItem,
  ForecastOverviewItem,
  PerCustomerForecastItem,
  BaselineFeatureStats,
  CustomerFeatureSnapshot,
  FeatureKey,
} from '@/types/anomaly'

type MetricRow = {
  customerId: number
  customerName: string
  state: string
  country: string
  region: string
  segment: string
  transactionCount: number
  totalAmount: number
  avgAmount: number
  uniqueProducts: number
  daysSinceLastTransaction: number
  avgDaysBetweenTransactions: number
}

type BaselineStats = {
  mean: number
  std: number
  min: number
  max: number
}

const SEVERITY_COLORS: Record<number, string> = {
  1: '#00e0ff',
  2: '#5fd4d6',
  3: '#5891cb',
  4: '#aa45dd',
  5: '#e930ff',
}

const FEATURE_KEYS = [
  'transactionCount',
  'totalAmount',
  'avgAmount',
  'daysSinceLastTransaction',
  'uniqueProducts',
  'avgDaysBetweenTransactions',
] as const

type FeatureKeyConst = (typeof FEATURE_KEYS)[number]

type BaselineMap = Record<FeatureKeyConst, BaselineStats>

export async function getAnomalyDashboardData(
  filters: AnomalyFilters = {}
): Promise<AnomalyDashboardData> {
  const dbPath = path.resolve(process.cwd(), 'src/lib/customers.db')
  const db = new Database(dbPath, { readonly: true })

  try {
    const metrics = getCustomerMetrics(db, filters)
    if (metrics.length === 0) {
      return emptyDashboard()
    }

    const baseline = calculateBaseline(metrics)
    const anomalies = calculateAnomalies(metrics, baseline)

    const filtered = applyFilters(anomalies, filters)

    const severityDistribution = calculateSeverityDistribution(filtered)
    const featureContributions = calculateFeatureContributions(filtered)
    const kpis = calculateKpis(filtered, metrics)

    return {
      anomalies: filtered.slice(0, 1000),
      severityDistribution,
      featureContributions,
      kpis,
    }
  } finally {
    db.close()
  }
}

// Extended data accessors for additional dashboard features

export async function getRegionDistribution(
  filters: AnomalyFilters = {}
): Promise<RegionDistributionItem[]> {
  const dbPath = path.resolve(process.cwd(), 'src/lib/customers.db')
  const db = new Database(dbPath, { readonly: true })
  try {
    const metrics = getCustomerMetrics(db, filters)
    if (metrics.length === 0) return []
    const baseline = calculateBaseline(metrics)
    const anomalies = applyFilters(calculateAnomalies(metrics, baseline), filters)

    const totalByRegion = new Map<string, number>()
    for (const m of metrics) {
      const key = m.region || 'Unknown'
      totalByRegion.set(key, (totalByRegion.get(key) ?? 0) + 1)
    }

    const anomalyByRegion = new Map<string, number>()
    for (const a of anomalies) {
      const key = a.region || 'Unknown'
      anomalyByRegion.set(key, (anomalyByRegion.get(key) ?? 0) + 1)
    }

    const regions: RegionDistributionItem[] = []
    for (const [name, total] of totalByRegion.entries()) {
      const anomaliesCount = anomalyByRegion.get(name) ?? 0
      regions.push({ name, anomalies: anomaliesCount, total, rate: total === 0 ? 0 : (anomaliesCount / total) * 100 })
    }
    regions.sort((a, b) => b.rate - a.rate)
    return regions
  } finally {
    db.close()
  }
}

export async function getCategoryDistribution(
  filters: AnomalyFilters = {}
): Promise<CategoryDistributionItem[]> {
  const dbPath = path.resolve(process.cwd(), 'src/lib/customers.db')
  const db = new Database(dbPath, { readonly: true })
  try {
    // Build anomaly customer list from current filters
    const metrics = getCustomerMetrics(db, filters)
    if (metrics.length === 0) return []
    const baseline = calculateBaseline(metrics)
    const anomalies = applyFilters(calculateAnomalies(metrics, baseline), filters)
    const anomalyIds = new Set(anomalies.map(a => a.customerId))

    let dateFilter = ''
    const params: (string | number)[] = []
    if (filters.dateRange?.start && filters.dateRange?.end) {
      dateFilter = 'AND st."Txn Date" >= ? AND st."Txn Date" <= ?'
      params.push(filters.dateRange.start, filters.dateRange.end)
    }

    const anomalyIdParams = metrics
      .filter(m => anomalyIds.has(m.customerId))
      .map(m => m.customerId)
    const placeholders = anomalyIdParams.length ? anomalyIdParams.map(() => '?').join(',') : 'NULL'

    const sql = `
      SELECT 
        COALESCE(st."Product Posting Group", 'Unknown') as category,
        COUNT(*) as total,
        SUM(CASE WHEN st."Customer Key" IN (${placeholders}) THEN 1 ELSE 0 END) as anomalyCount
      FROM "dbo_F_Sales_Transaction" st
      WHERE 1=1 ${dateFilter}
      GROUP BY COALESCE(st."Product Posting Group", 'Unknown')
      ORDER BY total DESC
      LIMIT 20
    `

    const stmt = db.prepare(sql)
    const rows = stmt.all(...anomalyIdParams, ...params) as { category: string; total: number; anomalyCount: number }[]

    // Compute simple trend: last 7 days vs previous 7 days anomaly rate
    function computeRateDelta(cat: string): number {
      const last7 = db.prepare(`
        SELECT 
          SUM(CASE WHEN st."Customer Key" IN (${placeholders}) THEN 1 ELSE 0 END) as a,
          COUNT(*) as t
        FROM "dbo_F_Sales_Transaction" st
        WHERE COALESCE(st."Product Posting Group", 'Unknown') = ?
          AND DATE(st."Txn Date") >= DATE('now', '-6 day')
      `).get(...anomalyIdParams, cat) as { a: number; t: number }
      const prev7 = db.prepare(`
        SELECT 
          SUM(CASE WHEN st."Customer Key" IN (${placeholders}) THEN 1 ELSE 0 END) as a,
          COUNT(*) as t
        FROM "dbo_F_Sales_Transaction" st
        WHERE COALESCE(st."Product Posting Group", 'Unknown') = ?
          AND DATE(st."Txn Date") BETWEEN DATE('now', '-13 day') AND DATE('now', '-7 day')
      `).get(...anomalyIdParams, cat) as { a: number; t: number }
      const r1 = last7 && last7.t ? (last7.a / last7.t) : 0
      const r0 = prev7 && prev7.t ? (prev7.a / prev7.t) : 0
      return r1 - r0
    }

    const categories: CategoryDistributionItem[] = rows.map(r => {
      const rate = r.total === 0 ? 0 : (r.anomalyCount / r.total) * 100
      const delta = computeRateDelta(r.category)
      const trend: CategoryDistributionItem['trend'] = delta > 0.01 ? 'up' : delta < -0.01 ? 'down' : 'stable'
      return { name: r.category, anomalies: r.anomalyCount, rate, trend }
    })
    return categories
  } finally {
    db.close()
  }
}

export async function getSegmentSummary(
  filters: AnomalyFilters = {}
): Promise<SegmentSummaryItem[]> {
  const dbPath = path.resolve(process.cwd(), 'src/lib/customers.db')
  const db = new Database(dbPath, { readonly: true })
  try {
    const metrics = getCustomerMetrics(db, filters)
    if (metrics.length === 0) return []
    const baseline = calculateBaseline(metrics)
    const anomalies = applyFilters(calculateAnomalies(metrics, baseline), filters)
    const anomalyIds = new Set(anomalies.map(a => a.customerId))

    const segMap = new Map<string, { total: number; anomalous: number }>()
    for (const m of metrics) {
      const seg = m.segment || 'Standard'
      const entry = segMap.get(seg) ?? { total: 0, anomalous: 0 }
      entry.total += 1
      if (anomalyIds.has(m.customerId)) entry.anomalous += 1
      segMap.set(seg, entry)
    }
    const out: SegmentSummaryItem[] = []
    for (const [name, { total, anomalous }] of segMap.entries()) {
      out.push({ name, count: total, anomalyRate: total === 0 ? 0 : (anomalous / total) * 100 })
    }
    out.sort((a, b) => b.anomalyRate - a.anomalyRate)
    return out
  } finally {
    db.close()
  }
}

export async function getTimeSeriesDaily(days: number): Promise<TimeSeriesPoint[]> {
  const dbPath = path.resolve(process.cwd(), 'src/lib/customers.db')
  const db = new Database(dbPath, { readonly: true })
  try {
    const sql = `
      SELECT substr(st."Txn Date",1,10) as d,
             COUNT(*) as transactionCount,
             COALESCE(SUM(st."Net Sales Amount"),0) as totalAmount,
             COUNT(DISTINCT st."Item Key") as uniqueProducts
      FROM "dbo_F_Sales_Transaction" st
      WHERE st."Txn Date" >= DATE('now', ?)
      GROUP BY d
      ORDER BY d ASC
    `
    const fromOffset = `-${Math.max(0, days - 1)} day`
    let rows = db.prepare(sql).all(fromOffset) as { d: string; transactionCount: number; totalAmount: number; uniqueProducts: number }[]
    // Fallback: if dataset has no recent dates relative to now, anchor to the latest date present
    if (rows.length === 0) {
      const maxRow = db
        .prepare('SELECT DATE(MAX(st."Txn Date")) as maxd FROM "dbo_F_Sales_Transaction" st')
        .get() as { maxd: string | null }
      if (!maxRow?.maxd) return []
      const endDate = maxRow.maxd
      const startDateObj = new Date(`${endDate}T00:00:00Z`)
      startDateObj.setDate(startDateObj.getDate() - Math.max(0, days - 1))
      const startDate = startDateObj.toISOString().slice(0, 10)
      rows = db
        .prepare(`
          SELECT substr(st."Txn Date",1,10) as d,
                 COUNT(*) as transactionCount,
                 COALESCE(SUM(st."Net Sales Amount"),0) as totalAmount,
                 COUNT(DISTINCT st."Item Key") as uniqueProducts
          FROM "dbo_F_Sales_Transaction" st
          WHERE DATE(st."Txn Date") BETWEEN ? AND ?
          GROUP BY d
          ORDER BY d ASC
        `)
        .all(startDate, endDate) as { d: string; transactionCount: number; totalAmount: number; uniqueProducts: number }[]
      if (rows.length === 0) return []
    }
    const counts = rows.map(r => r.transactionCount)
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length
    const variance = counts.reduce((a, b) => a + (b - mean) ** 2, 0) / counts.length
    const std = Math.sqrt(variance)
    const out: TimeSeriesPoint[] = rows.map(r => ({
      date: r.d,
      anomalyScore: std === 0 ? 0 : Math.min(Math.abs((r.transactionCount - mean) / std) / 3, 1),
      transactionCount: r.transactionCount,
      totalAmount: r.totalAmount,
      uniqueProducts: r.uniqueProducts,
    }))
    return out
  } finally {
    db.close()
  }
}

export async function getCustomerComparisonData(customerId: number): Promise<CustomerComparisonItem[]> {
  const dbPath = path.resolve(process.cwd(), 'src/lib/customers.db')
  const db = new Database(dbPath, { readonly: true })
  try {
    const metrics = getCustomerMetrics(db, {})
    const me = metrics.find(m => m.customerId === customerId)
    if (!me) return []
    const peers = metrics.filter(m => m.segment === me.segment && m.customerId !== customerId)
    const peerAvg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
    const peer = {
      avgAmount: peerAvg(peers.map(p => p.avgAmount)),
      transactionCount: peerAvg(peers.map(p => p.transactionCount)),
      uniqueProducts: peerAvg(peers.map(p => p.uniqueProducts)),
      avgDaysBetweenTransactions: peerAvg(peers.map(p => p.avgDaysBetweenTransactions)),
    }

    const items: CustomerComparisonItem[] = [
      { metric: 'Avg Transaction Value', customer: me.avgAmount, peer: peer.avgAmount, difference: pctDiff(me.avgAmount, peer.avgAmount), trend: trendFromDelta(me.avgAmount - peer.avgAmount) },
      { metric: 'Purchase Frequency (txns)', customer: me.transactionCount, peer: peer.transactionCount, difference: pctDiff(me.transactionCount, peer.transactionCount), trend: trendFromDelta(me.transactionCount - peer.transactionCount) },
      { metric: 'Product Variety (unique items)', customer: me.uniqueProducts, peer: peer.uniqueProducts, difference: pctDiff(me.uniqueProducts, peer.uniqueProducts), trend: trendFromDelta(me.uniqueProducts - peer.uniqueProducts) },
      { metric: 'Avg Days Between Txns', customer: me.avgDaysBetweenTransactions, peer: peer.avgDaysBetweenTransactions, difference: pctDiff(me.avgDaysBetweenTransactions, peer.avgDaysBetweenTransactions), trend: trendFromDelta(peer.avgDaysBetweenTransactions - me.avgDaysBetweenTransactions) },
    ]
    return items
  } finally {
    db.close()
  }
}

export async function getCustomerFeatureImportance(
  customerId: number
): Promise<AnomalousFeature[]> {
  const dbPath = path.resolve(process.cwd(), 'src/lib/customers.db')
  const db = new Database(dbPath, { readonly: true })
  try {
    const metrics = getCustomerMetrics(db, {})
    if (metrics.length === 0) return []
    const baseline = calculateBaseline(metrics)
    const anomaly = computeAnomalyForRow(metrics.find(m => m.customerId === customerId)!, baseline)
    return anomaly?.features?.slice().sort((a, b) => b.contribution - a.contribution) ?? []
  } finally {
    db.close()
  }
}

export async function getRiskAlerts(limit = 10): Promise<RiskAlertItem[]> {
  const dbPath = path.resolve(process.cwd(), 'src/lib/customers.db')
  const db = new Database(dbPath, { readonly: true })
  try {
    const metrics = getCustomerMetrics(db, {})
    if (metrics.length === 0) return []
    const baseline = calculateBaseline(metrics)
    const anomalies = calculateAnomalies(metrics, baseline)
    const sorted = anomalies
      .slice()
      .sort((a, b) => b.anomalyScore * b.totalAmount - a.anomalyScore * a.totalAmount)
      .slice(0, limit)
    const alerts: RiskAlertItem[] = sorted.map((a, idx) => ({
      id: `ALT_${String(idx + 1).padStart(3, '0')}`,
      customerId: a.customerId,
      customer: a.customerName,
      riskScore: a.anomalyScore,
      priority: a.severity >= 5 ? 'Critical' : a.severity >= 4 ? 'High' : 'Medium',
      impact: a.totalAmount,
      actions: suggestActionsFor(a),
      timeToActHours: a.severity >= 5 ? 2 : a.severity >= 4 ? 6 : 24,
      category: categorizeAnomaly(a),
    }))
    return alerts
  } finally {
    db.close()
  }
}

export async function getForecasts(): Promise<{
  overview: ForecastOverviewItem[];
  perCustomer: PerCustomerForecastItem[];
}> {
  const dbPath = path.resolve(process.cwd(), 'src/lib/customers.db')
  const db = new Database(dbPath, { readonly: true })
  try {
    const metrics = getCustomerMetrics(db, {})
    if (metrics.length === 0) return { overview: [], perCustomer: [] }
    const baseline = calculateBaseline(metrics)
    const anomalies = calculateAnomalies(metrics, baseline)
    const top = anomalies.slice().sort((a, b) => b.anomalyScore - a.anomalyScore).slice(0, 3)

    const perCustomer: PerCustomerForecastItem[] = []
    for (const a of top) {
      const daily = db.prepare(`
        SELECT DATE(st."Txn Date") as d, COUNT(*) as cnt
        FROM "dbo_F_Sales_Transaction" st
        WHERE st."Customer Key" = ? AND DATE(st."Txn Date") >= DATE('now', '-30 day')
        GROUP BY DATE(st."Txn Date")
        ORDER BY d ASC
      `).all(a.customerId) as { d: string; cnt: number }[]
      const n = daily.length
      const slope = n > 1 ? linearSlope(daily.map((r, i) => [i, r.cnt])) : 0
      const delta = Math.max(-0.15, Math.min(0.15, slope / 100))
      const nextWeekScore = clamp01(a.anomalyScore + delta)
      const nextMonthScore = clamp01(a.anomalyScore + delta * 2)
      const variability = stdDev(daily.map(r => r.cnt))
      const confidence = clamp01(1 - variability / (Math.max(1, avg(daily.map(r => r.cnt))) * 2))
      const trend: PerCustomerForecastItem['trend'] = delta > 0.01 ? 'increasing' : delta < -0.01 ? 'decreasing' : 'stable'
      const churnRisk = clamp01(0.5 * a.anomalyScore + 0.5 * (a.severity / 5))
      perCustomer.push({
        customerId: a.customerId,
        customer: a.customerName,
        currentScore: a.anomalyScore,
        nextWeekScore,
        nextMonthScore,
        churnRisk,
        trend,
        confidence,
      })
    }

    const overview: ForecastOverviewItem[] = [
      { title: 'High-Risk Customers Next Week', value: perCustomer.filter(p => p.nextWeekScore >= 0.8).length, change: 0, icon: 'AlertTriangle', color: 'text-red-500' },
      { title: 'Predicted Churn Cases', value: perCustomer.filter(p => p.churnRisk >= 0.7).length, change: 0, icon: 'TrendingDown', color: 'text-orange-500' },
      { title: 'New Anomaly Patterns', value: 0, change: 0, icon: 'TrendingUp', color: 'text-blue-500' },
      { title: 'Customers at Risk', value: perCustomer.length, change: 0, icon: 'Users', color: 'text-purple-500' },
    ]

    return { overview, perCustomer }
  } finally {
    db.close()
  }
}

export async function getSimulationBaselines(
  customerId: number
): Promise<{ baseline: BaselineFeatureStats[]; current: CustomerFeatureSnapshot | null }> {
  const dbPath = path.resolve(process.cwd(), 'src/lib/customers.db')
  const db = new Database(dbPath, { readonly: true })
  try {
    const metrics = getCustomerMetrics(db, {})
    if (metrics.length === 0) return { baseline: [], current: null }
    const baseline = calculateBaseline(metrics)
    const baselineArr: BaselineFeatureStats[] = (FEATURE_KEYS as readonly string[]).map(name => {
      const stats = baseline[name as FeatureKeyConst]
      return { name: name as FeatureKey, mean: stats.mean, std: stats.std, min: stats.min, max: stats.max }
    })
    const me = metrics.find(m => m.customerId === customerId)
    const current: CustomerFeatureSnapshot | null = me
      ? {
          customerId: me.customerId,
          customerName: me.customerName,
          featureValues: {
            transactionCount: me.transactionCount,
            totalAmount: me.totalAmount,
            avgAmount: me.avgAmount,
            uniqueProducts: me.uniqueProducts,
            daysSinceLastTransaction: me.daysSinceLastTransaction,
            avgDaysBetweenTransactions: me.avgDaysBetweenTransactions,
          },
        }
      : null
    return { baseline: baselineArr, current }
  } finally {
    db.close()
  }
}

// Helpers
function pctDiff(a: number, b: number): number {
  if (!isFinite(a) || !isFinite(b) || b === 0) return 0
  return ((a - b) / Math.abs(b)) * 100
}

function trendFromDelta(delta: number): 'up' | 'down' | 'stable' {
  return delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable'
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x))
}

function avg(arr: number[]): number { return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0 }
function stdDev(arr: number[]): number { const m = avg(arr); return Math.sqrt(avg(arr.map(v => (v - m) ** 2))) }
function linearSlope(points: Array<[number, number]>): number {
  const n = points.length
  const sx = points.reduce((s, [x]) => s + x, 0)
  const sy = points.reduce((s, [, y]) => s + y, 0)
  const sxx = points.reduce((s, [x]) => s + x * x, 0)
  const sxy = points.reduce((s, [x, y]) => s + x * y, 0)
  const denom = n * sxx - sx * sx
  if (denom === 0) return 0
  return (n * sxy - sx * sy) / denom
}

function suggestActionsFor(a: AnomalyDataPoint): { action: string; confidence: number; status: 'recommended' | 'optional' }[] {
  const top = a.features.slice().sort((x, y) => y.contribution - x.contribution)[0]
  const actions: Array<{ action: string; confidence: number; status: 'recommended' | 'optional' }> = []
  if (!top) return actions
  switch (top.name) {
    case 'daysSinceLastTransaction':
      actions.push({ action: 'Reach out to re-engage customer', confidence: 0.85, status: 'recommended' })
      break
    case 'uniqueProducts':
      actions.push({ action: 'Recommend broader product variety', confidence: 0.8, status: 'recommended' })
      break
    case 'totalAmount':
      actions.push({ action: 'Review for potential fraud/spend spike', confidence: 0.88, status: 'recommended' })
      break
    default:
      actions.push({ action: 'Flag for manual review', confidence: 0.75, status: 'recommended' })
  }
  actions.push({ action: 'Monitor next 3 transactions', confidence: 0.6, status: 'optional' })
  return actions
}

function categorizeAnomaly(a: AnomalyDataPoint): string {
  const top = a.features.slice().sort((x, y) => y.contribution - x.contribution)[0]
  if (!top) return 'Behavioral Risk'
  if (top.name === 'totalAmount' || top.name === 'avgAmount') return 'Spend Risk'
  if (top.name === 'uniqueProducts') return 'Behavioral Drift'
  if (top.name === 'daysSinceLastTransaction') return 'Churn Risk'
  return 'General Anomaly'
}

function emptyDashboard(): AnomalyDashboardData {
  return {
    anomalies: [],
    severityDistribution: [],
    featureContributions: [],
    kpis: {
      anomalyRate: 0,
      anomalyRateTrend: 0,
      highSeverityCount: 0,
      topAnomalousFeature: 'None',
      meanAnomalyScore: 0,
      meanAnomalyScoreTrend: 0,
      newAnomalies24h: 0,
    },
  }
}

function getCustomerMetrics(db: Database.Database, filters: AnomalyFilters): MetricRow[] {
  const { dateRange } = filters

  let dateFilter = ''
  const params: (string | number)[] = []

  if (dateRange?.start && dateRange?.end) {
    dateFilter = 'AND st."Txn Date" >= ? AND st."Txn Date" <= ?'
    params.push(dateRange.start, dateRange.end)
  }

  const sql = `
      SELECT 
        c."Customer Key"        as customerId,
        c."Customer Name"       as customerName,
        c."Customer State/Prov" as state,
        c."Customer Country"    as country,
        c."Market Desc"         as region,
        c."Monetary Band"       as segment,
        COUNT(st."Sales Txn Key")                                   as transactionCount,
        COALESCE(SUM(st."Net Sales Amount"), 0)                     as totalAmount,
        COALESCE(AVG(st."Net Sales Amount"), 0)                     as avgAmount,
        COUNT(DISTINCT st."Item Key")                                as uniqueProducts,
        JULIANDAY('now') - MAX(JULIANDAY(st."Txn Date"))            as daysSinceLastTransaction,
        CASE 
          WHEN COUNT(st."Sales Txn Key") > 1 
            THEN (JULIANDAY(MAX(st."Txn Date")) - JULIANDAY(MIN(st."Txn Date"))) / (COUNT(st."Sales Txn Key") - 1)
            ELSE 0 
        END as avgDaysBetweenTransactions
      FROM "dbo_D_Customer" c
      LEFT JOIN "dbo_F_Sales_Transaction" st ON c."Customer Key" = st."Customer Key"
      WHERE c."Sales Activity Flag" = 1 ${dateFilter}
      GROUP BY c."Customer Key", c."Customer Name", c."Customer State/Prov", 
               c."Customer Country", c."Market Desc", c."Monetary Band"
      HAVING COUNT(st."Sales Txn Key") > 0
      ORDER BY totalAmount DESC
      LIMIT 5000
    `

  const stmt = db.prepare(sql)
  const rows = stmt.all(...params) as MetricRow[]
  return rows
}

function calculateBaseline(rows: MetricRow[]): BaselineMap {
  const baseline = {} as BaselineMap
  for (const feature of FEATURE_KEYS) {
    const values = rows
      .map((r) => r[feature as keyof MetricRow] as unknown as number)
      .filter((v) => Number.isFinite(v)) as number[]

    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
    const std = Math.sqrt(variance)
    baseline[feature] = { mean, std, min: Math.min(...values), max: Math.max(...values) }
  }
  return baseline
}

function computeAnomalyForRow(
  row: MetricRow,
  baseline: BaselineMap
) {
  let scoreSum = 0
  const features: AnomalousFeature[] = []

  for (const feature of FEATURE_KEYS) {
    const value = row[feature as keyof MetricRow] as unknown as number
    const stats = baseline[feature]
    const z = stats.std === 0 ? 0 : Math.abs((value - stats.mean) / stats.std)
    const contribution01 = Math.min(z / 3, 1)
    scoreSum += contribution01
    features.push({
      name: feature,
      value,
      normalRange: [stats.mean - 2 * stats.std, stats.mean + 2 * stats.std],
      severity: Math.min(Math.ceil(z), 5),
      zScore: z,
      contribution: contribution01 * 100,
    })
  }

  const score = Math.min(scoreSum / FEATURE_KEYS.length, 1)
  const severity = Math.min(Math.ceil(score * 5), 5)

  const anomaly: AnomalyDataPoint = {
    customerId: row.customerId,
    customerName: row.customerName,
    anomalyScore: score,
    severity,
    region: row.region || 'Unknown',
    state: row.state || 'Unknown',
    country: row.country || 'Unknown',
    detectionDate: new Date().toISOString(),
    transactionCount: row.transactionCount,
    totalAmount: row.totalAmount,
    avgAmount: row.avgAmount,
    segment: row.segment || 'Standard',
    features,
  }

  return anomaly
}

function calculateAnomalies(
  rows: MetricRow[],
  baseline: BaselineMap
): AnomalyDataPoint[] {
  return rows.map((r) => computeAnomalyForRow(r, baseline))
}

function applyFilters(
  anomalies: AnomalyDataPoint[],
  filters: AnomalyFilters
): AnomalyDataPoint[] {
  let out = anomalies
  // Apply anomaly gates first: score/severity thresholds if provided; default to sensible cutoff
  const minScore = typeof filters.minScore === 'number' ? filters.minScore : 0.2
  const minSeverity = typeof filters.minSeverity === 'number' ? filters.minSeverity : 1
  out = out.filter(a => a.anomalyScore >= minScore && a.severity >= minSeverity)
  if (filters.severityLevels && filters.severityLevels.length > 0) {
    out = out.filter((a) => filters.severityLevels!.includes(a.severity))
  }
  if (filters.regions && filters.regions.length > 0) {
    out = out.filter((a) => filters.regions!.includes(a.region))
  }
  return out
}

function calculateSeverityDistribution(anomalies: AnomalyDataPoint[]): SeverityDistributionItem[] {
  if (anomalies.length === 0) return []
  const levels = [1, 2, 3, 4, 5]
  return levels.map((level) => {
    const count = anomalies.filter((a) => a.severity === level).length
    return {
      level,
      count,
      percentage: (count / anomalies.length) * 100,
      color: SEVERITY_COLORS[level],
    }
  })
}

function calculateFeatureContributions(anomalies: AnomalyDataPoint[]): FeatureContributionSummary[] {
  const map = new Map<
    string,
    { contributions: number[]; anomalousValues: number[] }
  >()
  for (const a of anomalies) {
    for (const f of a.features) {
      if (!map.has(f.name)) {
        map.set(f.name, { contributions: [], anomalousValues: [] })
      }
      const agg = map.get(f.name)!
      agg.contributions.push(f.contribution)
      agg.anomalousValues.push(f.value)
    }
  }
  const summaries: FeatureContributionSummary[] = []
  for (const [name, agg] of map.entries()) {
    const mean = agg.anomalousValues.reduce((s, v) => s + v, 0) / agg.anomalousValues.length
    const variance =
      agg.anomalousValues.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / agg.anomalousValues.length
    const std = Math.sqrt(variance)
    const importance = agg.contributions.reduce((s, v) => s + v, 0) / agg.contributions.length
    summaries.push({
      featureName: name,
      importance,
      anomalousMean: mean,
      anomalousStd: std,
      separationIndex: importance / 100,
    })
  }
  summaries.sort((a, b) => b.importance - a.importance)
  return summaries
}

function calculateKpis(
  anomalies: AnomalyDataPoint[],
  allCustomers: MetricRow[]
): AnomalyKPI {
  const totalCustomers = allCustomers.length
  const anomalyRate = totalCustomers === 0 ? 0 : (anomalies.length / totalCustomers) * 100
  const highSeverityCount = anomalies.filter((a) => a.severity >= 4).length
  const meanAnomalyScore =
    anomalies.length === 0
      ? 0
      : anomalies.reduce((sum, a) => sum + a.anomalyScore, 0) / anomalies.length

  const topFeature = calculateFeatureContributions(anomalies)[0]?.featureName ?? 'None'

  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)
  const newAnomalies24h = anomalies.filter((a) => new Date(a.detectionDate) > oneDayAgo).length

  return {
    anomalyRate,
    anomalyRateTrend: 0,
    highSeverityCount,
    topAnomalousFeature: topFeature,
    meanAnomalyScore,
    meanAnomalyScoreTrend: 0,
    newAnomalies24h,
  }
}


