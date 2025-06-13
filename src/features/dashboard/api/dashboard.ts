import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { DashboardResponse } from '@/types/api';
import { QueryConfig } from '@/lib/react-query';

// Get all dashboard data
export const getDashboardData = async (): Promise<DashboardResponse> => {
  return api.get('/dashboard');
};

export const getDashboardDataQueryOptions = () => {
  return {
    queryKey: ['dashboard'],
    queryFn: () => getDashboardData(),
  };
};

export const useGetDashboardData = (queryConfig?: QueryConfig<typeof getDashboardDataQueryOptions>) => {
  return useQuery({
    ...getDashboardDataQueryOptions(),
    ...queryConfig,
  });
};