import { apiClient } from '../client';
import type {
  NavigationConfig,
  UserMenuItem,
  AppConfig,
  RouteDef,
  CustomPageConfig,
  SearchResponse,
  LaunchpadConfigResolved,
} from '../types';
import type { ModuleConfig } from '../../types/moduleConfig';

interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number | null;
    page?: number | null;
    page_size?: number | null;
    sort?: string | null;
    filter?: Record<string, unknown> | null;
  } | null;
}

export const configApi = {
  getNavigationConfig: async (): Promise<NavigationConfig> => {
    const response = await apiClient.get<ApiResponse<NavigationConfig>>('/config/navigation');
    return response.data.data;
  },

  getUserMenuConfig: async (): Promise<UserMenuItem[]> => {
    const response = await apiClient.get<ApiResponse<UserMenuItem[]>>('/config/user-menu');
    return response.data.data;
  },

  getAppsConfig: async (): Promise<Record<string, AppConfig>> => {
    const response = await apiClient.get<ApiResponse<Record<string, AppConfig>>>('/config/apps');
    return response.data.data;
  },

  getRoutes: async (): Promise<RouteDef[]> => {
    const response = await apiClient.get<ApiResponse<RouteDef[]>>('/config/routes');
    return response.data.data;
  },

  getPagesConfig: async (): Promise<Record<string, CustomPageConfig>> => {
    const response = await apiClient.get<ApiResponse<Record<string, CustomPageConfig>>>('/config/pages');
    return response.data.data;
  },

  getPageConfig: async (appKey: string, path: string): Promise<CustomPageConfig> => {
    const response = await apiClient.get<ApiResponse<CustomPageConfig>>(`/config/pages/${appKey}/${path}`);
    return response.data.data;
  },

  getPageContent: async (appKey: string, path: string): Promise<Record<string, unknown>> => {
    const response = await apiClient.get<Record<string, unknown>>(`/config/pages/${appKey}/${path}/content`);
    return response.data;
  },

  search: async (query: string, limit = 20): Promise<SearchResponse> => {
    const response = await apiClient.get<SearchResponse>('/config/search', { params: { q: query, limit } });
    return response.data;
  },

  getLaunchpadConfig: async (): Promise<LaunchpadConfigResolved> => {
    const response = await apiClient.get<LaunchpadConfigResolved>('/config/launchpad');
    return response.data;
  },

  listModules: async (): Promise<Record<string, string>> => {
    const response = await apiClient.get<Record<string, string>>('/config/modules');
    return response.data;
  },

  getModule: async (entity: string): Promise<ModuleConfig> => {
    const response = await apiClient.get<ModuleConfig>(`/config/modules/${entity}`);
    return response.data;
  },
};