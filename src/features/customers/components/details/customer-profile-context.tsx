import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useGetCustomerById } from '@/features/customers/api/customers';
import { CustomerDetailData } from '@/types/api';
import { calculateTenure, formatDate } from '@/utils/customer-helpers';
import { useCustomerAiInsightsStore } from '@/features/customers/state/customer-ai-insights-store';

type RiskFactorEntry = { key: string; weight: number };
type RiskTrendPoint = { label: string; value: number };

type ActivityEntry = {
  timestamp: string;
  type: string;
  description: string;
  displayTime?: string | null;
};

export interface CustomerHeaderProps {
  customerName: string;
  customerEmail: string;
  companyName?: string | null;
  accountOwner?: string | null;
  primarySegments: string[];
  churnRiskLevel: string;
  aiRiskLevel: string;
  completenessScore?: number | null;
  statusBadge?: string | null;
}

export interface OverviewWidgetsSheet {
  baselineScore?: number | null;
  aiScore?: number | null;
  riskTrend: RiskTrendPoint[];
  riskFactors: RiskFactorEntry[];
  predictionDate?: string | null;
}

export interface AccountBillingData {
  crm: {
    pipelineStage?: string | null;
    accountExecutive?: string | null;
    monthlyRecurringRevenue?: number | null;
    contractValue?: number | null;
    contractStart?: string | null;
    renewalDate?: string | null;
    contractEnd?: string | null;
  };
  paymentHealth: {
    arr?: number | null;
    mrr?: number | null;
    delinquencyStatus?: string | null;
    lifetimeValue?: number | null;
    billingContacts: string[];
    invoices: Array<{
      id: string;
      amount?: number | null;
      status?: string | null;
      dueDate?: string | null;
      issuedDate?: string | null;
    }>;
  };
  renewalTimeline: Array<{
    id: string;
    label: string;
    date?: string | null;
    status?: string | null;
  }>;
  contractLog: Array<{
    id: string;
    date?: string | null;
    summary: string;
    details?: string | null;
  }>;
}

export interface EngagementData {
  weeklyLogins: Array<{ week: string; count: number }>;
  featureUsagePercent?: number | null;
  featureCounts: Record<string, number>;
  avgSessionDuration?: number | null;
  lastLogin?: string | null;
  sessions: Array<{
    id: string;
    startedAt: string;
    durationMinutes?: number | null;
    feature?: string | null;
    isAnomaly?: boolean;
    notes?: string | null;
  }>;
  topFeatures: Array<{
    name: string;
    usageCount: number;
    category?: string | null;
  }>;
}

export interface SupportData {
  ticketVolume: Array<{ period: string; low: number; medium: number; high: number }>;
  slaSuccessRate?: number | null;
  openTickets: Array<{
    id: string;
    subject: string;
    severity: 'low' | 'medium' | 'high';
    status: string;
    openedAt: string;
    lastUpdatedAt?: string | null;
    owner?: string | null;
    sentiment?: number | null;
  }>;
  sentimentTrend: Array<{ date: string; score: number }>;
  escalations: Array<{ id: string; date: string; summary: string; severity: string }>;
}

export interface MarketingData {
  campaigns: Array<{
    id: string;
    name: string;
    channel?: string | null;
    influencedRevenue?: number | null;
    status?: string | null;
    lastTouch?: string | null;
  }>;
  emailStats: {
    openRate?: number | null;
    clickRate?: number | null;
    unsubRate?: number | null;
  };
  lifecycleFunnel: Array<{ stage: string; count: number; conversion?: number | null }>;
  nurtureSequences: Array<{ id: string; name: string; status: string; lastSent?: string | null }>;
  attribution: Array<{ id: string; channel: string; percent: number; revenue?: number | null }>;
}

export interface AiInsightsData {
  summaryMarkdown?: string | null;
  recommendations: Array<{ id: string; label: string; priority?: 'low' | 'medium' | 'high' }>;
  aiScore?: number | null;
  aiLevel?: string | null;
  baselineScore?: number | null;
  signature?: string | null;
  lastRun?: string | null;
}

export interface DataHealthData {
  completenessByDomain: Array<{ domain: string; score: number }>;
  lastSyncTimes: Array<{ source: string; lastSync?: string | null; status?: string | null }>;
  missingFields: string[];
  importHistory: Array<{ id: string; source: string; importedAt?: string | null; records?: number | null; status?: string | null }>;
}

