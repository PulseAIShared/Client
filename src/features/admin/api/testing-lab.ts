import { api } from "@/lib/api-client";
import { MutationConfig, QueryConfig } from "@/lib/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface InjectEventRequest {
  customerId: string;
  eventType: string;
  amount?: number | null;
  currency?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface TestEventResult {
  eventId: string;
  signalDetected: boolean;
  signalType?: string | null;
  matchingPlaybooks: string[];
}

export interface DetectedSignal {
  eventId: string;
  signalType: string;
  customerId: string;
  customerEmail: string;
  occurredAt: string;
}

export interface SignalDetectionResult {
  eventsProcessed: number;
  signalsDetected: number;
  signals: DetectedSignal[];
}

export interface DecisionSummary {
  schemaVersion: number;
  trigger: string;
  whyNow: string;
  whyThisPlaybook: string;
  confidence: string | number;
  signals: string[];
  evidence: Array<{ label: string; value: string; source: string }>;
  recommendedActions: string[];
  evaluatedAt: string;
}

export interface PlaybookEvaluation {
  playbookId: string;
  playbookName: string;
  wouldTrigger: boolean;
  suppressionReason?: string | null;
  suppressionDetailsJson?: string | null;
  decisionSummary?: DecisionSummary | null;
  missingConditions: string[];
}

export interface ConflictExplanation {
  suppressedPlaybookId: string;
  suppressedPlaybookName: string;
  winningPlaybookId?: string | null;
  winningPlaybookName?: string | null;
  reason: string;
  cooldownEndsAt?: string | null;
}

export interface DryRunResult {
  customerId: string;
  customerEmail: string;
  signalType: string;
  evaluations: PlaybookEvaluation[];
  conflicts: ConflictExplanation[];
}

export interface TimeSimulationResult {
  runsAffected: number;
  cooldownsExpired: number;
  simulatedTime: string;
}

export interface DecisionSummaryDetail {
  runId: string;
  customerName: string;
  playbookName: string;
  trigger: string;
  whyNow: string;
  whyThisPlaybook: string;
  confidence: string;
  signals: string[];
  activeActions: string[];
  evaluatedAt: string;
}

export interface DetectSignalsRequest {
  eventId?: string | null;
}

export interface EvaluateTriggersRequest {
  customerId: string;
  signalType: string;
}

export interface TestCustomerDto {
  customerId: string;
  customerName: string;
  customerEmail: string;
}

export interface PlaybookTestingDto {
  playbookId: string;
  name: string;
  status: string | number;
  triggerType: string | number;
  signalType?: string | null;
  priority: number;
  cooldownHours: number;
}

export const getTestingLabCustomers = async (): Promise<TestCustomerDto[]> => {
  return api.get('/admin/testing-lab/customers');
};

export const getTestingLabPlaybooks = async (): Promise<PlaybookTestingDto[]> => {
  return api.get('/admin/testing-lab/playbooks');
};

export const getTestingLabProviderSupport = async (): Promise<TestingLabProviderSupportResponse[]> => {
  return api.get('/admin/testing-lab/providers/support');
};

export const injectTestEvent = async (request: InjectEventRequest): Promise<TestEventResult> => {
  return api.post('/admin/testing-lab/inject-event', request);
};

export const detectSignals = async (request: DetectSignalsRequest): Promise<SignalDetectionResult> => {
  return api.post('/admin/testing-lab/detect-signals', request);
};

export const evaluateTriggersDryRun = async (request: EvaluateTriggersRequest): Promise<DryRunResult> => {
  return api.post('/admin/testing-lab/evaluate-triggers', request);
};

export const simulateTime = async (hoursToAdvance: number): Promise<TimeSimulationResult> => {
  return api.post('/admin/testing-lab/simulate-time', { hoursToAdvance });
};

export const resetTestingLab = async (): Promise<{ success: boolean }> => {
  return api.post('/admin/testing-lab/reset');
};

// ─── Integration setup types ───

export interface CreateTestingIntegrationRequest {
  integrationType: number;
  scenario?: string | null;
  seed?: number | null;
  autoSyncEnabled?: boolean;
}

