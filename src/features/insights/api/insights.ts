// src/features/insights/api/insights.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { BehaviorInsight, ChurnPredictionData, CohortData, DemographicData, FlowTemplate, KPIData, LTVData, RecoveryFlow, RevenueData, RiskFactor } from '@/types/api';



// Mock data (replace with actual API calls when backend is ready)
const mockChurnPredictionData: ChurnPredictionData[] = [
  { month: 'Jan', predicted: 8.2, actual: 7.9 },
  { month: 'Feb', predicted: 7.8, actual: 8.1 },
  { month: 'Mar', predicted: 6.5, actual: 6.8 },
  { month: 'Apr', predicted: 9.1, actual: 8.9 },
  { month: 'May', predicted: 8.2, actual: null },
  { month: 'Jun', predicted: 7.6, actual: null },
];

const mockRiskFactors: RiskFactor[] = [
  { factor: 'Payment Failures', impact: 'High', percentage: 85, color: 'text-red-400' },
  { factor: 'Low Engagement', impact: 'High', percentage: 78, color: 'text-red-400' },
  { factor: 'Support Tickets', impact: 'Medium', percentage: 62, color: 'text-orange-400' },
  { factor: 'Feature Usage', impact: 'Medium', percentage: 56, color: 'text-orange-400' },
  { factor: 'Login Frequency', impact: 'Low', percentage: 34, color: 'text-yellow-400' },
];

const mockRevenueData: RevenueData[] = [
  { month: 'Jan', revenue: 45000, recovered: 8200, churn: 12000 },
  { month: 'Feb', revenue: 48000, recovered: 9100, churn: 11200 },
  { month: 'Mar', revenue: 52000, recovered: 10800, churn: 9800 },
  { month: 'Apr', revenue: 49000, recovered: 12400, churn: 13500 },
  { month: 'May', revenue: 55000, recovered: 11600, churn: 10100 },
  { month: 'Jun', revenue: 58000, recovered: 13200, churn: 9400 },
];

const mockKPIData: KPIData[] = [
  { metric: 'Monthly Recurring Revenue', value: '$58,000', change: '+12.3%', trend: 'up' },
  { metric: 'Churn Rate', value: '8.2%', change: '-2.1%', trend: 'down' },
  { metric: 'Recovery Rate', value: '73%', change: '+8.5%', trend: 'up' },
  { metric: 'Customer Acquisition Cost', value: '$89', change: '-15.2%', trend: 'down' },
];

const mockDemographicData: DemographicData[] = [
  { name: 'Women 35+', value: 35, ltv: 185, color: '#8b5cf6' },
  { name: 'Men 35+', value: 28, ltv: 142, color: '#06b6d4' },
  { name: 'Women 25-34', value: 22, ltv: 128, color: '#10b981' },
  { name: 'Men 25-34', value: 15, ltv: 95, color: '#f59e0b' },
];

const mockBehaviorInsights: BehaviorInsight[] = [
  {
    insight: 'Women aged 35+ have 30% higher LTV than men of the same age group',
    impact: 'High',
    action: 'Target marketing campaigns towards this demographic',
    metric: '+30% LTV'
  },
  {
    insight: 'Enterprise customers show 45% better retention than SMB',
    impact: 'High',
    action: 'Focus sales efforts on enterprise prospects',
    metric: '+45% retention'
  },
  {
    insight: 'Mobile-first users have 25% lower engagement',
    impact: 'Medium',
    action: 'Improve mobile app experience and features',
    metric: '-25% engagement'
  },
  {
    insight: 'Customers onboarded with demo calls have 60% lower churn',
    impact: 'High',
    action: 'Increase demo call conversion rate',
    metric: '-60% churn'
  }
];

const mockLTVData: LTVData[] = [
  { segment: 'Premium', current: 280, previous: 245, growth: 14.3 },
  { segment: 'Pro', current: 135, previous: 128, growth: 5.5 },
  { segment: 'Basic', current: 85, previous: 92, growth: -7.6 },
  { segment: 'Trial', current: 12, previous: 15, growth: -20.0 },
];

const mockCohortData: CohortData[] = [
  { month: 'Jan Cohort', retention: 92, ltv: 156 },
  { month: 'Feb Cohort', retention: 89, ltv: 142 },
  { month: 'Mar Cohort', retention: 91, ltv: 165 },
  { month: 'Apr Cohort', retention: 94, ltv: 178 },
  { month: 'May Cohort', retention: 88, ltv: 134 },
];

