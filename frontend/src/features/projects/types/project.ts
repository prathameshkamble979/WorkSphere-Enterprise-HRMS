export interface Project {
  _id: string;
  name: string;
  description: string;
  clientId: {
    _id: string;
    companyName: string;
  };
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
  startDate: string;
  deadline: string;
  teamMembers: {
    _id: string;
    firstName: string;
    lastName: string;
  }[];
  priority: 'Low' | 'Medium' | 'High';
}

export interface ProjectResponse {
  success: boolean;
  data: Project | Project[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
