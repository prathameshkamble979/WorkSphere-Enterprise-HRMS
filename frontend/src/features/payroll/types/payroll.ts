export interface Payroll {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  month: string;
  year: number;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: 'Pending' | 'Processed' | 'Paid';
  paymentDate?: string;
}

export interface PayrollResponse {
  success: boolean;
  data: Payroll | Payroll[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
