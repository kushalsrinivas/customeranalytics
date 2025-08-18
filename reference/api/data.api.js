const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_DATABASE_URL
});

export default async function handler(req, res) {
  try {
    // 1. Purchase pattern metrics (frequency, recency, value, quantity, diversity, loyalty)
    const patternQuery = `
      SELECT 
        c."Customer Key" as customer_id,
        MAX(t."Txn Date") as last_purchase_date,
        COUNT(t."Sales Txn Key") as frequency,
        ROUND(AVG(t."Net Sales Amount")::numeric, 2) as avg_order_value,
        SUM(t."Net Sales Quantity") as quantity,
        COUNT(DISTINCT t."Item Category Hrchy Key") as diversity,
        'Unknown' as loyalty
      FROM dbo_d_customer c
      LEFT JOIN dbo_f_sales_transaction t ON c."Customer Key" = t."Customer Key"
      WHERE c."Customer Key" > 0
      GROUP BY c."Customer Key"
      HAVING COUNT(t."Sales Txn Key") > 0
    `;
    const patternsResult = await pool.query(patternQuery);
    const patterns = patternsResult.rows;

    // 2. Category affinity (category, count, spend)
    const categoryQuery = `
      SELECT 
        t."Item Category Hrchy Key" as category, 
        COUNT(*) as count, 
        SUM(t."Net Sales Amount") as spend
      FROM dbo_f_sales_transaction t
      WHERE t."Item Category Hrchy Key" IS NOT NULL
      GROUP BY t."Item Category Hrchy Key"
      ORDER BY spend DESC
      LIMIT 20
    `;
    const categoriesResult = await pool.query(categoryQuery);
    const categories = categoriesResult.rows;

    // 3. Channel usage (channel, count, spend)
    const channelQuery = `
      SELECT 
        t."Sales Organization Key" as channel, 
        COUNT(*) as count, 
        SUM(t."Net Sales Amount") as spend
      FROM dbo_f_sales_transaction t
      WHERE t."Sales Organization Key" IS NOT NULL
      GROUP BY t."Sales Organization Key"
      ORDER BY spend DESC
    `;
    const channelsResult = await pool.query(channelQuery);
    const channels = channelsResult.rows;

    // 4. Engagement (recency, frequency, spend, churn risk)
    const now = new Date();
    patterns.forEach(p => {
      const lastPurchaseDate = p.last_purchase_date ? new Date(p.last_purchase_date) : null;
      p.recency = lastPurchaseDate ? 
        Math.floor((now - lastPurchaseDate) / (1000 * 60 * 60 * 24)) : 
        999; // Large number for no purchases
      p.churn_risk = p.recency > 90 ? 'high' : p.recency > 30 ? 'medium' : 'low';
      
      // Convert BigInt and numeric types to proper numbers
      p.customer_id = parseInt(p.customer_id) || 0;
      p.frequency = parseInt(p.frequency) || 0;
      p.avg_order_value = parseFloat(p.avg_order_value) || 0;
      p.quantity = parseFloat(p.quantity) || 0;
      p.diversity = parseInt(p.diversity) || 0;
    });

    // Convert BigInt values to numbers for JSON serialization
    categories.forEach(c => {
      c.category = parseInt(c.category) || 0;
      c.count = parseInt(c.count) || 0;
      c.spend = parseFloat(c.spend) || 0;
    });

    channels.forEach(c => {
      c.channel = parseInt(c.channel) || 0;
      c.count = parseInt(c.count) || 0;
      c.spend = parseFloat(c.spend) || 0;
    });

    // 5. KPI metrics
    const avgPurchaseInterval = patterns.length > 0 ?
      patterns.reduce((sum, p) => sum + p.recency, 0) / patterns.length : 0;
    
    const avgOrderValue = patterns.length > 0 ?
      patterns.reduce((sum, p) => sum + p.avg_order_value, 0) / patterns.length : 0;
    
    const categoryDiversity = patterns.length > 0 ?
      patterns.reduce((sum, p) => sum + p.diversity, 0) / patterns.length : 0;
    
    const dominantChannel = channels[0]?.channel || 0;
    const totalChannelCount = channels.reduce((a, b) => a + b.count, 0);
    const dominantChannelPct = channels[0] && totalChannelCount > 0 ? 
      (channels[0].count / totalChannelCount) * 100 : 0;
    
    const churnRiskPct = patterns.length > 0 ?
      (patterns.filter(p => p.churn_risk === 'high').length / patterns.length) * 100 : 0;
    
    const kpis = {
      avgPurchaseInterval: Math.round(avgPurchaseInterval * 100) / 100,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      categoryDiversity: Math.round(categoryDiversity * 100) / 100,
      dominantChannel,
      dominantChannelPct: Math.round(dominantChannelPct * 100) / 100,
      churnRiskPct: Math.round(churnRiskPct * 100) / 100
    };

    res.status(200).json({
      status: 'success',
      patterns,
      categories,
      channels,
      kpis
    });
  } catch (error) {
    console.error('Error fetching customer behaviour data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch customer behaviour data',
      error: error.message
    });
  }
}