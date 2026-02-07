import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { DashboardResponse, DashboardStats } from '@/types/api';
import { QueryConfig, MutationConfig } from '@/lib/react-query';

export type DashboardQueryParams = {
  rangeDays?: number;
  from?: string;
  to?: string;
  segmentId?: string;
};

export type DashboardSegmentOption = {
  id: string;
  name: string;
  customerCount?: number;
};

// Get all dashboard data
export const getDashboardData = async (
  params: DashboardQueryParams = {},
): Promise<DashboardResponse> => {
  const response = await api.get('/dashboard', {
    params: {
      rangeDays: params.rangeDays,
      from: params.from,
      to: params.to,
      segmentId: params.segmentId,
    },
  }) as any;

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

  const workQueueRaw = response.workQueueSummary ?? response.WorkQueueSummary;
  const workQueueSummary = workQueueRaw
    ? {
        pendingApprovals: workQueueRaw.pendingApprovals ?? workQueueRaw.PendingApprovals ?? 0,
        highValueCount: workQueueRaw.highValueCount ?? workQueueRaw.HighValueCount ?? 0,
        atRiskAmount:
          workQueueRaw.atRiskAmount
          ?? workQueueRaw.AtRiskAmount
          ?? 0,
        hasActivePlaybooks:
          workQueueRaw.hasActivePlaybooks
          ?? workQueueRaw.HasActivePlaybooks
          ?? false,
        revenueSavedLast7d: workQueueRaw.revenueSavedLast7d ?? workQueueRaw.RevenueSavedLast7d ?? 0,
        oldestPendingAge: workQueueRaw.oldestPendingAge ?? workQueueRaw.OldestPendingAge,
        topItems: (workQueueRaw.topItems ?? workQueueRaw.TopItems ?? []).map((item: any) => ({
          id: item.id ?? item.Id,
          customerName: item.customerName ?? item.CustomerName,
          playbookName: item.playbookName ?? item.PlaybookName,
          reason: item.reason ?? item.Reason,
          potentialValue: item.potentialValue ?? item.PotentialValue,
          createdAt: item.createdAt ?? item.CreatedAt,
        })),
      }
    : undefined;

  const suggestedActionRaw = response.suggestedAction ?? response.SuggestedAction;
  const suggestedAction = suggestedActionRaw
    ? {
        actionType: suggestedActionRaw.actionType ?? suggestedActionRaw.ActionType,
        title: suggestedActionRaw.title ?? suggestedActionRaw.Title,
        description: suggestedActionRaw.description ?? suggestedActionRaw.Description,
        actionUrl: suggestedActionRaw.actionUrl ?? suggestedActionRaw.ActionUrl,
      }
    : undefined;

  const atRiskCustomers = (response.atRiskCustomers ?? response.AtRiskCustomers ?? []).map((item: any) => ({
    name: item.name ?? item.Name,
    daysSince: item.daysSince ?? item.DaysSince ?? 0,
    score: item.score ?? item.Score ?? 0,
    riskDriver: item.riskDriver ?? item.RiskDriver,
  }));

  return {
    ...response,
    stats,
    atRiskCustomers,
    recoveryAnalytics: response.recoveryAnalytics ?? response.RecoveryAnalytics,
    segmentAnalytics: response.segmentAnalytics ?? response.SegmentAnalytics,
    workQueueSummary,
    suggestedAction,
  };
};

export const getDashboardDataQueryOptions = (
  params: DashboardQueryParams = {},
) => {
  return {
    queryKey: ['dashboard', params],
    queryFn: () => getDashboardData(params),
  };
};

export const useGetDashboardData = (
  params?: DashboardQueryParams,
  queryConfig?: QueryConfig<typeof getDashboardDataQueryOptions>,
) => {
  return useQuery({
    ...getDashboardDataQueryOptions(params),
    ...queryConfig,
  });
};

type IntegrationStatusApiItem = {
  status?: string;
  Status?: string;
  isTokenExpired?: boolean;
  IsTokenExpired?: boolean;
};

export type DashboardIntegrationStatus = {
  hasActiveIntegration: boolean;
  connectedCount: number;
};

export const getDashboardIntegrationStatus = async (): Promise<DashboardIntegrationStatus> => {
  const response = await api.get('/integrations');
  const items: IntegrationStatusApiItem[] = Array.isArray(response)
    ? response
    : [];

  const connectedCount = items.filter((item) => {
    const status = String(item.status ?? item.Status ?? '').toLowerCase();
    const isTokenExpired = Boolean(
      item.isTokenExpired ?? item.IsTokenExpired ?? false,
    );
    return status === 'connected' && !isTokenExpired;
  }).length;

  return {
    hasActiveIntegration: connectedCount > 0,
    connectedCount,
  };
};

export const getDashboardIntegrationStatusQueryOptions = () => {
  return {
    queryKey: ['dashboard', 'integration-status'],
    queryFn: () => getDashboardIntegrationStatus(),
  };
};

export const useGetDashboardIntegrationStatus = (
  queryConfig?: QueryConfig<typeof getDashboardIntegrationStatusQueryOptions>,
) => {
  return useQuery({
    ...getDashboardIntegrationStatusQueryOptions(),
    ...queryConfig,
  });
};

export const getDashboardSegmentsList = async (): Promise<DashboardSegmentOption[]> => {
  const response = await api.get('/segments') as any[];
  const list = Array.isArray(response) ? response : [];

  return list.map((segment: any) => ({
    id: segment.id ?? segment.Id,
    name: segment.name ?? segment.Name,
    customerCount: segment.customerCount ?? segment.CustomerCount,
  }));
};

export const getDashboardSegmentsListQueryOptions = () => {
  return {
    queryKey: ['dashboard', 'segments-list'],
    queryFn: () => getDashboardSegmentsList(),
  };
};

export const useGetDashboardSegmentsList = (
  queryConfig?: QueryConfig<typeof getDashboardSegmentsListQueryOptions>,
) => {
  return useQuery({
    ...getDashboardSegmentsListQueryOptions(),
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
