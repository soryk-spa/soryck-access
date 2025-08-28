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
      setError(null);
      const endpoint = isAdmin ? '/api/admin/dashboard/stats' : '/api/dashboard/stats';
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permisos para acceder a estas estadísticas');
        } else if (response.status === 401) {
          throw new Error('Debes iniciar sesión para acceder a estas estadísticas');
        } else {
          throw new Error(`Error al cargar estadísticas (${response.status})`);
        }
      }
      
      const result = await response.json();
      
      if (isAdmin) {
        setData(result);
      } else {
        setData({ monthlyStats: result });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}
