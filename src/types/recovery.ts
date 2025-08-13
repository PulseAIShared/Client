// Recovery API Types for Server Implementation
// Note: This file contains types for FUNCTIONAL recovery operations only.
// Analytics types (KPIs, timeline, segments, reasons) are handled separately on the insights page.

// Analytics types still needed for insights components
export interface RecoveryKPIs {
  missedPaymentsCount: number;
  missedAmount: number;
  recoveredAmount: number;
  recoveryRate: number;
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
  reason: string;
  count: number;
}

export interface MissedPaymentRow {
  id: string;
  customer: string;
  amount: number;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Recovered';
  attempts: number;
  segmentTags: string[];
  customerId?: string;
  subscriptionId?: string;
  failureReason?: string;
  lastAttemptDate?: string;
  nextAttemptDate?: string;
}

export interface RecoveryFlowStep {
  step: number;
  type: 'email' | 'sms' | 'phone' | 'in-app';
  delay: string;
  subject: string;
  template?: string;
  open_rate?: number;
  response_rate?: number;
  click_rate?: number;
  conversion?: number;
}

export interface RecoveryFlow {
  id: string;
  name: string;
  status: 'Active' | 'Paused' | 'Draft';
  type: 'Automated' | 'AI-Generated' | 'Behavioral';
  trigger: string;
  channels: string[];
  successRate: number;
  recoveredRevenue: string;
  steps: RecoveryFlowStep[];
  createdAt: string;
  updatedAt: string;
  enrolledPayments?: number;
  totalRecovered?: number;
}

export interface FlowTemplate {
  id: string;
  name: string;
  trigger: string;
  successRate: number;
  category: string;
  description?: string;
  steps: RecoveryFlowStep[];
}

export interface RecoveryAnalytics {
  tables: {
    missedPayments: MissedPaymentRow[];
  };
}

export interface RecoveryFlows {
  flows: RecoveryFlow[];
  templates: FlowTemplate[];
}

export interface RecoveryDashboardResponse {
  analytics: RecoveryAnalytics;
  flows: RecoveryFlows;
}

// Request/Response Types for API Operations

export interface CreateFlowRequest {
  name: string;
  trigger: string;
  type: 'Automated' | 'AI-Generated' | 'Behavioral';
  steps: RecoveryFlowStep[];
  status?: 'Active' | 'Paused' | 'Draft';
}

export interface UpdateFlowRequest extends Partial<CreateFlowRequest> {
  id: string;
}

export interface EnrollPaymentRequest {
  flowId: string;
}

export interface BulkEnrollRequest {
  paymentIds: string[];
  flowId: string;
}

export interface RetryPaymentResponse {
  success: boolean;
  paymentId: string;
  newAttemptDate?: string;
  message?: string;
}

export interface EnrollPaymentResponse {
  success: boolean;
  paymentId: string;
  flowId: string;
  enrollmentId?: string;
  message?: string;
}

export interface FlowPerformanceMetrics {
  flowId: string;
  enrolledCount: number;
  recoveredCount: number;
  recoveredAmount: number;
  averageTimeToRecover: number;
  stepPerformance: {
    step: number;
    sentCount: number;
    openRate?: number;
    clickRate?: number;
    responseRate?: number;
    conversionRate?: number;
  }[];
}

// Filter and Query Types

export interface PaymentFilters {
  status?: 'All' | 'Open' | 'In Progress' | 'Recovered';
  minAmount?: number;
  maxAmount?: number;
  segment?: string;
  customerId?: string;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'customer' | 'amount' | 'dueDate' | 'status' | 'attempts';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface FlowFilters {
  status?: 'Active' | 'Paused' | 'Draft' | 'All';
  type?: 'Automated' | 'AI-Generated' | 'Behavioral' | 'All';
  sortBy?: 'name' | 'createdAt' | 'successRate' | 'recoveredRevenue';
  sortDirection?: 'asc' | 'desc';
}
