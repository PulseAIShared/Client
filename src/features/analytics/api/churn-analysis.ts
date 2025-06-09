import { api } from "@/lib/api-client";
import { MutationConfig, QueryConfig } from "@/lib/react-query";
import { CompletenessDataResponse, RunChurnAnalysisResponse } from "@/types/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export const checkChurnDataCompleteness = async (data: {
  customerIds: string[];
}): Promise<CompletenessDataResponse> => {
  return api.post('/analytics/churn/check-completeness', {
    customerIds: data.customerIds.map(id => id)
  });
};

export const runChurnAnalysis = async (data: {
  customerIds: string[];
  includeRecommendations?: boolean;
  includeRiskFactors?: boolean;
  modelVersion?: string;
}): Promise<RunChurnAnalysisResponse> => {
  return api.post('/analytics/churn/analyze', {
    customerIds: data.customerIds.map(id => id),
    includeRecommendations: data.includeRecommendations ?? true,
    includeRiskFactors: data.includeRiskFactors ?? true,
    modelVersion: data.modelVersion
  });
};

// Query Options
export const checkChurnDataCompletenessQueryOptions = (customerIds: string[]) => {
  return {
    queryKey: ['analytics', 'churn', 'completeness', customerIds],
    queryFn: () => checkChurnDataCompleteness({ customerIds }),
    enabled: false, // Only run when explicitly triggered
  };
};

// Hooks
export const useCheckChurnDataCompleteness = (options?: {
  mutationConfig?: MutationConfig<typeof checkChurnDataCompleteness>;
}) => {
  return useMutation({
    mutationFn: checkChurnDataCompleteness,
    ...options?.mutationConfig,
  });
};

export const useRunChurnAnalysis = (options?: {
  mutationConfig?: MutationConfig<typeof runChurnAnalysis>;
}) => {
  return useMutation({
    mutationFn: runChurnAnalysis,
    ...options?.mutationConfig,
  });
};

// Optional: If you want to fetch completeness data with useQuery instead of mutation
export const useGetChurnDataCompleteness = (
  customerIds: string[],
  queryConfig?: QueryConfig<typeof checkChurnDataCompletenessQueryOptions>
) => {
  return useQuery({
    ...checkChurnDataCompletenessQueryOptions(customerIds),
    ...queryConfig,
  });
};