import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import {
  RecoveryKPIs,
  RecoveryTimelinePoint,
  RecoveryBySegmentEntry,
  RecoveryReasonEntry
} from '@/types/recovery';

// Insights-specific API responses
export interface RecoveryInsightsResponse {
  kpis: RecoveryKPIs;
  timeline: RecoveryTimelinePoint[];
  bySegment: RecoveryBySegmentEntry[];
  reasons: RecoveryReasonEntry[];
}

export const getRecoveryInsights = async (): Promise<RecoveryInsightsResponse> => {
  return await api.get('/insights/recovery');
};

export const useGetRecoveryInsights = () => {
  return useQuery({
    queryKey: ['insights', 'recovery'],
    queryFn: getRecoveryInsights,
  });
};
