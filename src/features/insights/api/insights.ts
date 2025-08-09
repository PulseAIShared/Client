// src/features/insights/api/insights.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { 
  BehaviorInsight, 
  ChurnPredictionData, 
  CohortData, 
  DemographicData, 
  FlowTemplate, 
  KPIData, 
  LTVData, 
  RecoveryFlow, 
  RevenueData, 
  RiskFactor,
  InsightsResponse,
  SegmentAnalyticsResponse,
  RecoveryAnalytics,
  MissedPaymentRow,
  RecoveryBySegmentEntry,
  RecoveryTimelinePoint,
  RecoveryReasonEntry
} from '@/types/api';

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
      { step: 1, type: 'email', delay: 'Immediate', subject: "We miss you! Here's what's new", open_rate: 34 },
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
      { step: 1, type: 'email', delay: 'Immediate', subject: "Let's schedule a quick chat", open_rate: 58 },
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

// Segment analytics mock
const mockSegmentAnalytics: SegmentAnalyticsResponse = {
  churnTrendsBySegment: [
    { month: 'Jan', Enterprise: 2.1, Trial: 15.2, Basic: 28.4 },
    { month: 'Feb', Enterprise: 1.8, Trial: 14.1, Basic: 26.8 },
    { month: 'Mar', Enterprise: 2.4, Trial: 12.9, Basic: 24.2 },
    { month: 'Apr', Enterprise: 1.9, Trial: 11.8, Basic: 22.1 },
    { month: 'May', Enterprise: 1.6, Trial: 10.5, Basic: 20.9 },
    { month: 'Jun', Enterprise: 1.4, Trial: 9.8, Basic: 19.6 },
  ] as any,
  revenueBySegment: [
    { segment: 'Enterprise', revenue: 450000, customers: 1240, avgRevenue: 363 },
    { segment: 'Pro Users', revenue: 180000, customers: 2890, avgRevenue: 62 },
    { segment: 'Trial Users', revenue: 45000, customers: 890, avgRevenue: 51 },
    { segment: 'Basic', revenue: 78000, customers: 3200, avgRevenue: 24 },
  ],
  segmentDistribution: [
    { name: 'Enterprise', value: 15, customers: 1240, color: '#8b5cf6' },
    { name: 'Pro Users', value: 35, customers: 2890, color: '#06b6d4' },
    { name: 'Trial Users', value: 12, customers: 890, color: '#10b981' },
    { name: 'Basic', value: 38, customers: 3200, color: '#f59e0b' },
  ],
  campaignPerformanceBySegment: [
    { segment: 'High-Value Enterprise', campaigns: 5, success_rate: 78, revenue_recovered: 42000 },
    { segment: 'Payment Failed Recovery', campaigns: 12, success_rate: 67, revenue_recovered: 18500 },
    { segment: 'Trial Power Users', campaigns: 8, success_rate: 45, revenue_recovered: 12800 },
    { segment: 'Young Professionals', campaigns: 6, success_rate: 52, revenue_recovered: 9200 },
    { segment: 'Feature Champions', campaigns: 4, success_rate: 71, revenue_recovered: 15600 },
  ],
};