export interface TestingLabIntegrationResponse {
  integrationId: string;
  integrationType: number;
  status: string;
  parityLevel: string;
  parityWarning?: string | null;
  scenario?: string | null;
  seed?: number | null;
  createdAt: string;
}

export interface TestingLabIntegrationDetailResponse {
  integrationId: string;
  integrationType: number;
  status: string;
  parityLevel: string;
  parityWarning?: string | null;
  supportsDataSync: boolean;
  supportsActions: boolean;
  scenario?: string | null;
  seed?: number | null;
  createdAt: string;
  lastSyncedAt?: string | null;
  customerProfileCount: number;
  eventProfileCount: number;
  totalSyncCycles: number;
}

export interface TestingLabSyncFailureOpsItem {
  syncRunId: string;
  integrationId: string;
  integrationType: number;
  status: string;
  startedAt: string;
  completedAt?: string | null;
  correlationId: string;
  errorSummary?: string | null;
}

export interface TestingLabOutboxBacklogOpsItem {
  outboxEventId: string;
  type: string;
  occurredAt: string;
  nextAttemptAt: string;
  attempts: number;
  correlationId: string;
  lastError?: string | null;
}

export interface TestingLabOutboxBacklogOpsSummary {
  pendingCount: number;
  processingCount: number;
  failedCount: number;
  oldestPendingOccurredAt?: string | null;
  failedEvents: TestingLabOutboxBacklogOpsItem[];
}

export interface TestingLabRouteMismatchOpsItem {
  syncRunId: string;
  integrationId: string;
  integrationType: number;
  logId?: string | null;
  timestamp: string;
  scope: string;
  message: string;
  correlationId: string;
}

export interface TestingLabSyncQualityOpsItem {
  syncRunId: string;
  integrationId: string;
  integrationType: number;
  grade: string;
  score: number;
  status: string;
  startedAt: string;
  completedAt?: string | null;
  correlationId: string;
}

export interface TestingLabSyncQualityOpsSummary {
  evaluatedRunCount: number;
  ungradedRunCount: number;
  healthyRunCount: number;
  warningRunCount: number;
  criticalRunCount: number;
  gradeDistribution: Record<string, number>;
  latestNonHealthyRuns: TestingLabSyncQualityOpsItem[];
}

export interface TestingLabOpsSnapshotResponse {
  generatedAt: string;
  testingIntegrationCount: number;
  syncRunCorrelationCount: number;
  failedSyncRuns: TestingLabSyncFailureOpsItem[];
  outboxBacklog: TestingLabOutboxBacklogOpsSummary;
  syncQuality: TestingLabSyncQualityOpsSummary;
  routeMismatchFailures: TestingLabRouteMismatchOpsItem[];
}

export type SandboxVerificationTargetMode = 'Auto' | 'Sandbox' | 'TestingLab' | 'Live';

export interface SandboxVerificationProviderModeItem {
  integrationType: number;
  targetMode: SandboxVerificationTargetMode;
}

export interface SandboxVerificationConfigResponse {
  enabled: boolean;
  allowModeFallback: boolean;
  alertOnRegression: boolean;
  regressionScoreDropThreshold: number;
  nightlyCron: string;
  providerModes: SandboxVerificationProviderModeItem[];
  lastRunAt?: string | null;
  lastRunCompletedAt?: string | null;
  lastRunFailedAt?: string | null;
  lastRunError?: string | null;
  updatedAt: string;
}

export interface UpdateSandboxVerificationConfigRequest {
  enabled: boolean;
  allowModeFallback: boolean;
  alertOnRegression: boolean;
  regressionScoreDropThreshold: number;
  providerModes: SandboxVerificationProviderModeItem[];
}

