import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { 
  DashboardStats, 
  ChurnRiskData, 
  CustomerInsight, 
  AtRiskCustomer 
} from '@/types/api';
import { QueryConfig } from '@/lib/react-query';
import { 
  getDashboardStats, 
  getChurnRiskData, 
  getCustomerInsightsData, 
  getAtRiskCustomers 
} from '@/utils/mock-data';

// Get dashboard stats
export const getDashboardStatsApi = async (): Promise<DashboardStats> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get('/dashboard/stats');
  return getDashboardStats();
};

export const getDashboardStatsQueryOptions = () => {
  return {
    queryKey: ['dashboard', 'stats'],
    queryFn: () => getDashboardStatsApi(),
  };
};

export const useGetDashboardStats = (queryConfig?: QueryConfig<typeof getDashboardStatsQueryOptions>) => {
  return useQuery({
    ...getDashboardStatsQueryOptions(),
    ...queryConfig,
  });
};

// Get churn risk data
export const getChurnRiskDataApi = async ({ weeks = 6 }: { weeks?: number } = {}): Promise<ChurnRiskData[]> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get(`/dashboard/churn-risk?weeks=${weeks}`);
  return getChurnRiskData();
};

export const getChurnRiskDataQueryOptions = (weeks?: number) => {
  return {
    queryKey: ['dashboard', 'churn-risk', weeks],
    queryFn: () => getChurnRiskDataApi({ weeks }),
  };
};

export const useGetChurnRiskData = (weeks?: number, queryConfig?: QueryConfig<typeof getChurnRiskDataQueryOptions>) => {
  return useQuery({
    ...getChurnRiskDataQueryOptions(weeks),
    ...queryConfig,
  });
};

// Get customer insights
export const getCustomerInsightsApi = async (): Promise<CustomerInsight[]> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get('/dashboard/customer-insights');
  return getCustomerInsightsData();
};

export const getCustomerInsightsQueryOptions = () => {
  return {
    queryKey: ['dashboard', 'customer-insights'],
    queryFn: () => getCustomerInsightsApi(),
  };
};

export const useGetCustomerInsights = (queryConfig?: QueryConfig<typeof getCustomerInsightsQueryOptions>) => {
  return useQuery({
    ...getCustomerInsightsQueryOptions(),
    ...queryConfig,
  });
};

// Get at-risk customers
export const getAtRiskCustomersApi = async ({ 
  minRiskScore = 70, 
  page = 1, 
  pageSize = 10 
}: { 
  minRiskScore?: number; 
  page?: number; 
  pageSize?: number; 
} = {}): Promise<AtRiskCustomer[]> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get(`/customers/at-risk?minRiskScore=${minRiskScore}&page=${page}&pageSize=${pageSize}`);
  return getAtRiskCustomers();
};

export const getAtRiskCustomersQueryOptions = (params?: { minRiskScore?: number; page?: number; pageSize?: number }) => {
  return {
    queryKey: ['customers', 'at-risk', params],
    queryFn: () => getAtRiskCustomersApi(params),
  };
};

export const useGetAtRiskCustomers = (
  params?: { minRiskScore?: number; page?: number; pageSize?: number },
  queryConfig?: QueryConfig<typeof getAtRiskCustomersQueryOptions>
) => {
  return useQuery({
    ...getAtRiskCustomersQueryOptions(params),
    ...queryConfig,
  });
};