import { z } from 'zod';

export const createEmployeeSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Admin', 'Manager', 'HR', 'Employee']).optional(),
  employeeId: z.string().min(1, 'Employee ID is required'),
  phone: z.string().optional(),
  status: z.enum(['Active', 'On Leave', 'Terminated']).optional(),
  joiningDate: z.string().optional(),
  skills: z.array(z.string()).optional(),
  profilePicture: z.string().optional()
});

export const updateEmployeeSchema = createEmployeeSchema.partial();
