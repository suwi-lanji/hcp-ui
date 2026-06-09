import { apiClient } from '../client';
import type {
  Item,
  ItemCreate,
  ItemPublic,
  ItemsPublic,
} from '../types';

export const itemsApi = {
  getItems: async (skip = 0, limit = 100): Promise<ItemsPublic> => {
    const response = await apiClient.get<ItemsPublic>('/items/', { params: { skip, limit } });
    return response.data;
  },

  createItem: async (data: ItemCreate): Promise<ItemPublic> => {
    const response = await apiClient.post<ItemPublic>('/items/', data);
    return response.data;
  },

  getItem: async (itemId: string): Promise<ItemPublic> => {
    const response = await apiClient.get<ItemPublic>(`/items/${itemId}`);
    return response.data;
  },

  updateItem: async (itemId: string, data: ItemCreate): Promise<ItemPublic> => {
    const response = await apiClient.patch<ItemPublic>(`/items/${itemId}`, data);
    return response.data;
  },

  deleteItem: async (itemId: string): Promise<Item> => {
    const response = await apiClient.delete<Item>(`/items/${itemId}`);
    return response.data;
  },
};