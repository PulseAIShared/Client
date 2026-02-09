import { ReactNode } from "react";



export type BaseEntity = {
  id: string;
  createdAt: number;
};

export type Entity<T> = {
  [K in keyof T]: T[K];
} & BaseEntity;

export type Meta = {
  page: number;
  total: number;
  totalPages: number;
};

export type OnboardingStatus = {
  completed: boolean;
  currentStep?: number;
  completedSteps: string[];
};


export enum PlatformRole {
  User = 'User',       // Basic platform access (customers)
  Moderator = 'Moderator',  // Content moderation and user management
  Admin = 'Admin'     // Full system administration
}

// Company Role System - Company-specific permissions
export enum CompanyRole {
  Viewer = 'Viewer',     // Read-only access to company data
  Staff = 'Staff',      // Operational access (configurable by Owner)
  Owner = 'Owner'       // Full control over company data and settings
}

export type User = Entity<{
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  platformRole: PlatformRole;
  companyRole: CompanyRole;
  dateCreated: string;
  companyId?: string;
  isFirstLogin?: boolean;
  onboardingStatus?: OnboardingStatus;
  onboardingCurrentStep?: number;
  onboardingCompleted?: boolean;
}>;

export type UserProfile = Entity<{
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  platformRole: PlatformRole;
  companyRole: CompanyRole;
  friendCode: string;
}>;

export type AuthResponse = {
  token: string;
  user: User;
};

export type VerifyCodeResponse = {
  success: boolean;
  message: string;
  refreshToken?: string; // Optional token if verification is successful
  refreshTokenExpiryTime?: Date; // Optional expiry time for the refresh token
  authData?: AuthResponse; // Optional auth data if verification is successful
};

// OAuth is now handled entirely by the backend
// Frontend only needs company creation types

export type CompanyCreationRequest = {
  companyName: string;
  companyDomain?: string;
  companyCountry?: string;
  companySize: CompanySize;
  companyIndustry?: string;
};


/**
 * Dashboard response containing all dashboard data
 */
export interface DashboardResponse {
  stats: DashboardStats;
  churnRiskTrend: ChurnRiskData[];
  customerInsights: CustomerInsight[];
  atRiskCustomers: AtRiskCustomer[];
  customerTrends?: CustomerTrendPoint[];
  geoBreakdown?: GeoInsight[];
  workQueueSummary?: DashboardWorkQueueSummary;
  suggestedAction?: DashboardSuggestedAction;
  recoveryAnalytics?: {
    kpis?: {
      missedPaymentsCount?: number;
      missedAmount?: number;
      recoveredAmount?: number;
      recoveryRate?: number;
      averageDaysToRecover?: number;
    };
    tables?: {
      missedPayments?: MissedPaymentRow[];
    };
  };
  segmentAnalytics?: {
    segmentDistribution?: Array<{
      name: string;
      value: number;
      customers: number;
      color: string;
    }>;
  };
  activeUserMetrics?: ActiveUserMetrics;
  activationMetrics?: ActivationMetrics;
  demographicInsights?: DemographicInsight[];
  segmentSuggestions?: SegmentSuggestion[];
  dashboardAlerts?: DashboardAlert[];
}

export interface DashboardWorkQueueSummary {
  pendingApprovals: number;
  highValueCount: number;
  atRiskAmount: number;
  hasActivePlaybooks: boolean;
  revenueSavedLast7d: number;
  oldestPendingAge?: string | null;
  topItems: DashboardWorkQueueItem[];
}

export interface DashboardWorkQueueItem {
  id: string;
  customerName: string;
  playbookName: string;
  reason: string;
  potentialValue?: number | null;
  createdAt: string;
}

export interface DashboardSuggestedAction {
  actionType: string;
  title: string;
  description: string;
  actionUrl: string;
}

export interface ImpactQueryContract {
  from: string;
  to: string;
  segmentId?: string;
}

export interface ImpactRecoveryKpis {
  missedPaymentsCount: number;
  missedAmount: number;
  missedAmountPriorPeriod: number;
  recoveredAmount: number;
  recoveredAmountPriorPeriod: number;
  recoveryRate: number;
  recoveryRatePriorPeriod: number;
  averageDaysToRecover: number;
  averageDaysToRecoverPriorPeriod: number;
  allTimeRecoveredAmount: number;
  hasRecoveryData: boolean;
}

export interface ImpactSummaryResponse {
  recoveryKpis: ImpactRecoveryKpis;
}

export interface ImpactSegmentOption {
  id: string;
  name: string;
  customerCount?: number;
}

export interface ImpactPlaybookPerformanceItem {
  playbookId: string;
  name: string;
  status: string | number;
  priority: number;
  signalType?: string | null;
  customersReached: number;
  runs: number;
  recoveredRevenue: number;
  recoveryRate: number;
  averageRecoveryTimeDays: number;
  eligibleCustomers: number;
  eligibleAmount: number;
  actionedCustomers: number;
  actionedAmount: number;
  coverageRate: number;
  missedWhilePaused: number;
  missedWhilePausedAmount: number;
  hasActivityInPeriod: boolean;
}

export interface ImpactPlaybookPerformanceResponse {
  from: string;
  to: string;
  segmentId?: string | null;
  totalPlaybooks: number;
  activePlaybookCount: number;
  pausedPlaybookCount: number;
  totalRunsInPeriod: number;
  totalRecoveredRevenueInPeriod: number;
  hasActivityInPeriod: boolean;
  noActivePlaybooks: boolean;
  allPlaybooksPaused: boolean;
  noActivityInPeriod: boolean;
  playbooks: ImpactPlaybookPerformanceItem[];
}

export type ImpactTrendInterval = 'daily' | 'weekly';

export interface ImpactTrendPoint {
  bucketStart: string;
  revenueAtRisk: number;
  revenueRecovered: number;
  recoveryRate: number;
}

export interface ImpactChurnDistributionBucket {
  bucket: string;
  customerCount: number;
}

export interface ImpactTrendsResponse {
  from: string;
  to: string;
  segmentId?: string | null;
  interval: ImpactTrendInterval;
  hasSufficientData: boolean;
  points: ImpactTrendPoint[];
  churnDistribution: ImpactChurnDistributionBucket[];
}

export interface ImpactRecoveryFunnelResponse {
  from: string;
  to: string;
  segmentId?: string | null;
  totalAtRisk: number;
  actioned: number;
  recovered: number;
  lost: number;
  atRiskCustomers: number;
  actionedCustomers: number;
  recoveredCustomers: number;
  hasData: boolean;
}

/**
 * Dashboard statistics for the main dashboard overview
 */
export interface DashboardStats {
  totalUsers: string;
  churnRisk: string;
  recoveredRevenue: string;
  avgLTV: string;
  monthlyRecurringRevenue?: string;
  revenueSaved?: string;
  activationRate?: string;
  activeUsers7?: string;
  activeUsers14?: string;
  activeUsers30?: string;
  totalUsersChange?: string;
  churnRiskChange?: string;
  avgLtvChange?: string;
  monthlyRecurringRevenueChange?: string;
  revenueSavedChange?: string;
  recoveredRevenueChange?: string;
  activationRateChange?: string;
}

/**
 * Churn risk data for trend charts
 */
export interface ChurnRiskData {
  week: string;
  risk: number;
}

export interface CustomerTrendPoint {
  period: string;
  customers: number;
  churned: number;
}

export interface GeoInsight {
  country: string;
  customerCount: number;
  avgLtv: number;
  avgRisk: number;
}

/**
 * Customer insight data for pie charts and analytics
 */