export interface SandboxVerificationRunItemResponse {
  id: string;
  startedAt: string;
  completedAt: string;
  integrationType: number;
  requestedMode: string;
  effectiveMode?: string | null;
  usedFallbackMode: boolean;
  status: string;
  integrationId?: string | null;
  syncRunId?: string | null;
  correlationId?: string | null;
  qualityGrade?: string | null;
  qualityScore?: number | null;
  qualityStatus?: string | null;
  previousQualityGrade?: string | null;
  previousQualityScore?: number | null;
  scoreDelta?: number | null;
  regressionDetected: boolean;
  regressionReason?: string | null;
  errorSummary?: string | null;
}

export interface SandboxVerificationRunNowResponse {
  startedAt: string;
  completedAt: string;
  attemptedProviders: number;
  completedProviders: number;
  failedProviders: number;
  skippedProviders: number;
  regressionsDetected: number;
  runs: SandboxVerificationRunItemResponse[];
}

export interface TestingLabSyncRequest {
  startDate?: string | null;
  endDate?: string | null;
  customerCount: number;
  eventsPerCustomerPerMonth: number;
  generateCustomers?: boolean;
  waitForCompletion?: boolean;
}

export interface TestingLabSyncResult {
  integrationId: string;
  syncRunId: string;
  syncJobId?: string | null;
  queued: boolean;
  queuedAt: string;
  parityLevel: string;
  parityWarning?: string | null;
  customersCreated: number;
  eventsCreated: number;
  signalsDetected: number;
  runsCreated: number;
  startDate?: string | null;
  endDate?: string | null;
}

export interface TestingLabProviderSupportResponse {
  integrationType: number;
  provider: string;
  parityLevel: string;
  routeParity: boolean;
  payloadParity: boolean;
  eventGenerationParity: boolean;
  canCreateIntegration: boolean;
  supportsDataSync: boolean;
  supportsActions: boolean;
  warning?: string | null;
}

export interface TestingLabPipelineRequest {
  integrationId: string;
  startDate?: string | null;
  endDate?: string | null;
  customerCount: number;
  eventsPerCustomerPerMonth: number;
}

export const IntegrationTypeLabels: Record<number, string> = {
  4: 'Stripe',
  1: 'HubSpot',
  5: 'PostHog',
  2: 'Pipedrive',
  12: 'Chargebee',
  9: 'Zendesk',
  8: 'Intercom',
  11: 'Microsoft Teams',
};

// Integration purpose helpers
type IntegrationPurposeInfo = 'data_source' | 'action_channel' | 'hybrid';

const INTEGRATION_PURPOSE_MAP: Record<number, IntegrationPurposeInfo> = {
  4: 'hybrid',        // Stripe
  1: 'hybrid',        // HubSpot
  8: 'hybrid',        // Intercom
  9: 'hybrid',        // Zendesk
  10: 'action_channel', // Slack
  11: 'action_channel', // Microsoft Teams
  5: 'data_source',   // PostHog
  2: 'data_source',   // Pipedrive
  12: 'data_source',  // Chargebee
};

export const getIntegrationPurpose = (
  integrationType: number
): IntegrationPurposeInfo => {
  return INTEGRATION_PURPOSE_MAP[integrationType] ?? 'data_source';
};

export const supportsDataSync = (integrationType: number): boolean => {
  const purpose = getIntegrationPurpose(integrationType);
  return purpose === 'data_source' || purpose === 'hybrid';
};

export const supportsActions = (integrationType: number): boolean => {
  const purpose = getIntegrationPurpose(integrationType);
  return purpose === 'action_channel' || purpose === 'hybrid';
};

// Action types per integration for testing
export interface ActionTypeOption {
  value: string;
  label: string;
}

const ACTION_TYPES_BY_INTEGRATION: Record<number, ActionTypeOption[]> = {
  4: [{ value: 'StripeRetry', label: 'Retry Payment' }],
  1: [
    { value: 'CrmTask', label: 'Create CRM Task' },
    { value: 'HubspotWorkflow', label: 'Trigger Workflow' },
  ],
  8: [
    { value: 'IntercomMessage', label: 'Send Message' },
    { value: 'IntercomNote', label: 'Add Note' },
  ],
  9: [{ value: 'ZendeskCreateTicket', label: 'Create Ticket' }],
  10: [{ value: 'SlackAlert', label: 'Send Alert' }],
  11: [{ value: 'TeamsAlert', label: 'Send Alert' }],
};

