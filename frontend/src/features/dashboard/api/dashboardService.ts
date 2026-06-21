import { apiClient as api } from '../../../shared/api/apiClient';

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalClients: number;
  pendingApprovalsCount: number;
  employeeGrowth: any[];
  departmentDistribution: any[];
  approvalStats: any[];
  recentActivities: any[];
}

export const getDashboardStats = async (): Promise<any> => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export interface EmployeeDashboardStats {
  activeProjects: number;
  upcomingTimeOffDays: number;
  pendingLeaves: number;
  recentActivities: {
    id: string;
    text: string;
    time: string;
  }[];
}

export const getEmployeeDashboardStats = async (): Promise<EmployeeDashboardStats> => {
  const response = await api.get('/dashboard/employee-stats');
  return response.data.data;
};
