import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { CustomerData } from '@/types/api';
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
  // return api.get(`/customers?page=${page}&pageSize=${pageSize}&searchTerm=${searchTerm}&filterBy=${filterBy}`);
  return getCustomersData();
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
