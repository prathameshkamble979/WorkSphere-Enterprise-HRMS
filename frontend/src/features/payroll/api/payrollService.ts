import { apiClient } from '../../../shared/api/apiClient';
import type { PayrollResponse } from '../types/payroll';

export const getPayrollRecords = async (page = 1, limit = 10, status = '', month = '', year?: number) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) params.append('status', status);
  if (month) params.append('month', month);
  if (year) params.append('year', year.toString());

  const response = await apiClient.get<PayrollResponse>(`/payroll?${params.toString()}`);
  return response.data;
};

export const createPayrollRecord = async (data: any) => {
  const response = await apiClient.post<PayrollResponse>('/payroll', data);
  return response.data;
};

export const updatePayrollStatus = async (id: string, status: string) => {
  const response = await apiClient.patch<PayrollResponse>(`/payroll/${id}/status`, { status });
  return response.data;
};