export interface SourcesLogsData {
  sources: Array<{
    id: string;
    name: string;
    type: string;
    recordCount?: number | null;
    syncStatus?: string | null;
    lastSync?: string | null;
    isPrimary?: boolean;
  }>;
  syncHistory: Array<{ id: string; date: string; source: string; status: string; durationSeconds?: number | null }>;
  jobLogs: Array<{ id: string; jobType: string; startedAt: string; status: string; recordsProcessed?: number | null; errors?: number | null }>;
  anomalies: Array<{ id: string; detectedAt: string; summary: string; severity: string }>;
}

export interface CustomerProfileData {
  header: CustomerHeaderProps;
  overview: OverviewWidgetsSheet;
  accountBilling: AccountBillingData;
  engagement: EngagementData;
  support: SupportData;
  marketing: MarketingData;
  aiInsights: AiInsightsData;
  dataHealth: DataHealthData;
  sourcesLogs: SourcesLogsData;
  churnAnalysis: {
    baselineScore?: number | null;
    aiScore?: number | null;
    riskTrend: RiskTrendPoint[];
    riskFactors: RiskFactorEntry[];
    predictionDate?: string | null;
  };
}

interface CustomerProfileContextValue extends CustomerProfileData {
  rawCustomer?: CustomerDetailData;
  customerId: string;
  isLoading: boolean;
  error?: unknown;
  refetch: () => Promise<unknown>;
}

interface CustomerProfileProviderProps {
  customerId: string;
  initialCustomer?: CustomerDetailData;
  children: React.ReactNode;
}

const CustomerProfileContext = createContext<CustomerProfileContextValue | undefined>(undefined);

const collectActivities = (customer?: CustomerDetailData | null): ActivityEntry[] => {
  if (!customer) {
    return [];
  }

  if (customer.activity?.timeline && customer.activity.timeline.length > 0) {
    return customer.activity.timeline;
  }

  return (customer.recentActivities ?? []).map((item) => ({
    timestamp: item.timestamp ?? '',
    type: item.type,
    description: item.description,
    displayTime: item.displayTime ?? null,
  }));
};

const buildRiskTrend = (customer?: CustomerDetailData | null): RiskTrendPoint[] => {
  if (!customer) {
    return [];
  }

  if (customer.analytics?.churnRiskTrend && customer.analytics.churnRiskTrend.length > 0) {
    return customer.analytics.churnRiskTrend.map((point) => ({
      label: point.month,
      value: point.riskScore,
    }));
  }

  return (customer.churnHistory ?? []).map((entry) => ({
    label: formatDate(entry.predictionDate),
    value: entry.riskScore,
  }));
};

const buildRiskFactors = (customer?: CustomerDetailData | null): RiskFactorEntry[] => {
  if (!customer) {
    return [];
  }

  const factors = customer.churnOverview?.currentPrediction?.riskFactors ?? customer.churnOverview?.riskFactors ?? {};
  return Object.entries(factors)
    .filter(([, weight]) => typeof weight === 'number')
    .map(([key, weight]) => ({ key, weight: weight as number }))
    .sort((a, b) => b.weight - a.weight);
};

const buildHeader = (customer?: CustomerDetailData | null): CustomerHeaderProps => {
  if (!customer) {
    return {
      customerName: '',
      customerEmail: '',
      companyName: null,
      accountOwner: null,
      primarySegments: [],
      churnRiskLevel: 'Unknown',
      aiRiskLevel: 'Unknown',
      completenessScore: null,
      statusBadge: null,
    };
  }

  const customerName = customer.display?.fullName?.trim() || ${customer.firstName ?? ''} .trim() || customer.email;
  const segments = new Set<string>();
  if (customer.display?.planName) segments.add(customer.display.planName);
  if (customer.subscriptionStatusDisplay) segments.add(customer.subscriptionStatusDisplay);
  (customer.dataSources?.categories ?? []).forEach((category) => segments.add(category));
  if (customer.primaryMarketingSource) segments.add(Marketing: );
  if (customer.primarySupportSource) segments.add(Support: );

  const baselineScore = customer.churnOverview?.storedPrediction?.riskScore ?? customer.churnRiskScore ?? null;
  const aiScore = customer.churnOverview?.currentPrediction?.riskScore ?? customer.churnRiskScore ?? baselineScore;
  const aiRiskLevel = customer.churnOverview?.currentPrediction?.riskLevel ?? customer.churnOverview?.currentRiskLevel ?? customer.churnRiskLevel ?? 'Unknown';
  const completeness = customer.completeness?.overallCompletenessScore ?? customer.qualityMetrics?.completenessScore ?? customer.quickMetrics?.dataCompletenessScore ?? null;

  return {
    customerName,
    customerEmail: customer.email,
    companyName: customer.companyName,
    accountOwner: customer.primaryCrmSource,
    primarySegments: Array.from(segments).slice(0, 4),
    churnRiskLevel: customer.display?.riskLevelName ?? customer.riskStatus ?? 'Unknown',
    aiRiskLevel,
    completenessScore: completeness,
    statusBadge: customer.subscriptionStatusDisplay ?? customer.display?.subscriptionStatusName ?? null,
  };
};