export const getActionTypesForIntegration = (
  integrationType: number
): ActionTypeOption[] => {
  return ACTION_TYPES_BY_INTEGRATION[integrationType] ?? [];
};

export const getDefaultActionConfig = (actionType: string): string => {
  const templates: Record<string, object> = {
    SlackAlert: { channel: '#alerts', message: 'Test alert from PulseLTV' },
    TeamsAlert: { message: 'Test alert from PulseLTV' },
    IntercomMessage: { body: 'Test message from PulseLTV' },
    IntercomNote: { body: 'Test note from PulseLTV' },
    ZendeskCreateTicket: {
      subject: 'Test ticket',
      description: 'Created by PulseLTV Testing Lab',
      priority: 'normal',
    },
    CrmTask: { subject: 'Follow up', notes: 'Testing Lab task' },
    HubspotWorkflow: { workflowId: '' },
    StripeRetry: {},
  };
  return JSON.stringify(templates[actionType] ?? {}, null, 2);
};

// Test action API
export interface TestActionRequest {
  actionType: string;
  configJson: string;
}

export interface TestActionResponse {
  success: boolean;
  externalId?: string | null;
  responseJson?: string | null;
  error?: string | null;
}

export const testAction = async ({
  integrationId,
  request,
}: {
  integrationId: string;
  request: TestActionRequest;
}): Promise<TestActionResponse> => {
  return api.post(
    `/admin/testing-lab/integrations/${integrationId}/test-action`,
    request
  );
};

export const useTestAction = (options?: {
  mutationConfig?: MutationConfig<typeof testAction>;
}) => {
  return useMutation({
    mutationFn: testAction,
    ...options?.mutationConfig,
  });
};

export const ScenarioOptions = [
  { value: 'stable_growth', label: 'Stable Growth' },
  { value: 'high_risk_cohort', label: 'High Risk Cohort' },
  { value: 'seasonal_spikes', label: 'Seasonal Spikes' },
  { value: 'upgrade_downgrade', label: 'Upgrade / Downgrade' },
];

// ─── Integration setup API calls ───

export const createTestingIntegration = async (
  request: CreateTestingIntegrationRequest
): Promise<TestingLabIntegrationResponse> => {
  return api.post('/admin/testing-lab/integrations', request);
};

export const getTestingIntegrations = async (): Promise<TestingLabIntegrationDetailResponse[]> => {
  return api.get('/admin/testing-lab/integrations');
};

export const getTestingLabOpsSnapshot = async (): Promise<TestingLabOpsSnapshotResponse> => {
  return api.get('/admin/testing-lab/ops/snapshot');
};

export const getSandboxVerificationConfig = async (): Promise<SandboxVerificationConfigResponse> => {
  return api.get('/admin/testing-lab/sandbox-verification/config');
};

export const updateSandboxVerificationConfig = async (
  request: UpdateSandboxVerificationConfigRequest
): Promise<SandboxVerificationConfigResponse> => {
  return api.put('/admin/testing-lab/sandbox-verification/config', request);
};

export const getSandboxVerificationRuns = async (
  limit = 20
): Promise<SandboxVerificationRunItemResponse[]> => {
  return api.get(`/admin/testing-lab/sandbox-verification/runs?limit=${limit}`);
};

export const runSandboxVerificationNow = async (): Promise<SandboxVerificationRunNowResponse> => {
  return api.post('/admin/testing-lab/sandbox-verification/run');
};

export const syncTestingIntegration = async ({
  integrationId,
  request,
}: {
  integrationId: string;
  request: TestingLabSyncRequest;
}): Promise<TestingLabSyncResult> => {
  return api.post(`/admin/testing-lab/integrations/${integrationId}/sync`, request);
};

export const runTestingPipeline = async (
  request: TestingLabPipelineRequest
): Promise<TestingLabSyncResult> => {
  return api.post('/admin/testing-lab/pipeline/run', request);
};

