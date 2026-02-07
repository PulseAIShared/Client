import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import {
  ImpactChurnDistributionBucket,
  ImpactRecoveryFunnelResponse,
  ImpactPlaybookPerformanceItem,
  ImpactPlaybookPerformanceResponse,
  ImpactQueryContract,
  ImpactRecoveryKpis,
  ImpactSegmentOption,
  ImpactSummaryResponse,
  ImpactTrendInterval,
  ImpactTrendPoint,
  ImpactTrendsResponse,
} from '@/types/api';

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  return fallback;
};

const mapImpactRecoveryKpis = (raw: any): ImpactRecoveryKpis => ({
  missedPaymentsCount: toNumber(raw?.missedPaymentsCount ?? raw?.MissedPaymentsCount),
  missedAmount: toNumber(raw?.missedAmount ?? raw?.MissedAmount),
  missedAmountPriorPeriod: toNumber(raw?.missedAmountPriorPeriod ?? raw?.MissedAmountPriorPeriod),
  recoveredAmount: toNumber(raw?.recoveredAmount ?? raw?.RecoveredAmount),
  recoveredAmountPriorPeriod: toNumber(raw?.recoveredAmountPriorPeriod ?? raw?.RecoveredAmountPriorPeriod),
  recoveryRate: toNumber(raw?.recoveryRate ?? raw?.RecoveryRate),
  recoveryRatePriorPeriod: toNumber(raw?.recoveryRatePriorPeriod ?? raw?.RecoveryRatePriorPeriod),
  averageDaysToRecover: toNumber(raw?.averageDaysToRecover ?? raw?.AverageDaysToRecover),
  averageDaysToRecoverPriorPeriod: toNumber(
    raw?.averageDaysToRecoverPriorPeriod ?? raw?.AverageDaysToRecoverPriorPeriod,
  ),
  allTimeRecoveredAmount: toNumber(raw?.allTimeRecoveredAmount ?? raw?.AllTimeRecoveredAmount),
  hasRecoveryData: toBoolean(raw?.hasRecoveryData ?? raw?.HasRecoveryData),
});

const mapImpactPlaybookPerformanceItem = (
  raw: any,
): ImpactPlaybookPerformanceItem => ({
  playbookId: raw?.playbookId ?? raw?.PlaybookId,
  name: raw?.name ?? raw?.Name ?? 'Untitled playbook',
  status: raw?.status ?? raw?.Status,
  priority: toNumber(raw?.priority ?? raw?.Priority),
  signalType: raw?.signalType ?? raw?.SignalType ?? null,
  customersReached: toNumber(raw?.customersReached ?? raw?.CustomersReached),
  runs: toNumber(raw?.runs ?? raw?.Runs),
  recoveredRevenue: toNumber(raw?.recoveredRevenue ?? raw?.RecoveredRevenue),
  recoveryRate: toNumber(raw?.recoveryRate ?? raw?.RecoveryRate),
  averageRecoveryTimeDays: toNumber(
    raw?.averageRecoveryTimeDays ?? raw?.AverageRecoveryTimeDays,
  ),
  eligibleCustomers: toNumber(raw?.eligibleCustomers ?? raw?.EligibleCustomers),
  eligibleAmount: toNumber(raw?.eligibleAmount ?? raw?.EligibleAmount),
  actionedCustomers: toNumber(raw?.actionedCustomers ?? raw?.ActionedCustomers),
  actionedAmount: toNumber(raw?.actionedAmount ?? raw?.ActionedAmount),
  coverageRate: toNumber(raw?.coverageRate ?? raw?.CoverageRate),
  missedWhilePaused: toNumber(raw?.missedWhilePaused ?? raw?.MissedWhilePaused),
  missedWhilePausedAmount: toNumber(
    raw?.missedWhilePausedAmount ?? raw?.MissedWhilePausedAmount,
  ),
  hasActivityInPeriod: toBoolean(raw?.hasActivityInPeriod ?? raw?.HasActivityInPeriod),
});

const mapImpactTrendPoint = (
  raw: any,
): ImpactTrendPoint => ({
  bucketStart: raw?.bucketStart ?? raw?.BucketStart,
  revenueAtRisk: toNumber(raw?.revenueAtRisk ?? raw?.RevenueAtRisk),
  revenueRecovered: toNumber(raw?.revenueRecovered ?? raw?.RevenueRecovered),
  recoveryRate: toNumber(raw?.recoveryRate ?? raw?.RecoveryRate),
});

