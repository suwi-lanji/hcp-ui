import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/api/client';

interface UseModuleDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useModuleData<T = Record<string, unknown>>(module: string, id: string | undefined): UseModuleDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    if (!id || !module) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{ data: T } | T>(`/data/${module}/read`, {
        params: { id },
      });
      const payload = response.data;
      setData((payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload) as T);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [module, id]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