// ─── Integration setup query/mutation hooks ───

export const getTestingIntegrationsQueryOptions = () => ({
  queryKey: ['testing-lab', 'integrations'],
  queryFn: getTestingIntegrations,
});

export const getTestingLabOpsSnapshotQueryOptions = () => ({
  queryKey: ['testing-lab', 'ops-snapshot'],
  queryFn: getTestingLabOpsSnapshot,
});

export const getSandboxVerificationConfigQueryOptions = () => ({
  queryKey: ['testing-lab', 'sandbox-verification', 'config'],
  queryFn: getSandboxVerificationConfig,
});

export const getSandboxVerificationRunsQueryOptions = (limit = 20) => ({
  queryKey: ['testing-lab', 'sandbox-verification', 'runs', limit],
  queryFn: () => getSandboxVerificationRuns(limit),
});

export const useGetTestingIntegrations = (
  queryConfig?: QueryConfig<typeof getTestingIntegrationsQueryOptions>
) => {
  return useQuery({
    ...getTestingIntegrationsQueryOptions(),
    ...queryConfig,
  });
};

export const useGetTestingLabOpsSnapshot = (
  queryConfig?: QueryConfig<typeof getTestingLabOpsSnapshotQueryOptions>
) => {
  return useQuery({
    ...getTestingLabOpsSnapshotQueryOptions(),
    ...queryConfig,
  });
};

export const useGetSandboxVerificationConfig = (
  queryConfig?: QueryConfig<typeof getSandboxVerificationConfigQueryOptions>
) => {
  return useQuery({
    ...getSandboxVerificationConfigQueryOptions(),
    ...queryConfig,
  });
};

export const useGetSandboxVerificationRuns = (
  limit = 20,
  queryConfig?: QueryConfig<typeof getSandboxVerificationRunsQueryOptions>
) => {
  return useQuery({
    ...getSandboxVerificationRunsQueryOptions(limit),
    ...queryConfig,
  });
};

export const useCreateTestingIntegration = (options?: {
  mutationConfig?: MutationConfig<typeof createTestingIntegration>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTestingIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testing-lab', 'integrations'] });
    },
    ...options?.mutationConfig,
  });
};

export const useSyncTestingIntegration = (options?: {
  mutationConfig?: MutationConfig<typeof syncTestingIntegration>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncTestingIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testing-lab'] });
    },
    ...options?.mutationConfig,
  });
};

export const useRunTestingPipeline = (options?: {
  mutationConfig?: MutationConfig<typeof runTestingPipeline>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runTestingPipeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testing-lab'] });
    },
    ...options?.mutationConfig,
  });
};

export const useUpdateSandboxVerificationConfig = (options?: {
  mutationConfig?: MutationConfig<typeof updateSandboxVerificationConfig>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSandboxVerificationConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testing-lab', 'sandbox-verification'] });
    },
    ...options?.mutationConfig,
  });
};

export const useRunSandboxVerificationNow = (options?: {
  mutationConfig?: MutationConfig<typeof runSandboxVerificationNow>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runSandboxVerificationNow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testing-lab', 'sandbox-verification'] });
      queryClient.invalidateQueries({ queryKey: ['testing-lab', 'ops-snapshot'] });
    },
    ...options?.mutationConfig,
  });
};

export const getTestingLabCustomersQueryOptions = () => {
  return {
    queryKey: ['testing-lab', 'customers'],
    queryFn: getTestingLabCustomers,
  };
};

export const getTestingLabPlaybooksQueryOptions = () => {
  return {
    queryKey: ['testing-lab', 'playbooks'],
    queryFn: getTestingLabPlaybooks,
  };
};

export const getTestingLabProviderSupportQueryOptions = () => {
  return {
    queryKey: ['testing-lab', 'provider-support'],
    queryFn: getTestingLabProviderSupport,
  };
};

export const useGetTestingLabCustomers = (
  queryConfig?: QueryConfig<typeof getTestingLabCustomersQueryOptions>
) => {
  return useQuery({
    ...getTestingLabCustomersQueryOptions(),
    ...queryConfig,
  });
};