export interface CustomerInsight {
  name: string;
  value: number;
  revenue: number;
  color: string;
}

/**
 * At-risk customer data for tables and lists
 */
export interface AtRiskCustomer {
  name: string;
  daysSince: number;
  score: number;
  riskDriver?: string | null;
}



// Enums to match your C# backend
export enum SubscriptionStatus {
  Inactive = 0,
  Active = 1,
  Cancelled = 2,
  PastDue = 3,
  Paused = 4
}

export enum SubscriptionPlan {
  Basic = 0,
  Pro = 1,
  Enterprise = 2
}

export enum PaymentStatus {
  Current = 0,
  Failed = 1,
  Overdue = 2,
  Pending = 3
}

export enum ChurnRiskLevel {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

// Nested object types from the actual JSON
export interface ChurnHistoryEntry {
  id: string;
  riskScore: number;
  riskLevel: number;
  predictionDate: string;
  riskFactors: Record<string, number>;
  modelVersion: string;
}

export interface QualityMetrics {
  completenessScore: number;
  hasMultipleSources: boolean;
  lastDataSync: string;
  missingFields: string[];
  dataFreshness: string;
  recommendedActions: string[];
  qualityLevel: string;
}

export interface DataSources {
  totalSources: number;
  activeSources: number;
  lastOverallSync: string;
  sourceNames: string[];
  hasPaymentData: boolean;
  hasEngagementData: boolean;
  hasSupportData: boolean;
  hasMarketingData: boolean;
  hasCrmData: boolean;
}

// Updated CustomerData interface to match actual detailed API response
export interface CustomerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  location?: string;
  country?: string;
  age?: number;
  gender?: string;
  timeZone?: string | null;
  
  // Churn data
  churnRiskScore: number;
  churnRiskLevel: number; // 0, 1, 2, 3 for Low, Medium, High, Critical
  churnPredictionDate?: string;
  
  // Subscription data
  subscriptionStatus: number; // 0, 1, 2, 3, 4 for subscription status
  plan: number; // 0, 1, 2 for Basic, Pro, Enterprise
  paymentStatus: number;
  monthlyRecurringRevenue: number;
  lifetimeValue: number;
  currentBalance: number;
  currency: string;
  subscriptionStartDate: string;
  subscriptionEndDate?: string;
  lastPaymentDate?: string;
  nextBillingDate?: string;
  paymentFailureCount: number;
  paymentMethodType?: string;
  trialStartDate?: string | null;
  trialEndDate?: string | null;
  
  // Activity data
  lastLoginDate?: string;
  weeklyLoginFrequency: number;
  featureUsagePercentage: number;
  lastActivityDate?: string | null;
  hasRecentActivity: boolean;
  
  // Support data
  supportTicketCount: number;
  openSupportTickets: number;
  
  // Sources
  primaryCrmSource: string;
  primaryPaymentSource: string;
  primaryMarketingSource: string;
  primarySupportSource: string;
  primaryEngagementSource: string;
  
  // Metadata
  dateCreated: string;
  lastSyncedAt: string;
  
  // Computed fields
  fullName: string;
  tenureDays: number;
  tenureDisplay: string;
  activityStatus: string;
  riskStatus: string;
  
  // Complex nested data
  recentActivities: any[]; // Can be typed later if needed
  churnHistory: ChurnHistoryEntry[];
  qualityMetrics: QualityMetrics;
  dataSources: DataSources;
}

/**
 * CustomerListItem - matches backend CustomerListResponse exactly.
 * All display strings are pre-computed by the server for reliable rendering.
 */
export interface CustomerListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string | null;

  // Pre-computed display strings from backend
  fullName: string;
  tenureDisplay: string;
  activityStatus: 'Active' | 'Inactive';
  lastActivityDisplay: string;
  planDisplay: string;
  statusDisplay: string;
  churnRiskDisplay: string;
  formattedMrr: string;
  formattedLtv: string;
  healthStatus: 'Healthy' | 'Watch' | 'AtRisk' | 'Critical';

  // Raw enum values for filtering/sorting
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  churnRisk: ChurnRiskLevel;
  churnRiskScore: number;
  monthlyRecurringRevenue: number;
  lifetimeValue: number;
  nextBillingDate?: string | null;
  hasPaymentIssues: boolean;
  paymentFailureCount: number;
  planName: string;
  monthlyAmount: number;
  currency: string;
  paymentStatusLabel: string;

  // Tenure (raw)
  tenureDays: number;

  // Activity
  lastActivityAt?: string | null;
  lastActivityDate?: string | null;
  hasRecentActivity: boolean;
  lastSyncedAt: string;

  // Additional fields
  leadSource?: string | null;
  industry?: string | null;
  isSubscribed: boolean;
  openSupportTickets: number;
}

// Legacy interface - keep for backwards compatibility but prefer CustomerListItem
export interface CustomerDisplayData {
  id: string;
  fullName: string;
  email: string;
  lifetimeValue: number;
  churnRiskScore: number;
  tenureDisplay: string;
  activityStatus: string;
  lastActivityDate: string;
  hasRecentActivity: boolean;
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  churnRiskLevel: ChurnRiskLevel;
  // Extended fields from CustomerListItem
  companyName?: string | null;
  monthlyRecurringRevenue?: number;
  hasPaymentIssues?: boolean;
  paymentFailureCount?: number;
  formattedMrr?: string;
  formattedLtv?: string;
  statusDisplay?: string;
  planDisplay?: string;
  lastActivityDisplay?: string;
  industry?: string | null;
  leadSource?: string | null;
  tenureDays?: number;
}