const mockRecoveryFlows: RecoveryFlow[] = [
  {
    id: 'payment-failed',
    name: 'Payment Recovery Flow',
    status: 'Active',
    type: 'Automated',
    trigger: 'Payment Failed',
    channels: ['Email', 'SMS'],
    success_rate: 73,
    recovered_revenue: '$18,420',
    steps: [
      { step: 1, type: 'email', delay: '1 hour', subject: 'Payment Update Required', open_rate: 68 },
      { step: 2, type: 'sms', delay: '24 hours', subject: 'Quick payment reminder', response_rate: 45 },
      { step: 3, type: 'email', delay: '3 days', subject: 'Special offer to stay', open_rate: 52 },
      { step: 4, type: 'phone', delay: '7 days', subject: 'Personal outreach call', conversion: 35 }
    ]
  },
  {
    id: 'inactive-users',
    name: 'Re-engagement Campaign',
    status: 'Active',
    type: 'AI-Generated',
    trigger: '14 days inactive',
    channels: ['Email', 'In-App'],
    success_rate: 41,
    recovered_revenue: '$12,680',
    steps: [
      { step: 1, type: 'email', delay: 'Immediate', subject: 'We miss you! Here\'s what\'s new', open_rate: 34 },
      { step: 2, type: 'in-app', delay: '2 days', subject: 'Feature highlight notification', click_rate: 28 },
      { step: 3, type: 'email', delay: '5 days', subject: 'Exclusive discount just for you', open_rate: 45 },
    ]
  },
  {
    id: 'high-risk',
    name: 'High-Risk Intervention',
    status: 'Active',
    type: 'Behavioral',
    trigger: 'Churn risk >80%',
    channels: ['Email', 'SMS', 'Phone'],
    success_rate: 62,
    recovered_revenue: '$24,750',
    steps: [
      { step: 1, type: 'email', delay: 'Immediate', subject: 'Let\'s schedule a quick chat', open_rate: 58 },
      { step: 2, type: 'phone', delay: '2 days', subject: 'Personal check-in call', conversion: 42 },
      { step: 3, type: 'email', delay: '5 days', subject: 'Custom success plan', open_rate: 61 },
    ]
  }
];

const mockFlowTemplates: FlowTemplate[] = [
  { name: 'Winback Campaign', trigger: 'Cancelled subscription', success_rate: 28 },
  { name: 'Trial Extension', trigger: 'Trial ending soon', success_rate: 54 },
  { name: 'Feature Adoption', trigger: 'Low feature usage', success_rate: 39 },
  { name: 'Upgrade Nudge', trigger: 'Usage limit reached', success_rate: 67 },
];

// API Functions
export const getChurnPredictionData = async (): Promise<{ data: ChurnPredictionData[], riskFactors: RiskFactor[] }> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get('/insights/churn-prediction');
  return { data: mockChurnPredictionData, riskFactors: mockRiskFactors };
};

export const getRevenueAnalytics = async (): Promise<{ revenueData: RevenueData[], kpiData: KPIData[] }> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get('/insights/revenue-analytics');
  return { revenueData: mockRevenueData, kpiData: mockKPIData };
};

export const getDemographicInsights = async (): Promise<{ demographicData: DemographicData[], behaviorInsights: BehaviorInsight[] }> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get('/insights/demographic');
  return { demographicData: mockDemographicData, behaviorInsights: mockBehaviorInsights };
};

export const getLTVAnalytics = async (): Promise<{ ltvData: LTVData[], cohortData: CohortData[] }> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get('/insights/ltv-analytics');
  return { ltvData: mockLTVData, cohortData: mockCohortData };
};

export const getRecoveryFlows = async (): Promise<{ flows: RecoveryFlow[], templates: FlowTemplate[] }> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get('/insights/recovery-flows');
  return { flows: mockRecoveryFlows, templates: mockFlowTemplates };
};

// Query Options
export const getChurnPredictionDataQueryOptions = () => ({
  queryKey: ['insights', 'churn-prediction'],
  queryFn: () => getChurnPredictionData(),
});

export const getRevenueAnalyticsQueryOptions = () => ({
  queryKey: ['insights', 'revenue-analytics'],
  queryFn: () => getRevenueAnalytics(),
});

export const getDemographicInsightsQueryOptions = () => ({
  queryKey: ['insights', 'demographic'],
  queryFn: () => getDemographicInsights(),
});

export const getLTVAnalyticsQueryOptions = () => ({
  queryKey: ['insights', 'ltv-analytics'],
  queryFn: () => getLTVAnalytics(),
});

export const getRecoveryFlowsQueryOptions = () => ({
  queryKey: ['insights', 'recovery-flows'],
  queryFn: () => getRecoveryFlows(),
});

// Hooks
export const useGetChurnPredictionData = (queryConfig?: QueryConfig<typeof getChurnPredictionDataQueryOptions>) => {
  return useQuery({
    ...getChurnPredictionDataQueryOptions(),
    ...queryConfig,
  });
};

export const useGetRevenueAnalytics = (queryConfig?: QueryConfig<typeof getRevenueAnalyticsQueryOptions>) => {
  return useQuery({
    ...getRevenueAnalyticsQueryOptions(),
    ...queryConfig,
  });
};

export const useGetDemographicInsights = (queryConfig?: QueryConfig<typeof getDemographicInsightsQueryOptions>) => {
  return useQuery({
    ...getDemographicInsightsQueryOptions(),
    ...queryConfig,
  });
};

export const useGetLTVAnalytics = (queryConfig?: QueryConfig<typeof getLTVAnalyticsQueryOptions>) => {
  return useQuery({
    ...getLTVAnalyticsQueryOptions(),
    ...queryConfig,
  });
};

export const useGetRecoveryFlows = (queryConfig?: QueryConfig<typeof getRecoveryFlowsQueryOptions>) => {
  return useQuery({
    ...getRecoveryFlowsQueryOptions(),
    ...queryConfig,
  });
};