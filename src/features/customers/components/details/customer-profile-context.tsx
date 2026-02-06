import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  type CustomerDetailQueryResponse,
  useGetCustomerChurnHistory,
  useGetCustomerDataSources,
  useGetCustomerEngagementHistory,
  useGetCustomerOverview,
  useGetCustomerPaymentHistory,
  useGetCustomerSupportHistory,
  useCustomerDetailQuery,
  useGetCustomerEngagementSessions,
  useGetCustomerEngagementFeaturesTop,
  useGetCustomerSupportTickets,
} from '@/features/customers/api/customers';
import {
  CustomerChurnHistoryResponse,
  CustomerDataSourcesResponse,
  CustomerDetailData,
  CustomerEngagementHistoryResponse,
  CustomerOverviewResponse,
  CustomerPaymentHistoryResponse,
  CustomerSupportHistoryResponse,
  DataCompletenessScores,
  CustomerAiRecommendation,
} from '@/types/api';
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
  recommendations: Array<{ id: string; label: string; priority?: 'low' | 'medium' | 'high'; category?: string }>;
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
  overviewSnapshot?: CustomerOverviewResponse;
  // Direct access to enhanced overview data (no transformation needed)
  completenessScores?: DataCompletenessScores;
  backendRecommendations?: CustomerAiRecommendation[];
  backendRiskFactors?: Record<string, number>;
  histories: {
    payment?: CustomerPaymentHistoryResponse;
    engagement?: CustomerEngagementHistoryResponse;
    support?: CustomerSupportHistoryResponse;
    churn?: CustomerChurnHistoryResponse;
    dataSources?: CustomerDataSourcesResponse;
  };
  loadingStates: {
    overview: boolean;
    payment: boolean;
    engagement: boolean;
    support: boolean;
    churn: boolean;
    dataSources: boolean;
  };
  lastUpdated: {
    overview?: string;
    payment?: string;
    engagement?: string;
    support?: string;
    churn?: string;
    dataSources?: string;
  };
  requestSection: (section: 'payment' | 'engagement' | 'support' | 'churn' | 'dataSources') => void;
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

const riskLevelToNumber = (riskLevel?: string | number | null): number | null => {
  if (riskLevel == null) return null;
  if (typeof riskLevel === 'number') return riskLevel;

  const normalized = riskLevel.toLowerCase();
  if (normalized.includes('critical')) return 90;
  if (normalized.includes('high')) return 75;
  if (normalized.includes('medium')) return 50;
  if (normalized.includes('low')) return 25;
  return null;
};

