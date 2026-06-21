export interface Client {
  _id: string;
  companyName: string;
  industry: string;
  website?: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address?: string;
  status?: string;
  primaryContact?: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
}

export interface ClientResponse {
  success: boolean;
  data: Client | Client[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
