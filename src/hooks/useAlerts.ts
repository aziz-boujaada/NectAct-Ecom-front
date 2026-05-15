import { useEffect, useState, useCallback } from 'react';
import { listAlerts } from '../api/catalog';
import type { Alert } from '../types';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listAlerts();
      setAlerts(data || []);
      setLastFetch(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch alerts on mount
    fetchAlerts();

    // Poll for new alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);

    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const unreadCount = alerts.filter((alert) => alert.is_read === 0).length;
  const lowStockAlerts = alerts.filter((alert) => alert.type === 'low_stock');
  const outOfStockAlerts = alerts.filter((alert) => alert.type === 'out_of_stock');

  return {
    alerts,
    loading,
    error,
    unreadCount,
    lowStockAlerts,
    outOfStockAlerts,
    refetch: fetchAlerts,
    lastFetch,
  };
}
