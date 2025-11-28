// src/features/customers/api/customers.ts - Updated to work with your real API
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { 
  CustomerData, 
  CustomersApiResponse, 
  CustomersQueryParams,
  transformCustomerData,
  CustomerDisplayData,
  CustomerDetailData,
  CustomerOverviewResponse,
  CustomerPaymentHistoryResponse,
  CustomerEngagementHistoryResponse,
  CustomerSupportHistoryResponse,
  CustomerChurnHistoryResponse,
  CustomerDataSourcesResponse
} from '@/types/api';
import { MutationConfig, QueryConfig } from '@/lib/react-query';

// Get all customers with proper query params
export const getCustomers = async (params: CustomersQueryParams = {}): Promise<{
  customers: CustomerDisplayData[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}> => {
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.subscriptionStatus !== undefined) queryParams.append('subscriptionStatus', params.subscriptionStatus.toString());
  if (params.plan !== undefined) queryParams.append('plan', params.plan.toString());
  if (params.paymentStatus !== undefined) queryParams.append('paymentStatus', params.paymentStatus.toString());
  if (params.churnRiskLevel !== undefined) queryParams.append('churnRiskLevel', params.churnRiskLevel.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDescending !== undefined) queryParams.append('sortDescending', params.sortDescending.toString());

  const url = `/customers?${queryParams.toString()}`;
  console.log('API Call URL:', url);
  const response = await api.get(url) as CustomersApiResponse;
  
  // Transform API data to display format
  const customers = response.items.map(transformCustomerData);
  
  return {
    customers,
    pagination: {
      page: response.page,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      totalCount: response.totalCount,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    }
  };
};

export const getCustomersQueryOptions = (params?: CustomersQueryParams) => {
  return {
    queryKey: ['customers', params],
    queryFn: () => getCustomers(params),
  };
};

export const useGetCustomers = (
  params?: CustomersQueryParams,
  queryConfig?: QueryConfig<typeof getCustomersQueryOptions>
) => {
  return useQuery({
    ...getCustomersQueryOptions(params),
    ...queryConfig,
  });
};

