import { apiClient } from '../client';
import type { DataRequest } from '../types';
import type { SelectOption } from '../../types/moduleConfig';

export const dataApi = {
  dataEndpoint: async (
    module: string,
    operation: string,
    request: DataRequest
  ): Promise<Record<string, unknown>> => {
    const response = await apiClient.post<Record<string, unknown>>(
      `/data/${module}/${operation}`,
      request
    );
    return response.data;
  },

  listFunctions: async (module: string): Promise<Record<string, unknown>> => {
    const response = await apiClient.get<Record<string, unknown>>(`/data/functions/${module}`);
    return response.data;
  },

  batchEndpoint: async (requests: DataRequest[]): Promise<Record<string, unknown>> => {
    const response = await apiClient.post<Record<string, unknown>>('/data/batch', requests);
    return response.data;
  },

  selectOptions: async (
    entity: string,
    fieldKey: string,
    values: Record<string, string | number | null> = {}
  ): Promise<SelectOption[]> => {
    const response = await apiClient.post<{ data: SelectOption[] }>('/select/options', {
      entity,
      fieldKey,
      values,
    });
    return response.data?.data || [];
  },
};