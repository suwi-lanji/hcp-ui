import { useEffect, useState } from 'react';
import { useConfigStore } from '../stores/configStore';
import type { ModuleConfig } from '../types/moduleConfig';

export function useModuleConfig(entity: string | null) {
  const [fetchedConfig, setFetchedConfig] = useState<ModuleConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchModuleConfig = useConfigStore((s) => s.fetchModuleConfig);
  const cachedConfig = useConfigStore((s) => (entity ? s.moduleConfigs[entity] : null));

  // Derived state: prefer cached, fall back to last fetched result
  const config = cachedConfig ?? fetchedConfig;

  useEffect(() => {
    if (!entity || cachedConfig) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    fetchModuleConfig(entity)
      .then((result) => {
        if (cancelled) return;
        setFetchedConfig(result);
        if (!result) {
          setError('Module not found');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load module');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [entity, cachedConfig, fetchModuleConfig]);

  return { config, loading, error };
}
