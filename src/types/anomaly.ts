export interface AnomalousFeature {
  name: string;
  value: number;
  normalRange: [number, number];
  severity: number;
  zScore: number;
  contribution: number; // Percentage contribution to anomaly score (0-100)
}

export interface AnomalyDataPoint {
  customerId: number;
  customerName: string;
  anomalyScore: number; // 0-1
  severity: number; // 1-5
  region: string;
  state: string;
  country: string;
  detectionDate: string; // ISO
  transactionCount: number;
  totalAmount: number;
  avgAmount: number;
  segment: string;
  features: AnomalousFeature[];
}

export interface SeverityDistributionItem {
  level: number; // 1-5
  count: number;
  percentage: number; // 0-100
  color: string; // hex
}

export interface FeatureContributionSummary {
  featureName: string;
  importance: number; // 0-100
  anomalousMean: number;
  anomalousStd: number;
  separationIndex: number;
}

export interface AnomalyKPI {
  anomalyRate: number; // percent
  anomalyRateTrend: number; // delta percent (optional trend)
  highSeverityCount: number;
  topAnomalousFeature: string;
  meanAnomalyScore: number;
  meanAnomalyScoreTrend: number;
  newAnomalies24h: number;
}

export interface AnomalyDashboardData {
  anomalies: AnomalyDataPoint[];
  severityDistribution: SeverityDistributionItem[];
  featureContributions: FeatureContributionSummary[];
  kpis: AnomalyKPI;
}

export interface AnomalyFilters {
  severityLevels?: number[]; // 1-5
  regions?: string[];
  dateRange?: { start: string | null; end: string | null };
}

// Additional analytics types used by dashboard components
export interface RegionDistributionItem {
  name: string;
  anomalies: number;
  total: number;
  rate: number; // anomalies / total * 100
}

export interface CategoryDistributionItem {
  name: string;
  anomalies: number;
  rate: number; // percent
  trend: 'up' | 'down' | 'stable';
}

export interface SegmentSummaryItem {
  name: string; // segment label
  count: number; // total customers in segment
  anomalyRate: number; // percent anomalous
}

export interface TimeSeriesPoint {
  date: string; // ISO date (YYYY-MM-DD)
  anomalyScore: number; // normalized 0-1 aggregate score
  transactionCount: number;
  totalAmount: number;
  uniqueProducts: number;
}

export interface CustomerComparisonItem {
  metric: string;
  customer: number;
  peer: number;
  difference: number; // percent difference (customer vs peer)
  trend: 'up' | 'down' | 'stable';
}

export interface RiskAlertAction {
  action: string;
  confidence: number; // 0-1
  status: 'recommended' | 'optional';
}

export interface RiskAlertItem {
  id: string;
  customerId: number;
  customer: string;
  riskScore: number; // 0-1
  priority: 'Critical' | 'High' | 'Medium';
  impact: number; // currency amount
  actions: RiskAlertAction[];
  timeToActHours: number;
  category: string;
}

export interface ForecastOverviewItem {
  title: string;
  value: number;
  change: number; // delta vs prior period (can be 0 if unavailable)
  icon: 'AlertTriangle' | 'TrendingDown' | 'TrendingUp' | 'Users';
  color: string; // tailwind color class e.g. text-red-500
}

export interface PerCustomerForecastItem {
  customerId: number;
  customer: string;
  currentScore: number;
  nextWeekScore: number;
  nextMonthScore: number;
  churnRisk: number; // 0-1
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number; // 0-1
}

export type FeatureKey =
  | 'transactionCount'
  | 'totalAmount'
  | 'avgAmount'
  | 'uniqueProducts'
  | 'daysSinceLastTransaction'
  | 'avgDaysBetweenTransactions';

export interface BaselineFeatureStats {
  name: FeatureKey;
  mean: number;
  std: number;
  min: number;
  max: number;
}

export interface CustomerFeatureSnapshot {
  customerId: number;
  customerName: string;
  featureValues: Record<FeatureKey, number>;
}