const buildOverview = (customer?: CustomerDetailData | null): OverviewWidgetsSheet => {
  const baselineScore = customer?.churnOverview?.storedPrediction?.riskScore ?? customer?.churnRiskScore ?? null;
  const aiScore = customer?.churnOverview?.currentPrediction?.riskScore ?? customer?.churnRiskScore ?? baselineScore;
  return {
    baselineScore,
    aiScore,
    riskTrend: buildRiskTrend(customer),
    riskFactors: buildRiskFactors(customer).slice(0, 8),
    predictionDate: customer?.churnOverview?.currentPrediction?.predictionDate ?? customer?.churnPredictionDate ?? null,
  };
};

const buildAccountBilling = (customer?: CustomerDetailData | null): AccountBillingData => ({
  crm: {
    pipelineStage: customer?.subscriptionStatusDisplay ?? customer?.display?.subscriptionStatusName ?? null,
    accountExecutive: customer?.primaryCrmSource ?? null,
    monthlyRecurringRevenue: customer?.monthlyRecurringRevenue ?? null,
    contractValue: customer?.lifetimeValue ?? null,
    contractStart: customer?.subscriptionStartDate ?? null,
    renewalDate: customer?.nextBillingDate ?? customer?.subscriptionEndDate ?? null,
    contractEnd: customer?.subscriptionEndDate ?? null,
  },
  paymentHealth: {
    arr: customer?.monthlyRecurringRevenue != null ? customer.monthlyRecurringRevenue * 12 : null,
    mrr: customer?.monthlyRecurringRevenue ?? null,
    delinquencyStatus: customer?.paymentStatusDisplay ?? customer?.display?.paymentStatusName ?? null,
    lifetimeValue: customer?.lifetimeValue ?? null,
    billingContacts: [customer?.email, customer?.primaryPaymentSource].filter(Boolean) as string[],
    invoices: [
      {
        id: 'primary-invoice',
        amount: customer?.monthlyRecurringRevenue ?? null,
        status: customer?.paymentStatusDisplay ?? null,
        dueDate: customer?.nextBillingDate ?? null,
        issuedDate: customer?.lastPaymentDate ?? null,
      },
    ],
  },
  renewalTimeline: [
    {
      id: 'contract-start',
      label: 'Contract Start',
      date: customer?.subscriptionStartDate ?? null,
      status: 'completed',
    },
    {
      id: 'next-renewal',
      label: 'Next Renewal',
      date: customer?.nextBillingDate ?? customer?.subscriptionEndDate ?? null,
      status: customer?.subscriptionEndDate ? 'scheduled' : 'projected',
    },
    {
      id: 'tenure',
      label: 'Tenure',
      date: customer?.subscriptionStartDate ? ${calculateTenure(customer.subscriptionStartDate)} months : null,
      status: 'info',
    },
  ],
  contractLog: (customer?.churnHistory ?? []).map((entry) => ({
    id: entry.id,
    date: entry.predictionDate,
    summary: Risk score ,
    details: entry.riskFactors ? Object.keys(entry.riskFactors).slice(0, 3).join(', ') : null,
  })),
});

