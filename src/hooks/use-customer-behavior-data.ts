import { useState, useEffect } from 'react';
import { getCustomerBehaviorData } from '@/lib/customer-behavior-data';
import { CustomerBehaviorData } from '@/types/customer-behavior';

export function useCustomerBehaviorData(
  timeRange: string = 'quarterly',
  segment?: string,
  productCategory?: string,
  customerId?: string
) {
  const [data, setData] = useState<CustomerBehaviorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const behaviorData = await getCustomerBehaviorData(
          timeRange,
          segment,
          productCategory,
          customerId
        );
        setData(behaviorData);
      } catch (err) {
        console.error("Failed to fetch customer behavior data:", err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, segment, productCategory, customerId]);

  return { data, loading, error, refetch: () => fetchData() };
}
