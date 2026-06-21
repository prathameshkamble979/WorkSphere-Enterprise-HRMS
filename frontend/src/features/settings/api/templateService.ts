import { apiClient } from '../../../shared/api/apiClient';

export interface INotificationTemplate {
  _id: string;
  name: string;
  type: 'Slack' | 'GoogleCalendar' | 'Email';
  eventTrigger: 'NEW_HIRE' | 'LEAVE_APPROVED' | 'PAYROLL_COMPLETED' | 'PROJECT_MILESTONE';
  subject?: string;
  body: string;
  isActive: boolean;
  channel?: string;
  createdAt: string;
}

export const templateService = {
  getTemplates: async () => {
    const response = await apiClient.get('/settings/templates');
    return response.data.data;
  },
  
  createTemplate: async (data: Partial<INotificationTemplate>) => {
    const response = await apiClient.post('/settings/templates', data);
    return response.data.data;
  },
  
  updateTemplate: async (id: string, data: Partial<INotificationTemplate>) => {
    const response = await apiClient.put(`/settings/templates/${id}`, data);
    return response.data.data;
  },
  
  deleteTemplate: async (id: string) => {
    const response = await apiClient.delete(`/settings/templates/${id}`);
    return response.data.data;
  }
};
