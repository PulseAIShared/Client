export enum PlaybookStatus {
  Draft = 0,
  Active = 1,
  Paused = 2,
  Archived = 3,
}

export enum PlaybookCategory {
  Payment = 0,
  Engagement = 1,
  Support = 2,
  Cancellation = 3,
  Custom = 4,
}

export enum TriggerType {
  Signal = 0,
  Segment = 1,
  Manual = 2,
}

export enum ExecutionMode {
  Immediate = 0,
  Approval = 1,
  Scheduled = 2,
}

export enum ActionType {
  StripeRetry = 0,
  SlackAlert = 1,
  CrmTask = 2,
  HubspotWorkflow = 3,
  Email = 4,
  Webhook = 5,
}

export enum ConfidenceLevel {
  Minimal = 0,
  Good = 1,
  High = 2,
  Excellent = 3,
}

export enum LifecycleStatus {
  Pending = 0,
  PendingApproval = 1,
  ApprovedQueued = 2,
  Executing = 3,
  Terminal = 4,
}

export enum RunOutcome {
  Succeeded = 0,
  PartialSuccess = 1,
  Failed = 2,
  Inconclusive = 3,
  Cancelled = 4,
  Rejected = 5,
}

export interface PlaybookSummary {
  id: string;
  name: string;
  status: PlaybookStatus | string;
  category: PlaybookCategory | string;
  priority: number;
  activeRunCount: number;
  totalRunCount: number;
  createdAt: string;
  signalType?: string | null;
}

export interface PlaybookAction {
  actionType: ActionType | string;
  orderIndex: number;
  configJson: string;
}

export interface PlaybookTargetSegment {
  segmentId: string;
  name: string;
}

export interface PlaybookDetail extends PlaybookSummary {
  description?: string | null;
  triggerType: TriggerType | string;
  triggerConditionsJson: string;
  minConfidence: ConfidenceLevel | string;
  cooldownHours: number;
  maxConcurrentRuns: number;
  executionMode: ExecutionMode | string;
  actions: PlaybookAction[];
  targetSegments: PlaybookTargetSegment[];
}

export interface PlaybookRun {
  id: string;
  playbookId: string;
  customerId: string;
  customerName: string;
  lifecycleStatus: LifecycleStatus | string;
  outcome?: RunOutcome | string | null;
  confidence: ConfidenceLevel | string;
  potentialValue?: number | null;
  reasonShort: string;
  decisionSummaryJson: string;
  createdAt: string;
  approvedAt?: string | null;
  completedAt?: string | null;
  snoozedUntil?: string | null;
}

export interface TriggerExplanation {
  playbookName: string;
  customerName: string;
  verdict: string;
  signalChecks: Array<{
    signalType: string;
    isPresent: boolean;
    conditionsMatched: boolean;
    details?: string | null;
  }>;
  confidenceCheck: {
    required: ConfidenceLevel | string;
    actual: ConfidenceLevel | string;
    passed: boolean;
  };
  suppressionCheck: {
    isSuppressed: boolean;
    reason?: string | null;
    cooldownEndsAt?: string | null;
    details?: string | null;
  };
  segmentCheck: {
    isMatch: boolean;
    matchedSegments: PlaybookTargetSegment[];
    missingSegments: PlaybookTargetSegment[];
  };
}

export interface ConflictLogEntry {
  id: string;
  suppressedPlaybookName: string;
  winningPlaybookName?: string | null;
  customerName: string;
  reason: string | number;
  createdAt: string;
}

export interface WorkQueueSummary {
  pendingApprovals: number;
  highValueCount: number;
  staleCount: number;
  totalValueAtRisk: number;
  oldestPendingAge?: string | null;
}

export interface WorkQueueItem {
  runId: string;
  customerId: string;
  playbookId?: string;
  customerName: string;
  customerEmail: string;
  playbookName: string;
  reason: string;
  priority?: 'High' | 'Medium' | 'Low';
  confidence: ConfidenceLevel | string;
  potentialValue?: number | null;
  currencyCode?: string;
  createdAt: string;
  snoozedUntil?: string | null;
  customerMonthlyRecurringRevenue?: number | null;
  customerPlanTier?: string | null;
  lastPaymentAt?: string | null;
  failedPaymentsLast30d?: number;
  successfulPaymentsLast30d?: number;
  churnRiskScore?: number | null;
  lastActiveAt?: string | null;
  engagementScore?: number | null;
  engagementTrend?: string | null;
  customerSince?: string;
}

export interface WorkQueueResponse {
  summary: WorkQueueSummary;
  items: WorkQueueItem[];
}

export type WorkQueueBulkAction = 'approve' | 'snooze' | 'dismiss';

export interface WorkQueueBulkActionRequest {
  itemIds: string[];
  action: WorkQueueBulkAction;
  snoozeDurationHours?: number;
}

export interface WorkQueueBulkActionFailure {
  id: string;
  reason: string;
}

export interface WorkQueueBulkActionResponse {
  succeeded: string[];
  failed: WorkQueueBulkActionFailure[];
}

export type WorkQueueOutcomeStatus =
  | 'Executing'
  | 'Succeeded'
  | 'PartiallyFailed'
  | 'Failed'
  | 'Dismissed'
  | 'Snoozed';

export type WorkQueueDecision = 'Approved' | 'Dismissed' | 'Snoozed';

export interface RecentlyActedSummary {
  approvedToday: number;
  dismissedToday: number;
  snoozedToday: number;
  successRatePercent: number;
}

export interface RecentlyActedItem {
  runId: string;
  customerId: string;
  playbookId: string;
  customerName: string;
  customerEmail: string;
  playbookName: string;
  reason: string;
  potentialValue?: number | null;
  currencyCode: string;
  decision: WorkQueueDecision;
  actedByUserId?: string | null;
  actedByName: string;
  actedAt: string;
  outcomeStatus: WorkQueueOutcomeStatus;
}

export interface RecentlyActedResponse {
  summary: RecentlyActedSummary;
  items: RecentlyActedItem[];
}

export interface PlaybookRunActionItem {
  actionId: string;
  actionType: string;
  status: string;
  attemptCount: number;
  timestamp: string;
  errorCode?: string | null;
  errorMessage?: string | null;
  detailsJson?: string | null;
}

export interface PlaybookRunActionsResponse {
  runId: string;
  actions: PlaybookRunActionItem[];
}

export interface FailedActionsSummary {
  totalFailures: number;
  oldestFailureAge?: string | null;
  totalFailedValue: number;
}

export interface FailedActionItem {
  runId: string;
  customerId: string;
  playbookId: string;
  customerName: string;
  customerEmail: string;
  playbookName: string;
  reason: string;
  potentialValue?: number | null;
  currencyCode: string;
  failedActionId: string;
  failedActionType: string;
  errorDetails: string;
  failedAt: string;
  outcomeStatus: WorkQueueOutcomeStatus;
  dismissalReason?: string | null;
}

export interface FailedActionsResponse {
  summary: FailedActionsSummary;
  items: FailedActionItem[];
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
