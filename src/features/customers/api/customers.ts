import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { CustomerData, ImportCustomerData, ImportResult } from '@/types/api';
import { MutationConfig, QueryConfig } from '@/lib/react-query';
import { getCustomersData } from '@/utils/mock-data';

// Get all customers
export const getCustomers = async ({ 
  page = 1, 
  pageSize = 50, 
  searchTerm, 
  filterBy 
}: { 
  page?: number; 
  pageSize?: number; 
  searchTerm?: string; 
  filterBy?: string; 
} = {}): Promise<CustomerData[]> => {
  // TODO: Replace with actual API call when backend is ready
  return api.get(`/customers?page=${page}&pageSize=${pageSize}&searchTerm=${searchTerm}&filterBy=${filterBy}`);

};

export const getCustomersQueryOptions = (params?: { 
  page?: number; 
  pageSize?: number; 
  searchTerm?: string; 
  filterBy?: string; 
}) => {
  return {
    queryKey: ['customers', params],
    queryFn: () => getCustomers(params),
  };
};

export const useGetCustomers = (
  params?: { page?: number; pageSize?: number; searchTerm?: string; filterBy?: string },
  queryConfig?: QueryConfig<typeof getCustomersQueryOptions>
) => {
  return useQuery({
    ...getCustomersQueryOptions(params),
    ...queryConfig,
  });
};

// Get customer by ID
export const getCustomerById = async ({ customerId }: { customerId: string }): Promise<CustomerData> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get(`/customers/${customerId}`);
  const customers = getCustomersData();
  const customer = customers.find(c => c.id === customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }
  return customer;
};

export const getCustomerByIdQueryOptions = (customerId: string) => {
  return {
    queryKey: ['customers', customerId],
    queryFn: () => getCustomerById({ customerId }),
    enabled: !!customerId,
  };
};

export const useGetCustomerById = (customerId: string, queryConfig?: QueryConfig<typeof getCustomerByIdQueryOptions>) => {
  return useQuery({
    ...getCustomerByIdQueryOptions(customerId),
    ...queryConfig,
  });
};

// Create customer
export const createCustomer = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  plan: string;
  monthlyRecurringRevenue: number;
}): Promise<CustomerData> => {
  return api.post('/customers', data);
};

type UseCreateCustomerOptions = {
  mutationConfig?: MutationConfig<typeof createCustomer>;
};

export const useCreateCustomer = ({ mutationConfig }: UseCreateCustomerOptions = {}) => {
  return useMutation({
    mutationFn: createCustomer,
    ...mutationConfig,
  });
};

// Update customer
export const updateCustomer = async ({ 
  customerId, 
  ...data 
}: { 
  customerId: string; 
  firstName: string; 
  lastName: string; 
  email: string; 
}): Promise<CustomerData> => {
  return api.put(`/customers/${customerId}`, data);
};

type UseUpdateCustomerOptions = {
  mutationConfig?: MutationConfig<typeof updateCustomer>;
};

export const useUpdateCustomer = ({ mutationConfig }: UseUpdateCustomerOptions = {}) => {
  return useMutation({
    mutationFn: updateCustomer,
    ...mutationConfig,
  });
};

// Delete customer
export const deleteCustomer = async ({ customerId }: { customerId: string }): Promise<void> => {
  return api.delete(`/customers/${customerId}`);
};

type UseDeleteCustomerOptions = {
  mutationConfig?: MutationConfig<typeof deleteCustomer>;
};

export const useDeleteCustomer = ({ mutationConfig }: UseDeleteCustomerOptions = {}) => {
  return useMutation({
    mutationFn: deleteCustomer,
    ...mutationConfig,
  });
};


// src/features/customers/api/customers.ts (add these functions)

// Add this interface to your existing types

// Import customers function
export const importCustomers = async (customers: ImportCustomerData[]): Promise<ImportResult> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.post('/customers/import', { customers });
  
  // Mock implementation for now
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    importedCount: customers.length,
    skippedCount: 0,
    errors: []
  };
};

// Validate import data (can be called before actual import)
export const validateImportData = async (customers: ImportCustomerData[]): Promise<{
  valid: boolean;
  duplicateEmails: string[];
  invalidData: Array<{ index: number; errors: string[] }>;
}> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.post('/customers/validate-import', { customers });
  
  // Mock validation
  const existingEmails = ['existing@example.com']; // This would come from your backend
  const duplicateEmails = customers
    .map(c => c.email)
    .filter(email => existingEmails.includes(email));
  
  return {
    valid: duplicateEmails.length === 0,
    duplicateEmails,
    invalidData: []
  };
};

type UseImportCustomersOptions = {
  mutationConfig?: MutationConfig<typeof importCustomers>;
};

export const useImportCustomers = ({ mutationConfig }: UseImportCustomersOptions = {}) => {
  return useMutation({
    mutationFn: importCustomers,
    ...mutationConfig,
  });
};

type UseValidateImportOptions = {
  mutationConfig?: MutationConfig<typeof validateImportData>;
};

export const useValidateImport = ({ mutationConfig }: UseValidateImportOptions = {}) => {
  return useMutation({
    mutationFn: validateImportData,
    ...mutationConfig,
  });
};
