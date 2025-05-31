


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


export interface CustomerData {
  id: string;
  name: string;
  email: string;
  monthsSubbed: number;
  ltv: string;
  churnRisk: number;
  activityFrequency: 'High' | 'Medium' | 'Low';
  lastActivity: string;
  plan: string;
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
