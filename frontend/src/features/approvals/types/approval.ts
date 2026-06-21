export interface Approval {
  _id: string;
  requesterId: {
    _id: string;
    email: string;
    role: string;
  };
  type: 'Leave' | 'Expense' | 'Promotion' | 'Other';
  title: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewerId?: {
    _id: string;
    email: string;
  };
  comments?: string;
  createdAt: string;
}

export interface ApprovalResponse {
  success: boolean;
  data: Approval | Approval[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