const buildEngagement = (customer?: CustomerDetailData | null): EngagementData => {
  const activities = collectActivities(customer);
  const weeklyLoginsMap = new Map<string, number>();
  const sessions: EngagementData['sessions'] = [];
  const featureCounts: Record<string, number> = {};

  activities.forEach((activity, index) => {
    const type = activity.type?.toLowerCase() ?? '';
    if (type === 'login') {
      const key = activity.timestamp ? formatDate(getWeekKeyDate(activity.timestamp)) : week-;
      weeklyLoginsMap.set(key, (weeklyLoginsMap.get(key) ?? 0) + 1);
      if (activity.timestamp) {
        sessions.push({
          id: ${activity.timestamp}-,
          startedAt: activity.timestamp,
          durationMinutes: null,
          feature: null,
          isAnomaly: /anomaly|error|failed/i.test(activity.description ?? ''),
          notes: activity.description,
        });
      }
    }

    if (type === 'feature') {
      const name = activity.description ?? 'Feature usage';
      featureCounts[name] = (featureCounts[name] ?? 0) + 1;
    }
  });

  const weeklyLogins = Array.from(weeklyLoginsMap.entries())
    .map(([week, count]) => ({ week, count }))
    .slice(-12);

  const topFeatures = Object.entries(featureCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, usageCount], index) => ({
      name,
      usageCount,
      category: index < 3 ? 'Core' : 'Advanced',
    }));

  return {
    weeklyLogins,
    featureUsagePercent: customer?.analytics?.keyMetrics?.featureUsagePercent ?? customer?.featureUsagePercentage ?? null,
    featureCounts,
    avgSessionDuration: null,
    lastLogin: customer?.lastLoginDate ?? null,
    sessions: sessions.slice(0, 10),
    topFeatures,
  };
};

const buildSupport = (customer?: CustomerDetailData | null): SupportData => {
  const activities = collectActivities(customer).filter((activity) => (activity.type?.toLowerCase() ?? '') === 'support');
  const ticketVolumeMap = new Map<string, { low: number; medium: number; high: number }>();
  const openTickets: SupportData['openTickets'] = [];
  const sentimentTrend: SupportData['sentimentTrend'] = [];
  const escalations: SupportData['escalations'] = [];

  activities.forEach((activity, index) => {
    const period = activity.timestamp ? activity.timestamp.slice(0, 7) : period-;
    const severity: 'low' | 'medium' | 'high' = /critical|p1|high/i.test(activity.description ?? '')
      ? 'high'
      : /medium|p2/i.test(activity.description ?? '')
      ? 'medium'
      : 'low';

    const counts = ticketVolumeMap.get(period) ?? { low: 0, medium: 0, high: 0 };
    counts[severity] += 1;
    ticketVolumeMap.set(period, counts);

    openTickets.push({
      id: ${period}-,
      subject: activity.description ?? 'Support interaction',
      severity,
      status: 'Open',
      openedAt: activity.timestamp ?? new Date().toISOString(),
      lastUpdatedAt: activity.displayTime ?? null,
      owner: customer?.primarySupportSource ?? null,
      sentiment: null,
    });

    sentimentTrend.push({
      date: activity.timestamp ?? new Date().toISOString(),
      score: /resolved|positive|satisfied/i.test(activity.description ?? '') ? 0.75 : 0.45,
    });

    if (/escalation/i.test(activity.description ?? '')) {
      escalations.push({
        id: sc-,
        date: activity.timestamp ?? new Date().toISOString(),
        summary: activity.description ?? 'Escalation recorded',
        severity: severity.toUpperCase(),
      });
    }
  });

  return {
    ticketVolume: Array.from(ticketVolumeMap.entries()).map(([period, counts]) => ({ period, ...counts })),
    slaSuccessRate:
      customer?.supportTicketCount && customer.supportTicketCount > 0
        ? ((customer.supportTicketCount - (customer.openSupportTickets ?? 0)) / customer.supportTicketCount) * 100
        : null,
    openTickets: openTickets.slice(0, 10),
    sentimentTrend: sentimentTrend.slice(-12),
    escalations,
  };
};

const buildMarketing = (customer?: CustomerDetailData | null): MarketingData => {
  const categories = customer?.dataSources?.categories ?? [];
  const sourceNames = customer?.dataSources?.sourceNames ?? [];

  const campaigns = sourceNames.map((name, index) => ({
    id: campaign-,
    name,
    channel: categories[index] ?? 'General',
    influencedRevenue: null,
    status: 'Active',
    lastTouch: customer?.lastSyncedAt ?? null,
  }));

  const attribution = categories.map((channel, index) => ({
    id: ttr-,
    channel,
    percent: categories.length > 0 ? Math.round(100 / categories.length) : 0,
    revenue: null,
  }));

  return {
    campaigns,
    emailStats: {
      openRate: null,
      clickRate: null,
      unsubRate: null,
    },
    lifecycleFunnel: [
      { stage: 'Awareness', count: 1, conversion: null },
      { stage: 'Engaged', count: customer?.hasRecentActivity ? 1 : 0, conversion: null },
      { stage: 'Customer', count: 1, conversion: null },
    ],
    nurtureSequences: [],
    attribution,
  };
};

