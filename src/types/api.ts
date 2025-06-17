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

export type User = Entity<{
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'User';
  dateCreated: string;
}>;

export type UserProfile = Entity<{
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  role: string;
  friendCode: string;
}>;

export type AuthResponse = {
  token: string;
  user: User;
};


/**
 * Dashboard response containing all dashboard data
 */
export interface DashboardResponse {
  stats: DashboardStats;
  churnRiskTrend: ChurnRiskData[];
  customerInsights: CustomerInsight[];
  atRiskCustomers: AtRiskCustomer[];
}

/**
 * Dashboard statistics for the main dashboard overview
 */
export interface DashboardStats {
  totalUsers: string;
  churnRisk: string;
  recoveredRevenue: string;
  avgLTV: string;
}

/**
 * Churn risk data for trend charts
 */
export interface ChurnRiskData {
  week: string;
  risk: number;
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
  Basic = 1,
  Pro = 2,
  Enterprise = 3
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

// Updated CustomerData interface to match your API response
export interface CustomerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  subscriptionStatus: SubscriptionStatus;
  plan: SubscriptionPlan;
  monthlyRecurringRevenue: number;
  lifetimeValue: number;
  subscriptionStartDate: string;
  subscriptionEndDate?: string;
  lastLoginDate: string;
  weeklyLoginFrequency: number;
  featureUsagePercentage: number;
  supportTicketCount: number;
  churnRiskScore: number;
  churnRiskLevel: ChurnRiskLevel;
  churnPredictionDate?: string;
  paymentStatus: PaymentStatus;
  lastPaymentDate?: string;
  nextBillingDate?: string;
  paymentFailureCount: number;
  location?: string;
  country?: string;
  source: string;
  lastSyncedAt: string;
  dateCreated: string;
}

// Helper interface for display purposes (computed from CustomerData)
export interface CustomerDisplayData {
  id: string;
  name: string; // computed from firstName + lastName
  email: string;
  monthsSubbed: number; // computed from subscriptionStartDate
  ltv: string; // formatted lifetimeValue
  churnRisk: number; // churnRiskScore as percentage
  activityFrequency: 'High' | 'Medium' | 'Low'; // computed from weeklyLoginFrequency
  lastActivity: string; // lastLoginDate
  plan: string; // formatted plan name
  planEnum: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  churnRiskLevel: ChurnRiskLevel;
}

// API response wrapper
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
  search?: string;
  subscriptionStatus?: SubscriptionStatus;
  plan?: SubscriptionPlan;
  paymentStatus?: PaymentStatus;
  churnRiskLevel?: ChurnRiskLevel;
  sortBy?: string;
  sortDescending?: boolean;
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

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Transform API data to display format
export const transformCustomerData = (customer: CustomerData): CustomerDisplayData => {
  return {
    id: customer.id,
    name: `${customer.firstName} ${customer.lastName}`.trim(),
    email: customer.email,
    monthsSubbed: calculateMonthsSubscribed(customer.subscriptionStartDate),
    ltv: formatCurrency(customer.lifetimeValue),
    churnRisk: Math.round(customer.churnRiskScore),
    activityFrequency: calculateActivityFrequency(customer.weeklyLoginFrequency),
    lastActivity: customer.lastLoginDate,
    plan: formatPlanName(customer.plan),
    planEnum: customer.plan,
    subscriptionStatus: customer.subscriptionStatus,
    paymentStatus: customer.paymentStatus,
    churnRiskLevel: customer.churnRiskLevel,
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
    type: formatSegmentType(segment.type).toLowerCase().replace('-', '') as any,
    color: segment.color
  };
};

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
export interface ImportJobResponse {
  importJobId: string;
  status: 'Validating' | 'Validated' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled';
  totalRecords: number;
  processedRecords: number;
  validRecords: number;
  invalidRecords: number;
  duplicateRecords: number;
  errorCount: number;
  fileName: string;
  importSource: string;
  skipDuplicates: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  message?: string;
}

export interface ImportErrorResponse {
  rowNumber: number;
  email: string;
  errorMessage: string;
  fieldName: string;
  rawData?: string | null;
  errorTime: string;
}


export interface ImportJobSummaryResponse {
  id: string;
  fileName: string;
  status: ImportJobStatus;
  totalRecords: number;
  successfulRecords: number;
  errorCount: number;
  createdAt: string;
  completedAt?: string;
}

