import { useEffect } from 'react';
import { useConfigStore } from '../stores/configStore';
import { useAuth } from '../auth/AuthContext';

export function useConfigStoreInit() {
  const { isInitialized: storeInitialized, isLoading, fetchAll } = useConfigStore();
  const { user, isInitialized: authInitialized } = useAuth();

  useEffect(() => {
    if (authInitialized && user && !storeInitialized && !isLoading) {
      fetchAll();
    }
    // fetchAll is stable from Zustand store
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authInitialized, user, storeInitialized, isLoading]);

  return useConfigStore();
}

export function useConfig() {
  return useConfigStore();
}

export function useNavigation() {
  const { navigation } = useConfigStore();
  return navigation;
}

export function useUserMenu() {
  const { userMenu } = useConfigStore();
  return userMenu;
}

export function useApps() {
  const { apps } = useConfigStore();
  return apps;
}

export function useRoutes() {
  const { routes } = useConfigStore();
  return routes;
}

export function useLaunchpad() {
  const { launchpad } = useConfigStore();
  return launchpad;
}

export function useModules() {
  const { modules } = useConfigStore();
  return modules;
}
