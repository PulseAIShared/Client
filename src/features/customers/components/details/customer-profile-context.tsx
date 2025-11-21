import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useGetCustomerById } from '@/features/customers/api/customers';
import { CustomerDetailData } from '@/types/api';
import { formatDate } from '@/utils/customer-helpers';
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
  planName?: string | null;
  subscriptionStatus?: string | null;
  paymentStatus?: string | null;
  riskScore?: number | null;
  churnRiskDisplay?: string | null;
  lastSyncedAt?: string | null;
  activityStatus?: string | null;
  location?: string | null;
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
  children: React.ReactNode;
}

const CustomerProfileContext = createContext<CustomerProfileContextValue | undefined>(undefined);

const getWeekKey = (timestamp: string): string => {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return 'unknown';
  }

  const firstDay = new Date(parsed.getFullYear(), 0, 1);
  const diff = parsed.getTime() - firstDay.getTime();
  const startDay = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
  const week = Math.ceil((diff / 86_400_000 + startDay) / 7);
  return `${parsed.getFullYear()}-W${week.toString().padStart(2, '0')}`;
};

const collectActivities = (customer?: CustomerDetailData | null): ActivityEntry[] => {
  if (!customer) {
    return [];
  }

  if (customer.activity?.timeline && customer.activity.timeline.length > 0) {
    return customer.activity.timeline;
  }

  return customer.recentActivities ?? [];
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
      planName: null,
      subscriptionStatus: null,
      paymentStatus: null,
      riskScore: null,
      churnRiskDisplay: null,
      lastSyncedAt: null,
      activityStatus: null,
      location: null,
    };
  }

  const customerName =
    customer.display?.fullName?.trim() ||
    customer.fullName?.trim() ||
    `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() ||
    customer.email;

  const segments = new Set<string>();
  if (customer.display?.planName) segments.add(customer.display.planName);
  if (customer.planDisplay) segments.add(customer.planDisplay);
  if (customer.subscriptionStatusDisplay) segments.add(customer.subscriptionStatusDisplay);
  if (customer.crmOverview?.lifecycleStage) segments.add(customer.crmOverview.lifecycleStage);
  (customer.dataSources?.categories ?? []).forEach((category) => segments.add(category));
  if (customer.primaryMarketingSource) segments.add(`Marketing: ${customer.primaryMarketingSource}`);
  if (customer.primarySupportSource) segments.add(`Support: ${customer.primarySupportSource}`);

  const baselineScore = customer.churnOverview?.storedPrediction?.riskScore ?? customer.churnRiskScore ?? null;
  const aiScore = customer.churnOverview?.currentPrediction?.riskScore ?? customer.churnRiskScore ?? baselineScore;
  const aiRiskLevel = customer.churnOverview?.currentPrediction?.riskLevel ?? customer.churnOverview?.currentRiskLevel ?? customer.churnRiskLevel ?? 'Unknown';
  const completeness = customer.completeness?.overallCompletenessScore ?? customer.qualityMetrics?.completenessScore ?? customer.quickMetrics?.dataCompletenessScore ?? null;

  return {
    customerName,
    customerEmail: customer.email,
    companyName: customer.companyName,
    accountOwner: customer.crmOverview?.salesOwnerName ?? customer.primaryCrmSource,
    primarySegments: Array.from(segments).slice(0, 4),
    churnRiskLevel: customer.display?.riskLevelName ?? customer.riskStatus ?? 'Unknown',
    aiRiskLevel: typeof aiRiskLevel === 'number' ? aiRiskLevel.toString() : String(aiRiskLevel ?? 'Unknown'),
    completenessScore: completeness,
    statusBadge: customer.subscriptionStatusDisplay ?? customer.display?.subscriptionStatusName ?? null,
    planName: customer.display?.planName ?? customer.planDisplay ?? null,
    subscriptionStatus: customer.subscriptionStatusDisplay ?? customer.display?.subscriptionStatusName ?? null,
    paymentStatus: customer.paymentStatusDisplay ?? customer.display?.paymentStatusName ?? null,
    riskScore: typeof aiScore === 'number' ? aiScore : baselineScore,
    churnRiskDisplay: customer.churnRiskDisplay ?? customer.riskStatus ?? null,
    lastSyncedAt: customer.lastSyncedAt ?? null,
    activityStatus: customer.activityStatus ?? customer.riskStatus ?? null,
    location: customer.location ?? customer.country ?? null,
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

const buildAccountBilling = (customer?: CustomerDetailData | null): AccountBillingData => {
  const payment = customer?.paymentOverview;
  const crm = customer?.crmOverview;

  return {
    crm: {
      pipelineStage: crm?.pipelineStage ?? customer?.subscriptionStatusDisplay ?? customer?.display?.subscriptionStatusName ?? null,
      accountExecutive: crm?.salesOwnerName ?? customer?.primaryCrmSource ?? null,
      monthlyRecurringRevenue: payment?.monthlyRecurringRevenue ?? customer?.monthlyRecurringRevenue ?? null,
      contractValue: crm?.totalDealValue ?? payment?.lifetimeValue ?? customer?.lifetimeValue ?? null,
      contractStart: payment?.subscriptionStartDate ?? customer?.subscriptionStartDate ?? null,
      renewalDate: payment?.nextBillingDate ?? customer?.nextBillingDate ?? customer?.subscriptionEndDate ?? null,
      contractEnd: payment?.subscriptionEndDate ?? customer?.subscriptionEndDate ?? null,
    },
    paymentHealth: {
      arr: payment?.monthlyRecurringRevenue != null ? payment.monthlyRecurringRevenue * (payment.billingIntervalCount ?? 12) : customer?.monthlyRecurringRevenue != null ? customer.monthlyRecurringRevenue * 12 : null,
      mrr: payment?.monthlyRecurringRevenue ?? customer?.monthlyRecurringRevenue ?? null,
      delinquencyStatus: payment?.paymentStatus ? payment.paymentStatus.toString() : customer?.paymentStatusDisplay ?? customer?.display?.paymentStatusName ?? null,
      lifetimeValue: payment?.lifetimeValue ?? customer?.lifetimeValue ?? null,
      billingContacts: [customer?.email, customer?.primaryPaymentSource, crm?.salesOwnerName].filter(Boolean) as string[],
      invoices: [
        {
          id: 'last-payment',
          amount: payment?.monthlyRecurringRevenue ?? customer?.monthlyRecurringRevenue ?? null,
          status: payment?.invoiceStatus ?? customer?.paymentStatusDisplay ?? null,
          dueDate: payment?.nextBillingDate ?? customer?.nextBillingDate ?? null,
          issuedDate: payment?.lastPaymentDate ?? customer?.lastPaymentDate ?? null,
        },
        {
          id: 'upcoming',
          amount: payment?.monthlyRecurringRevenue ?? customer?.monthlyRecurringRevenue ?? null,
          status: payment?.chargeStatus ?? 'scheduled',
          dueDate: payment?.nextBillingDate ?? customer?.nextBillingDate ?? null,
          issuedDate: customer?.subscriptionStartDate ?? payment?.subscriptionStartDate ?? null,
        },
      ].filter((invoice) => invoice.dueDate || invoice.issuedDate),
    },
    renewalTimeline: [
      {
        id: 'trial-start',
        label: 'Trial Start',
        date: payment?.trialStartDate ?? customer?.trialStartDate ?? null,
        status: payment?.trialStartDate ? 'completed' : 'info',
      },
      {
        id: 'trial-end',
        label: 'Trial End',
        date: payment?.trialEndDate ?? customer?.trialEndDate ?? null,
        status: payment?.trialEndDate ? 'completed' : 'info',
      },
      {
        id: 'contract-start',
        label: 'Contract Start',
        date: payment?.subscriptionStartDate ?? customer?.subscriptionStartDate ?? null,
        status: 'completed',
      },
      {
        id: 'next-renewal',
        label: 'Next Renewal',
        date: payment?.nextBillingDate ?? customer?.nextBillingDate ?? customer?.subscriptionEndDate ?? null,
        status: customer?.subscriptionEndDate ? 'scheduled' : 'projected',
      },
      {
        id: 'contract-end',
        label: 'Contract End',
        date: payment?.subscriptionEndDate ?? customer?.subscriptionEndDate ?? null,
        status: payment?.subscriptionEndDate || customer?.subscriptionEndDate ? 'scheduled' : 'info',
      },
    ].filter((item) => item.date != null || item.status === 'projected'),
    contractLog: (customer?.churnHistory ?? []).map((entry) => ({
      id: entry.id,
      date: entry.predictionDate,
      summary: `Risk score ${entry.riskScore}`,
      details: entry.riskFactors ? Object.keys(entry.riskFactors).slice(0, 3).join(', ') : null,
    })),
  };
};

const buildEngagement = (customer?: CustomerDetailData | null): EngagementData => {
  const activities = collectActivities(customer);
  const weeklyLoginsMap = new Map<string, number>();
  const sessions: EngagementData['sessions'] = [];
  const featureCounts: Record<string, number> = {};

  const engagementTrend = customer?.analytics?.engagementTrends ?? [];
  engagementTrend.forEach((entry) => {
    weeklyLoginsMap.set(entry.month, entry.engagement);
  });

  activities.forEach((activity, index) => {
    const type = activity.type?.toLowerCase() ?? '';
    if (type === 'login' || type === 'session') {
      const key = activity.timestamp ? getWeekKey(activity.timestamp) : `week-${index}`;
      weeklyLoginsMap.set(key, (weeklyLoginsMap.get(key) ?? 0) + 1);
      if (activity.timestamp) {
        sessions.push({
          id: `${activity.timestamp}-${index}`,
          startedAt: activity.timestamp,
          durationMinutes: customer?.engagementOverview?.averageSessionDuration ?? null,
          feature: activity.description ?? null,
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

  if (sessions.length === 0 && customer?.engagementOverview?.lastLoginDate) {
    sessions.push({
      id: 'last-login',
      startedAt: customer.engagementOverview.lastLoginDate,
      durationMinutes: customer.engagementOverview.averageSessionDuration ?? null,
      feature: 'Product login',
      isAnomaly: false,
      notes: 'Latest recorded login',
    });
  }

  const weeklyLogins =
    weeklyLoginsMap.size > 0
      ? Array.from(weeklyLoginsMap.entries())
          .map(([week, count]) => ({ week, count }))
          .slice(-12)
      : customer?.weeklyLoginFrequency
      ? [{ week: 'This week', count: customer.weeklyLoginFrequency }]
      : [];

  const topFeaturesFromActivities = Object.entries(featureCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, usageCount], index) => ({
      name,
      usageCount,
      category: index < 3 ? 'Core' : 'Advanced',
    }));

  const featureUsagePercent =
    customer?.analytics?.keyMetrics?.featureUsagePercent ??
    customer?.engagementOverview?.featureUsagePercentage ??
    customer?.featureUsagePercentage ??
    null;

  const topFeatures =
    topFeaturesFromActivities.length > 0
      ? topFeaturesFromActivities
      : featureUsagePercent != null
      ? [
          { name: 'Core adoption', usageCount: Math.round(featureUsagePercent), category: 'core' },
          { name: 'Advanced adoption', usageCount: Math.round(featureUsagePercent * 0.4), category: 'advanced' },
        ]
      : [];

  return {
    weeklyLogins,
    featureUsagePercent,
    featureCounts,
    avgSessionDuration: customer?.engagementOverview?.averageSessionDuration ?? null,
    lastLogin: customer?.engagementOverview?.lastLoginDate ?? customer?.lastLoginDate ?? null,
    sessions: sessions.slice(0, 10),
    topFeatures,
  };
};

const buildSupport = (customer?: CustomerDetailData | null): SupportData => {
  const ticketVolumeMap = new Map<string, { low: number; medium: number; high: number }>();
  const openTickets: SupportData['openTickets'] = [];
  const sentimentTrend: SupportData['sentimentTrend'] = [];
  const escalations: SupportData['escalations'] = [];

  (customer?.supportTimeline ?? []).forEach((event, index) => {
    const period = event.timestamp ? event.timestamp.slice(0, 7) : `period-${index}`;
    const severity: 'low' | 'medium' | 'high' = /critical|urgent|high/i.test(event.severity ?? '')
      ? 'high'
      : /medium/i.test(event.severity ?? '')
      ? 'medium'
      : 'low';

    const counts = ticketVolumeMap.get(period) ?? { low: 0, medium: 0, high: 0 };
    counts[severity] += 1;
    ticketVolumeMap.set(period, counts);

    openTickets.push({
      id: `${event.type}-${index}`,
      subject: event.summary ?? 'Support interaction',
      severity,
      status: event.type === 'closed' ? 'Closed' : 'Open',
      openedAt: event.timestamp ?? new Date().toISOString(),
      lastUpdatedAt: event.timestamp ?? null,
      owner: customer?.primarySupportSource ?? null,
      sentiment: null,
    });

    sentimentTrend.push({
      date: event.timestamp ?? new Date().toISOString(),
      score: event.severity === 'critical' ? 0.3 : event.severity === 'high' ? 0.4 : 0.6,
    });

    if (event.severity === 'critical' || event.type === 'urgent_tickets') {
      escalations.push({
        id: `esc-${index}`,
        date: event.timestamp ?? new Date().toISOString(),
        summary: event.summary ?? 'Escalation recorded',
        severity: event.severity ?? 'high',
      });
    }
  });

  if (openTickets.length === 0 && customer?.supportOverview?.openTickets) {
    openTickets.push({
      id: 'open-1',
      subject: 'Open support tickets',
      severity: customer.supportOverview.urgentTickets && customer.supportOverview.urgentTickets > 0 ? 'high' : 'medium',
      status: 'Open',
      openedAt: customer.supportOverview.lastTicketDate ?? new Date().toISOString(),
      lastUpdatedAt: customer.supportOverview.lastTicketDate ?? null,
      owner: customer.primarySupportSource ?? null,
      sentiment: null,
    });
  }

  const ticketVolume =
    ticketVolumeMap.size > 0
      ? Array.from(ticketVolumeMap.entries()).map(([period, counts]) => ({ period, ...counts }))
      : [
          {
            period: 'Current',
            low: Math.max((customer?.supportOverview?.openTickets ?? 0) - (customer?.supportOverview?.urgentTickets ?? 0), 0),
            medium: 0,
            high: customer?.supportOverview?.urgentTickets ?? 0,
          },
        ];

  return {
    ticketVolume,
    slaSuccessRate:
      customer?.supportTicketCount && customer.supportTicketCount > 0
        ? ((customer.supportTicketCount - (customer.openSupportTickets ?? 0)) / customer.supportTicketCount) * 100
        : customer?.supportOverview?.customerSatisfactionScore
        ? customer.supportOverview.customerSatisfactionScore * 20
        : null,
    openTickets: openTickets.slice(0, 10),
    sentimentTrend: sentimentTrend.slice(-12),
    escalations,
  };
};

const buildMarketing = (customer?: CustomerDetailData | null): MarketingData => {
  const marketing = customer?.marketingOverview;
  const campaigns = marketing
    ? [
        {
          id: 'campaign-activity',
          name: marketing.leadSource ? `${marketing.leadSource} campaigns` : 'Recent campaigns',
          channel: marketing.utmMedium ?? marketing.utmSource ?? 'Email',
          influencedRevenue: null,
          status: marketing.isSubscribed ? 'Active' : 'Paused',
          lastTouch: marketing.lastCampaignEngagement ?? customer?.lastSyncedAt ?? null,
        },
      ]
    : [];

  const attribution = [
    marketing?.utmSource,
    marketing?.utmCampaign,
    marketing?.utmMedium,
    marketing?.utmContent,
  ]
    .filter(Boolean)
    .map((channel, index, arr) => ({
      id: `attr-${index}`,
      channel: channel ?? 'Unknown',
      percent: arr.length > 0 ? Math.round(100 / arr.length) : 0,
      revenue: null,
    }));

  return {
    campaigns,
    emailStats: {
      openRate: marketing?.averageOpenRate ?? null,
      clickRate: marketing?.averageClickRate ?? null,
      unsubRate: null,
    },
    lifecycleFunnel: [
      { stage: 'Lead', count: 1, conversion: null },
      { stage: marketing?.leadSource ?? 'Engaged', count: marketing?.campaignCount ?? 0, conversion: null },
      { stage: customer?.subscriptionStatusDisplay ?? 'Customer', count: 1, conversion: null },
    ],
    nurtureSequences: [],
    attribution,
  };
};

const buildDataHealth = (customer?: CustomerDetailData | null): DataHealthData => {
  const completenessByDomain: Array<{ domain: string; score: number }> = [];
  const syncHistory =
    (customer as unknown as { syncHistory?: Array<{ source?: string; category?: string; lastSync?: string | null; status?: string | null }> } | null | undefined)
      ?.syncHistory ?? [];
  if (customer?.completeness) {
    completenessByDomain.push({ domain: 'CRM', score: customer.completeness.crmDataScore });
    completenessByDomain.push({ domain: 'Payment', score: customer.completeness.paymentDataScore });
    completenessByDomain.push({ domain: 'Marketing', score: customer.completeness.marketingDataScore });
    completenessByDomain.push({ domain: 'Support', score: customer.completeness.supportDataScore });
    completenessByDomain.push({ domain: 'Engagement', score: customer.completeness.engagementDataScore });
    completenessByDomain.push({ domain: 'Historical', score: customer.completeness.historicalDataScore });
  } else if (customer?.qualityMetrics?.completenessScore != null) {
    completenessByDomain.push({ domain: 'Overall', score: customer.qualityMetrics.completenessScore });
  } else if (customer?.dataHealth?.completenessScore != null) {
    completenessByDomain.push({ domain: 'Overall', score: customer.dataHealth.completenessScore });
  }

  const lastSyncTimes =
    syncHistory.length > 0
      ? syncHistory.map((sync, index) => ({
          source: `${sync.source ?? sync.category ?? 'Sync'} ${index + 1}`,
          lastSync: sync.lastSync ?? customer?.lastSyncedAt ?? null,
          status: sync.status ?? null,
        }))
      : (customer?.dataSources?.sources ?? []).map((source, index) => ({
          source: source.name ?? `Source ${index + 1}`,
          lastSync: source.lastSync ?? customer?.dataSources?.lastOverallSync ?? null,
          status: source.syncStatus ?? null,
        }));

  const importHistory = (customer?.dataSources?.sources ?? []).map((source, index) => ({
    id: source.id ?? `import-${index}`,
    source: source.name ?? `Source ${index + 1}`,
    importedAt: source.lastSync ?? customer?.dataSources?.lastOverallSync ?? null,
    records: source.recordCount ?? null,
    status: source.syncStatus ?? null,
  }));

  const missingFields = Array.from(
    new Set([
      ...(customer?.qualityMetrics?.missingFields ?? []),
      ...(customer?.dataQuality?.qualityIssues ?? []),
      ...(customer?.completeness?.missingDataCategories ?? []),
      ...(customer?.dataHealth?.issues?.map((issue) => issue.field) ?? []),
    ]),
  );

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
    ...(customer?.dataHealth?.issues?.map((issue) => issue.description) ?? []),
  ].map((summary, index) => ({
    id: `anomaly-${index}`,
    detectedAt: customer?.lastSyncedAt ?? new Date().toISOString(),
    summary,
    severity: 'medium',
  }));

  const syncHistory =
    (customer as unknown as { syncHistory?: Array<{ source?: string; category?: string; lastSync?: string | null; status?: string | null }> } | null | undefined)
      ?.syncHistory ?? [];

  return {
    sources: sources.map((source, index) => ({
      id: source.id ?? `source-${index}`,
      name: source.name,
      type: source.type,
      recordCount: source.recordCount ?? null,
      syncStatus: source.syncStatus ?? null,
      lastSync: source.lastSync ?? customer?.dataSources?.lastOverallSync ?? null,
      isPrimary: source.isPrimary ?? false,
    })),
    syncHistory:
      syncHistory.length > 0
        ? syncHistory.map((sync, index) => ({
            id: `sync-${index}`,
            date: sync.lastSync ?? customer?.dataSources?.lastOverallSync ?? new Date().toISOString(),
            source: sync.source ?? sync.category ?? 'Source',
            status: sync.status ?? 'unknown',
            durationSeconds: null,
          }))
        : sources.map((source, index) => ({
            id: source.id ?? `sync-${index}`,
            date: source.lastSync ?? customer?.dataSources?.lastOverallSync ?? new Date().toISOString(),
            source: source.name,
            status: source.syncStatus ?? 'unknown',
            durationSeconds: null,
          })),
    jobLogs: [],
    anomalies,
  };
};

const buildAiInsights = (customer: CustomerDetailData | null | undefined, overview: OverviewWidgetsSheet): AiInsightsData => {
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
  const aiMeta = customer.aiInsights;

  const summaryParts: string[] = [];
  if (aiMeta?.summary) {
    summaryParts.push(aiMeta.summary);
  } else {
    summaryParts.push(`**Risk posture**: ${customer.churnOverview?.currentRiskLevel ?? customer.riskStatus ?? 'Unknown'}.`);
  }
  if (aiMeta?.recommendations?.length) {
    summaryParts.push(`**AI recommendations**: ${aiMeta.recommendations.join(' • ')}`);
  } else if (customer.dataQuality?.recommendedActions?.length) {
    summaryParts.push(`**Data quality**: ${customer.dataQuality.recommendedActions.join(', ')}.`);
  }

  return {
    summaryMarkdown: summaryParts.join('\n\n'),
    recommendations: (aiMeta?.recommendations ?? customer.churnOverview?.recommendations ?? []).map((label, index) => ({
      id: `rec-${index}`,
      label,
    })),
    aiScore: aiMeta?.aiRiskScore ?? current?.riskScore ?? customer.churnRiskScore ?? null,
    aiLevel:
      aiMeta?.aiRiskLevel != null
        ? aiMeta.aiRiskLevel.toString()
        : typeof current?.riskLevel === 'number'
        ? current.riskLevel.toString()
        : customer.churnOverview?.currentRiskLevel?.toString() ?? customer.churnRiskLevel.toString(),
    baselineScore: stored?.riskScore ?? customer.churnRiskScore ?? null,
    signature: aiMeta?.modelVersion ?? customer.churnOverview?.modelVersion ?? null,
    lastRun: aiMeta?.generatedAt ?? customer.churnOverview?.analyzedAt ?? customer.churnPredictionDate ?? null,
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

export const CustomerProfileProvider: React.FC<CustomerProfileProviderProps> = ({ customerId, children }) => {
  const customerQuery = useGetCustomerById(customerId);

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
