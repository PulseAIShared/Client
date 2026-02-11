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

export const getSegmentsListQueryOptions = () => ({
  queryKey: ['customers', 'segment-list'],
  queryFn: getSegmentsList,
});

export const useGetSegmentsList = (queryConfig?: QueryConfig<typeof getSegmentsListQueryOptions>) => {
  return useQuery({
    ...getSegmentsListQueryOptions(),
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

export const getPlaybooksListQueryOptions = () => ({
  queryKey: ['customers', 'playbook-list'],
  queryFn: getPlaybooksList,
});

export const useGetPlaybooksList = (queryConfig?: QueryConfig<typeof getPlaybooksListQueryOptions>) => {
  return useQuery({
    ...getPlaybooksListQueryOptions(),
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
  v2?: {
    summary?: boolean;
    risk?: boolean;
    revenue?: boolean;
    engagement?: boolean;
    operations?: boolean;
    dataQuality?: boolean;
    timeline?: boolean;
    timelineDays?: number;
    timelinePageSize?: number;
  };
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
        confidence?: string | number;
        potentialValue?: number;
        reasonShort?: string;
        decisionSummaryJson?: string;
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
  v2?: {
    summary?: {
      meta?: {
        asOf?: string | null;
        freshness?: string;
        sources?: string[];
        confidence?: string | null;
      };
      customerName?: string;
      email?: string;
      company?: string | null;
      riskScore?: number;
      riskLevel?: { code?: string; label?: string };
      mrr?: number | null;
      ltv?: number | null;
      daysUntilRenewal?: number | null;
      openTickets?: number;
      urgentTickets?: number;
      lastSyncedAt?: string | null;
      recommendations?: Array<{
        id: string;
        label: string;
        priority?: string;
        category?: string;
      }>;
      topRiskFactors?: Record<string, number>;
    };
    risk?: {
      meta?: {
        asOf?: string | null;
        freshness?: string;
        sources?: string[];
        confidence?: string | null;
      };
      riskScore?: number;
      riskLevel?: { code?: string; label?: string };
      modelVersion?: string | null;
      lastPredictionAt?: string | null;
      riskFactors?: Record<string, number>;
      history?: Array<{
        predictionDate?: string;
        predictionDateDisplay?: string;
        riskScore?: number;
        riskLevel?: string;
        confidence?: string;
        dataAsOf?: string;
        connectedSources?: string[];
        recommendations?: string[];
        riskFactors?: Record<string, number>;
        modelVersion?: string | null;
      }>;
      recommendations?: Array<{
        id: string;
        label: string;
        priority?: string;
        category?: string;
      }>;
    };
    revenue?: {
      meta?: {
        asOf?: string | null;
        freshness?: string;
        sources?: string[];
        confidence?: string | null;
      };
      subscriptionStatus?: { code?: string; label?: string };
      plan?: { code?: string; label?: string };
      paymentStatus?: { code?: string; label?: string };
      monthlyRecurringRevenue?: number | null;
      lifetimeValue?: number | null;
      currentBalance?: number | null;
      failedPaymentsLast30d?: number;
      failedPaymentsPrevious30d?: number;
      mrrChangePercent?: number | null;
      mrrTrajectory?: string | null;
      nextBillingDate?: string | null;
      lastPaymentDate?: string | null;
      daysUntilRenewal?: number | null;
      isInRenewalWindow?: boolean;
      crmOwner?: string | null;
      crmLifecycleStage?: string | null;
      dealCount?: number;
      totalDealValue?: number;
    };
    engagement?: {
      meta?: {
        asOf?: string | null;
        freshness?: string;
        sources?: string[];
        confidence?: string | null;
      };
      activeLoginsLast30d?: number;
      activeLoginsLast90d?: number;
      weeklyLoginFrequency?: number;
      monthlyLoginFrequency?: number;
      featureUsagePercentage?: number | null;
      engagementScore?: number | null;
      engagementTrajectory?: string | null;
      engagementChangePercent?: number | null;
      lastLoginDate?: string | null;
      lastEventAt?: string | null;
      lastEventProvider?: string | null;
    };
    operations?: {
      meta?: {
        asOf?: string | null;
        freshness?: string;
        sources?: string[];
        confidence?: string | null;
      };
      openTickets?: number;
      urgentTickets?: number;
      ticketsLast30d?: number;
      averageResolutionTimeHours?: number | null;
      customerSatisfactionScore?: number | null;
      marketingOpenRate?: number | null;
      marketingClickRate?: number | null;
      isSubscribedToMarketing?: boolean | null;
      playbooksSummary?: {
        totalRuns?: number;
        successRate?: number;
        lastRunAt?: string;
        pendingApprovals?: number;
        recoveredRevenue?: number;
      };
      recentPlaybookRuns?: Array<{
        runId?: string;
        playbookId?: string;
        playbookName?: string;
        status?: string;
        outcome?: string;
        confidence?: string | number;
        potentialValue?: number;
        reasonShort?: string;
        decisionSummaryJson?: string;
        startedAt?: string;
        completedAt?: string | null;
      }>;
    };
    dataQuality?: {
      meta?: {
        asOf?: string | null;
        freshness?: string;
        sources?: string[];
        confidence?: string | null;
      };
      completeness?: {
        coreProfile?: number;
        paymentData?: number;
        engagementData?: number;
        supportData?: number;
        crmData?: number;
        marketingData?: number;
        historicalData?: number;
        overall?: number;
        isEligibleForChurnAnalysis?: boolean;
        missingCategories?: string[];
      };
      missingCategories?: string[];
      sources?: Array<{
        source?: string;
        categories?: string[] | null;
        isPrimary?: boolean;
        lastSync?: string | null;
        syncStatus?: string | null;
      }>;
      anomalies?: Array<{
        occurredAt?: string;
        category?: string;
        description?: string;
        severity?: string;
        type?: string;
        details?: Record<string, unknown>;
      }>;
    };
    timeline?: {
      meta?: {
        asOf?: string | null;
        freshness?: string;
        sources?: string[];
        confidence?: string | null;
      };
      events?: Array<{
        occurredAt?: string;
        category?: string;
        type?: string;
        description?: string;
        severity?: string;
        details?: Record<string, unknown>;
      }>;
      summary?: {
        totalEvents?: number;
        paymentEventsCount?: number;
        engagementEventsCount?: number;
        supportEventsCount?: number;
        marketingEventsCount?: number;
        crmEventsCount?: number;
        mostRecentEventAt?: string | null;
        highestSeverityLevel?: string;
        timelinePeriodDays?: number;
      };
    };
  };
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
    severity: string;
    status: string;
    openedAt: string;
    lastUpdatedAt?: string | null;
    owner?: string | null;
  }>;
};

type CustomerTimelineEvent = {
  occurredAt: string;
  category: string;
  type: string;
  description: string;
  severity: string;
  icon?: string;
  details?: Record<string, unknown>;
};

type CustomerTimelineResponse = {
  events: CustomerTimelineEvent[];
  summary?: {
    totalEvents?: number;
    paymentEventsCount?: number;
    engagementEventsCount?: number;
    supportEventsCount?: number;
    marketingEventsCount?: number;
    crmEventsCount?: number;
    mostRecentEventAt?: string | null;
    highestSeverityLevel?: string;
    timelinePeriodDays?: number;
  };
  paginationInfo?: {
    totalRecords?: number;
    pageSize?: number;
    pageNumber?: number;
    totalPages?: number;
  };
};

export const postCustomerDetailQuery = async (
  customerId: string,
  sections: CustomerDetailSectionsSpec
) : Promise<CustomerDetailQueryResponse> => {
  const shouldRequestHistory = sections.history !== undefined;
  const shouldRequestPlaybooks = sections.playbooks !== undefined;
  const shouldRequestV2 = sections.v2 !== undefined;
  const response = await api.post('/customers/detail-query', {
    customerId,
    sections: {
      overview: sections.overview ?? true,
      history: shouldRequestHistory ? sections.history : null,
      aiInsights: sections.aiInsights ?? false,
      playbooks: shouldRequestPlaybooks ? sections.playbooks : null,
      dataSources: sections.dataSources ?? false,
      v2: shouldRequestV2 ? sections.v2 : null,
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

export const getCustomerTimeline = async (
  customerId: string,
  days = 90,
  pageSize = 50,
): Promise<CustomerTimelineResponse> => {
  const response = await api.get(`/customers/${customerId}/timeline?days=${days}&pageSize=${pageSize}`);
  return response as unknown as CustomerTimelineResponse;
};

export const getCustomerTimelineQueryOptions = (
  customerId: string,
  days = 90,
  pageSize = 50,
) => ({
  queryKey: ['customers', customerId, 'timeline', { days, pageSize }],
  queryFn: () => getCustomerTimeline(customerId, days, pageSize),
  enabled: !!customerId,
});

export const useGetCustomerTimeline = (
  customerId: string,
  days = 90,
  pageSize = 50,
  queryConfig?: QueryConfig<typeof getCustomerTimelineQueryOptions>,
) => {
  return useQuery({
    ...getCustomerTimelineQueryOptions(customerId, days, pageSize),
    ...queryConfig,
  });
};

export type CustomerDetailUiEventPayload = {
  eventName: string;
  tab?: string;
  context?: string;
  metadata?: Record<string, unknown>;
};

export const trackCustomerDetailUiEvent = async (
  customerId: string,
  payload: CustomerDetailUiEventPayload,
): Promise<{ tracked: boolean }> => {
  const response = await api.post(`/customers/${customerId}/ui-events`, payload);
  return response as unknown as { tracked: boolean };
};

type TrackCustomerDetailUiEventMutation = (input: {
  customerId: string;
  payload: CustomerDetailUiEventPayload;
}) => Promise<{ tracked: boolean }>;

export const useTrackCustomerDetailUiEvent = (
  mutationConfig?: MutationConfig<TrackCustomerDetailUiEventMutation>,
) => {
  return useMutation({
    mutationFn: ({
      customerId,
      payload,
    }: {
      customerId: string;
      payload: CustomerDetailUiEventPayload;
    }) => trackCustomerDetailUiEvent(customerId, payload),
    ...mutationConfig,
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

