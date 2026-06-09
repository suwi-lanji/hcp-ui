import { apiClient } from '../client';
import type { Message } from '../types';

export const utilsApi = {
  healthCheck: async (): Promise<boolean> => {
    const response = await apiClient.get<boolean>('/utils/health-check/');
    return response.data;
  },

  testEmail: async (emailTo: string): Promise<Message> => {
    const response = await apiClient.post<Message>('/utils/test-email/', null, {
      params: { email_to: emailTo },
    });
    return response.data;
  },
};