// Get customer by ID
export const getCustomerById = async ({ customerId }: { customerId: string }): Promise<CustomerDetailData> => {
  const response = await api.get(`/customers/${customerId}`) as CustomerDetailData;

  return response;
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

// New split endpoints
export const getCustomerOverview = async (customerId: string): Promise<CustomerOverviewResponse> => {
  return api.get(`/customers/${customerId}/overview`);
};

export const getCustomerOverviewQueryOptions = (customerId: string) => ({
  queryKey: ['customers', customerId, 'overview'],
  queryFn: () => getCustomerOverview(customerId),
  enabled: !!customerId,
});

export const useGetCustomerOverview = (
  customerId: string,
  queryConfig?: QueryConfig<typeof getCustomerOverviewQueryOptions>,
) => {
  return useQuery({
    ...getCustomerOverviewQueryOptions(customerId),
    ...queryConfig,
  });
};

export const getCustomerPaymentHistory = async (customerId: string): Promise<CustomerPaymentHistoryResponse> => {
  return api.get(`/customers/${customerId}/payment/history`);
};

export const getCustomerPaymentHistoryQueryOptions = (customerId: string) => ({
  queryKey: ['customers', customerId, 'payment-history'],
  queryFn: () => getCustomerPaymentHistory(customerId),
  enabled: !!customerId,
});

export const useGetCustomerPaymentHistory = (
  customerId: string,
  queryConfig?: QueryConfig<typeof getCustomerPaymentHistoryQueryOptions>,
) => {
  return useQuery({
    ...getCustomerPaymentHistoryQueryOptions(customerId),
    ...queryConfig,
  });
};

export const getCustomerEngagementHistory = async (customerId: string): Promise<CustomerEngagementHistoryResponse> => {
  return api.get(`/customers/${customerId}/engagement/history`);
};

export const getCustomerEngagementHistoryQueryOptions = (customerId: string) => ({
  queryKey: ['customers', customerId, 'engagement-history'],
  queryFn: () => getCustomerEngagementHistory(customerId),
  enabled: !!customerId,
});

export const useGetCustomerEngagementHistory = (
  customerId: string,
  queryConfig?: QueryConfig<typeof getCustomerEngagementHistoryQueryOptions>,
) => {
  return useQuery({
    ...getCustomerEngagementHistoryQueryOptions(customerId),
    ...queryConfig,
  });
};

export const getCustomerSupportHistory = async (customerId: string): Promise<CustomerSupportHistoryResponse> => {
  return api.get(`/customers/${customerId}/support/history`);
};

export const getCustomerSupportHistoryQueryOptions = (customerId: string) => ({
  queryKey: ['customers', customerId, 'support-history'],
  queryFn: () => getCustomerSupportHistory(customerId),
  enabled: !!customerId,
});

export const useGetCustomerSupportHistory = (
  customerId: string,
  queryConfig?: QueryConfig<typeof getCustomerSupportHistoryQueryOptions>,
) => {
  return useQuery({
    ...getCustomerSupportHistoryQueryOptions(customerId),
    ...queryConfig,
  });
};

export const getCustomerChurnHistory = async (customerId: string): Promise<CustomerChurnHistoryResponse> => {
  return api.get(`/customers/${customerId}/churn/history`);
};

export const getCustomerChurnHistoryQueryOptions = (customerId: string) => ({
  queryKey: ['customers', customerId, 'churn-history'],
  queryFn: () => getCustomerChurnHistory(customerId),
  enabled: !!customerId,
});

export const useGetCustomerChurnHistory = (
  customerId: string,
  queryConfig?: QueryConfig<typeof getCustomerChurnHistoryQueryOptions>,
) => {
  return useQuery({
    ...getCustomerChurnHistoryQueryOptions(customerId),
    ...queryConfig,
  });
};

export const getCustomerDataSources = async (customerId: string): Promise<CustomerDataSourcesResponse> => {
  return api.get(`/customers/${customerId}/data-sources`);
};

export const getCustomerDataSourcesQueryOptions = (customerId: string) => ({
  queryKey: ['customers', customerId, 'data-sources'],
  queryFn: () => getCustomerDataSources(customerId),
  enabled: !!customerId,
});

export const useGetCustomerDataSources = (
  customerId: string,
  queryConfig?: QueryConfig<typeof getCustomerDataSourcesQueryOptions>,
) => {
  return useQuery({
    ...getCustomerDataSourcesQueryOptions(customerId),
    ...queryConfig,
  });
};

// Create customer
export const createCustomer = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  plan: number; // SubscriptionPlan enum value
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
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  plan?: number;
  monthlyRecurringRevenue?: number;
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

export interface CustomerDeletionError {
  customerId: string;
  email: string;
  errorMessage: string;
}

export interface DeleteCustomersResponse {
  message: string;
  totalRequested: number;
  successfullyDeleted: number;
  failed: number;
  errors: CustomerDeletionError[];
  hasMoreErrors: boolean;
}

export interface DeleteCustomersRequest {
  customerIds: string[];
}


export const deleteCustomers = async (request: DeleteCustomersRequest): Promise<DeleteCustomersResponse> => {
  return api.post('/customers/delete', request); 
};

type UseDeleteCustomersOptions = {
  mutationConfig?: MutationConfig<typeof deleteCustomers>;
};

export const useDeleteCustomers = ({ mutationConfig }: UseDeleteCustomersOptions = {}) => {
  return useMutation({
    mutationFn: deleteCustomers,
    ...mutationConfig,
  });
};
// Bulk operations
export const bulkUpdateCustomers = async (data: {
  customerIds: string[];
  updates: Partial<{
    plan: number;
    subscriptionStatus: number;
    paymentStatus: number;
  }>;
}): Promise<{ updated: number; errors: string[] }> => {
  return api.post('/customers/bulk-update', data);
};

type UseBulkUpdateCustomersOptions = {
  mutationConfig?: MutationConfig<typeof bulkUpdateCustomers>;
};

export const useBulkUpdateCustomers = ({ mutationConfig }: UseBulkUpdateCustomersOptions = {}) => {
  return useMutation({
    mutationFn: bulkUpdateCustomers,
    ...mutationConfig,
  });
};

// Export customers
export const exportCustomers = async (params: CustomersQueryParams = {}): Promise<Blob> => {
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.append('search', params.search);
  if (params.subscriptionStatus !== undefined) queryParams.append('subscriptionStatus', params.subscriptionStatus.toString());
  if (params.plan !== undefined) queryParams.append('plan', params.plan.toString());
  if (params.paymentStatus !== undefined) queryParams.append('paymentStatus', params.paymentStatus.toString());
  if (params.churnRiskLevel !== undefined) queryParams.append('churnRiskLevel', params.churnRiskLevel.toString());

  return api.get(`/customers/export?${queryParams.toString()}`, {
    responseType: 'blob',
  });
};

type UseExportCustomersOptions = {
  mutationConfig?: MutationConfig<typeof exportCustomers>;
};

export const useExportCustomers = ({ mutationConfig }: UseExportCustomersOptions = {}) => {
  return useMutation({
    mutationFn: exportCustomers,
    ...mutationConfig,
  });
};