export const useGetTestingLabPlaybooks = (
  queryConfig?: QueryConfig<typeof getTestingLabPlaybooksQueryOptions>
) => {
  return useQuery({
    ...getTestingLabPlaybooksQueryOptions(),
    ...queryConfig,
  });
};

export const useGetTestingLabProviderSupport = (
  queryConfig?: QueryConfig<typeof getTestingLabProviderSupportQueryOptions>
) => {
  return useQuery({
    ...getTestingLabProviderSupportQueryOptions(),
    ...queryConfig,
  });
};

export const useInjectTestEvent = (options?: {
  mutationConfig?: MutationConfig<typeof injectTestEvent>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: injectTestEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testing-lab', 'customers'] });
    },
    ...options?.mutationConfig,
  });
};

export const useEvaluateTriggersDryRun = (options?: {
  mutationConfig?: MutationConfig<typeof evaluateTriggersDryRun>;
}) => {
  return useMutation({
    mutationFn: evaluateTriggersDryRun,
    ...options?.mutationConfig,
  });
};

export const useSimulateTime = (options?: {
  mutationConfig?: MutationConfig<typeof simulateTime>;
}) => {
  return useMutation({
    mutationFn: simulateTime,
    ...options?.mutationConfig,
  });
};

export const useResetTestingLab = (options?: {
  mutationConfig?: MutationConfig<typeof resetTestingLab>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetTestingLab,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testing-lab'] });
    },
    ...options?.mutationConfig,
  });
};

// ─── Integration detail + data generation types ───

export interface GenerateCustomersRequest {
  customerCount?: number;
  scenario?: string | null;
  seed?: number | null;
}

export interface GenerateCustomersResult {
  integrationId: string;
  customersCreated: number;
}

export interface GenerateEventsRequest {
  startDate?: string | null;
  endDate?: string | null;
  eventsPerCustomerPerMonth?: number;
  scenario?: string | null;
  seed?: number | null;
}

export interface GenerateEventsResult {
  integrationId: string;
  eventsCreated: number;
}

export interface BackfillRequest {
  startDate: string;
  endDate: string;
  eventsPerCustomerPerMonth?: number;
  customerCount?: number;
}

export interface BackfillResult {
  integrationId: string;
  customersCreated: number;
  eventsCreated: number;
  startDate: string;
  endDate: string;
}

export interface SimulateSyncsRequest {
  cycles?: number;
  daysPerCycle?: number;
}

export interface SimulateSyncsResult {
  integrationId: string;
  cyclesCompleted: number;
  totalEventsCreated: number;
  totalCustomersCreated: number;
}

export interface TestingLabCustomerProfileDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mrr: number;
  status: string;
  plan?: string | null;
}

export interface TestingLabEventProfileDto {
  id: string;
  eventType: string;
  occurredAt: string;
  amount?: number | null;
  currency?: string | null;
  customerEmail?: string | null;
}

export interface IntegrationSyncRunStepResponse {
  id: string;
  stepKey: string;
  status: string;
  startedAt: string;
  completedAt?: string | null;
  summary?: string | null;
  detailsJson?: Record<string, unknown> | null;
}

export interface IntegrationSyncRunLogResponse {
  id: string;
  timestamp: string;
  level: string;
  scope: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  dataJson?: Record<string, unknown> | null;
  correlationId?: string | null;
}

export interface IntegrationSyncRunMetricsResponse {
  pulled: number;
  mapped: number;
  newRecords: number;
  updated: number;
  failed: number;
  affectedCustomers: number;
  persistenceAttempted: boolean;
  persistenceInserted: number;
  persistenceDuplicates: number;
  persistenceErrors: number;
  persistenceFatalError: boolean;
}

export interface IntegrationSyncRunQualityGradeResponse {
  grade: string;
  score: number;
  status: string;
  ingestionScore: number;
  extractionScore: number;
  projectionScore: number;
  downstreamScore: number;
  criticalIssues: string[];
}

