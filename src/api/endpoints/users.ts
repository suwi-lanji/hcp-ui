import { apiClient } from '../client';
import type {
  UserPublic,
  UsersPublic,
  UserCreate,
  UserRegister,
  UserUpdateMe,
  UserUpdate,
  UpdatePassword,
  Message,
} from '../types';

export const usersApi = {
  getUsers: async (skip = 0, limit = 100): Promise<UsersPublic> => {
    const response = await apiClient.get<UsersPublic>('/users/', { params: { skip, limit } });
    return response.data;
  },

  createUser: async (data: UserCreate): Promise<UserPublic> => {
    const response = await apiClient.post<UserPublic>('/users/', data);
    return response.data;
  },

  getMe: async (): Promise<UserPublic> => {
    const response = await apiClient.get<UserPublic>('/users/me');
    return response.data;
  },

  updateMe: async (data: UserUpdateMe): Promise<UserPublic> => {
    const response = await apiClient.patch<UserPublic>('/users/me', data);
    return response.data;
  },

  deleteMe: async (): Promise<Message> => {
    const response = await apiClient.delete<Message>('/users/me');
    return response.data;
  },

  updatePassword: async (data: UpdatePassword): Promise<Message> => {
    const response = await apiClient.patch<Message>('/users/me/password', data);
    return response.data;
  },

  register: async (data: UserRegister): Promise<UserPublic> => {
    const response = await apiClient.post<UserPublic>('/users/signup', data);
    return response.data;
  },

  getUserById: async (userId: string): Promise<UserPublic> => {
    const response = await apiClient.get<UserPublic>(`/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId: string, data: UserUpdate): Promise<UserPublic> => {
    const response = await apiClient.patch<UserPublic>(`/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<Message> => {
    const response = await apiClient.delete<Message>(`/users/${userId}`);
    return response.data;
  },
};