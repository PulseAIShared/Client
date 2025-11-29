import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { DashboardResponse, DashboardStats } from '@/types/api';
import { QueryConfig, MutationConfig } from '@/lib/react-query';

// Get all dashboard data
export const getDashboardData = async (): Promise<DashboardResponse> => {
  const response = await api.get('/dashboard') as any;

  const s = response.stats || {};
  const stats: DashboardStats = {
    totalUsers: s.totalUsers ?? s.TotalUsers ?? '0',
    churnRisk: s.churnRisk ?? s.ChurnRisk ?? '0%',
    recoveredRevenue: s.recoveredRevenue ?? s.RecoveredRevenue ?? '$0',
    avgLTV: s.avgLTV ?? s.AvgLTV ?? '$0',
    monthlyRecurringRevenue: s.monthlyRecurringRevenue ?? s.MonthlyRecurringRevenue,
    revenueSaved: s.revenueSaved ?? s.RevenueSaved,
    activationRate: s.activationRate ?? s.ActivationRate,
    activeUsers7: s.activeUsers7 ?? s.ActiveUsers7,
    activeUsers14: s.activeUsers14 ?? s.ActiveUsers14,
    activeUsers30: s.activeUsers30 ?? s.ActiveUsers30,
    totalUsersChange: s.totalUsersChange ?? s.TotalUsersChange,
    churnRiskChange: s.churnRiskChange ?? s.ChurnRiskChange,
    avgLtvChange: s.avgLtvChange ?? s.AvgLtvChange,
    monthlyRecurringRevenueChange: s.monthlyRecurringRevenueChange ?? s.MonthlyRecurringRevenueChange,
    revenueSavedChange: s.revenueSavedChange ?? s.RevenueSavedChange,
    recoveredRevenueChange: s.recoveredRevenueChange ?? s.RecoveredRevenueChange,
    activationRateChange: s.activationRateChange ?? s.ActivationRateChange,
  };

  return {
    ...response,
    stats,
  };
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
