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
  scenario?: string | null;
  seed?: number | null;
  createdAt: string;
}

export interface TestingLabIntegrationDetailResponse {
  integrationId: string;
  integrationType: number;
  status: string;
  scenario?: string | null;
  seed?: number | null;
  createdAt: string;
  lastSyncedAt?: string | null;
  customerProfileCount: number;
  eventProfileCount: number;
  totalSyncCycles: number;
}

export interface TestingLabSyncRequest {
  startDate?: string | null;
  endDate?: string | null;
  customerCount: number;
  eventsPerCustomerPerMonth: number;
  generateCustomers?: boolean;
}

export interface TestingLabSyncResult {
  integrationId: string;
  customersCreated: number;
  eventsCreated: number;
  signalsDetected: number;
  runsCreated: number;
  startDate?: string | null;
  endDate?: string | null;
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

export const useGetTestingIntegrations = (
  queryConfig?: QueryConfig<typeof getTestingIntegrationsQueryOptions>
) => {
  return useQuery({
    ...getTestingIntegrationsQueryOptions(),
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

export const useGetEventProfiles = (
  integrationId: string,
  queryConfig?: QueryConfig<typeof getEventProfilesQueryOptions>
) => {
  return useQuery({
    ...getEventProfilesQueryOptions(integrationId),
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