const composeCustomerFromSplit = ({
  overview,
  paymentHistory,
  engagementHistory,
  supportHistory,
  churnHistory,
  dataSources,
}: {
  overview?: CustomerOverviewResponse;
  paymentHistory?: CustomerPaymentHistoryResponse;
  engagementHistory?: CustomerEngagementHistoryResponse;
  supportHistory?: CustomerSupportHistoryResponse;
  churnHistory?: CustomerChurnHistoryResponse;
  dataSources?: CustomerDataSourcesResponse;
}): CustomerDetailData | null => {
  if (!overview) {
    return null;
  }

  const fullName = `${overview.firstName ?? ''} ${overview.lastName ?? ''}`.trim() || overview.email;
  const initials =
    `${overview.firstName?.[0] ?? ''}${overview.lastName?.[0] ?? ''}`.trim().toUpperCase() ||
    (overview.email ? overview.email.slice(0, 2).toUpperCase() : '??');

  const paymentTrend = paymentHistory?.trends ?? overview.miniPaymentTrend ?? [];
  const engagementTrend = engagementHistory?.trends ?? overview.miniEngagementTrend ?? [];
  const churnHistoryEntries = churnHistory?.history ?? [];
  const latestChurn = churnHistoryEntries[churnHistoryEntries.length - 1];
  const paymentFailures = paymentTrend.reduce((total, entry) => total + (entry.paymentFailures ?? 0), 0);
  const supportLatest = supportHistory?.trends?.[supportHistory.trends.length - 1];

  const supportTimeline =
    supportHistory?.trends?.map((trend, index) => ({
      timestamp: trend.lastTicketDate ?? trend.period,
      type: 'ticket',
      summary: `${trend.openTickets} open / ${trend.totalTickets} total`,
      severity: trend.csat != null && trend.csat < 3 ? 'critical' : 'info',
      id: `support-${index}`,
    })) ?? [];

  const mappedActivities =
    overview.recentActivities?.map((activity) => ({
      timestamp: activity.activityDate,
      type: activity.type,
      description: activity.description,
      displayTime: null,
    })) ?? [];

  const riskTrend = churnHistoryEntries.map((entry) => ({
    month: entry.predictionDate,
    riskScore: entry.riskScore,
  }));

  const engagementTrends = engagementTrend.map((trend) => ({
    month: trend.period,
    engagement: trend.weeklyLogins,
  }));

  const dataSourceItems =
    dataSources?.sources?.map((source, index) => {
      const categories = source.categories ?? (source.category ? [source.category] : []);
      return {
        id: source.id ?? `source-${index}`,
        name: source.name ?? source.source ?? `Source ${index + 1}`,
        type: source.type ?? (categories.length ? categories.join(', ') : 'Source'),
        recordCount: undefined,
        syncStatus: source.syncStatus ?? source.status ?? 'unknown',
        lastSync: source.lastSync ?? dataSources.lastOverallSync ?? overview.lastSyncedAt ?? null,
        isPrimary: source.isPrimary ?? false,
        category: categories[0] ?? undefined,
        categories,
      };
    }) ?? [];

  const dataSourceCategories = Array.from(
    new Set([
      ...dataSourceItems
        .map((item) => item.category)
        .filter((category): category is string => Boolean(category)),
      ...((dataSources?.sources ?? []).flatMap((src) => src.categories ?? []) as string[]),
    ]),
  );

  const customer: CustomerDetailData = {
    id: overview.id,
    firstName: overview.firstName,
    lastName: overview.lastName,
    fullName,
    email: overview.email,
    phone: overview.phone ?? null,
    companyName: overview.companyName ?? null,
    jobTitle: overview.jobTitle ?? null,
    location: overview.location ?? overview.country ?? null,
    country: overview.country ?? null,
    age: overview.age ?? null,
    gender: overview.gender ?? null,
    timeZone: null,
    churnRiskScore: overview.churnRiskScore,
    churnRiskLevel: riskLevelToNumber(overview.churnRiskLevel) ?? overview.churnRiskScore,
    churnRiskDisplay: overview.churnRiskLevel,
    churnRiskStatus: overview.churnRiskLevel,
    churnPredictionDate: overview.churnPredictionDate ?? undefined,
    subscriptionStatus: 0,
    subscriptionStatusDisplay: overview.subscriptionStatus,
    plan: 0,
    planDisplay: overview.plan,
    paymentStatus: 0,
    paymentStatusDisplay: overview.paymentStatus,
    paymentMethodType: null,
    monthlyRecurringRevenue: overview.monthlyRecurringRevenue ?? 0,
    lifetimeValue: overview.lifetimeValue ?? 0,
    currentBalance: undefined,
    currency: 'USD',
    formattedMRR: undefined,
    formattedLTV: undefined,
    formattedBalance: undefined,
    subscriptionStartDate: overview.dateCreated,
    subscriptionEndDate: null,
    trialStartDate: null,
    trialEndDate: null,
    lastPaymentDate: overview.lastPaymentDate ?? null,
    lastPaymentDisplay: overview.lastPaymentDate ?? undefined,
    nextBillingDate: overview.nextBillingDate ?? null,
    nextBillingDisplay: overview.nextBillingDate ?? undefined,
    lastLoginDate: overview.lastLoginDate ?? null,
    lastLoginDisplay: overview.lastLoginDate ?? undefined,
    weeklyLoginFrequency: overview.weeklyLoginFrequency ?? undefined,
    featureUsagePercentage: overview.featureUsagePercentage ?? undefined,
    engagementSummary: overview.weeklyLoginFrequency != null ? `${overview.weeklyLoginFrequency} logins/wk` : undefined,
    supportTicketCount: supportLatest?.totalTickets ?? overview.openTickets ?? 0,
    openSupportTickets: supportLatest?.openTickets ?? overview.openTickets ?? 0,
    paymentFailureCount: paymentFailures,
    hasRecentActivity: (overview.recentActivities?.length ?? 0) > 0,
    hasPaymentIssues: paymentFailures > 0,
    isTrialCustomer: false,
    needsAttention: paymentFailures > 0 || (overview.churnRiskScore ?? 0) >= 70,
    activityStatus: overview.lastLoginDate ? 'Active' : 'Unknown',
    riskStatus: overview.churnRiskLevel,
    primaryPaymentSource: overview.primaryPaymentSource ?? null,
    primaryCrmSource: overview.primaryCrmSource ?? null,
    primaryMarketingSource: overview.primaryMarketingSource ?? null,
    primarySupportSource: overview.primarySupportSource ?? null,
    primaryEngagementSource: overview.primaryEngagementSource ?? null,
    dateCreated: overview.dateCreated,
    lastSyncedAt: overview.lastSyncedAt ?? overview.lastPaymentDate ?? overview.dateCreated,
    tenureDays: undefined,
    tenureDisplay: undefined,
    quickMetrics: {
      totalDataSources: dataSourceItems.length,
      lastActivityDate: mappedActivities[0]?.timestamp ?? null,
      lastDataSync: overview.lastSyncedAt ?? null,
      totalActivities: mappedActivities.length,
      totalChurnPredictions: churnHistoryEntries.length,
      hasRecentActivity: (overview.recentActivities?.length ?? 0) > 0,
      hasMultipleSources: dataSourceItems.length > 1,
      dataCompletenessScore: dataSourceItems.length > 0 ? 75 : 50,
      daysSinceLastActivity: undefined,
      daysSinceLastSync: undefined,
      activityStatus: overview.lastLoginDate ? 'active' : 'unknown',
      dataFreshnessStatus: overview.lastSyncedAt ? 'fresh' : 'stale',
      overallHealthScore: undefined,
    },
    qualityMetrics: {
      completenessScore: dataSourceItems.length > 0 ? 75 : undefined,
      missingFields: [],
      recommendedActions: [],
      dataFreshness: overview.lastSyncedAt ?? undefined,
    },
    dataQuality: {
      qualityIssues: [],
      recommendedActions: [],
    },
    dataSources: dataSourceItems.length
      ? {
          totalSources: dataSources?.totalSources ?? dataSourceItems.length,
          activeSources: dataSourceItems.length,
          lastOverallSync: dataSources?.lastOverallSync ?? overview.lastSyncedAt ?? undefined,
          sourceNames: dataSourceItems.map((item) => item.name),
          hasPaymentData: dataSourceItems.some(
            (item) =>
              item.categories?.some((cat) => cat.toLowerCase().includes('pay')) ||
              item.type?.toLowerCase().includes('pay'),
          ),
          hasCrmData: dataSourceItems.some(
            (item) =>
              item.categories?.some((cat) => cat.toLowerCase().includes('crm')) ||
              item.type?.toLowerCase().includes('crm'),
          ),
          hasMarketingData: dataSourceItems.some(
            (item) =>
              item.categories?.some((cat) => cat.toLowerCase().includes('market')) ||
              item.type?.toLowerCase().includes('market'),
          ),
          hasSupportData: dataSourceItems.some(
            (item) =>
              item.categories?.some((cat) => cat.toLowerCase().includes('support')) ||
              item.type?.toLowerCase().includes('support'),
          ),
          hasEngagementData: dataSourceItems.some(
            (item) =>
              item.categories?.some((cat) => cat.toLowerCase().includes('engage')) ||
              item.type?.toLowerCase().includes('engage'),
          ),
          sources: dataSourceItems,
          categories: dataSourceCategories,
          quality: {
            dataFreshnessDisplay: dataSources?.lastOverallSync ?? overview.lastSyncedAt ?? undefined,
          },
        }
      : undefined,
    display: {
      fullName,
      tenureDisplay: '',
      tenureMonths: 0,
      planName: overview.plan,
      subscriptionStatusName: overview.subscriptionStatus,
      paymentStatusName: overview.paymentStatus,
      riskLevelName: overview.churnRiskLevel,
      initials,
    },
    activity: mappedActivities.length ? { timeline: mappedActivities as any } : undefined,
    analytics: {
      churnRiskTrend: riskTrend,
      engagementTrends,
      keyMetrics: {
        featureUsagePercent: overview.featureUsagePercentage ?? undefined,
      },
    },
    churnHistory: churnHistoryEntries.map((entry, index) => ({
      id: `${overview.id}-churn-${index}`,
      predictionDate: entry.predictionDate,
      riskScore: entry.riskScore,
      riskLevel: riskLevelToNumber(entry.riskLevel) ?? entry.riskScore,
      riskFactors: entry.riskFactors,
    })),
    churnOverview: {
      currentPrediction: latestChurn
        ? {
            id: `${overview.id}-latest-churn`,
            predictionDate: latestChurn.predictionDate,
            riskScore: latestChurn.riskScore,
            riskLevel: riskLevelToNumber(latestChurn.riskLevel) ?? latestChurn.riskScore,
            riskFactors: latestChurn.riskFactors,
            modelVersion: latestChurn.modelVersion ?? undefined,
          }
        : undefined,
      storedPrediction: churnHistoryEntries[0]
        ? {
            id: `${overview.id}-stored-churn`,
            predictionDate: churnHistoryEntries[0].predictionDate,
            riskScore: churnHistoryEntries[0].riskScore,
            riskLevel: riskLevelToNumber(churnHistoryEntries[0].riskLevel) ?? churnHistoryEntries[0].riskScore,
            riskFactors: churnHistoryEntries[0].riskFactors,
            modelVersion: churnHistoryEntries[0].modelVersion ?? undefined,
          }
        : undefined,
      currentRiskLevel: riskLevelToNumber(latestChurn?.riskLevel ?? overview.churnRiskLevel) ?? undefined,
      modelVersion: latestChurn?.modelVersion ?? undefined,
      riskFactors: latestChurn?.riskFactors ?? {},
      recommendations: latestChurn?.recommendations ?? [],
    },
    churnSnapshot: null,
    recentActivities: mappedActivities as any,
    qualitySummary: undefined,
    completeness: undefined,
    riskPeers: [],
    primaryPaymentInfo: null,
    primaryCrmInfo: null,
    primaryMarketingInfo: null,
    primarySupportInfo: null,
    primaryEngagementInfo: null,
    paymentOverview: {
      subscriptionStatus: 0,
      plan: 0,
      paymentStatus: 0,
      monthlyRecurringRevenue: overview.monthlyRecurringRevenue ?? 0,
      lifetimeValue: overview.lifetimeValue ?? 0,
      currentBalance: null,
      currency: 'USD',
      invoiceStatus: overview.paymentStatus ?? null,
      chargeStatus: overview.paymentStatus ?? null,
      discountCode: null,
      discountPercentOff: null,
      discountAmountOff: null,
      taxExempt: null,
      paymentCardBrand: null,
      paymentCardLast4: null,
      paymentCardExpMonth: null,
      paymentCardExpYear: null,
      billingInterval: null,
      billingIntervalCount: null,
      subscriptionStartDate: overview.dateCreated,
      subscriptionEndDate: null,
      trialStartDate: null,
      trialEndDate: null,
      lastPaymentDate: overview.lastPaymentDate ?? null,
      nextBillingDate: overview.nextBillingDate ?? null,
      paymentFailureCount: paymentFailures,
    },
    supportOverview: {
      totalTickets: supportLatest?.totalTickets ?? overview.openTickets ?? 0,
      openTickets: supportLatest?.openTickets ?? overview.openTickets ?? 0,
      closedTickets: undefined,
      urgentTickets: undefined,
      customerSatisfactionScore: supportLatest?.csat ?? overview.customerSatisfactionScore ?? undefined,
      firstTicketDate: supportHistory?.trends?.[0]?.lastTicketDate ?? undefined,
      lastTicketDate: supportLatest?.lastTicketDate ?? undefined,
      ticketsByCategory: undefined,
    },
    engagementOverview: {
      lastLoginDate: overview.lastLoginDate ?? undefined,
      weeklyLoginFrequency: overview.weeklyLoginFrequency ?? undefined,
      monthlyLoginFrequency: undefined,
      totalSessions: undefined,
      averageSessionDuration: undefined,
      featureUsagePercentage: overview.featureUsagePercentage ?? undefined,
      pageViews: undefined,
      featureFlags: [],
      cohorts: [],
      lastFeatureUsage: undefined,
    },
    crmOverview: {
      lifecycleStage: undefined,
      leadStatus: undefined,
      salesOwnerName: overview.primaryCrmSource ?? undefined,
      dealCount: undefined,
      totalDealValue: undefined,
      wonDealValue: undefined,
      pipelineStage: overview.subscriptionStatus ?? undefined,
      annualRevenue: undefined,
      numberOfEmployees: undefined,
      domain: undefined,
      industry: undefined,
    },
    marketingOverview: {
      isSubscribed: undefined,
      averageOpenRate: undefined,
      averageClickRate: undefined,
      campaignCount: undefined,
      lastCampaignEngagement: overview.lastSyncedAt ?? undefined,
      lastEmailOpenDate: undefined,
      lastEmailClickDate: undefined,
      tags: [],
      lists: [],
      leadSource: overview.primaryMarketingSource ?? undefined,
      utmSource: undefined,
      utmCampaign: undefined,
      utmMedium: undefined,
      utmTerm: undefined,
      utmContent: undefined,
    },
    aiInsights: {
      summary: null,
      recommendations: [],
      aiRiskScore: latestChurn?.riskScore ?? overview.churnRiskScore ?? undefined,
      aiRiskLevel: latestChurn?.riskLevel ?? overview.churnRiskLevel ?? undefined,
      generatedAt: latestChurn?.predictionDate ?? overview.churnPredictionDate ?? undefined,
      modelVersion: latestChurn?.modelVersion ?? undefined,
    },
    dataHealth: {
      completenessScore: undefined,
      freshness: overview.lastSyncedAt ?? undefined,
      lastSyncedAt: overview.lastSyncedAt ?? undefined,
      issues: [],
      strengths: [],
    },
    supportTimeline,
    syncHistory: dataSourceItems.map((item) => ({
      source: item.name,
      category: item.category ?? item.type,
      lastSync: item.lastSync ?? overview.lastSyncedAt ?? null,
      status: item.syncStatus ?? 'unknown',
      error: null,
    })),
  };

  return customer;
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
          name: marketing.leadSource ? `${marketing.leadSource} engagements` : 'Recent engagements',
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

const buildDataHealth = (customer?: CustomerDetailData | null, overviewCompleteness?: DataCompletenessScores): DataHealthData => {
  const completenessByDomain: Array<{ domain: string; score: number }> = [];
  const syncHistory =
    (customer as unknown as { syncHistory?: Array<{ source?: string; category?: string; lastSync?: string | null; status?: string | null }> } | null | undefined)
      ?.syncHistory ?? [];

  // Prefer backend completeness scores from overview endpoint
  if (overviewCompleteness) {
    completenessByDomain.push({ domain: 'Core Profile', score: overviewCompleteness.coreProfile });
    completenessByDomain.push({ domain: 'Payment', score: overviewCompleteness.paymentData });
    completenessByDomain.push({ domain: 'Engagement', score: overviewCompleteness.engagementData });
    completenessByDomain.push({ domain: 'Support', score: overviewCompleteness.supportData });
    completenessByDomain.push({ domain: 'CRM', score: overviewCompleteness.crmData });
    completenessByDomain.push({ domain: 'Marketing', score: overviewCompleteness.marketingData });
    completenessByDomain.push({ domain: 'Historical', score: overviewCompleteness.historicalData });
  } else if (customer?.completeness) {
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

  const lastSyncTimesRaw =
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

  // Fallback: populate from primary sources if no metadata
  const inferredLastSyncTimes: Array<{ source: string; lastSync?: string | null; status?: string | null }> = [];
  if (lastSyncTimesRaw.length === 0 && customer) {
    const pushIf = (name?: string | null) => {
      if (name) inferredLastSyncTimes.push({ source: name, lastSync: customer.lastSyncedAt ?? null, status: 'Current' });
    };
    pushIf(customer.primaryPaymentSource);
    pushIf(customer.primaryCrmSource);
    pushIf(customer.primaryEngagementSource);
    pushIf(customer.primarySupportSource);
    pushIf(customer.primaryMarketingSource);
  }
  const lastSyncTimes = lastSyncTimesRaw.length > 0 ? lastSyncTimesRaw : inferredLastSyncTimes;

  const importHistory: Array<{ id: string; source: string; importedAt?: string | null; records?: number | null; status?: string | null }> = [];

  const missingFields = Array.from(
    new Set([
      ...(customer?.qualityMetrics?.missingFields ?? []),
      ...(customer?.dataQuality?.qualityIssues ?? []),
      ...(customer?.completeness?.missingDataCategories ?? []),
      ...(customer?.dataHealth?.issues?.map((issue) => issue.field) ?? []),
    ]),
  );

  // Boost completeness when data exists but backend score wasn't calculated yet
  if (completenessByDomain.length === 0 && customer) {
    const push = (domain: string, present: boolean) => completenessByDomain.push({ domain, score: present ? 60 : 0 });
    push('Payment', Boolean(customer.paymentOverview?.monthlyRecurringRevenue || customer.lifetimeValue));
    push('Engagement', Boolean(customer.engagementOverview?.weeklyLoginFrequency || customer.lastLoginDate));
    push('Support', Boolean(customer.supportOverview?.openTickets || customer.supportOverview?.totalTickets));
    push('CRM', Boolean(customer.crmOverview?.lifecycleStage));
    push('Marketing', Boolean(customer.marketingOverview?.campaignCount));
  }

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

const buildAiInsights = (
  customer: CustomerDetailData | null | undefined,
  overview: OverviewWidgetsSheet,
  backendRecommendations?: CustomerAiRecommendation[]
): AiInsightsData => {
  if (!customer) {
    return {
      summaryMarkdown: null,
      recommendations: backendRecommendations?.map((rec) => ({
        id: rec.id,
        label: rec.label,
        priority: rec.priority,
        category: rec.category,
      })) ?? [],
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

  // Use backend recommendations if available
  if (backendRecommendations?.length) {
    const highPriority = backendRecommendations.filter((r) => r.priority === 'high');
    if (highPriority.length > 0) {
      summaryParts.push(`**Priority actions**: ${highPriority.map((r) => r.label).join(' • ')}`);
    }
  } else if (aiMeta?.recommendations?.length) {
    summaryParts.push(`**AI recommendations**: ${aiMeta.recommendations.join(' • ')}`);
  } else if (customer.dataQuality?.recommendedActions?.length) {
    summaryParts.push(`**Data quality**: ${customer.dataQuality.recommendedActions.join(', ')}.`);
  }

  // Prefer backend recommendations, then fall back to existing sources
  const recommendations = backendRecommendations?.length
    ? backendRecommendations.map((rec) => ({
        id: rec.id,
        label: rec.label,
        priority: rec.priority,
        category: rec.category,
      }))
    : (aiMeta?.recommendations ?? customer.churnOverview?.recommendations ?? []).map((label, index) => ({
        id: `rec-${index}`,
        label,
      }));

  return {
    summaryMarkdown: summaryParts.join('\n\n'),
    recommendations,
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

const buildCustomerProfile = (
  customer?: CustomerDetailData | null,
  overviewCompleteness?: DataCompletenessScores,
  backendRecommendations?: CustomerAiRecommendation[],
  backendRiskFactors?: Record<string, number>
): CustomerProfileData => {
  const overview = buildOverview(customer);

  // If we have backend risk factors, merge them with any existing ones
  if (backendRiskFactors && Object.keys(backendRiskFactors).length > 0) {
    overview.riskFactors = Object.entries(backendRiskFactors)
      .map(([key, weight]) => ({ key, weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 8);
  }

  return {
    header: buildHeader(customer),
    overview,
    accountBilling: buildAccountBilling(customer),
    engagement: buildEngagement(customer),
    support: buildSupport(customer),
    marketing: buildMarketing(customer),
    aiInsights: buildAiInsights(customer, overview, backendRecommendations),
    dataHealth: buildDataHealth(customer, overviewCompleteness),
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
  const [requestedSections, setRequestedSections] = useState({
    overview: true,
    payment: false,
    engagement: false,
    support: false,
    churn: true, // needed for overview risk trend/drivers on initial load
    dataSources: false,
  });

  const requestSection = React.useCallback((section: keyof typeof requestedSections) => {
    setRequestedSections((prev) => (prev[section] ? prev : { ...prev, [section]: true }));
  }, []);

  // Aggregator: prefetch core sections (overview, history, ai); dataSources lazily
  const detailSections = React.useMemo(() => ({
    overview: true,
    history: { months: 12, domains: ['payment','engagement','support'] },
    aiInsights: true,
    dataSources: requestedSections.dataSources,
  }), [requestedSections.dataSources]);

  const detailQuery = useCustomerDetailQuery(customerId, detailSections, { enabled: !!customerId });
  const detailData = detailQuery.data as CustomerDetailQueryResponse | undefined;

  const overviewQuery = useGetCustomerOverview(customerId, {
    enabled: requestedSections.overview && !detailData?.overview,
  });
  const paymentHistoryQuery = useGetCustomerPaymentHistory(customerId, {
    enabled: requestedSections.payment && !detailData?.history?.payment,
  });
  const engagementHistoryQuery = useGetCustomerEngagementHistory(customerId, {
    enabled: requestedSections.engagement && !detailData?.history?.engagement,
  });
  const supportHistoryQuery = useGetCustomerSupportHistory(customerId, {
    enabled: requestedSections.support && !detailData?.history?.support,
  });
  const engagementSessionsQuery = useGetCustomerEngagementSessions(customerId, 3, {
    enabled: requestedSections.engagement,
  });
  const engagementFeaturesQuery = useGetCustomerEngagementFeaturesTop(customerId, 3, {
    enabled: requestedSections.engagement,
  });
  const supportTicketsQuery = useGetCustomerSupportTickets(customerId, true, 50, {
    enabled: requestedSections.support,
  });
  const churnHistoryQuery = useGetCustomerChurnHistory(customerId, {
    enabled: requestedSections.churn,
  });
  const dataSourcesQuery = useGetCustomerDataSources(customerId, {
    enabled: requestedSections.dataSources && !detailData?.dataSources,
  });

  const aggregatedCustomer = useMemo(
    () =>
      composeCustomerFromSplit({
        overview: (detailData?.overview ?? overviewQuery.data) as CustomerOverviewResponse | undefined,
        paymentHistory: detailData?.history?.payment ?? paymentHistoryQuery.data,
        engagementHistory: detailData?.history?.engagement ?? engagementHistoryQuery.data,
        supportHistory: detailData?.history?.support ?? supportHistoryQuery.data,
        churnHistory: churnHistoryQuery.data,
        dataSources: detailData?.dataSources ?? dataSourcesQuery.data,
      }),
    [
      churnHistoryQuery.data,
      dataSourcesQuery.data,
      engagementHistoryQuery.data,
      overviewQuery.data,
      paymentHistoryQuery.data,
      supportHistoryQuery.data,
      detailData,
    ],
  );

  const profile = useMemo(
    () => {
      const base = buildCustomerProfile(
        aggregatedCustomer ?? null,
        overviewQuery.data?.completeness,
        overviewQuery.data?.aiRecommendations,
        overviewQuery.data?.riskFactors
      );
      // Override engagement details if available
      if (engagementSessionsQuery.data?.sessions) {
        base.engagement.sessions = engagementSessionsQuery.data.sessions.map((s: any) => ({
          id: s.id,
          startedAt: s.startedAt,
          durationMinutes: s.durationMinutes,
          feature: s.feature,
          isAnomaly: false,
          notes: null,
        }));
      }
      if (engagementFeaturesQuery.data?.topFeatures) {
        base.engagement.topFeatures = engagementFeaturesQuery.data.topFeatures.map((f: any) => ({
          name: f.name,
          usageCount: f.usageCount,
          category: null,
        }));
      }
      // Override support open tickets if available
      if (supportTicketsQuery.data?.tickets) {
        base.support.openTickets = supportTicketsQuery.data.tickets.map((t: any) => ({
          id: t.id,
          subject: t.subject,
          severity: t.severity,
          status: t.status,
          openedAt: t.openedAt,
          lastUpdatedAt: t.lastUpdatedAt,
          owner: t.owner,
          sentiment: null,
        }));
      }
      return base;
    },
    [
      aggregatedCustomer,
      overviewQuery.data?.completeness,
      overviewQuery.data?.aiRecommendations,
      overviewQuery.data?.riskFactors,
      engagementSessionsQuery.data,
      engagementFeaturesQuery.data,
      supportTicketsQuery.data,
    ]
  );

  const syncInsights = useCustomerAiInsightsStore((state) => state.syncInsights);
  const status = useCustomerAiInsightsStore((state) => state.status);
  const setStatus = useCustomerAiInsightsStore((state) => state.setStatus);
  const lastSyncedRef = useRef<string>('');

  useEffect(() => {
    const customer = aggregatedCustomer;
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
  }, [aggregatedCustomer, setStatus, status, syncInsights]);

  const loadingStates = {
    overview: (detailQuery.isLoading && !detailData?.overview) || overviewQuery.isLoading || overviewQuery.isFetching,
    payment: (detailQuery.isLoading && !detailData?.history?.payment) || paymentHistoryQuery.isLoading || paymentHistoryQuery.isFetching,
    engagement:
      (detailQuery.isLoading && !detailData?.history?.engagement) ||
      engagementHistoryQuery.isLoading ||
      engagementHistoryQuery.isFetching ||
      engagementSessionsQuery.isLoading ||
      engagementFeaturesQuery.isLoading,
    support:
      (detailQuery.isLoading && !detailData?.history?.support) ||
      supportHistoryQuery.isLoading ||
      supportHistoryQuery.isFetching ||
      supportTicketsQuery.isLoading,
    churn: churnHistoryQuery.isLoading || churnHistoryQuery.isFetching,
    dataSources: (detailQuery.isLoading && !detailData?.dataSources) || dataSourcesQuery.isLoading || dataSourcesQuery.isFetching,
  };

  const lastUpdated = {
    overview: overviewQuery.dataUpdatedAt ? new Date(overviewQuery.dataUpdatedAt).toISOString() : undefined,
    payment: paymentHistoryQuery.dataUpdatedAt ? new Date(paymentHistoryQuery.dataUpdatedAt).toISOString() : undefined,
    engagement: engagementHistoryQuery.dataUpdatedAt ? new Date(engagementHistoryQuery.dataUpdatedAt).toISOString() : undefined,
    support: supportHistoryQuery.dataUpdatedAt ? new Date(supportHistoryQuery.dataUpdatedAt).toISOString() : undefined,
    churn: churnHistoryQuery.dataUpdatedAt ? new Date(churnHistoryQuery.dataUpdatedAt).toISOString() : undefined,
    dataSources: dataSourcesQuery.dataUpdatedAt ? new Date(dataSourcesQuery.dataUpdatedAt).toISOString() : undefined,
  };

  const refetch = async () => {
    const tasks: Array<Promise<unknown>> = [overviewQuery.refetch()];
    if (requestedSections.payment) tasks.push(paymentHistoryQuery.refetch());
    if (requestedSections.engagement) tasks.push(engagementHistoryQuery.refetch());
    if (requestedSections.support) tasks.push(supportHistoryQuery.refetch());
    if (requestedSections.churn) tasks.push(churnHistoryQuery.refetch());
    if (requestedSections.dataSources) tasks.push(dataSourcesQuery.refetch());
    const [overviewResult] = (await Promise.all(tasks)) as Array<{ data: unknown }>;
    return overviewResult.data;
  };

  const value: CustomerProfileContextValue = {
    customerId,
    ...profile,
    rawCustomer: aggregatedCustomer ?? undefined,
    overviewSnapshot: (detailData?.overview ?? overviewQuery.data) ?? undefined,
    // Direct access to enhanced overview data from backend
    completenessScores: (detailData?.overview?.completeness ?? overviewQuery.data?.completeness) ?? undefined,
    backendRecommendations:
      (detailData?.aiInsights?.recommendations?.map((r: any) => ({ id: r.id, label: r.label, priority: r.priority, category: r.category })) ??
        overviewQuery.data?.aiRecommendations) ?? undefined,
    backendRiskFactors: (detailData?.aiInsights?.riskFactors ?? overviewQuery.data?.riskFactors) ?? undefined,
    histories: {
      payment: paymentHistoryQuery.data,
      engagement: engagementHistoryQuery.data,
      support: supportHistoryQuery.data,
      churn: churnHistoryQuery.data,
      dataSources: dataSourcesQuery.data,
    },
    loadingStates,
    lastUpdated,
    requestSection,
    isLoading: loadingStates.overview && !aggregatedCustomer,
    // Only block page load if overview fails - other sections can fail gracefully
    error: overviewQuery.error,
    refetch,
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