export interface IntegrationSyncRunIssueSummaryResponse {
  warningLogCount: number;
  errorLogCount: number;
  failedStepCount: number;
  skippedStepCount: number;
}

export interface IntegrationSyncRunDownstreamOutcomesResponse {
  outboxEmitted: number;
  outboxProcessed: number;
  outboxFailed: number;
  recomputeQueued: number;
  recomputeProcessed: number;
  recomputeFailed: number;
  churnRiskChanged: number;
  segmentMembershipChanged: number;
}

export interface IntegrationSyncRunAffectedCustomerResponse {
  customerId: string;
  changedDomains: string[];
  riskDelta?: number | null;
  segmentDeltaCount: number;
}

export interface IntegrationSyncRunDetailResponse {
  syncRunId: string;
  integrationId: string;
  companyId: string;
  status: string;
  mode: string;
  triggeredByUserId?: string | null;
  startedAt: string;
  completedAt?: string | null;
  correlationId: string;
  cursorFrom?: string | null;
  cursorTo?: string | null;
  countsJson?: Record<string, unknown> | null;
  errorSummary?: string | null;
  qualityGrade?: IntegrationSyncRunQualityGradeResponse | null;
  metrics?: IntegrationSyncRunMetricsResponse | null;
  issues?: IntegrationSyncRunIssueSummaryResponse | null;
  downstreamOutcomes?: IntegrationSyncRunDownstreamOutcomesResponse | null;
  affectedCustomers?: IntegrationSyncRunAffectedCustomerResponse[] | null;
  totalLogCount: number;
  returnedLogCount: number;
  logsTruncated: boolean;
  steps: IntegrationSyncRunStepResponse[];
  logs: IntegrationSyncRunLogResponse[];
}

// ─── Integration detail + data generation API calls ───

export const getTestingIntegration = async (
  integrationId: string
): Promise<TestingLabIntegrationDetailResponse> => {
  return api.get(`/admin/testing-lab/integrations/${integrationId}`);
};

export const generateCustomers = async ({
  integrationId,
  request,
}: {
  integrationId: string;
  request: GenerateCustomersRequest;
}): Promise<GenerateCustomersResult> => {
  return api.post(`/admin/testing-lab/integrations/${integrationId}/customers`, request);
};

export const getCustomerProfiles = async (
  integrationId: string
): Promise<TestingLabCustomerProfileDto[]> => {
  return api.get(`/admin/testing-lab/integrations/${integrationId}/customers`);
};

export const generateEvents = async ({
  integrationId,
  request,
}: {
  integrationId: string;
  request: GenerateEventsRequest;
}): Promise<GenerateEventsResult> => {
  return api.post(`/admin/testing-lab/integrations/${integrationId}/events`, request);
};

export const getEventProfiles = async (
  integrationId: string
): Promise<TestingLabEventProfileDto[]> => {
  return api.get(`/admin/testing-lab/integrations/${integrationId}/events`);
};

export const getIntegrationSyncRunDetail = async ({
  integrationId,
  syncRunId,
  logLevel,
  logLimit,
}: {
  integrationId: string;
  syncRunId: string;
  logLevel?: string;
  logLimit?: number;
}): Promise<IntegrationSyncRunDetailResponse> => {
  const queryParams = new URLSearchParams();
  if (logLevel) {
    queryParams.set('logLevel', logLevel);
  }
  if (logLimit && logLimit > 0) {
    queryParams.set('logLimit', String(logLimit));
  }

  const query = queryParams.toString();
  const path = `/integrations/${integrationId}/sync-runs/${syncRunId}`;
  return api.get(query ? `${path}?${query}` : path);
};

export const backfillIntegration = async ({
  integrationId,
  request,
}: {
  integrationId: string;
  request: BackfillRequest;
}): Promise<BackfillResult> => {
  return api.post(`/admin/testing-lab/integrations/${integrationId}/backfill`, request);
};

export const simulateSyncs = async ({
  integrationId,
  request,
}: {
  integrationId: string;
  request: SimulateSyncsRequest;
}): Promise<SimulateSyncsResult> => {
  return api.post(`/admin/testing-lab/integrations/${integrationId}/simulate-syncs`, request);
};

