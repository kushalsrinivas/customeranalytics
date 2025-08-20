import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { CustomerBehaviorData, BehaviorPattern, CategoryAffinity, ChannelUsage, EngagementData, BehaviorKPI } from '@/types/customer-behavior';

interface CustomerRecord {
  customer_id: number;
  customer_name: string;
  customer_type: string;
  customer_category: number;
  customer_status: number;
  loyalty_status: string;
  customer_since: string;
  last_activity_date: string;
}

interface TransactionRecord {
  customer_id: number;
  transaction_date: string;
  sales_amount: number;
  quantity: number;
  item_id: number;
  sales_channel: string;
  product_category: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'quarterly';
    const segment = searchParams.get('segment') || undefined;
    const productCategory = searchParams.get('productCategory') || undefined;
    const customerId = searchParams.get('customerId') || undefined;

    // Connect to SQLite database
    const dbPath = path.join(process.cwd(), 'src', 'lib', 'customers.db');
    const db = new Database(dbPath, { readonly: true });

    // Parse time period to get date range
    const { startDate, endDate } = parseTimePeriod(timeRange);

    // Fetch customer data
    const customerData = fetchCustomerData(db, segment, customerId);
    
    // Fetch transaction data for the specified time period
    const transactionData = fetchTransactionData(db, startDate, endDate, segment, productCategory, customerId);

    // Close database connection
    db.close();

    // Process the data to calculate behavior patterns
    const processedData = await processCustomerBehaviorData(customerData, transactionData);

    const result: CustomerBehaviorData = {
      ...processedData,
      timeRange,
      segment
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching customer behavior data:', error);
    
    // Return fallback data structure
    const fallbackData: CustomerBehaviorData = {
      kpis: {
        avgPurchaseInterval: 0,
        avgOrderValue: 0,
        categoryDiversity: 0,
        dominantChannel: 'Unknown',
        dominantChannelPct: 0,
        churnRiskPct: 0
      },
      patterns: [],
      categoryAffinities: [],
      channelUsage: [],
      engagementData: [],
      timeRange: 'quarterly',
      segment: undefined
    };

    return NextResponse.json(fallbackData, { status: 500 });
  }
}