// API response wrapper for customer list
export interface CustomersListApiResponse {
  items: CustomerListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CustomerSummaryStats {
  totalCount: number;
  activeCount: number;
  totalMrr: number;
  avgChurnRisk: number;
  highRiskCount: number;
  recentActivityCount: number;
  paymentIssuesCount: number;
  cancelledCount: number;
}

export interface CustomersPageApiResponse {
  customers: CustomersListApiResponse;
  summary: CustomerSummaryStats;
}

// Legacy response wrapper - keep for backwards compatibility
export interface CustomersApiResponse {
  items: CustomerData[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Query parameters for the customers endpoint
export interface CustomersQueryParams {
  page?: number;
  pageSize?: number;
  segmentId?: string;
  filter?: string;
  search?: string;
  subscriptionStatus?: SubscriptionStatus;
  plan?: SubscriptionPlan;
  paymentStatus?: PaymentStatus;
  churnRiskLevel?: ChurnRiskLevel;
  hasRecentActivity?: boolean;
  hasPaymentIssues?: boolean;
  isSubscribed?: boolean;
  mrrMin?: number;
  mrrMax?: number;
  industry?: string;
  leadSource?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface SegmentListItem {
  id: string;
  name: string;
  customerCount?: number;
}

export interface PlaybookListItem {
  id: string;
  name: string;
  status?: string;
}

export interface BulkActionResult {
  totalRequested: number;
  processed: number;
  failed: number;
  errors: Array<{
    customerId: string;
    message: string;
  }>;
}

export interface BulkAddToSegmentPayload {
  customerIds: string[];
  segmentId: string;
}

export interface BulkTriggerPlaybookPayload {
  customerIds: string[];
  playbookId: string;
}

export interface BulkAddToWorkQueuePayload {
  customerIds: string[];
  note?: string;
}

export interface BulkExportCustomersPayload {
  customerIds: string[];
}

// Utility functions to help with data transformation
export const formatPlanName = (plan: SubscriptionPlan): string => {
  switch (plan) {
    case SubscriptionPlan.Basic:
      return 'Basic';
    case SubscriptionPlan.Pro:
      return 'Pro';
    case SubscriptionPlan.Enterprise:
      return 'Enterprise';
    default:
      return 'Unknown';
  }
};

export const formatSubscriptionStatus = (status: SubscriptionStatus): string => {
  switch (status) {
    case SubscriptionStatus.Active:
      return 'Active';
    case SubscriptionStatus.Inactive:
      return 'Inactive';
    case SubscriptionStatus.Cancelled:
      return 'Cancelled';
    case SubscriptionStatus.PastDue:
      return 'Past Due';
    case SubscriptionStatus.Paused:
      return 'Paused';
    default:
      return 'Unknown';
  }
};

export const formatPaymentStatus = (status: PaymentStatus): string => {
  switch (status) {
    case PaymentStatus.Current:
      return 'Current';
    case PaymentStatus.Failed:
      return 'Failed';
    case PaymentStatus.Overdue:
      return 'Overdue';
    case PaymentStatus.Pending:
      return 'Pending';
    default:
      return 'Unknown';
  }
};

export const formatChurnRiskLevel = (level: ChurnRiskLevel): string => {
  switch (level) {
    case ChurnRiskLevel.Low:
      return 'Low';
    case ChurnRiskLevel.Medium:
      return 'Medium';
    case ChurnRiskLevel.High:
      return 'High';
    case ChurnRiskLevel.Critical:
      return 'Critical';
    default:
      return 'Unknown';
  }
};

export const calculateMonthsSubscribed = (startDate: string): number => {
  const start = new Date(startDate);
  const now = new Date();
  const yearDiff = now.getFullYear() - start.getFullYear();
  const monthDiff = now.getMonth() - start.getMonth();
  return Math.max(1, yearDiff * 12 + monthDiff);
};

export const calculateActivityFrequency = (weeklyLoginFrequency: number): 'High' | 'Medium' | 'Low' => {
  if (weeklyLoginFrequency >= 5) return 'High';
  if (weeklyLoginFrequency >= 2) return 'Medium';
  return 'Low';
};

export const formatCurrency = (amount: number | null | undefined, currency = 'USD', options?: Intl.NumberFormatOptions): string => {
  if (amount == null || Number.isNaN(amount)) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
};

// Transform API data to display format
export const transformCustomerData = (customer: CustomerData): CustomerDisplayData => {
  return {
    id: customer.id,
    fullName: customer.fullName,
    email: customer.email,
    lifetimeValue: customer.lifetimeValue,
    churnRiskScore: customer.churnRiskScore,
    tenureDisplay: customer.tenureDisplay,
    activityStatus: customer.activityStatus,
    lastActivityDate: customer.lastActivityDate || customer.lastLoginDate || '',
    hasRecentActivity: customer.hasRecentActivity,
    plan: customer.plan as SubscriptionPlan,
    subscriptionStatus: customer.subscriptionStatus as SubscriptionStatus,
    churnRiskLevel: customer.churnRiskLevel as ChurnRiskLevel,
  };
};


// Segment enums to match backend
export enum SegmentType {
  Behavioral = 0,
  Demographic = 1,
  Geographic = 2,
  Psychographic = 3,
  AiGenerated = 4
}

export enum SegmentStatus {
  Draft = 0,
  Active = 1,
  Inactive = 2
}

export enum CriteriaOperator {
  Equals = 0,
  NotEquals = 1,
  GreaterThan = 2,
  LessThan = 3,
  Contains = 4,
  In = 5,
  NotIn = 6
}

// Updated types to match backend DTOs
export interface SegmentCriteriaDto {
  field: string;
  operator: CriteriaOperator;
  value: string;
  label: string;
}

export interface SegmentCriteriaResponse {
  id: string;
  field: string;
  operator: CriteriaOperator;
  value: string;
  label: string;
}

export interface SegmentResponse {
  id: string;
  companyId: string;
  name: string;
  description: string;
  type: SegmentType;
  status: SegmentStatus;
  color: string;
  customerCount: number;
  averageChurnRate: number;
  averageLifetimeValue: number;
  averageRevenue: number;
  criteria: SegmentCriteriaResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSegmentRequest {
  name: string;
  description: string;
  type: SegmentType;
  color: string;
  criteria: SegmentCriteriaDto[];
}

export interface UpdateSegmentRequest {
  name: string;
  description: string;
  type: SegmentType;
  color: string;
  status: SegmentStatus;
  criteria: SegmentCriteriaDto[];
}

export interface SegmentPreviewRequest {
  criteria: SegmentCriteriaDto[];
  type: SegmentType;
}

export interface SegmentPreviewResponse {
  estimatedCustomerCount: number;
  averageChurnRate: number;
  averageLifetimeValue: number;
  averageRevenue: number;
  matchingSampleCustomers: string[];
}

// Legacy types for backward compatibility (can be removed once all components are updated)
export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  customerCount: number;
  churnRate: number;
  avgLTV: number;
  avgRevenue: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'draft';
  type: 'behavioral' | 'demographic' | 'geographic' | 'psychographic' | 'ai-generated';
  color: string;
  campaigns?: SegmentCampaign[];
}

export interface SegmentCriteria {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: string | number | string[];
  label: string;
}

export interface SegmentCampaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'in-app' | 'push';
  status: 'active' | 'paused' | 'completed';
  sentCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  createdAt: string;
}

export interface SegmentPerformanceMetrics {
  totalSegments: number;
  activeSegments: number;
  totalCustomersSegmented: number;
  avgChurnReduction: number;
  revenueImpact: string;
  topPerformingSegment: {
    name: string;
    churnReduction: number;
  };
}

// Helper functions for segments
export const formatSegmentType = (type: SegmentType): string => {
  switch (type) {
    case SegmentType.Behavioral:
      return 'Behavioral';
    case SegmentType.Demographic:
      return 'Demographic';
    case SegmentType.Geographic:
      return 'Geographic';
    case SegmentType.Psychographic:
      return 'Psychographic';
    case SegmentType.AiGenerated:
      return 'AI-Generated';
    default:
      return 'Unknown';
  }
};

export const formatSegmentStatus = (status: SegmentStatus): string => {
  switch (status) {
    case SegmentStatus.Draft:
      return 'Draft';
    case SegmentStatus.Active:
      return 'Active';
    case SegmentStatus.Inactive:
      return 'Inactive';
    default:
      return 'Unknown';
  }
};

export const formatCriteriaOperator = (operator: CriteriaOperator): string => {
  switch (operator) {
    case CriteriaOperator.Equals:
      return 'equals';
    case CriteriaOperator.NotEquals:
      return 'not equals';
    case CriteriaOperator.GreaterThan:
      return 'greater than';
    case CriteriaOperator.LessThan:
      return 'less than';
    case CriteriaOperator.Contains:
      return 'contains';
    case CriteriaOperator.In:
      return 'in';
    case CriteriaOperator.NotIn:
      return 'not in';
    default:
      return 'unknown';
  }
};

// Transform new API response to legacy format for backward compatibility
export const transformSegmentResponse = (segment: SegmentResponse): CustomerSegment => {
  const normalizedType = formatSegmentType(segment.type).toLowerCase().replace(/\s+/g, '-');

  return {
    id: segment.id,
    name: segment.name,
    description: segment.description,
    criteria: segment.criteria.map(c => ({
      field: c.field,
      operator: formatCriteriaOperator(c.operator) as any,
      value: c.value,
      label: c.label
    })),
    customerCount: segment.customerCount,
    churnRate: segment.averageChurnRate,
    avgLTV: segment.averageLifetimeValue,
    avgRevenue: segment.averageRevenue,
    createdAt: segment.createdAt,
    updatedAt: segment.updatedAt,
    status: formatSegmentStatus(segment.status).toLowerCase() as any,
    type: normalizedType as CustomerSegment['type'],
    color: segment.color
  };
};

// AI Segment Generation Types
export interface GeneratedSegmentDto {
  name: string;
  description: string;
  type: SegmentType;
  criteria: SegmentCriteriaDto[];
}

export interface SegmentInsight {
  title: string;
  description: string;
  recommendation: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface AISegmentPromptRequest {
  prompt: string;
}

// Types for insights data
export interface ChurnPredictionData {
  month: string;
  predicted: number;
  actual: number | null;
}

export interface RiskFactor {
  factor: string;
  impact: 'High' | 'Medium' | 'Low';
  percentage: number;
  color: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  recovered: number;
  churn: number;
}

export interface KPIData {
  metric: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

export interface DemographicData {
  name: string;
  value: number;
  ltv: number;
  color: string;
}

export interface BehaviorInsight {
  insight: string;
  impact: 'High' | 'Medium' | 'Low';
  action: string;
  metric: string;
}

export interface LTVData {
  segment: string;
  current: number;
  previous: number;
  growth: number;
}

export interface CohortData {
  month: string;
  retention: number;
  ltv: number;
}

export interface RecoveryFlow {
  id: string;
  name: string;
  status: 'Active' | 'Paused' | 'Draft';
  type: 'Automated' | 'AI-Generated' | 'Behavioral';
  trigger: string;
  channels: string[];
  success_rate: number;
  recovered_revenue: string;
  steps: FlowStep[];
}

export interface FlowStep {
  step: number;
  type: string;
  delay: string;
  subject: string;
  open_rate?: number;
  response_rate?: number;
  click_rate?: number;
  conversion?: number;
}

export interface FlowTemplate {
  name: string;
  trigger: string;
  success_rate: number;
}

// Integration Types and Enums
export enum IntegrationType {
  HubSpot = 'HubSpot',
  Stripe = 'Stripe',
  PostHog = 'PostHog',
  Slack = 'Slack',
  Intercom = 'Intercom',
  Zendesk = 'Zendesk',
  Pipedrive = 'Pipedrive',
  Chargebee = 'Chargebee',
  MicrosoftTeams = 'MicrosoftTeams',
}

export enum IntegrationStatus {
  NotConnected = 'NotConnected',
  Connected = 'Connected',
  Error = 'Error',
  Syncing = 'Syncing',
  TokenExpired = 'TokenExpired'
}

export enum IntegrationPurpose {
  DataSource = 'data_source',
  ActionChannel = 'action_channel',
  Hybrid = 'hybrid',
}

export enum SyncFrequency {
  Manual = 'Manual',
  Hourly = 'Hourly',
  Daily = 'Daily',
  Weekly = 'Weekly'
}

// Integration Response Types
// Raw server response for /integrations endpoints
export interface IntegrationApiItem {
  integrationId: string;
  type: IntegrationType | string;
  name: string;
  status: 'Connected' | 'Disconnected' | 'Error' | string;
  purpose?: IntegrationPurpose | string | null;
  supportedActionTypes?: string[] | null;
  connectedAt: string;
  lastSyncAt: string | null;
  nextSyncAt: string | null;
  syncedRecordCount: number;
  errorMessage: string | null;
  isTokenExpired: boolean;
  needsTokenRefresh: boolean;
  needsConfiguration: boolean;
  syncConfiguration: SyncConfiguration | null;
  tokenExpiresAt?: string | null;
  actionDefaults?: Record<string, string> | null;
}

export interface IntegrationStatusResponse {
  id: string;
  type: IntegrationType | string;
  name: string;
  status: IntegrationStatus;
  purpose: IntegrationPurpose;
  supportedActionTypes: string[];
  isConnected: boolean;
  lastSyncedAt?: string;
  nextSyncAt?: string;
  syncedRecordCount: number;
  syncConfiguration?: SyncConfiguration;
  errorMessage?: string;
  connectionDetails?: ConnectionDetails;
  needsTokenRefresh?: boolean;
  needsConfiguration?: boolean;
  isTokenExpired?: boolean;
  tokenExpiresAt?: string | null;
  actionDefaults?: Record<string, string>;
}

export interface ConnectionDetails {
  connectedAt: string;
  connectedBy: string;
  accountName?: string;
  accountId?: string;
  permissions: string[];
}

export interface SyncConfiguration {
  syncEnabled: boolean;
  syncFrequency: SyncFrequency;
  dataTypes: string[];
  customFields: Record<string, string>;
  historicalSyncDays: number;
  batchSize: number;
  lastSuccessfulSync?: string;
  nextScheduledSync?: string;
}

// Inspection / capabilities discovery
export interface DataTypeCapability {
  id: string;
  label: string;
  supported: boolean;
  permissionOk: boolean;
  approxCount?: number;
  missingScopes?: string[];
  notes?: string;
}

export interface FieldMappingSuggestion {
  sourceField: string;
  targetField: string;
  required: boolean;
  sampleValue?: unknown;
}

export interface IntegrationInspection {
  integrationId: string;
  provider: IntegrationType | string;
  dataTypes: DataTypeCapability[];
  recommendedMappings?: Record<string, FieldMappingSuggestion[]>;
}

// Configuration Options
export interface ConfigurationOptions {
  availableDataTypes: DataTypeOption[];
  availableCustomFields: CustomFieldOption[];
  syncFrequencyOptions: SyncFrequencyOption[];
  defaultHistoricalSyncDays: number;
  maxHistoricalSyncDays: number;
  defaultBatchSize: number;
  maxBatchSize: number;
}

export type IntegrationConfigurationMap = Record<string, ConfigurationOptions>;

export interface DataTypeOption {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  isDefault: boolean;
}

export interface CustomFieldOption {
  id: string;
  name: string;
  type: string;
  description: string;
  options?: string[];
}

export interface SyncFrequencyOption {
  value: SyncFrequency;
  label: string;
  description: string;
}

export interface ProblemDetails<TMetadata = Record<string, unknown>> {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  traceId?: string;
  code?: string;
  metadata?: TMetadata;
}

// OAuth Flow Types
export interface StartConnectionResult {
  authorizationUrl: string;
  state: string;
  existingIntegrationId?: string | null;
}

export interface OAuthCallbackRequest {
  code: string;
  state: string;
  error?: string;
}

export interface HandleCallbackResult {
  integrationId: string;
  status: string;
  message?: string;
  needsConfiguration: boolean;
}

// Sync Configuration Types
export interface SyncConfigRequest {
  syncEnabled: boolean;
  syncFrequency: SyncFrequency;
  dataTypes: string[];
  customFields: Record<string, string>;
  historicalSyncDays: number;
  batchSize: number;
}

export interface ConfigureIntegrationResult {
  success: boolean;
  configurationId: string;
  nextSyncScheduled?: string;
  errorMessage?: string;
}

// Connection Management Types
export interface ReconnectIntegrationResult {
  integrationId: string;
  authorizationUrl?: string;
  errorMessage?: string;
  message?: string;
}

export interface TestConnectionResult {
  integrationId: string;
  isConnected: boolean;
  status: string;
  message?: string;
  lastTested: string;
  tokenExpired: boolean;
  canRefresh: boolean;
}

export interface TriggerSyncResult {
  success: boolean;
  syncJobId: string;
  estimatedDuration?: string;
  recordsToSync?: number;
  errorMessage?: string;
}

export interface DisconnectIntegrationResult {
  success: boolean;
  message: string;
  integrationId?: string;
}

export interface IntegrationSyncJobSummary {
  integrationId: string;
  jobId: string;
  lastExecution?: string | null;
  nextExecution?: string | null;
  lastJobState: string;
  isProcessing: boolean;
  cron?: string | null;
  description?: string;
}

// Legacy interface for backwards compatibility
export interface Integration {
  id: string;
  type: string;
  name: string;
  status: 'Connected' | 'Disconnected' | 'Error';
  lastSyncedAt?: string;
  syncedRecordCount: number;
  configuration?: Record<string, unknown>;
}

export interface IntegrationStats {
  connectedCount: number;
  totalRecordsSynced: number;
  lastSyncTime: string;
}


export interface ImportCustomerData {
  name: string;
  email: string;
  plan: string;
  monthlyRevenue: number;
  subscriptionStartDate: string;
  lastActivity: string;
  companyName?: string;
  phoneNumber?: string;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errors: Array<{
    row: number;
    email: string;
    error: string;
  }>;
}

export enum CompanySize {
  Startup = 0,
  SMB = 1,
  Enterprise = 2
}

interface CustomerDataSourceItem {
  id: string;
  name: string;
  type: string;
  category: string;
  lastSync?: string | null;
  syncStatus?: string | null;
  recordCount?: number | null;
  isPrimary?: boolean;
}

interface CustomerDataSourcesOverview {
  totalSources: number;
  totalRecords?: number;
  lastOverallSync?: string;
}

interface CustomerDataSourcesQuality {
  completenessScorePercent?: number;
  accuracyScorePercent?: number | null;
  dataFreshnessDisplay?: string;
}

interface CustomerDataSourcesMeta {
  totalSources?: number;
  activeSources?: number;
  lastOverallSync?: string;
  sourceNames?: string[];
  hasPaymentData?: boolean;
  hasCrmData?: boolean;
  hasMarketingData?: boolean;
  hasSupportData?: boolean;
  hasEngagementData?: boolean;
  overview?: CustomerDataSourcesOverview;
  sources?: CustomerDataSourceItem[];
  categories?: string[];
  quality?: CustomerDataSourcesQuality;
}

interface CustomerPaymentInfo {
  source: string;
  isPrimarySource: boolean;
  importBatchId?: string;
  importedByUserName?: string;
  subscriptionStatus: number;
  plan: number;
  monthlyRecurringRevenue: number;
  lifetimeValue: number;
  subscriptionStartDate: string;
  subscriptionEndDate?: string | null;
  paymentStatus: number;
  nextBillingDate?: string | null;
  lastPaymentDate?: string | null;
  paymentFailureCount: number;
  lastSyncedAt: string;
  isActive: boolean;
}

interface CustomerQuickMetrics {
  totalDataSources: number;
  lastActivityDate?: string | null;
  lastDataSync?: string | null;
  totalActivities: number;
  totalChurnPredictions: number;
  hasRecentActivity: boolean;
  hasMultipleSources: boolean;
  dataCompletenessScore: number;
  daysSinceLastActivity?: number;
  daysSinceLastSync?: number;
  activityStatus?: string;
  dataFreshnessStatus?: string;
  overallHealthScore?: string;
}

interface CustomerDataQuality {
  completenessScore?: number;
  hasMultipleSources?: boolean;
  lastDataSync?: string;
  missingCriticalData?: string[];
  dataFreshness?: string;
  recommendedActions?: string[];
  overallQuality?: number;
  qualityIssues?: string[];
}

interface CustomerQualityMetrics {
  completenessScore?: number;
  hasMultipleSources?: boolean;
  lastDataSync?: string;
  missingFields?: string[];
  dataFreshness?: string;
  recommendedActions?: string[];
  qualityLevel?: string;
}

interface CustomerChurnPrediction {
  id: string;
  riskScore: number;
  riskLevel: number;
  predictionDate: string;
  riskFactors: Record<string, number>;
  modelVersion?: string;
}

interface CustomerChurnOverview {
  storedPrediction?: CustomerChurnPrediction | null;
  currentPrediction?: CustomerChurnPrediction | null;
  currentRiskScore?: number;
  currentRiskLevel?: number;
  analyzedAt?: string;
  modelVersion?: string;
  riskFactors?: Record<string, number>;
  recommendations?: string[];
}

interface CustomerAnalyticsKeyMetrics {
  loginFrequencyPerMonth?: number;
  featureUsagePercent?: number;
  supportTicketsLast30Days?: number;
}

interface CustomerAnalyticsData {
  engagementTrends?: Array<{
    month: string;
    engagement: number;
  }>;
  churnRiskTrend?: Array<{
    month: string;
    riskScore: number;
  }>;
  keyMetrics?: CustomerAnalyticsKeyMetrics;
}

interface CustomerActivityTimelineEntry {
  timestamp: string;
  type: string;
  description: string;
  displayTime?: string;
}

interface CustomerCompletenessOverview {
  customerId: string;
  customerEmail: string;
  customerName: string;
  coreProfileScore: number;
  paymentDataScore: number;
  engagementDataScore: number;
  supportDataScore: number;
  crmDataScore: number;
  marketingDataScore: number;
  historicalDataScore: number;
  overallCompletenessScore: number;
  isEligibleForChurnAnalysis: boolean;
  missingDataCategories: string[];
  recommendedActions: string[];
}

interface CustomerRiskPeer {
  customerId: string;
  name: string;
  email: string;
  riskScore: number;
  riskLevel: number;
  plan: string;
  monthlyRecurringRevenue: number;
  subscriptionStatus: string;
}

export interface CustomerDetailData {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  jobTitle?: string | null;
  location?: string | null;
  country?: string | null;
  age?: number | null;
  gender?: string | null;
  timeZone?: string | null;
  churnRiskScore: number;
  churnRiskLevel: number;
  churnRiskDisplay?: string;
  churnRiskStatus?: string;
  churnPredictionDate?: string;
  subscriptionStatus: number;
  subscriptionStatusDisplay?: string;
  plan: number;
  planDisplay?: string;
  paymentStatus: number;
  paymentStatusDisplay?: string;
  paymentMethodType?: string | null;
  monthlyRecurringRevenue: number;
  lifetimeValue: number;
  currentBalance?: number;
  currency?: string;
  formattedMRR?: string;
  formattedLTV?: string;
  formattedBalance?: string;
  subscriptionStartDate: string;
  subscriptionEndDate?: string | null;
  trialStartDate?: string | null;
  trialEndDate?: string | null;
  lastPaymentDate?: string | null;
  lastPaymentDisplay?: string;
  nextBillingDate?: string | null;
  nextBillingDisplay?: string;
  lastLoginDate?: string | null;
  lastLoginDisplay?: string;
  weeklyLoginFrequency?: number;
  featureUsagePercentage?: number;
  engagementSummary?: string;
  supportTicketCount?: number;
  openSupportTickets?: number;
  paymentFailureCount?: number;
  hasRecentActivity?: boolean;
  hasPaymentIssues?: boolean;
  isTrialCustomer?: boolean;
  needsAttention?: boolean;
  activityStatus?: string;
  riskStatus?: string;
  primaryPaymentSource?: string | null;
  primaryCrmSource?: string | null;
  primaryMarketingSource?: string | null;
  primarySupportSource?: string | null;
  primaryEngagementSource?: string | null;
  dateCreated: string;
  lastSyncedAt: string;
  tenureDays?: number;
  tenureDisplay?: string;
  quickMetrics?: CustomerQuickMetrics;
  qualityMetrics?: CustomerQualityMetrics;
  dataQuality?: CustomerDataQuality;
  dataSources?: CustomerDataSourcesMeta;
  display?: {
    fullName: string;
    tenureDisplay: string;
    tenureMonths: number;
    planName: string;
    subscriptionStatusName: string;
    paymentStatusName: string;
    riskLevelName: string;
    initials: string;
  };
  activity?: {
    timeline: CustomerActivityTimelineEntry[];
  };
  analytics?: CustomerAnalyticsData;
  churnHistory?: CustomerChurnPrediction[];
  churnOverview?: CustomerChurnOverview;
  churnSnapshot?: unknown | null;
  recentActivities?: CustomerActivityTimelineEntry[];
  qualitySummary?: string;
  completeness?: CustomerCompletenessOverview;
  riskPeers?: CustomerRiskPeer[];
  primaryPaymentInfo?: CustomerPaymentInfo | null;
  primaryCrmInfo?: unknown | null;
  primaryMarketingInfo?: unknown | null;
  primarySupportInfo?: unknown | null;
  primaryEngagementInfo?: unknown | null;
  paymentOverview?: {
    subscriptionStatus: number;
    plan: number;
    paymentStatus: number;
    monthlyRecurringRevenue: number;
    lifetimeValue: number;
    currentBalance?: number | null;
    currency?: string | null;
    invoiceStatus?: string | null;
    chargeStatus?: string | null;
    discountCode?: string | null;
    discountPercentOff?: number | null;
    discountAmountOff?: number | null;
    taxExempt?: string | null;
    paymentCardBrand?: string | null;
    paymentCardLast4?: string | null;
    paymentCardExpMonth?: number | null;
    paymentCardExpYear?: number | null;
    billingInterval?: string | null;
    billingIntervalCount?: number | null;
    subscriptionStartDate?: string | null;
    subscriptionEndDate?: string | null;
    trialStartDate?: string | null;
    trialEndDate?: string | null;
    lastPaymentDate?: string | null;
    nextBillingDate?: string | null;
    paymentFailureCount?: number | null;
  };
  supportOverview?: {
    totalTickets?: number;
    openTickets?: number;
    closedTickets?: number;
    urgentTickets?: number;
    customerSatisfactionScore?: number;
    firstTicketDate?: string;
    lastTicketDate?: string;
    ticketsByCategory?: unknown;
  };
  engagementOverview?: {
    lastLoginDate?: string;
    weeklyLoginFrequency?: number;
    monthlyLoginFrequency?: number;
    totalSessions?: number;
    averageSessionDuration?: number;
    featureUsagePercentage?: number;
    pageViews?: number;
    featureFlags?: unknown[];
    cohorts?: unknown[];
    lastFeatureUsage?: string;
  };
  crmOverview?: {
    lifecycleStage?: string;
    leadStatus?: string;
    salesOwnerName?: string;
    dealCount?: number;
    totalDealValue?: number;
    wonDealValue?: number;
    pipelineStage?: string;
    annualRevenue?: number;
    numberOfEmployees?: number;
    domain?: string;
    industry?: string;
  };
  marketingOverview?: {
    isSubscribed?: boolean;
    averageOpenRate?: number;
    averageClickRate?: number;
    campaignCount?: number;
    lastCampaignEngagement?: string;
    lastEmailOpenDate?: string;
    lastEmailClickDate?: string;
    tags?: string[];
    lists?: string[];
    leadSource?: string;
    utmSource?: string | null;
    utmCampaign?: string | null;
    utmMedium?: string | null;
    utmTerm?: string | null;
    utmContent?: string | null;
  };
  aiInsights?: {
    summary?: string | null;
    recommendations?: string[];
    aiRiskScore?: number;
    aiRiskLevel?: number | string;
    generatedAt?: string;
    modelVersion?: string;
  };
  dataHealth?: {
    completenessScore?: number;
    freshness?: string;
    lastSyncedAt?: string;
    issues?: Array<{ field: string; description: string; severity?: string }>;
    strengths?: Array<{ field: string; description: string; severity?: string }>;
  };
  supportTimeline?: Array<{ timestamp: string; type: string; summary?: string; severity?: string }>;
  syncHistory?: Array<{ source?: string; category?: string; lastSync?: string | null; status?: string | null; error?: string | null }>;
}


// New customer detail endpoints (split API)
export interface CustomerMiniPaymentTrendEntry {
  period: string;
  mrr: number;
  subscriptionStatus: string;
  paymentStatus: string;
  paymentFailures: number;
}

export interface CustomerMiniEngagementTrendEntry {
  period: string;
  weeklyLogins: number;
  featureUsagePercentage: number;
  lastLoginDate: string;
}

// Data completeness scores per domain (0-100)
export interface DataCompletenessScores {
  coreProfile: number;
  paymentData: number;
  engagementData: number;
  supportData: number;
  crmData: number;
  marketingData: number;
  historicalData: number;
  overall: number;
  isEligibleForChurnAnalysis: boolean;
  missingCategories: string[];
}

// AI-generated recommendation
export interface CustomerAiRecommendation {
  id: string;
  label: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
}

export interface CustomerOverviewResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  jobTitle?: string | null;
  location?: string | null;
  country?: string | null;
  age?: number | null;
  gender?: string | null;
  dateCreated: string;
  lastSyncedAt?: string | null;
  churnRiskScore: number;
  churnRiskLevel: string;
  churnPredictionDate?: string | null;
  subscriptionStatus: string;
  plan: string;
  paymentStatus: string;
  monthlyRecurringRevenue?: number | null;
  lifetimeValue?: number | null;
  nextBillingDate?: string | null;
  lastPaymentDate?: string | null;
  lastLoginDate?: string | null;
  weeklyLoginFrequency?: number | null;
  featureUsagePercentage?: number | null;
  openTickets?: number | null;
  customerSatisfactionScore?: number | null;
  primaryCrmSource?: string | null;
  primaryPaymentSource?: string | null;
  primaryMarketingSource?: string | null;
  primarySupportSource?: string | null;
  primaryEngagementSource?: string | null;
  recentActivities?: Array<{
    id: string;
    type: string;
    description: string;
    metadata?: unknown;
    activityDate: string;
  }>;
  miniPaymentTrend: CustomerMiniPaymentTrendEntry[];
  miniEngagementTrend: CustomerMiniEngagementTrendEntry[];

  // New fields for enhanced overview
  completeness?: DataCompletenessScores;
  aiRecommendations?: CustomerAiRecommendation[];
  riskFactors?: Record<string, number>;
}

export interface CustomerPaymentTrendEntry extends CustomerMiniPaymentTrendEntry {}
export interface CustomerPaymentHistoryResponse {
  trends: CustomerPaymentTrendEntry[];
}

export interface CustomerEngagementTrendEntry extends CustomerMiniEngagementTrendEntry {}
export interface CustomerEngagementHistoryResponse {
  trends: CustomerEngagementTrendEntry[];
}

export interface CustomerSupportTrendEntry {
  period: string;
  openTickets: number;
  totalTickets: number;
  csat?: number | null;
  lastTicketDate?: string | null;
}

export interface CustomerSupportHistoryResponse {
  trends: CustomerSupportTrendEntry[];
}

export interface CustomerChurnHistoryEntry {
  predictionDate: string;
  riskScore: number;
  riskLevel: string;
  recommendations: string[];
  riskFactors: Record<string, number>;
  modelVersion?: string | null;
}

export interface CustomerChurnHistoryResponse {
  history: CustomerChurnHistoryEntry[];
}

export interface CustomerDataSourceEntry {
  id?: string;
  name?: string;
  source?: string;
  category?: string | null;
  categories?: string[] | null;
  type?: string | null;
  lastSync?: string | null;
  isPrimary?: boolean;
  status?: string | null;
  syncStatus?: string | null;
}

export interface CustomerDataSourcesResponse {
  totalSources?: number;
  lastOverallSync?: string | null;
  sources: CustomerDataSourceEntry[];
}

export interface CategoryScores {
  coreProfile: number;
  paymentData: number;
  engagementData: number;
  supportData: number;
  historicalData: number;
}

export interface EligibleCustomer {
  customerId: string;
  customerEmail: string;
  customerName: string;
  overallCompletenessScore: number;
  categoryScores: CategoryScores;
}

export interface IneligibleCustomer {
  customerId: string;
  customerEmail: string;
  customerName: string;
  overallCompletenessScore: number;
  missingDataCategories: string[];
  recommendedActions: string[];
}

export interface CompletenessDataResponse {
  overallEligibility: boolean;
  summary: {
    totalCustomers: number;
    eligibleCustomersCount: number;
    ineligibleCustomersCount: number;
    averageCompletenessScore: number;
  };
  recommendedActions: string[];
  eligibleCustomers: EligibleCustomer[];
  ineligibleCustomers: IneligibleCustomer[];
}

export interface RunChurnAnalysisResponse {
  analysisId: string;
  status: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export interface ChurnAnalysisResultResponse {
  analysisId: string;
  status: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  requestedBy: UserSummary;
  totalCustomers: number;
  processedCustomers: number;
  progressPercentage: number;
  modelVersion: string;
  includeRecommendations: boolean;
  includeRiskFactors: boolean;
  errorMessage?: string;
  results?: ChurnAnalysisResults;
}

export interface ChurnAnalysisResults {
  overallChurnRate: number;
  averageRiskScore: number;
  riskDistribution: RiskDistributionResponse;
  keyInsights: string[];
  recommendations: string[];
  customerResults: CustomerChurnResultResponse[];
}

export interface CustomerChurnResultResponse {
  customerId: string;
  customerEmail: string;
  customerName: string;
  churnRiskScore: number;
  riskLevel: string;
  analyzedAt: string;
  riskFactors: Record<string, number>;
  recommendations: string[];
}

export interface RiskDistributionResponse {
  criticalRisk: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
}

export interface ChurnTrendsResponse {
  trends: ChurnTrendDataPoint[];
  periodComparison: PeriodComparisonResponse;
  summary: ChurnTrendsSummary;
}

export interface ChurnTrendDataPoint {
  date: string;
  churnRate: number;
  averageRiskScore: number;
  totalCustomers: number;
  highRiskCustomers: number;
  criticalRiskCustomers: number;
}

export interface PeriodComparisonResponse {
  churnRateChange: number;
  churnRateChangePercentage: number;
  riskScoreChange: number;
  riskScoreChangePercentage: number;
  trend: string;
}

export interface ChurnTrendsSummary {
  averageChurnRate: number;
  peakChurnRate: number;
  lowestChurnRate: number;
  totalAnalysisPeriodDays: number;
  dataPoints: number;
}

export interface CustomerChurnDetailsResponse {
  customerId: string;
  customerEmail: string;
  customerName: string;
  currentRiskScore: number;
  currentRiskLevel: string;
  lastAnalyzedAt: string;
  riskFactors: Record<string, number>;
  recommendations: string[];
  historicalPredictions: ChurnPredictionHistoryResponse[];
  recentActivities: CustomerActivitySummary[];
  riskTrend: string;
  summary: CustomerChurnSummary;
}

export interface ChurnPredictionHistoryResponse {
  predictionDate: string;
  riskScore: number;
  riskLevel: string;
  modelVersion?: string;
}

export interface CustomerActivitySummary {
  type: string;
  description: string;
  activityDate: string;
}

export interface CustomerChurnSummary {
  daysAsCustomer: number;
  totalPredictions: number;
  highestRiskScore: number;
  lowestRiskScore: number;
  recentActivityCount: number;
}

// Admin User Management Types
export interface AdminUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateCreated: string;
  platformRole: PlatformRole;
  companyRole: CompanyRole;
  companyId: string;
  avatar?: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  platformRole: PlatformRole;
  companyRole: CompanyRole;
}

export interface AdminUsersQueryParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  platformRole?: PlatformRole;
  companyRole?: CompanyRole;
  role?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Insights API Types
export interface InsightsResponse {
  header: InsightsHeaderData;
  analyticsOverview: AnalyticsOverviewData;
  churnPrediction: ChurnPredictionResponse;
  ltvAnalytics: LTVAnalyticsResponse;
  demographicInsights: DemographicInsightsResponse;
  segmentAnalytics: SegmentAnalyticsResponse;
  recoveryAnalytics: RecoveryAnalytics;
  recoveryFlows: RecoveryFlowsResponse;
  aiRecommendations: AIRecommendationsData;
}

export interface InsightsHeaderData {
  predictionAccuracy: number;
  revenueSaved: string;
}

export interface AnalyticsOverviewData {
  kpiData: KPIData[];
  revenueData: RevenueData[];
}

export interface ChurnPredictionResponse {
  predictionData: ChurnPredictionData[];
  riskFactors: RiskFactor[];
}

export interface LTVAnalyticsResponse {
  ltvData: LTVData[];
  cohortData: CohortData[];
}

export interface DemographicInsightsResponse {
  demographicData: DemographicData[];
  behaviorInsights: BehaviorInsight[];
}

export interface SegmentAnalyticsResponse {
  churnTrendsBySegment: Array<{ month: string } & Record<string, number | string>>;
  revenueBySegment: Array<{ segment: string; revenue: number; customers: number; avgRevenue: number }>;
  segmentDistribution: Array<{ name: string; value: number; customers: number; color: string }>;
  campaignPerformanceBySegment: Array<{ segment: string; campaigns: number; success_rate: number; revenue_recovered: number }>;
}

// Re-export recovery types for convenience
export * from './recovery';

export interface RecoveryAnalyticsKpis {
  missedPaymentsCount: number;
  missedAmount: number;
  recoveredAmount: number;
  recoveryRate: number; // percentage 0-100
  averageDaysToRecover: number;
}

export interface RecoveryTimelinePoint {
  month: string;
  missedAmount: number;
  recoveredAmount: number;
}

export interface RecoveryBySegmentEntry {
  segmentId: string;
  segmentName: string;
  missedAmount: number;
  recoveredAmount: number;
  recoveryRate: number;
}

export interface RecoveryReasonEntry {
  reason: string; // e.g., 'Card expired'
  count: number;
}

export interface MissedPaymentRow {
  id: string;
  customer: string;
  amount: number;
  dueDate: string; // ISO
  status: 'Open' | 'Recovered' | 'In Progress' | 'Closed';
  attempts: number;
  segmentTags: string[];
}

export interface RecoveryAnalyticsTables {
  missedPayments: MissedPaymentRow[];
}

export interface RecoveryAnalytics {
  kpis: RecoveryAnalyticsKpis;
  timeline: RecoveryTimelinePoint[];
  bySegment: RecoveryBySegmentEntry[];
  reasons: RecoveryReasonEntry[];
  tables: RecoveryAnalyticsTables;
}

export interface RecoveryFlowsResponse {
  flows: RecoveryFlow[];
  templates: FlowTemplate[];
}

export interface AIRecommendationsData {
  recommendations: AIRecommendation[];
}

export interface AIRecommendation {
  type: string;
  title: string;
  description: string;
  actionText: string;
  iconType: string;
  count: number;
}

// Team management
export interface TeamSummaryResponse {
  companyId: string;
  companyName: string;
  planName?: string;
  maxSeats: number;
  memberCount: number;
  pendingInvitations: number;
  trialEndsAt?: string | null;
  createdAt?: string;
}

export interface TeamMemberResponse {
  userId: string;
  name: string;
  email: string;
  role: CompanyRole;
  joinedAt: string;
  invitedBy?: string | null;
}

export interface TeamInvitationResponse {
  invitationId: string;
  email: string;
  role: CompanyRole;
  invitedAt: string;
  invitedBy?: string | null;
  expiresAt?: string | null;
  isAccepted: boolean;
  acceptedAt?: string | null;
}

export interface SendTeamInvitationRequest {
  email: string;
  role: CompanyRole;
}

export interface AcceptTeamInvitationRequest {
  token: string;
}

export interface AcceptTeamInvitationResponse {
  joinedViaInvitation: boolean;
  companyId: string;
  companyName?: string | null;
  inviterName?: string | null;
  inviterEmail?: string | null;
}

// Settings
export interface AccountSettingsResponse {
  userId: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
  companyName: string;
  canEdit: boolean;
}

export interface UpdateAccountSettingsRequest {
  firstName: string;
  lastName: string;
}

export interface PersonalNotificationSettingsResponse {
  churnRiskAlerts: boolean;
  weeklyReports: boolean;
  integrationStatus: boolean;
}

export interface CompanyNotificationSettingsResponse {
  defaultNotificationPreferences: boolean;
  criticalAlertEscalation: boolean;
  digestFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface NotificationSettingsResponse {
  personal: PersonalNotificationSettingsResponse;
  company: CompanyNotificationSettingsResponse;
  canManageCompanySettings: boolean;
}

export interface UpdatePersonalNotificationSettingsRequest {
  churnRiskAlerts?: boolean;
  weeklyReports?: boolean;
  integrationStatus?: boolean;
}

export interface UpdateCompanyNotificationSettingsRequest {
  defaultNotificationPreferences?: boolean;
  criticalAlertEscalation?: boolean;
  digestFrequency?: 'daily' | 'weekly' | 'monthly';
}

export interface UpdateNotificationSettingsRequest {
  personal?: UpdatePersonalNotificationSettingsRequest;
  company?: UpdateCompanyNotificationSettingsRequest;
}

export interface BillingSummaryResponse {
  companyId: string;
  companyName: string;
  plan: string;
  memberCount: number;
  seatLimit: number;
  pendingInvitationCount: number;
  seatUtilizationPercentage?: number | null;
  canManageBilling: boolean;
  isBillingPortalConfigured: boolean;
}

export interface BillingPortalSessionResponse {
  url: string;
  expiresAtUtc: string;
}

export interface SecurityCapabilitiesResponse {
  passwordChangeEnabled: boolean;
  sessionManagementEnabled: boolean;
  twoFactorEnabled: boolean;
  singleSignOnEnabled: boolean;
  ipAllowlistEnabled: boolean;
  auditLogsEnabled: boolean;
}

export interface SecuritySessionResponse {
  sessionId: string;
  label: string;
  isCurrent: boolean;
  canRevoke: boolean;
  expiresAtUtc?: string | null;
}

export interface SecuritySessionsResponse {
  canManageCompanySecurity: boolean;
  canChangePassword: boolean;
  isSsoAccount: boolean;
  capabilities: SecurityCapabilitiesResponse;
  sessions: SecuritySessionResponse[];
}

export interface UpdateSecurityPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface SecurityPasswordUpdateResponse {
  success: boolean;
  reauthenticationRequired: boolean;
}

export interface SecuritySessionRevokeResponse {
  revoked: boolean;
}

// Helper functions for role system
export const formatPlatformRole = (role: PlatformRole): string => {
  switch (role) {
    case PlatformRole.User:
      return 'User';
    case PlatformRole.Moderator:
      return 'Moderator';
    case PlatformRole.Admin:
      return 'Admin';
    default:
      return 'Unknown';
  }
};

export const formatCompanyRole = (role: CompanyRole): string => {
  switch (role) {
    case CompanyRole.Viewer:
      return 'Viewer';
    case CompanyRole.Staff:
      return 'Staff';
    case CompanyRole.Owner:
      return 'Owner';
    default:
      return 'Unknown';
  }
};

export const isPlatformAdmin = (platformRole: PlatformRole): boolean => {
  return platformRole === PlatformRole.Admin;
};

export const isPlatformModerator = (platformRole: PlatformRole): boolean => {
  return platformRole === PlatformRole.Moderator;
};

export const isCompanyOwner = (companyRole: CompanyRole): boolean => {
  return companyRole === CompanyRole.Owner;
};

export const hasCompanyEditAccess = (companyRole: CompanyRole): boolean => {
  return companyRole === CompanyRole.Staff || companyRole === CompanyRole.Owner;
};

export const canAccessPlatformAdmin = (platformRole: PlatformRole): boolean => {
  return platformRole === PlatformRole.Admin || platformRole === PlatformRole.Moderator;
};

// Enhanced Dashboard Types

/**
 * Active user metrics for dashboard
 */
export interface ActiveUserMetrics {
  last7Days: number;
  last14Days: number;
  last30Days: number;
  percentage7Days: number;
  percentage14Days: number;
  percentage30Days: number;
}

/**
 * Activation metrics showing user engagement frequency
 */
export interface ActivationMetrics {
  frequentUserPercentage: number;     // 4+ logins per week
  regularUserPercentage: number;      // 2-3 logins per week
  inactiveUserPercentage: number;     // < 1 login per week
  avgFeatureUsagePercentage: number;
  avgSessionDuration: number;
  totalActiveUsers: number;
}

/**
 * Demographic insight with trend analysis
 */
export interface DemographicInsight {
  segment: string;                    // e.g., "Women 35-50", "Tech Industry"
  customerCount: number;
  avgLtv: number;
  avgChurnRisk: number;
  ltvChange: number;                  // % change from previous period
  churnRiskChange: number;            // % change from previous period
  topMetrics: string[];               // e.g., ["High Engagement", "Growth"]
}

/**
 * Suggested segment for customer targeting
 */
export interface SegmentSuggestion {
  name: string;                       // "High-Value At-Risk"
  description: string;                // "High LTV with elevated churn risk"
  customerCount: number;
  potentialValue: number;             // Estimated revenue impact
  reasoning: string;                  // Why this segment matters
  characteristics: string[];
}

/**
 * Dashboard alert configuration
 */
export interface DashboardAlert {
  id: string;
  name: string;
  alertType: string;                  // "ChurnRisk", "RevenueThreshold", etc
  condition: string;                  // "ChurnRisk > 50%"
  action: string;                     // "Email", "Slack", "Tag", "AutomatedRecovery"
  triggeredCount: number;
  lastTriggered?: string;
}

/**
 * Recovery opportunity
 */
export interface RecoveryOpportunity {
  customerId: string;
  customerName: string;
  missedAmount: number;
  daysSinceFailure: number;
  retryAttempts: number;
  successProbability: number;
  recommendedActions: string[];
}

/**
 * Enhanced DashboardResponse with additional metrics
 */
export interface EnhancedDashboardResponse extends DashboardResponse {
  activeUserMetrics?: ActiveUserMetrics;
  activationMetrics?: ActivationMetrics;
  demographicInsights?: DemographicInsight[];
  segmentSuggestions?: SegmentSuggestion[];
  dashboardAlerts?: DashboardAlert[];
}