const buildDataHealth = (customer?: CustomerDetailData | null): DataHealthData => {
  const completenessByDomain: Array<{ domain: string; score: number }> = [];
  if (customer?.completeness) {
    completenessByDomain.push({ domain: 'CRM', score: customer.completeness.crmDataScore });
    completenessByDomain.push({ domain: 'Payment', score: customer.completeness.paymentDataScore });
    completenessByDomain.push({ domain: 'Marketing', score: customer.completeness.marketingDataScore });
    completenessByDomain.push({ domain: 'Support', score: customer.completeness.supportDataScore });
    completenessByDomain.push({ domain: 'Engagement', score: customer.completeness.engagementDataScore });
    completenessByDomain.push({ domain: 'Historical', score: customer.completeness.historicalDataScore });
  } else if (customer?.qualityMetrics?.completenessScore != null) {
    completenessByDomain.push({ domain: 'Overall', score: customer.qualityMetrics.completenessScore });
  }

  const lastSyncTimes = (customer?.dataSources?.sources ?? []).map((source) => ({
    source: source.name,
    lastSync: source.lastSync ?? customer?.dataSources?.lastOverallSync ?? null,
    status: source.syncStatus ?? null,
  }));

  const importHistory = (customer?.dataSources?.sources ?? []).map((source, index) => ({
    id: source.id ?? import-,
    source: source.name,
    importedAt: source.lastSync ?? customer?.dataSources?.lastOverallSync ?? null,
    records: source.recordCount ?? null,
    status: source.syncStatus ?? null,
  }));

  const missingFields = [
    ...(customer?.qualityMetrics?.missingFields ?? []),
    ...(customer?.dataQuality?.missingCriticalData ?? []),
    ...(customer?.completeness?.missingDataCategories ?? []),
  ];

  return {
    completenessByDomain,
    lastSyncTimes,
    missingFields,
    importHistory,
  };
};

const buildSourcesLogs = (customer?: CustomerDetailData | null): SourcesLogsData => {
  const sources = customer?.dataSources?.sources ?? [];
  const anomalies = [
    ...(customer?.dataQuality?.qualityIssues ?? []),
    ...(customer?.qualityMetrics?.recommendedActions ?? []),
  ].map((summary, index) => ({
    id: nomaly-,
    detectedAt: customer?.lastSyncedAt ?? new Date().toISOString(),
    summary,
    severity: 'medium',
  }));

  return {
    sources: sources.map((source, index) => ({
      id: source.id ?? source-,
      name: source.name,
      type: source.type,
      recordCount: source.recordCount ?? null,
      syncStatus: source.syncStatus ?? null,
      lastSync: source.lastSync ?? customer?.dataSources?.lastOverallSync ?? null,
      isPrimary: source.isPrimary ?? false,
    })),
    syncHistory: sources.map((source, index) => ({
      id: source.id ?? sync-,
      date: source.lastSync ?? customer?.dataSources?.lastOverallSync ?? new Date().toISOString(),
      source: source.name,
      status: source.syncStatus ?? 'unknown',
      durationSeconds: null,
    })),
    jobLogs: [],
    anomalies,
  };
};

const buildAiInsights = (customer?: CustomerDetailData | null, overview: OverviewWidgetsSheet): AiInsightsData => {
  if (!customer) {
    return {
      summaryMarkdown: null,
      recommendations: [],
      aiScore: overview.aiScore ?? null,
      aiLevel: 'Unknown',
      baselineScore: overview.baselineScore ?? null,
      signature: null,
      lastRun: null,
    };
  }

  const current = customer.churnOverview?.currentPrediction;
  const stored = customer.churnOverview?.storedPrediction;

  const summaryParts: string[] = [];
  summaryParts.push(**Risk posture**: .);
  if (customer.dataQuality?.recommendedActions?.length) {
    summaryParts.push(**Data quality**: .);
  }

  return {
    summaryMarkdown: summaryParts.join('\n\n'),
    recommendations: (customer.churnOverview?.recommendations ?? []).map((label, index) => ({
      id: ec-,
      label,
    })),
    aiScore: current?.riskScore ?? customer.churnRiskScore ?? null,
    aiLevel: current?.riskLevel ?? customer.churnOverview?.currentRiskLevel ?? customer.churnRiskLevel ?? 'Unknown',
    baselineScore: stored?.riskScore ?? customer.churnRiskScore ?? null,
    signature: customer.churnOverview?.modelVersion ?? null,
    lastRun: customer.churnOverview?.analyzedAt ?? customer.churnPredictionDate ?? null,
  };
};

