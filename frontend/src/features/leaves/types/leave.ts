export interface Leave {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  leaveType: 'Sick' | 'Vacation' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Other';
  duration: 'Full Day' | 'First Half' | 'Second Half';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: {
    _id: string;
    email: string;
    role: string;
  };
  rejectionReason?: string;
}

export interface LeaveResponse {
  success: boolean;
  data: Leave | Leave[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
