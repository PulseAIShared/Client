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

// Helper interface for display purposes (computed from CustomerData)
export interface CustomerDisplayData {
  id: string;
  fullName: string; // from API
  email: string;
  lifetimeValue: number; // raw number for sorting and display
  churnRiskScore: number; // percentage from API
  tenureDisplay: string; // pre-formatted from API
  activityStatus: string; // from API ("Active" | "Inactive")
  lastActivityDate: string; // ISO date from API
  hasRecentActivity: boolean; // from API
  plan: SubscriptionPlan; // converted from number
  subscriptionStatus: SubscriptionStatus; // converted from status number
  churnRiskLevel: ChurnRiskLevel; // converted from churnRisk number
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

// Integration Types and Enums
export enum IntegrationType {
  HubSpot = 'HubSpot',
  Salesforce = 'Salesforce',
  Mailchimp = 'Mailchimp',
  Stripe = 'Stripe',
  Slack = 'Slack'
}

export enum IntegrationStatus {
  NotConnected = 'NotConnected',
  Connected = 'Connected',
  Error = 'Error',
  Syncing = 'Syncing',
  TokenExpired = 'TokenExpired'
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
  connectedAt: string;
  lastSyncAt: string | null;
  nextSyncAt: string | null;
  syncedRecordCount: number;
  errorMessage: string | null;
  isTokenExpired: boolean;
  needsTokenRefresh: boolean;
  syncConfiguration: SyncConfiguration | null;
}

export interface IntegrationStatusResponse {
  id: string;
  type: IntegrationType;
  name: string;
  status: IntegrationStatus;
  isConnected: boolean;
  lastSyncedAt?: string;
  nextSyncAt?: string;
  syncedRecordCount: number;
  syncConfiguration?: SyncConfiguration;
  errorMessage?: string;
  connectionDetails?: ConnectionDetails;
  needsTokenRefresh?: boolean;
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

// OAuth Flow Types
export interface StartConnectionResult {
  authorizationUrl: string;
  state: string;
}

export interface OAuthCallbackRequest {
  code: string;
  state: string;
  error?: string;
}

export interface HandleCallbackResult {
  success: boolean;
  integrationId?: string;
  requiresConfiguration: boolean;
  errorMessage?: string;
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
  success: boolean;
  authorizationUrl?: string;
  errorMessage?: string;
}

export interface TestConnectionResult {
  integrationId: string;
  isConnected: boolean;
  status: string;
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
  // New optional sections for ideal JSON shape used by UI
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
    timeline: Array<{
      timestamp: string;
      type: string;
      description: string;
      displayTime?: string;
    }>;
  };
  analytics?: {
    engagementTrends: Array<{
      month: string;
      engagement: number;
    }>;
    churnRiskTrend: Array<{
      month: string;
      riskScore: number;
    }>;
    keyMetrics?: {
      loginFrequencyPerMonth?: number;
      featureUsagePercent?: number;
      supportTicketsLast30Days?: number;
    };
  };
  dataSources?: {
    overview?: {
      totalSources: number;
      totalRecords?: number;
      lastOverallSync?: string;
    };
    sources: Array<{
      id: string;
      name: string;
      type: string; // hubspot|stripe|manual|...
      category: string; // crm|payment|activity|support|marketing|engagement
      lastSync?: string;
      syncStatus?: string; // success|warning|error
      recordCount?: number;
      isPrimary?: boolean;
    }>;
    categories?: string[];
    quality?: {
      completenessScorePercent?: number;
      accuracyScorePercent?: number;
      dataFreshnessDisplay?: string;
    };
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
