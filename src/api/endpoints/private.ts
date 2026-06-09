import { apiClient } from '../client';

export const privateApi = {
  getServerInfo: async (): Promise<Record<string, unknown>> => {
    const response = await apiClient.get<Record<string, unknown>>('/private/server-info');
    return response.data;
  },
};