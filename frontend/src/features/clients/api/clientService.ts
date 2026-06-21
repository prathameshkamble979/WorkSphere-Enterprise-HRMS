import { apiClient } from '../../../shared/api/apiClient';
import type { ClientResponse } from '../types/client';

export const getClients = async (page = 1, limit = 10, search = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) params.append('search', search);

  const response = await apiClient.get<ClientResponse>(`/clients?${params.toString()}`);
  return response.data;
};

export const createClient = async (data: any) => {
  const response = await apiClient.post<ClientResponse>('/clients', data);
  return response.data;
};

export const getClientById = async (id: string) => {
  const response = await apiClient.get<ClientResponse>(`/clients/${id}`);
  return response.data;
};

export const updateClient = async (id: string, data: any) => {
  const response = await apiClient.put<ClientResponse>(`/clients/${id}`, data);
  return response.data;
};

export const deleteClient = async (id: string) => {
  const response = await apiClient.delete<{ success: boolean; data: any }>(`/clients/${id}`);
  return response.data;
};
