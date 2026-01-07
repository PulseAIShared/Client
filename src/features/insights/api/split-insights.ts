// API hooks for split insights endpoints
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import {
  InsightsOverviewResponse,
  ChurnInsightsResponse,
  CohortInsightsResponse,
  FeatureInsightsResponse,
  RecommendationInsightsResponse,
  EarlyWarningsResponse,
  AccuracyInsightsResponse,
  SegmentInsightsResponse,
  RecoveryInsightsResponse,
  CohortQueryParams,
  SegmentQueryParams,
  RecoveryQueryParams,
} from '@/types/insights';

// ==========================================
// Overview - GET /insights/overview
// ==========================================
export const getInsightsOverview = async (): Promise<InsightsOverviewResponse> => {
  return api.get('/insights/overview');
};

export const getInsightsOverviewQueryOptions = () => ({
  queryKey: ['insights', 'overview'],
  queryFn: getInsightsOverview,
  staleTime: 30 * 1000, // 30 seconds
});

export const useInsightsOverview = (
  queryConfig?: QueryConfig<typeof getInsightsOverviewQueryOptions>
) => {
  return useQuery({
    ...getInsightsOverviewQueryOptions(),
    ...queryConfig,
  });
};

// ==========================================
// Churn - GET /insights/churn
// ==========================================
export const getChurnInsights = async (): Promise<ChurnInsightsResponse> => {
  return api.get('/insights/churn');
};

export const getChurnInsightsQueryOptions = () => ({
  queryKey: ['insights', 'churn'],
  queryFn: getChurnInsights,
  staleTime: 60 * 1000, // 1 minute
});

export const useChurnInsights = (
  queryConfig?: QueryConfig<typeof getChurnInsightsQueryOptions>
) => {
  return useQuery({
    ...getChurnInsightsQueryOptions(),
    ...queryConfig,
  });
};

// ==========================================
// Cohorts - GET /insights/cohorts
// ==========================================
export const getCohortInsights = async (params?: CohortQueryParams): Promise<CohortInsightsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.cohortType) queryParams.append('cohortType', params.cohortType);
  if (params?.period) queryParams.append('period', params.period);
  const queryString = queryParams.toString();
  return api.get(`/insights/cohorts${queryString ? `?${queryString}` : ''}`);
};

export const getCohortInsightsQueryOptions = (params?: CohortQueryParams) => ({
  queryKey: ['insights', 'cohorts', params],
  queryFn: () => getCohortInsights(params),
  staleTime: 2 * 60 * 1000, // 2 minutes
});

export const useCohortInsights = (
  params?: CohortQueryParams,
  queryConfig?: QueryConfig<typeof getCohortInsightsQueryOptions>
) => {
  return useQuery({
    ...getCohortInsightsQueryOptions(params),
    ...queryConfig,
  });
};

// ==========================================
// Features - GET /insights/features
// ==========================================
export const getFeatureInsights = async (): Promise<FeatureInsightsResponse> => {
  return api.get('/insights/features');
};

export const getFeatureInsightsQueryOptions = () => ({
  queryKey: ['insights', 'features'],
  queryFn: getFeatureInsights,
  staleTime: 2 * 60 * 1000, // 2 minutes
});

export const useFeatureInsights = (
  queryConfig?: QueryConfig<typeof getFeatureInsightsQueryOptions>
) => {
  return useQuery({
    ...getFeatureInsightsQueryOptions(),
    ...queryConfig,
  });
};

// ==========================================
// Recommendations - GET /insights/recommendations
// ==========================================
export const getRecommendationInsights = async (): Promise<RecommendationInsightsResponse> => {
  return api.get('/insights/recommendations');
};

export const getRecommendationInsightsQueryOptions = () => ({
  queryKey: ['insights', 'recommendations'],
  queryFn: getRecommendationInsights,
  staleTime: 30 * 1000, // 30 seconds
});

export const useRecommendationInsights = (
  queryConfig?: QueryConfig<typeof getRecommendationInsightsQueryOptions>
) => {
  return useQuery({
    ...getRecommendationInsightsQueryOptions(),
    ...queryConfig,
  });
};

// ==========================================
// Early Warnings - GET /insights/early-warnings
// ==========================================
export const getEarlyWarnings = async (): Promise<EarlyWarningsResponse> => {
  return api.get('/insights/early-warnings');
};

export const getEarlyWarningsQueryOptions = () => ({
  queryKey: ['insights', 'early-warnings'],
  queryFn: getEarlyWarnings,
  staleTime: 30 * 1000, // 30 seconds
});

export const useEarlyWarnings = (
  queryConfig?: QueryConfig<typeof getEarlyWarningsQueryOptions>
) => {
  return useQuery({
    ...getEarlyWarningsQueryOptions(),
    ...queryConfig,
  });
};

// ==========================================
// Accuracy - GET /insights/accuracy
// ==========================================
export const getAccuracyInsights = async (): Promise<AccuracyInsightsResponse> => {
  return api.get('/insights/accuracy');
};

export const getAccuracyInsightsQueryOptions = () => ({
  queryKey: ['insights', 'accuracy'],
  queryFn: getAccuracyInsights,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

export const useAccuracyInsights = (
  queryConfig?: QueryConfig<typeof getAccuracyInsightsQueryOptions>
) => {
  return useQuery({
    ...getAccuracyInsightsQueryOptions(),
    ...queryConfig,
  });
};

// ==========================================
// Segments - GET /insights/segments
// ==========================================
export const getSegmentInsights = async (params?: SegmentQueryParams): Promise<SegmentInsightsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.segment) queryParams.append('segment', params.segment);
  const queryString = queryParams.toString();
  return api.get(`/insights/segments${queryString ? `?${queryString}` : ''}`);
};

export const getSegmentInsightsQueryOptions = (params?: SegmentQueryParams) => ({
  queryKey: ['insights', 'segments', params],
  queryFn: () => getSegmentInsights(params),
  staleTime: 2 * 60 * 1000, // 2 minutes
});

export const useSegmentInsights = (
  params?: SegmentQueryParams,
  queryConfig?: QueryConfig<typeof getSegmentInsightsQueryOptions>
) => {
  return useQuery({
    ...getSegmentInsightsQueryOptions(params),
    ...queryConfig,
  });
};

// ==========================================
// Recovery - GET /insights/recovery
// ==========================================
export const getRecoveryInsights = async (params?: RecoveryQueryParams): Promise<RecoveryInsightsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.period) queryParams.append('period', params.period);
  const queryString = queryParams.toString();
  return api.get(`/insights/recovery${queryString ? `?${queryString}` : ''}`);
};

export const getRecoveryInsightsQueryOptions = (params?: RecoveryQueryParams) => ({
  queryKey: ['insights', 'recovery', params],
  queryFn: () => getRecoveryInsights(params),
  staleTime: 60 * 1000, // 1 minute
});

export const useRecoveryInsights = (
  params?: RecoveryQueryParams,
  queryConfig?: QueryConfig<typeof getRecoveryInsightsQueryOptions>
) => {
  return useQuery({
    ...getRecoveryInsightsQueryOptions(params),
    ...queryConfig,
  });
};
