export interface Employee {
  _id: string;
  userId: {
    _id: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  employeeId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  joiningDate: string;
  skills: string[];
  profilePicture?: string;
}

export interface EmployeeResponse {
  success: boolean;
  data: Employee | Employee[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
