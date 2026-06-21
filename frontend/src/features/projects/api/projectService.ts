import { apiClient } from '../../../shared/api/apiClient';
import type { ProjectResponse } from '../types/project';

export const getProjects = async (page = 1, limit = 10, search = '', status = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) params.append('search', search);
  if (status) params.append('status', status);

  const response = await apiClient.get<ProjectResponse>(`/projects?${params.toString()}`);
  return response.data;
};

export const createProject = async (data: Record<string, unknown>) => {
  const response = await apiClient.post<ProjectResponse>('/projects', data);
  return response.data;
};

export const updateProject = async (id: string, data: Record<string, unknown>) => {
  const response = await apiClient.put<ProjectResponse>(`/projects/${id}`, data);
  return response.data;
};

export const deleteProject = async (id: string) => {
  const response = await apiClient.delete(`/projects/${id}`);
  return response.data;
};
