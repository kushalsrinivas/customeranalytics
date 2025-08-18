import { CustomerBehaviorData } from '@/types/customer-behavior';

// Client-side function to fetch customer behavior data from API
export async function getCustomerBehaviorData(
  timeRange: string = 'quarterly',
  segment?: string
): Promise<CustomerBehaviorData> {
  try {
    const params = new URLSearchParams({
      timeRange,
      ...(segment && { segment })
    });

    const response = await fetch(`/api/customer-behavior?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: CustomerBehaviorData = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching customer behavior data:', error);
    
    // Fallback to empty data structure
    return {
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
      timeRange,
      segment
    };
  }
}
