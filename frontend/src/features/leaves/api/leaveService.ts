import { apiClient } from '../../../shared/api/apiClient';
import type { LeaveResponse } from '../types/leave';

export const getLeaves = async (page = 1, limit = 10, status = '', leaveType = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) params.append('status', status);
  if (leaveType) params.append('leaveType', leaveType);

  const response = await apiClient.get<LeaveResponse>(`/leaves?${params.toString()}`);
  return response.data;
};

export const applyLeave = async (data: any) => {
  const response = await apiClient.post<LeaveResponse>('/leaves', data);
  return response.data;
};

export const updateLeaveStatus = async (id: string, status: string, rejectionReason?: string) => {
  const response = await apiClient.patch<LeaveResponse>(`/leaves/${id}/status`, { status, rejectionReason });
  return response.data;
};
