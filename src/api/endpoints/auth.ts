import { apiClient } from '../client';
import type {
  Token,
  UserPublic,
  Message,
  NewPassword,
} from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<Token> => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const response = await apiClient.post<Token>('/login/access-token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  testToken: async (): Promise<UserPublic> => {
    const response = await apiClient.post<UserPublic>('/login/test-token');
    return response.data;
  },

  recoverPassword: async (email: string): Promise<Message> => {
    const response = await apiClient.post<Message>(`/password-recovery/${email}`);
    return response.data;
  },

  resetPassword: async (data: NewPassword): Promise<Message> => {
    const response = await apiClient.post<Message>('/reset-password/', data);
    return response.data;
  },

  getPasswordRecoveryHtml: async (email: string): Promise<string> => {
    const response = await apiClient.post<string>(`/password-recovery-html-content/${email}`);
    return response.data;
  },
};