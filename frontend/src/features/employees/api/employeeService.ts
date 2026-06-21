import { apiClient } from '../../../shared/api/apiClient';
import type { EmployeeResponse } from '../types/employee';

export const getEmployees = async (page = 1, limit = 10, search = '', status = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) params.append('search', search);
  if (status) params.append('status', status);

  const response = await apiClient.get<EmployeeResponse>(`/employees?${params.toString()}`);
  return response.data;
};

export const getEmployeeById = async (id: string) => {
  const response = await apiClient.get<EmployeeResponse>(`/employees/${id}`);
  return response.data;
};

export const createEmployee = async (data: any) => {
  const response = await apiClient.post<EmployeeResponse>('/employees', data);
  return response.data;
};

export const updateEmployee = async (id: string, data: any) => {
  const response = await apiClient.put<EmployeeResponse>(`/employees/${id}`, data);
  return response.data;
};

export const deleteEmployee = async (id: string) => {
  const response = await apiClient.delete<{ success: boolean; data: any }>(`/employees/${id}`);
  return response.data;
};