export const triggerChurn = async (companyId: string): Promise<{ success: boolean }> => {
  return api.post(`/admin/testing-lab/churn/trigger?companyId=${companyId}`);
};

// ─── Integration detail + data generation query/mutation hooks ───

export const getTestingIntegrationQueryOptions = (integrationId: string) => ({
  queryKey: ['testing-lab', 'integrations', integrationId],
  queryFn: () => getTestingIntegration(integrationId),
  enabled: !!integrationId,
});

export const useGetTestingIntegration = (
  integrationId: string,
  queryConfig?: QueryConfig<typeof getTestingIntegrationQueryOptions>
) => {
  return useQuery({
    ...getTestingIntegrationQueryOptions(integrationId),
    ...queryConfig,
  });
};

export const getCustomerProfilesQueryOptions = (integrationId: string) => ({
  queryKey: ['testing-lab', 'integrations', integrationId, 'customers'],
  queryFn: () => getCustomerProfiles(integrationId),
  enabled: !!integrationId,
});

export const useGetCustomerProfiles = (
  integrationId: string,
  queryConfig?: QueryConfig<typeof getCustomerProfilesQueryOptions>
) => {
  return useQuery({
    ...getCustomerProfilesQueryOptions(integrationId),
    ...queryConfig,
  });
};

export const getEventProfilesQueryOptions = (integrationId: string) => ({
  queryKey: ['testing-lab', 'integrations', integrationId, 'events'],
  queryFn: () => getEventProfiles(integrationId),
  enabled: !!integrationId,
});

export const getIntegrationSyncRunDetailQueryOptions = ({
  integrationId,
  syncRunId,
  logLevel,
  logLimit,
}: {
  integrationId: string;
  syncRunId: string;
  logLevel?: string;
  logLimit?: number;
}) => ({
  queryKey: [
    'testing-lab',
    'sync-runs',
    integrationId,
    syncRunId,
    logLevel ?? 'all',
    logLimit ?? 250
  ],
  queryFn: () => getIntegrationSyncRunDetail({ integrationId, syncRunId, logLevel, logLimit }),
  enabled: Boolean(integrationId && syncRunId),
});

export const useGetEventProfiles = (
  integrationId: string,
  queryConfig?: QueryConfig<typeof getEventProfilesQueryOptions>
) => {
  return useQuery({
    ...getEventProfilesQueryOptions(integrationId),
    ...queryConfig,
  });
};

export const useGetIntegrationSyncRunDetail = (
  params: {
    integrationId: string;
    syncRunId: string;
    logLevel?: string;
    logLimit?: number;
  },
  queryConfig?: QueryConfig<typeof getIntegrationSyncRunDetailQueryOptions>
) => {
  return useQuery({
    ...getIntegrationSyncRunDetailQueryOptions(params),
    ...queryConfig,
  });
};

export const useGenerateCustomers = (options?: {
  mutationConfig?: MutationConfig<typeof generateCustomers>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateCustomers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testing-lab'] });
    },
    ...options?.mutationConfig,
  });
};

export const useGenerateEvents = (options?: {
  mutationConfig?: MutationConfig<typeof generateEvents>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateEvents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testing-lab'] });
    },
    ...options?.mutationConfig,
  });
};

export const useBackfillIntegration = (options?: {
  mutationConfig?: MutationConfig<typeof backfillIntegration>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: backfillIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testing-lab'] });
    },
    ...options?.mutationConfig,
  });
};

export const useSimulateSyncs = (options?: {
  mutationConfig?: MutationConfig<typeof simulateSyncs>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: simulateSyncs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testing-lab'] });
    },
    ...options?.mutationConfig,
  });
};

export const useTriggerChurn = (options?: {
  mutationConfig?: MutationConfig<typeof triggerChurn>;
}) => {
  return useMutation({
    mutationFn: triggerChurn,
    ...options?.mutationConfig,
  });
};