const buildCustomerProfile = (customer?: CustomerDetailData | null): CustomerProfileData => {
  const overview = buildOverview(customer);
  return {
    header: buildHeader(customer),
    overview,
    accountBilling: buildAccountBilling(customer),
    engagement: buildEngagement(customer),
    support: buildSupport(customer),
    marketing: buildMarketing(customer),
    aiInsights: buildAiInsights(customer, overview),
    dataHealth: buildDataHealth(customer),
    sourcesLogs: buildSourcesLogs(customer),
    churnAnalysis: {
      baselineScore: overview.baselineScore,
      aiScore: overview.aiScore,
      riskTrend: overview.riskTrend,
      riskFactors: overview.riskFactors,
      predictionDate: overview.predictionDate,
    },
  };
};

export const CustomerProfileProvider: React.FC<CustomerProfileProviderProps> = ({ customerId, initialCustomer, children }) => {
  const customerQuery = useGetCustomerById(customerId, {
    initialData: initialCustomer,
  });

  const profile = useMemo(() => buildCustomerProfile(customerQuery.data ?? null), [customerQuery.data]);

  const syncInsights = useCustomerAiInsightsStore((state) => state.syncInsights);
  const status = useCustomerAiInsightsStore((state) => state.status);
  const setStatus = useCustomerAiInsightsStore((state) => state.setStatus);
  const lastSyncedRef = useRef<string>('');

  useEffect(() => {
    const customer = customerQuery.data;
    if (!customer) {
      return;
    }

    const overviewSnapshot = buildOverview(customer);
    const ai = buildAiInsights(customer, overviewSnapshot);
    const syncKey = JSON.stringify({
      id: customer.id,
      signature: ai.signature ?? null,
      lastRun: ai.lastRun ?? null,
      aiScore: ai.aiScore ?? null,
      baselineScore: ai.baselineScore ?? null,
      summary: ai.summaryMarkdown ?? null,
      recommendations: ai.recommendations.map((item) => item.label),
    });

    if (lastSyncedRef.current === syncKey) {
      return;
    }

    lastSyncedRef.current = syncKey;

    syncInsights(customer.id, {
      aiScore: ai.aiScore ?? undefined,
      baselineScore: ai.baselineScore ?? undefined,
      signature: ai.signature ?? undefined,
      lastRun: ai.lastRun ?? undefined,
      summaryMarkdown: ai.summaryMarkdown ?? undefined,
      recommendations: ai.recommendations,
    });

    if (customer.churnOverview?.currentRiskLevel != null && status !== 'fresh') {
      setStatus('fresh');
    }
  }, [customerQuery.data, setStatus, status, syncInsights]);

  const value: CustomerProfileContextValue = {
    customerId,
    ...profile,
    rawCustomer: customerQuery.data ?? undefined,
    isLoading: customerQuery.isLoading || customerQuery.isFetching,
    error: customerQuery.error,
    refetch: () => customerQuery.refetch().then((result) => result.data),
  };

  return <CustomerProfileContext.Provider value={value}>{children}</CustomerProfileContext.Provider>;
};

export const useCustomerProfile = () => {
  const context = useContext(CustomerProfileContext);
  if (!context) {
    throw new Error('useCustomerProfile must be used within a CustomerProfileProvider');
  }
  return context;
};

function getWeekKeyDate(date: string): Date {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  const firstDay = new Date(parsed.getFullYear(), 0, 1);
  const diff = parsed.getTime() - firstDay.getTime();
  const startDay = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
  const week = Math.ceil((diff / 86_400_000 + startDay) / 7);
  const result = new Date(parsed.getFullYear(), 0, 1);
  result.setDate(result.getDate() + week * 7);
  return result;
}
