// Powered by OnSpace.AI
import { useState, useEffect, useCallback } from 'react';
import { fetchRates, Rate } from '@/services/nbrbService';

interface UseRatesReturn {
  rates: Rate[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useRates(): UseRatesReturn {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRates();
      setRates(data);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e.message || 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { rates, loading, error, lastUpdated, refresh: load };
}
