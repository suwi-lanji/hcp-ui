import { create } from 'zustand';
import { configApi } from '../api/endpoints';
import type {
  NavigationConfig,
  UserMenuItem,
  AppConfig,
  RouteDef,
  LaunchpadConfigResolved,
} from '../api/types';

interface ConfigStore {
  navigation: NavigationConfig | null;
  userMenu: UserMenuItem[];
  apps: Record<string, AppConfig>;
  routes: RouteDef[];
  launchpad: LaunchpadConfigResolved | null;
  modules: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  isInitialized: boolean;
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  navigation: null,
  userMenu: [],
  apps: {},
  routes: [],
  launchpad: null,
  modules: {},
  isLoading: false,
  error: null,
  isInitialized: false,

  fetchAll: async () => {
    if (get().isLoading || get().isInitialized) return;

    set({ isLoading: true, error: null });

    try {
      const [navigation, userMenu, apps, routes, launchpad, modules] = await Promise.all([
        configApi.getNavigationConfig(),
        configApi.getUserMenuConfig(),
        configApi.getAppsConfig(),
        configApi.getRoutes(),
        configApi.getLaunchpadConfig(),
        configApi.listModules(),
      ]);

      set({
        navigation,
        userMenu,
        apps,
        routes,
        launchpad,
        modules,
        isLoading: false,
        isInitialized: true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load configuration';
      set({ error: message, isLoading: false });
    }
  },
}));