export enum ImportJobStatus {
  Pending = 0,
  Validating = 1,
  Processing = 2,
  Completed = 3,
  Failed = 4,
  Cancelled = 5
}

export interface UploadImportResponse {
  importJobId: string;
  message: string;
  status: string;
}

export interface ConfirmImportResponse {
  importJobId: string;
  message: string;
  status: string;
}

export interface ImportJobDetailResponse {
  id: string;
  fileName: string;
  status: 'Validating' | 'Validated' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled';
  type: string;
  importSource?: string;
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  skippedRecords: number;
  updatedRecords: number;
  newRecords: number;
  errorMessage?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  progressPercentage: number;
  validationErrors: ImportErrorResponse[];
  updates: ImportUpdateResponse[];
  summary?: ImportSummaryResponse;
}

export interface ImportUpdateResponse {
  rowNumber: number;
  email: string;
  customerName: string;
  updatedFields: ImportFieldUpdate[];
  updateTime: string;
}

export interface ImportFieldUpdate {
  fieldName: string;
  oldValue: string;
  newValue: string;
}


export interface ImportSummaryResponse {
  totalImported: number;
  duplicatesSkipped: number;
  errorsEncountered: number;
  processingTimeMs: number;
  [key: string]: ReactNode;
}

interface DataSource {
  source: string;
  externalId: string;
  isPrimarySource: boolean;
  lastSyncedAt: string;
  importBatchId?: string;
  importedByUserName?: string;
  sourcePriority: number;
  isActive: boolean;
  syncVersion?: string | null;
  syncStatus: string;
  daysSinceLastSync: number;
  priorityLevel: string;
}

interface PaymentInfo {
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

interface QuickMetrics {
  totalDataSources: number;
  lastActivityDate?: string | null;
  lastDataSync: string;
  totalActivities: number;
  totalChurnPredictions: number;
  hasRecentActivity: boolean;
  hasMultipleSources: boolean;
  dataCompletenessScore: number;
  daysSinceLastActivity: number;
  daysSinceLastSync: number;
  activityStatus: string;
  dataFreshnessStatus: string;
  overallHealthScore: string;
}

interface DataQuality {
  completenessScore: number;
  hasMultipleSources: boolean;
  lastDataSync: string;
  missingCriticalData: string[];
  dataFreshness: string;
  recommendedActions: string[];
  overallQuality: number;
  qualityIssues: string[];
}

export interface CustomerDetailData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string | null;
  location?: string | null;
  country?: string | null;
  churnRiskScore: number;
  churnRiskLevel: number;
  churnPredictionDate: string;
  subscriptionStatus: number;
  plan: number;
  monthlyRecurringRevenue: number;
  lifetimeValue: number;
  subscriptionStartDate: string;
  subscriptionEndDate?: string | null;
  lastLoginDate?: string | null;
  weeklyLoginFrequency: number;
  featureUsagePercentage: number;
  supportTicketCount: number;
  paymentStatus: number;
  lastPaymentDate?: string | null;
  nextBillingDate?: string | null;
  paymentFailureCount: number;
  dateCreated: string;
  lastSyncedAt: string;
  primaryPaymentInfo?: PaymentInfo | null;
  primaryCrmInfo?: unknown | null;
  primaryMarketingInfo?: unknown | null;
  primarySupportInfo?: unknown | null;
  primaryEngagementInfo?: unknown | null;
  quickMetrics: QuickMetrics;
  dataQuality: DataQuality;
  dataSourceDetails: {
    crmSources: DataSource[];
    paymentSources: DataSource[];
    marketingSources: DataSource[];
    supportSources: DataSource[];
    engagementSources: DataSource[];
    totalActiveSources: number;
    lastOverallSync: string;
    uniqueSourceNames: string[];
  };
  sourceSummary: {
    crmSourceCount: number;
    paymentSourceCount: number;
    marketingSourceCount: number;
    supportSourceCount: number;
    engagementSourceCount: number;
    totalSources: number;
    hasMultipleSources: boolean;
    hasPaymentData: boolean;
    hasCrmData: boolean;
    hasMarketingData: boolean;
    hasSupportData: boolean;
    hasEngagementData: boolean;
  };
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
  role: string;
  isCompanyOwner: boolean;
  companyId: string;
  avatar?: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isCompanyOwner: boolean;
}

export interface AdminUsersQueryParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
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
