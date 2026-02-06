// src/features/customers/api/customers.ts - Updated to work with your real API
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import {
  CustomerData,
  CustomersQueryParams,
  CustomerListItem,
  CustomersListApiResponse,
  CustomersPageApiResponse,
  CustomerSummaryStats,
  CustomerDetailData,
  CustomerOverviewResponse,
  CustomerPaymentHistoryResponse,
  CustomerEngagementHistoryResponse,
  CustomerSupportHistoryResponse,
  CustomerChurnHistoryResponse,
  CustomerDataSourcesResponse,
  SegmentListItem,
  PlaybookListItem,
  BulkActionResult,
  BulkAddToSegmentPayload,
  BulkTriggerPlaybookPayload,
  BulkAddToWorkQueuePayload,
  BulkExportCustomersPayload
} from '@/types/api';
import { MutationConfig, QueryConfig } from '@/lib/react-query';

// Get all customers with proper query params
// Backend now returns display-ready data - no transformation needed
export const getCustomers = async (params: CustomersQueryParams = {}): Promise<{
  customers: CustomerListItem[];
  summary: CustomerSummaryStats;
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
  if (params.segmentId) queryParams.append('segmentId', params.segmentId);
  if (params.filter) queryParams.append('filter', params.filter);
  if (params.search) queryParams.append('search', params.search);
  if (params.subscriptionStatus !== undefined) queryParams.append('subscriptionStatus', params.subscriptionStatus.toString());
  if (params.plan !== undefined) queryParams.append('plan', params.plan.toString());
  if (params.paymentStatus !== undefined) queryParams.append('paymentStatus', params.paymentStatus.toString());
  if (params.churnRiskLevel !== undefined) queryParams.append('churnRiskLevel', params.churnRiskLevel.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDescending !== undefined) queryParams.append('sortDescending', params.sortDescending.toString());

  const url = `/customers?${queryParams.toString()}`;
  const response = await api.get(url) as CustomersPageApiResponse;
  const customersPage = response.customers as CustomersListApiResponse;

  // Backend provides display-ready data - use directly
  return {
    customers: customersPage.items,
    summary: response.summary,
    pagination: {
      page: customersPage.page,
      pageSize: customersPage.pageSize,
      totalPages: customersPage.totalPages,
      totalCount: customersPage.totalCount,
      hasNextPage: customersPage.hasNextPage,
      hasPreviousPage: customersPage.hasPreviousPage,
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

export const getSegmentsList = async (): Promise<SegmentListItem[]> => {
  const segments = await api.get('/segments') as Array<{ id: string; name: string; customerCount?: number }>;
  return (segments ?? []).map((segment) => ({
    id: segment.id,
    name: segment.name,
    customerCount: segment.customerCount,
  }));
};

export const useGetSegmentsList = (queryConfig?: QueryConfig<any>) => {
  return useQuery({
    queryKey: ['customers', 'segment-list'],
    queryFn: getSegmentsList,
    ...queryConfig,
  });
};

export const getPlaybooksList = async (): Promise<PlaybookListItem[]> => {
  const playbooks = await api.get('/playbooks') as Array<{ id: string; name: string; status?: string }>;
  return (playbooks ?? []).map((playbook) => ({
    id: playbook.id,
    name: playbook.name,
    status: playbook.status,
  }));
};

export const useGetPlaybooksList = (queryConfig?: QueryConfig<any>) => {
  return useQuery({
    queryKey: ['customers', 'playbook-list'],
    queryFn: getPlaybooksList,
    ...queryConfig,
  });
};

// Aggregator: Customer Detail Query
export type CustomerDetailSectionsSpec = {
  overview?: boolean;
  history?: { months?: number; domains?: string[] };
  aiInsights?: boolean;
  playbooks?: { summary?: boolean; runs?: { page?: number; pageSize?: number; status?: string; since?: string } };
  dataSources?: boolean;
};

export type CustomerDetailQueryResponse = {
  overview?: CustomerOverviewResponse;
  history?: {
    payment?: CustomerPaymentHistoryResponse;
    engagement?: CustomerEngagementHistoryResponse;
    support?: CustomerSupportHistoryResponse;
  };
  aiInsights?: {
    aiScore?: number;
    aiLevel?: string;
    baselineScore?: number;
    riskFactors?: Record<string, number>;
    recommendations?: Array<{
      id: string;
      label: string;
      priority?: string;
      category?: string;
    }>;
    lastRun?: string;
    modelVersion?: string;
    signature?: string;
  };
  playbooks?: {
    summary?: {
      totalRuns?: number;
      successRate?: number;
      lastRunAt?: string;
      pendingApprovals?: number;
      recoveredRevenue?: number;
    };
    runs?: {
      items?: Array<{
        runId?: string;
        playbookId?: string;
        playbookName?: string;
        status?: string;
        outcome?: string;
        confidence?: number;
        potentialValue?: number;
        reasonShort?: string;
        startedAt?: string;
        completedAt?: string | null;
      }>;
      page?: number;
      pageSize?: number;
      totalPages?: number;
      totalCount?: number;
    };
  };
  dataSources?: CustomerDataSourcesResponse;
  errors?: Record<string, string>;
};

type CustomerEngagementSessionsResponse = {
  sessions: Array<{
    id: string;
    startedAt: string;
    durationMinutes?: number | null;
    feature?: string | null;
  }>;
};

type CustomerEngagementFeaturesResponse = {
  topFeatures: Array<{
    name: string;
    usageCount: number;
  }>;
};

type CustomerSupportTicketsResponse = {
  tickets: Array<{
    id: string;
    subject: string;
    severity: 'low' | 'medium' | 'high';
    status: string;
    openedAt: string;
    lastUpdatedAt?: string | null;
    owner?: string | null;
  }>;
};

export const postCustomerDetailQuery = async (
  customerId: string,
  sections: CustomerDetailSectionsSpec
) : Promise<CustomerDetailQueryResponse> => {
  const response = await api.post('/customers/detail-query', {
    customerId,
    sections: {
      overview: sections.overview ?? true,
      history: sections.history ?? { months: 12, domains: ['payment','engagement','support'] },
      aiInsights: sections.aiInsights ?? true,
      playbooks: sections.playbooks ?? { summary: true, runs: { page: 1, pageSize: 50 } },
      dataSources: sections.dataSources ?? true,
    },
  });
  return response as CustomerDetailQueryResponse;
};

export const getCustomerDetailQueryOptions = (
  customerId: string,
  sections: CustomerDetailSectionsSpec
) => ({
  queryKey: ['customers', customerId, 'detail', sections],
  queryFn: () => postCustomerDetailQuery(customerId, sections),
  enabled: !!customerId,
});

export const useCustomerDetailQuery = (
  customerId: string,
  sections: CustomerDetailSectionsSpec,
  queryConfig?: QueryConfig<typeof getCustomerDetailQueryOptions>
) => {
  return useQuery({
    ...getCustomerDetailQueryOptions(customerId, sections),
    ...queryConfig,
  });
};

// Engagement sessions/features
export const getCustomerEngagementSessions = async (
  customerId: string,
  months = 3
): Promise<CustomerEngagementSessionsResponse> => {
  const response = await api.get(`/customers/${customerId}/engagement/sessions?months=${months}`);
  return response as unknown as CustomerEngagementSessionsResponse;
};

export const getCustomerEngagementSessionsQueryOptions = (customerId: string, months = 3) => ({
  queryKey: ['customers', customerId, 'engagement-sessions', months],
  queryFn: () => getCustomerEngagementSessions(customerId, months),
  enabled: !!customerId,
});

export const useGetCustomerEngagementSessions = (
  customerId: string,
  months = 3,
  queryConfig?: QueryConfig<typeof getCustomerEngagementSessionsQueryOptions>
) => {
  return useQuery({
    ...getCustomerEngagementSessionsQueryOptions(customerId, months),
    ...queryConfig,
  });
};

export const getCustomerEngagementFeaturesTop = async (
  customerId: string,
  months = 3
): Promise<CustomerEngagementFeaturesResponse> => {
  const response = await api.get(`/customers/${customerId}/engagement/features?months=${months}`);
  return response as unknown as CustomerEngagementFeaturesResponse;
};

export const getCustomerEngagementFeaturesTopQueryOptions = (customerId: string, months = 3) => ({
  queryKey: ['customers', customerId, 'engagement-features', months],
  queryFn: () => getCustomerEngagementFeaturesTop(customerId, months),
  enabled: !!customerId,
});

export const useGetCustomerEngagementFeaturesTop = (
  customerId: string,
  months = 3,
  queryConfig?: QueryConfig<typeof getCustomerEngagementFeaturesTopQueryOptions>
) => {
  return useQuery({
    ...getCustomerEngagementFeaturesTopQueryOptions(customerId, months),
    ...queryConfig,
  });
};

// Support tickets
export const getCustomerSupportTickets = async (
  customerId: string,
  openOnly = true,
  limit = 50
): Promise<CustomerSupportTicketsResponse> => {
  const response = await api.get(`/customers/${customerId}/support/tickets?openOnly=${openOnly}&limit=${limit}`);
  return response as unknown as CustomerSupportTicketsResponse;
};

export const getCustomerSupportTicketsQueryOptions = (
  customerId: string,
  openOnly = true,
  limit = 50
) => ({
  queryKey: ['customers', customerId, 'support-tickets', { openOnly, limit }],
  queryFn: () => getCustomerSupportTickets(customerId, openOnly, limit),
  enabled: !!customerId,
});

export const useGetCustomerSupportTickets = (
  customerId: string,
  openOnly = true,
  limit = 50,
  queryConfig?: QueryConfig<typeof getCustomerSupportTicketsQueryOptions>
) => {
  return useQuery({
    ...getCustomerSupportTicketsQueryOptions(customerId, openOnly, limit),
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

export const bulkAddToSegment = async (
  payload: BulkAddToSegmentPayload
): Promise<BulkActionResult> => {
  return api.post('/customers/bulk/add-to-segment', payload);
};

export const useBulkAddToSegment = (
  mutationConfig?: MutationConfig<typeof bulkAddToSegment>
) => {
  return useMutation({
    mutationFn: bulkAddToSegment,
    ...mutationConfig,
  });
};

export const bulkTriggerPlaybook = async (
  payload: BulkTriggerPlaybookPayload
): Promise<BulkActionResult> => {
  return api.post('/customers/bulk/trigger-playbook', payload);
};

export const useBulkTriggerPlaybook = (
  mutationConfig?: MutationConfig<typeof bulkTriggerPlaybook>
) => {
  return useMutation({
    mutationFn: bulkTriggerPlaybook,
    ...mutationConfig,
  });
};

export const bulkAddToWorkQueue = async (
  payload: BulkAddToWorkQueuePayload
): Promise<BulkActionResult> => {
  return api.post('/customers/bulk/add-to-work-queue', payload);
};

export const useBulkAddToWorkQueue = (
  mutationConfig?: MutationConfig<typeof bulkAddToWorkQueue>
) => {
  return useMutation({
    mutationFn: bulkAddToWorkQueue,
    ...mutationConfig,
  });
};

export const bulkExportCustomers = async (
  payload: BulkExportCustomersPayload
): Promise<Blob> => {
  return api.post('/customers/bulk/export', payload, {
    responseType: 'blob',
  });
};

export const useBulkExportCustomers = (
  mutationConfig?: MutationConfig<typeof bulkExportCustomers>
) => {
  return useMutation({
    mutationFn: bulkExportCustomers,
    ...mutationConfig,
  });
};

export const useBulkDeleteCustomers = ({ mutationConfig }: UseDeleteCustomersOptions = {}) => {
  return useMutation({
    mutationFn: deleteCustomers,
    ...mutationConfig,
  });
};