const mapImpactChurnDistributionBucket = (
  raw: any,
): ImpactChurnDistributionBucket => ({
  bucket: raw?.bucket ?? raw?.Bucket ?? 'Unknown',
  customerCount: toNumber(raw?.customerCount ?? raw?.CustomerCount),
});

export const getImpactSummary = async (
  params: ImpactQueryContract,
): Promise<ImpactSummaryResponse> => {
  const response = await api.get('/dashboard', {
    params: {
      from: params.from,
      to: params.to,
      segmentId: params.segmentId,
    },
  }) as any;

  const recoveryAnalytics = response?.recoveryAnalytics ?? response?.RecoveryAnalytics;
  const kpis = recoveryAnalytics?.kpis ?? recoveryAnalytics?.Kpis;

  return {
    recoveryKpis: mapImpactRecoveryKpis(kpis),
  };
};

export const getImpactSummaryQueryOptions = (
  params: ImpactQueryContract,
  enabled = true,
) => ({
  queryKey: ['impact', 'summary', params],
  queryFn: () => getImpactSummary(params),
  enabled,
});

export const useGetImpactSummary = (
  params: ImpactQueryContract,
  enabled = true,
  queryConfig?: QueryConfig<typeof getImpactSummaryQueryOptions>,
) => {
  return useQuery({
    ...getImpactSummaryQueryOptions(params, enabled),
    ...queryConfig,
  });
};

export const getImpactSegments = async (): Promise<ImpactSegmentOption[]> => {
  const response = await api.get('/segments') as any[];
  const list = Array.isArray(response) ? response : [];

  return list.map((segment: any) => ({
    id: segment.id ?? segment.Id,
    name: segment.name ?? segment.Name,
    customerCount: segment.customerCount ?? segment.CustomerCount,
  }));
};

export const getImpactSegmentsQueryOptions = () => ({
  queryKey: ['impact', 'segments'],
  queryFn: getImpactSegments,
});

export const useGetImpactSegments = (
  queryConfig?: QueryConfig<typeof getImpactSegmentsQueryOptions>,
) => {
  return useQuery({
    ...getImpactSegmentsQueryOptions(),
    ...queryConfig,
  });
};

export const getImpactPlaybookPerformance = async (
  params: ImpactQueryContract,
): Promise<ImpactPlaybookPerformanceResponse> => {
  const response = await api.get('/analytics/impact/playbook-performance', {
    params: {
      from: params.from,
      to: params.to,
      segmentId: params.segmentId,
    },
  }) as any;

  const playbooksRaw = response?.playbooks ?? response?.Playbooks ?? [];

  return {
    from: response?.from ?? response?.From ?? params.from,
    to: response?.to ?? response?.To ?? params.to,
    segmentId: response?.segmentId ?? response?.SegmentId ?? params.segmentId ?? null,
    totalPlaybooks: toNumber(response?.totalPlaybooks ?? response?.TotalPlaybooks),
    activePlaybookCount: toNumber(response?.activePlaybookCount ?? response?.ActivePlaybookCount),
    pausedPlaybookCount: toNumber(response?.pausedPlaybookCount ?? response?.PausedPlaybookCount),
    totalRunsInPeriod: toNumber(response?.totalRunsInPeriod ?? response?.TotalRunsInPeriod),
    totalRecoveredRevenueInPeriod: toNumber(
      response?.totalRecoveredRevenueInPeriod ?? response?.TotalRecoveredRevenueInPeriod,
    ),
    hasActivityInPeriod: toBoolean(response?.hasActivityInPeriod ?? response?.HasActivityInPeriod),
    noActivePlaybooks: toBoolean(response?.noActivePlaybooks ?? response?.NoActivePlaybooks),
    allPlaybooksPaused: toBoolean(response?.allPlaybooksPaused ?? response?.AllPlaybooksPaused),
    noActivityInPeriod: toBoolean(response?.noActivityInPeriod ?? response?.NoActivityInPeriod),
    playbooks: Array.isArray(playbooksRaw)
      ? playbooksRaw.map(mapImpactPlaybookPerformanceItem)
      : [],
  };
};

export const getImpactPlaybookPerformanceQueryOptions = (
  params: ImpactQueryContract,
  enabled = true,
) => ({
  queryKey: ['impact', 'playbook-performance', params],
  queryFn: () => getImpactPlaybookPerformance(params),
  enabled,
});