function parseTimePeriod(timeRange: string): { startDate: string; endDate: string } {
  const referenceDate = new Date('2021-01-01'); // Use 2021 as reference since we have data from 2019-2021
  let startDate: Date;
  let endDate: Date;

  if (timeRange.includes(':')) {
    // Date range format: YYYY-MM-DD:YYYY-MM-DD
    const dates = timeRange.split(':');
    startDate = new Date(dates[0]);
    endDate = new Date(dates[1]);
  } else {
    switch (timeRange) {
      case 'monthly':
        startDate = new Date(referenceDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = referenceDate;
        break;
      case 'quarterly':
        startDate = new Date(referenceDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        endDate = referenceDate;
        break;
      case 'annual':
      case 'yearly':
        startDate = new Date(referenceDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        endDate = referenceDate;
        break;
      default:
        startDate = new Date(referenceDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        endDate = referenceDate;
    }
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

function fetchCustomerData(db: Database.Database, segment?: string, customerId?: string): CustomerRecord[] {
  let query = `
    SELECT DISTINCT
      c.[Customer Key] as customer_id,
      c.[Customer Name] as customer_name,
      c.[Customer Type Desc] as customer_type,
      c.[Customer Category Hrchy Code] as customer_category,
      c.[Customer Status] as customer_status,
      COALESCE(cl.[Loyalty Status], 'Unknown') as loyalty_status,
      cl.[First Activity Date] as customer_since,
      cl.[Last Activity Date] as last_activity_date
    FROM dbo_D_Customer c
    LEFT JOIN dbo_F_Customer_Loyalty cl ON c.[Customer Key] = cl.[Entity Key]
    WHERE c.[Customer Key] > 0
  `;

  const params: any[] = [];
  
  if (segment) {
    query += ` AND c.[Customer Category Hrchy Code] = ?`;
    params.push(parseFloat(segment));
  }

  if (customerId) {
    query += ` AND c.[Customer Key] = ?`;
    params.push(parseInt(customerId));
  }

  query += ` LIMIT 1000`;

  const stmt = db.prepare(query);
  return stmt.all(...params) as CustomerRecord[];
}

function fetchTransactionData(db: Database.Database, startDate: string, endDate: string, segment?: string, productCategory?: string, customerId?: string): TransactionRecord[] {
  let query = `
    SELECT 
      [Customer Key] as customer_id,
      [Txn Date] as transaction_date,
      [Net Sales Amount] as sales_amount,
      [Net Sales Quantity] as quantity,
      [Item Key] as item_id,
      [Line Type] as sales_channel,
      [Item Category Hrchy Key] as product_category
    FROM dbo_F_Sales_Transaction
    WHERE [Txn Date] BETWEEN ? AND ?
      AND [Deleted Flag] = 0
      AND [Excluded Flag] = 0
      AND [Customer Key] > 0
      AND [Net Sales Amount] IS NOT NULL
      AND [Net Sales Quantity] IS NOT NULL
  `;

  const params: any[] = [startDate, endDate];

  if (segment) {
    query += ` AND [Customer Key] IN (
      SELECT [Customer Key] 
      FROM dbo_D_Customer 
      WHERE [Customer Category Hrchy Code] = ?
    )`;
    params.push(parseFloat(segment));
  }

  if (productCategory) {
    query += ` AND [Item Category Hrchy Key] = ?`;
    params.push(parseInt(productCategory));
  }

  if (customerId) {
    query += ` AND [Customer Key] = ?`;
    params.push(parseInt(customerId));
  }

  query += ` LIMIT 10000`;

  const stmt = db.prepare(query);
  return stmt.all(...params) as TransactionRecord[];
}

async function processCustomerBehaviorData(
  customerData: CustomerRecord[],
  transactionData: TransactionRecord[]
): Promise<Omit<CustomerBehaviorData, 'timeRange' | 'segment'>> {
  
  // Group transactions by customer
  const customerTransactions = new Map<number, TransactionRecord[]>();
  transactionData.forEach(transaction => {
    const customerId = transaction.customer_id;
    if (!customerTransactions.has(customerId)) {
      customerTransactions.set(customerId, []);
    }
    customerTransactions.get(customerId)!.push(transaction);
  });

  // Calculate behavior patterns
  const patterns: BehaviorPattern[] = [];
  const engagementData: EngagementData[] = [];

  for (const [customerId, transactions] of customerTransactions) {
    if (transactions.length < 2) continue; // Skip customers with less than 2 transactions

    // Sort transactions by date
    transactions.sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());

    const firstPurchase = new Date(transactions[0].transaction_date);
    const lastPurchase = new Date(transactions[transactions.length - 1].transaction_date);
    const totalSpend = transactions.reduce((sum, t) => sum + t.sales_amount, 0);
    const totalQuantity = transactions.reduce((sum, t) => sum + t.quantity, 0);
    const avgOrderValue = totalSpend / transactions.length;

    // Calculate frequency (transactions per month)
    const daysBetweenFirstAndLast = (lastPurchase.getTime() - firstPurchase.getTime()) / (1000 * 60 * 60 * 24);
    const frequency = daysBetweenFirstAndLast > 0 ? (transactions.length / (daysBetweenFirstAndLast / 30)) : transactions.length;

    // Calculate diversity (unique product categories)
    const uniqueCategories = new Set(transactions.map(t => t.product_category)).size;
    
    // Calculate recency (days since last purchase)
    const recency = Math.floor((Date.now() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate loyalty score (based on frequency and spend)
    const loyalty = Math.min(100, Math.round((frequency * 10) + (totalSpend / 100)));

    // Determine churn risk
    let churnRisk: 'low' | 'medium' | 'high' = 'low';
    if (recency > 90) churnRisk = 'high';
    else if (recency > 45) churnRisk = 'medium';

    patterns.push({
      customer_id: customerId.toString(),
      last_purchase_date: lastPurchase.toISOString().split('T')[0],
      frequency: Math.round(frequency * 10) / 10,
      avg_order_value: Math.round(avgOrderValue * 100) / 100,
      quantity: Math.round(totalQuantity / transactions.length),
      diversity: uniqueCategories,
      loyalty,
      recency,
      churn_risk: churnRisk
    });

    // Calculate engagement level
    let engagementLevel: 'champions' | 'loyal' | 'promising' | 'at_risk' = 'at_risk';
    if (frequency >= 2 && recency <= 30) engagementLevel = 'champions';
    else if (frequency >= 1 && recency <= 60) engagementLevel = 'loyal';
    else if (frequency >= 0.5 && recency <= 90) engagementLevel = 'promising';

    engagementData.push({
      customer_id: customerId.toString(),
      recency,
      frequency: Math.round(frequency * 10) / 10,
      engagement_level: engagementLevel,
      spend_volume: Math.round(totalSpend)
    });
  }

  // Calculate category affinities
  const categorySpend = new Map<number, { count: number; spend: number }>();
  transactionData.forEach(transaction => {
    const category = transaction.product_category;
    if (!categorySpend.has(category)) {
      categorySpend.set(category, { count: 0, spend: 0 });
    }
    const current = categorySpend.get(category)!;
    current.count += 1;
    current.spend += transaction.sales_amount;
  });

  const totalTransactions = transactionData.length;
  const categoryAffinities: CategoryAffinity[] = Array.from(categorySpend.entries())
    .map(([category, data]) => ({
      category: `Category ${category}`,
      count: data.count,
      spend: Math.round(data.spend),
      percentage: Math.round((data.count / totalTransactions) * 100 * 10) / 10
    }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 10); // Top 10 categories

  // Calculate channel usage
  const channelUsage = new Map<string, { count: number; spend: number }>();
  transactionData.forEach(transaction => {
    const channel = transaction.sales_channel || 'Unknown';
    if (!channelUsage.has(channel)) {
      channelUsage.set(channel, { count: 0, spend: 0 });
    }
    const current = channelUsage.get(channel)!;
    current.count += 1;
    current.spend += transaction.sales_amount;
  });

  const channelUsageArray: ChannelUsage[] = Array.from(channelUsage.entries())
    .map(([channel, data]) => ({
      channel,
      count: data.count,
      spend: Math.round(data.spend),
      percentage: Math.round((data.count / totalTransactions) * 100 * 10) / 10
    }))
    .sort((a, b) => b.count - a.count);

  // Calculate KPIs
  const avgPurchaseInterval = patterns.length > 0 
    ? Math.round(patterns.reduce((sum, p) => sum + (365 / (p.frequency || 1)), 0) / patterns.length)
    : 0;
  
  const avgOrderValue = patterns.length > 0
    ? Math.round(patterns.reduce((sum, p) => sum + p.avg_order_value, 0) / patterns.length * 100) / 100
    : 0;
  
  const categoryDiversity = patterns.length > 0
    ? Math.round(patterns.reduce((sum, p) => sum + p.diversity, 0) / patterns.length * 10) / 10
    : 0;
  
  const dominantChannel = channelUsageArray.length > 0 ? channelUsageArray[0] : { channel: 'Unknown', percentage: 0 };
  
  const churnRiskPct = patterns.length > 0
    ? Math.round((patterns.filter(p => p.churn_risk === 'high').length / patterns.length) * 100 * 10) / 10
    : 0;

  const kpis: BehaviorKPI = {
    avgPurchaseInterval,
    avgOrderValue,
    categoryDiversity,
    dominantChannel: dominantChannel.channel,
    dominantChannelPct: dominantChannel.percentage,
    churnRiskPct
  };

  return {
    kpis,
    patterns,
    categoryAffinities,
    channelUsage: channelUsageArray,
    engagementData
  };
}