// Recovery analytics mock
const mockRecoveryAnalytics: RecoveryAnalytics = {
  kpis: {
    missedPaymentsCount: 146,
    missedAmount: 124500,
    recoveredAmount: 78250,
    recoveryRate: 62,
    averageDaysToRecover: 4.6,
  },
  timeline: [
    { month: 'Jan', missedAmount: 21000, recoveredAmount: 12000 },
    { month: 'Feb', missedAmount: 19500, recoveredAmount: 11800 },
    { month: 'Mar', missedAmount: 18200, recoveredAmount: 13200 },
    { month: 'Apr', missedAmount: 22800, recoveredAmount: 14100 },
    { month: 'May', missedAmount: 21600, recoveredAmount: 14800 },
    { month: 'Jun', missedAmount: 22000, recoveredAmount: 16250 },
  ] as RecoveryTimelinePoint[],
  bySegment: [
    { segmentId: 'seg_ent', segmentName: 'Enterprise', missedAmount: 32000, recoveredAmount: 24000, recoveryRate: 75 },
    { segmentId: 'seg_pro', segmentName: 'Pro Users', missedAmount: 28000, recoveredAmount: 16000, recoveryRate: 57 },
    { segmentId: 'seg_trial', segmentName: 'Trial Users', missedAmount: 14500, recoveredAmount: 6200, recoveryRate: 43 },
    { segmentId: 'seg_basic', segmentName: 'Basic', missedAmount: 50000, recoveredAmount: 32050, recoveryRate: 64 },
  ] as RecoveryBySegmentEntry[],
  reasons: [
    { reason: 'Card expired', count: 64 },
    { reason: 'Insufficient funds', count: 38 },
    { reason: 'Network error', count: 22 },
    { reason: 'Bank declined', count: 18 },
    { reason: 'Unknown', count: 4 },
  ] as RecoveryReasonEntry[],
  tables: {
    missedPayments: [
      { id: 'mp_1', customer: 'Acme Corp', amount: 4500, dueDate: new Date().toISOString(), status: 'Open', attempts: 1, segmentTags: ['Enterprise'] },
      { id: 'mp_2', customer: 'Globex', amount: 299, dueDate: new Date().toISOString(), status: 'In Progress', attempts: 2, segmentTags: ['Pro Users'] },
      { id: 'mp_3', customer: 'Soylent', amount: 25, dueDate: new Date().toISOString(), status: 'Recovered', attempts: 1, segmentTags: ['Trial Users'] },
      { id: 'mp_4', customer: 'Initech', amount: 59, dueDate: new Date().toISOString(), status: 'Open', attempts: 3, segmentTags: ['Basic'] },
    ] as MissedPaymentRow[],
  },
};

export const getInsightsData = async (): Promise<InsightsResponse> => {
  try {
    return await api.get('/insights');
  } catch (error) {
    console.warn('Failed to fetch insights from API, using mock data:', error);
    // Return mock payload matching InsightsResponse
    const response: InsightsResponse = {
      header: { predictionAccuracy: 87.3, revenueSaved: '$4.2M' },
      analyticsOverview: { kpiData: mockKPIData, revenueData: mockRevenueData },
      churnPrediction: { predictionData: mockChurnPredictionData, riskFactors: mockRiskFactors },
      ltvAnalytics: { ltvData: mockLTVData, cohortData: mockCohortData },
      demographicInsights: { demographicData: mockDemographicData, behaviorInsights: mockBehaviorInsights },
      segmentAnalytics: mockSegmentAnalytics,
      recoveryAnalytics: mockRecoveryAnalytics,
      recoveryFlows: { flows: mockRecoveryFlows, templates: mockFlowTemplates },
      aiRecommendations: {
        recommendations: [
          { type: 'risk', title: 'High-Risk Alert', description: '23 customers entering critical churn risk zone', actionText: 'Launch Intervention', iconType: 'alert', count: 23 },
          { type: 'upsell', title: 'Upsell Opportunity', description: '156 customers ready for premium upgrade', actionText: 'Create Campaign', iconType: 'growth', count: 156 },
          { type: 'adoption', title: 'Feature Adoption', description: 'Push analytics feature to boost engagement', actionText: 'Send Tutorials', iconType: 'feature', count: 1 },
        ],
      },
    };
    return response;
  }
};

export const getInsightsDataQueryOptions = () => ({
  queryKey: ['insights'],
  queryFn: () => getInsightsData(),
});

// Hooks
export const useGetInsightsData = (queryConfig?: QueryConfig<typeof getInsightsDataQueryOptions>) => {
  return useQuery({
    ...getInsightsDataQueryOptions(),
    ...queryConfig,
  });
};