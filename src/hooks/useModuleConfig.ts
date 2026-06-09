import { useEffect, useState } from 'react';
import { configApi } from '../api/endpoints/config';
import type { ModuleConfig } from '../types/moduleConfig';

interface UseModuleConfigResult {
  config: ModuleConfig | null;
  loading: boolean;
  error: string | null;
}

export function useModuleConfig(entity: string | null): UseModuleConfigResult {
  const [config, setConfig] = useState<ModuleConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(entity));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entity) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfig(null);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    configApi
      .getModule(entity)
      .then((result) => {
        if (cancelled) return;
        setConfig(result as ModuleConfig);
        if (!result) {
          setError('Module not found');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load module');
        setConfig(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [entity]);

  return { config, loading, error };
}