export const useGetImpactPlaybookPerformance = (
  params: ImpactQueryContract,
  enabled = true,
  queryConfig?: QueryConfig<typeof getImpactPlaybookPerformanceQueryOptions>,
) => {
  return useQuery({
    ...getImpactPlaybookPerformanceQueryOptions(params, enabled),
    ...queryConfig,
  });
};

export type ImpactTrendsQueryContract = ImpactQueryContract & {
  interval?: ImpactTrendInterval;
};

export const getImpactTrends = async (
  params: ImpactTrendsQueryContract,
): Promise<ImpactTrendsResponse> => {
  const response = await api.get('/analytics/impact/trends', {
    params: {
      from: params.from,
      to: params.to,
      segmentId: params.segmentId,
      interval: params.interval,
    },
  }) as any;

  const pointsRaw = response?.points ?? response?.Points ?? [];
  const churnDistributionRaw = response?.churnDistribution ?? response?.ChurnDistribution ?? [];
  const intervalRaw = (response?.interval ?? response?.Interval ?? params.interval ?? 'daily') as string;
  const interval: ImpactTrendInterval = intervalRaw === 'weekly' ? 'weekly' : 'daily';

  return {
    from: response?.from ?? response?.From ?? params.from,
    to: response?.to ?? response?.To ?? params.to,
    segmentId: response?.segmentId ?? response?.SegmentId ?? params.segmentId ?? null,
    interval,
    hasSufficientData: toBoolean(response?.hasSufficientData ?? response?.HasSufficientData),
    points: Array.isArray(pointsRaw)
      ? pointsRaw.map(mapImpactTrendPoint)
      : [],
    churnDistribution: Array.isArray(churnDistributionRaw)
      ? churnDistributionRaw.map(mapImpactChurnDistributionBucket)
      : [],
  };
};

export const getImpactTrendsQueryOptions = (
  params: ImpactTrendsQueryContract,
  enabled = true,
) => ({
  queryKey: ['impact', 'trends', params],
  queryFn: () => getImpactTrends(params),
  enabled,
});

export const useGetImpactTrends = (
  params: ImpactTrendsQueryContract,
  enabled = true,
  queryConfig?: QueryConfig<typeof getImpactTrendsQueryOptions>,
) => {
  return useQuery({
    ...getImpactTrendsQueryOptions(params, enabled),
    ...queryConfig,
  });
};

export const getImpactRecoveryFunnel = async (
  params: ImpactQueryContract,
): Promise<ImpactRecoveryFunnelResponse> => {
  const response = await api.get('/analytics/impact/funnel', {
    params: {
      from: params.from,
      to: params.to,
      segmentId: params.segmentId,
    },
  }) as any;

  return {
    from: response?.from ?? response?.From ?? params.from,
    to: response?.to ?? response?.To ?? params.to,
    segmentId: response?.segmentId ?? response?.SegmentId ?? params.segmentId ?? null,
    totalAtRisk: toNumber(response?.totalAtRisk ?? response?.TotalAtRisk),
    actioned: toNumber(response?.actioned ?? response?.Actioned),
    recovered: toNumber(response?.recovered ?? response?.Recovered),
    lost: toNumber(response?.lost ?? response?.Lost),
    atRiskCustomers: toNumber(response?.atRiskCustomers ?? response?.AtRiskCustomers),
    actionedCustomers: toNumber(response?.actionedCustomers ?? response?.ActionedCustomers),
    recoveredCustomers: toNumber(response?.recoveredCustomers ?? response?.RecoveredCustomers),
    hasData: toBoolean(response?.hasData ?? response?.HasData),
  };
};

export const getImpactRecoveryFunnelQueryOptions = (
  params: ImpactQueryContract,
  enabled = true,
) => ({
  queryKey: ['impact', 'funnel', params],
  queryFn: () => getImpactRecoveryFunnel(params),
  enabled,
});

export const useGetImpactRecoveryFunnel = (
  params: ImpactQueryContract,
  enabled = true,
  queryConfig?: QueryConfig<typeof getImpactRecoveryFunnelQueryOptions>,
) => {
  return useQuery({
    ...getImpactRecoveryFunnelQueryOptions(params, enabled),
    ...queryConfig,
  });
};
