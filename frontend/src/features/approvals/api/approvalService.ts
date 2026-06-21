import { apiClient } from '../../../shared/api/apiClient';
import type { ApprovalResponse } from '../types/approval';

export const getApprovals = async (page = 1, limit = 10, search = '', status = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) params.append('search', search);
  if (status) params.append('status', status);

  const response = await apiClient.get<ApprovalResponse>(`/approvals?${params.toString()}`);
  return response.data;
};

export const createApproval = async (data: any) => {
  const response = await apiClient.post<ApprovalResponse>('/approvals', data);
  return response.data;
};

export const updateApprovalStatus = async (id: string, status: string, comments?: string) => {
  const response = await apiClient.patch<ApprovalResponse>(`/approvals/${id}/status`, { status, comments });
  return response.data;
};
