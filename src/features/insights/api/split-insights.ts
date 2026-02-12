import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig, QueryConfig } from '@/lib/react-query';
import {
  AccuracyInsightsResponse,
  DataHealthInsightsResponse,
  DriverInsightsDetailResponse,
  DriversInsightsResponse,
  InsightsOverviewResponse,
  InsightsQueryFilters,
  SegmentInsightsResponse,
  SegmentQueryParams,
} from '@/types/insights';

const appendInsightsFilters = (
  queryParams: URLSearchParams,
  filters?: InsightsQueryFilters,
) => {
  if (!filters) {
    return;
  }

  if (filters.from) queryParams.append('from', filters.from);
  if (filters.to) queryParams.append('to', filters.to);
  if (filters.range) queryParams.append('range', filters.range);
  if (filters.riskBucket) queryParams.append('riskBucket', filters.riskBucket);
  if (filters.planTier) queryParams.append('planTier', filters.planTier);
  if (filters.lifecycleStage) queryParams.append('lifecycleStage', filters.lifecycleStage);
  if (filters.acquisitionChannel) queryParams.append('acquisitionChannel', filters.acquisitionChannel);
  if (filters.companySize) queryParams.append('companySize', filters.companySize);
  if (filters.geo) queryParams.append('geo', filters.geo);
  if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
};

const buildQueryString = (queryParams: URLSearchParams) => {
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const getInsightsOverview = async (
  filters?: InsightsQueryFilters,
): Promise<InsightsOverviewResponse> => {
  const queryParams = new URLSearchParams();
  appendInsightsFilters(queryParams, filters);
  return api.get(`/insights/overview${buildQueryString(queryParams)}`);
};

export const getInsightsOverviewQueryOptions = (filters?: InsightsQueryFilters) => ({
  queryKey: ['insights', 'overview', filters],
  queryFn: () => getInsightsOverview(filters),
  staleTime: 30 * 1000,
});

export const useInsightsOverview = (
  filters?: InsightsQueryFilters,
  queryConfig?: QueryConfig<typeof getInsightsOverviewQueryOptions>,
) => {
  return useQuery({
    ...getInsightsOverviewQueryOptions(filters),
    ...queryConfig,
  });
};

export const getDriversInsights = async (
  filters?: InsightsQueryFilters,
): Promise<DriversInsightsResponse> => {
  const queryParams = new URLSearchParams();
  appendInsightsFilters(queryParams, filters);
  return api.get(`/insights/drivers${buildQueryString(queryParams)}`);
};

export const getDriversInsightsQueryOptions = (filters?: InsightsQueryFilters) => ({
  queryKey: ['insights', 'drivers', filters],
  queryFn: () => getDriversInsights(filters),
  staleTime: 60 * 1000,
});

export const useDriversInsights = (
  filters?: InsightsQueryFilters,
  queryConfig?: QueryConfig<typeof getDriversInsightsQueryOptions>,
) => {
  return useQuery({
    ...getDriversInsightsQueryOptions(filters),
    ...queryConfig,
  });
};

export const getDriverInsightsDetail = async (
  driverKey: string,
  filters?: InsightsQueryFilters,
): Promise<DriverInsightsDetailResponse> => {
  const queryParams = new URLSearchParams();
  appendInsightsFilters(queryParams, filters);
  return api.get(`/insights/drivers/${encodeURIComponent(driverKey)}${buildQueryString(queryParams)}`);
};

export const getDriverInsightsDetailQueryOptions = (
  driverKey: string | null | undefined,
  filters?: InsightsQueryFilters,
) => ({
  queryKey: ['insights', 'drivers', 'detail', driverKey, filters],
  queryFn: () => getDriverInsightsDetail(driverKey ?? '', filters),
  enabled: !!driverKey,
  staleTime: 60 * 1000,
});

export const useDriverInsightsDetail = (
  driverKey: string | null | undefined,
  filters?: InsightsQueryFilters,
  queryConfig?: QueryConfig<typeof getDriverInsightsDetailQueryOptions>,
) => {
  return useQuery({
    ...getDriverInsightsDetailQueryOptions(driverKey, filters),
    ...queryConfig,
  });
};

export const getModelQualityInsights = async (
  filters?: InsightsQueryFilters,
): Promise<AccuracyInsightsResponse> => {
  const queryParams = new URLSearchParams();
  appendInsightsFilters(queryParams, filters);
  return api.get(`/insights/model-quality${buildQueryString(queryParams)}`);
};

export const getModelQualityInsightsQueryOptions = (filters?: InsightsQueryFilters) => ({
  queryKey: ['insights', 'model-quality', filters],
  queryFn: () => getModelQualityInsights(filters),
  staleTime: 5 * 60 * 1000,
});

export const useModelQualityInsights = (
  filters?: InsightsQueryFilters,
  queryConfig?: QueryConfig<typeof getModelQualityInsightsQueryOptions>,
) => {
  return useQuery({
    ...getModelQualityInsightsQueryOptions(filters),
    ...queryConfig,
  });
};

export const getDataHealthInsights = async (
  filters?: InsightsQueryFilters,
): Promise<DataHealthInsightsResponse> => {
  const queryParams = new URLSearchParams();
  appendInsightsFilters(queryParams, filters);
  return api.get(`/insights/data-health${buildQueryString(queryParams)}`);
};

export const getDataHealthInsightsQueryOptions = (filters?: InsightsQueryFilters) => ({
  queryKey: ['insights', 'data-health', filters],
  queryFn: () => getDataHealthInsights(filters),
  staleTime: 2 * 60 * 1000,
});

export const useDataHealthInsights = (
  filters?: InsightsQueryFilters,
  queryConfig?: QueryConfig<typeof getDataHealthInsightsQueryOptions>,
) => {
  return useQuery({
    ...getDataHealthInsightsQueryOptions(filters),
    ...queryConfig,
  });
};

export const getSegmentInsights = async (params?: SegmentQueryParams): Promise<SegmentInsightsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.segment) queryParams.append('segment', params.segment);
  appendInsightsFilters(queryParams, params);
  return api.get(`/insights/segments${buildQueryString(queryParams)}`);
};

export const getSegmentInsightsQueryOptions = (params?: SegmentQueryParams) => ({
  queryKey: ['insights', 'segments', params],
  queryFn: () => getSegmentInsights(params),
  staleTime: 2 * 60 * 1000,
});

export const useSegmentInsights = (
  params?: SegmentQueryParams,
  queryConfig?: QueryConfig<typeof getSegmentInsightsQueryOptions>,
) => {
  return useQuery({
    ...getSegmentInsightsQueryOptions(params),
    ...queryConfig,
  });
};

export type InsightsUiEventPayload = {
  eventName: string;
  tab?: string;
  context?: string;
  metadata?: Record<string, unknown>;
};

export const trackInsightsUiEvent = async (
  payload: InsightsUiEventPayload,
): Promise<{ tracked: boolean }> => {
  const response = await api.post('/insights/ui-events', payload);
  return response as unknown as { tracked: boolean };
};

type TrackInsightsUiEventMutation = (
  payload: InsightsUiEventPayload
) => Promise<{ tracked: boolean }>;

export const useTrackInsightsUiEvent = (
  mutationConfig?: MutationConfig<TrackInsightsUiEventMutation>,
) => {
  return useMutation({
    mutationFn: (payload: InsightsUiEventPayload) => trackInsightsUiEvent(payload),
    ...mutationConfig,
  });
};
