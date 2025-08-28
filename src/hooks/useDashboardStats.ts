import { useState, useEffect, useCallback } from 'react';

interface MonthlyStats {
  name: string;
  ingresos: number;
  eventos: number;
  tickets?: number;
  usuarios?: number;
}

interface DashboardStats {
  monthlyStats: MonthlyStats[];
  totals?: {
    users: number;
    events: number;
    orders: number;
    revenue: number;
  };
}

export function useDashboardStats(isAdmin = false) {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/api/admin/dashboard/stats' : '/api/dashboard/stats';
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      const result = await response.json();
      
      if (isAdmin) {
        setData(result);
      } else {
        setData({ monthlyStats: result });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}
