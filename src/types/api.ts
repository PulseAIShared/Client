


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


export interface ChurnRiskData {
  week: string;
  risk: number;
}

export interface CustomerInsight {
  name: string;
  value: number;
  revenue: number;
  color: string;
}

export interface AtRiskCustomer {
  name: string;
  daysSince: number;
  score: number;
}

export interface DashboardStats {
  totalUsers: string;
  churnRisk: string;
  recoveredRevenue: string;
  avgLTV: string;
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

// Keep existing interfaces for backward compatibility
export interface ChurnRiskData {
  week: string;
  risk: number;
}

export interface CustomerInsight {
  name: string;
  value: number;
  revenue: number;
  color: string;
}

export interface AtRiskCustomer {
  name: string;
  daysSince: number;
  score: number;
}

export interface DashboardStats {
  totalUsers: string;
  churnRisk: string;
  recoveredRevenue: string;
  avgLTV: string;
}

// Rest of your existing types remain the same...
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
