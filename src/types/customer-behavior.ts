export interface BehaviorPattern {
  customer_id: string;
  last_purchase_date: string;
  frequency: number;
  avg_order_value: number;
  quantity: number;
  diversity: number;
  loyalty: number;
  recency: number;
  churn_risk: 'low' | 'medium' | 'high';
}

export interface CategoryAffinity {
  category: string;
  count: number;
  spend: number;
  percentage: number;
}

export interface ChannelUsage {
  channel: string;
  count: number;
  spend: number;
  percentage: number;
}

export interface BehaviorKPI {
  avgPurchaseInterval: number;
  avgOrderValue: number;
  categoryDiversity: number;
  dominantChannel: string;
  dominantChannelPct: number;
  churnRiskPct: number;
}

export interface EngagementData {
  customer_id: string;
  recency: number;
  frequency: number;
  engagement_level: 'champions' | 'loyal' | 'promising' | 'at_risk';
  spend_volume: number;
}

export interface CustomerBehaviorData {
  kpis: BehaviorKPI;
  patterns: BehaviorPattern[];
  categoryAffinities: CategoryAffinity[];
  channelUsage: ChannelUsage[];
  engagementData: EngagementData[];
  timeRange: string;
  segment?: string;
}
