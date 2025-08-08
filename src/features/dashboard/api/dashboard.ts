import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { DashboardResponse } from '@/types/api';
import { QueryConfig, MutationConfig } from '@/lib/react-query';

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

// Export dashboard insights
export const exportDashboardInsights = async (): Promise<Blob> => {
  const response = await api.get('/dashboard/export', {
    responseType: 'blob',
  });
  return response.data;
};

export const useExportDashboardInsights = (mutationConfig?: MutationConfig<typeof exportDashboardInsights>) => {
  return useMutation({
    mutationFn: exportDashboardInsights,
    ...mutationConfig,
  });
};