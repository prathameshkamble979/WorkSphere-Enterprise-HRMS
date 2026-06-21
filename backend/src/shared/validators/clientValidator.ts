import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  company: z.string().min(2, 'Company is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  projects: z.array(z.string()).optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional()
});

export const updateClientSchema = createClientSchema.partial();
