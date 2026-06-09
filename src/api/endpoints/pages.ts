import { apiClient } from '../client';
import type { DataRequest } from '../types';

interface PageRenderResponse {
  [key: string]: unknown;
}

interface ActionResponse {
  [key: string]: unknown;
}

export const pagesApi = {
  renderPage: async (
    appKey: string,
    path: string,
    entity?: string,
    filters?: Record<string, unknown>
  ): Promise<PageRenderResponse> => {
    const response = await apiClient.get<PageRenderResponse>(
      `/pages/${appKey}/${path}/render`,
      { params: { entity, ...filters } }
    );
    return response.data;
  },

  executeAction: async (
    appKey: string,
    path: string,
    actionName: string,
    data?: DataRequest
  ): Promise<ActionResponse> => {
    const response = await apiClient.post<ActionResponse>(
      `/pages/${appKey}/${path}/action/${actionName}`,
      data
    );
    return response.data;
  },

  downloadPdf: async (appKey: string, path: string): Promise<Blob> => {
    const response = await apiClient.get(`/pages/${appKey}/${path}/download_pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};