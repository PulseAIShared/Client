import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig, QueryConfig } from '@/lib/react-query';
import {
  ConflictLogEntry,
  PagedResult,
  PlaybookBlueprintRecommendation,
  PlaybookConfidenceRecommendation,
  PlaybookDetail,
  PlaybookFieldRecommendation,
  PlaybookRun,
  PlaybookSummary,
  RecommendPlaybookBlueprintRequest,
  TrackPlaybookRecommendationOverrideRequest,
  TriggerExplanation,
  WorkQueueItem,
  WorkQueueResponse,
} from '@/types/playbooks';

type PlaybookListParams = {
  status?: string;
  category?: string;
  sortBy?: string;
  sortDirection?: string;
  includeArchived?: boolean;
};

type PlaybookActionInput = {
  actionType: number;
  orderIndex: number;
  configJson: string;
};

export type RecommendPlaybookConfidenceInput = {
  signalType?: string | null;
  actionTypes?: number[];
  executionMode?: number | null;
  hasTargetSegments?: boolean;
};

export type PlaybookInput = {
  name: string;
  description?: string | null;
  category: number;
  triggerType: number;
  triggerConditionsJson: string;
  minConfidence: number;
  confidenceMode: number;
  cooldownHours: number;
  maxConcurrentRuns: number;
  executionMode: number;
  priority: number;
  targetSegmentIds: string[];
  actions: PlaybookActionInput[];
};

export type PlaybookConnectedIntegrations = {
  providers: string[];
};

const mapPlaybookSummary = (raw: any): PlaybookSummary => ({
  id: raw.id ?? raw.Id,
  name: raw.name ?? raw.Name,
  status: raw.status ?? raw.Status,
  category: raw.category ?? raw.Category,
  priority: raw.priority ?? raw.Priority,
  activeRunCount: raw.activeRunCount ?? raw.ActiveRunCount ?? 0,
  totalRunCount: raw.totalRunCount ?? raw.TotalRunCount ?? 0,
  createdAt: raw.createdAt ?? raw.CreatedAt,
  signalType: raw.signalType ?? raw.SignalType ?? null,
});

const normalizeProvider = (
  provider: unknown,
): string | null => {
  if (typeof provider !== 'string') {
    return null;
  }

  const normalized = provider
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');

  if (!normalized) {
    return null;
  }

  if (normalized.includes('hubspot')) {
    return 'hubspot';
  }

  if (normalized.includes('stripe')) {
    return 'stripe';
  }

  if (normalized.includes('posthog')) {
    return 'posthog';
  }

  if (normalized.includes('mailchimp')) {
    return 'mailchimp';
  }

  return normalized;
};

const mapPlaybookDetail = (raw: any): PlaybookDetail => ({
  ...mapPlaybookSummary(raw),
  description: raw.description ?? raw.Description,
  triggerType: raw.triggerType ?? raw.TriggerType,
  triggerConditionsJson: raw.triggerConditionsJson ?? raw.TriggerConditionsJson ?? '{}',
  minConfidence: raw.minConfidence ?? raw.MinConfidence,
  confidenceMode:
    raw.confidenceMode ?? raw.ConfidenceMode,
  cooldownHours: raw.cooldownHours ?? raw.CooldownHours ?? 0,
  maxConcurrentRuns: raw.maxConcurrentRuns ?? raw.MaxConcurrentRuns ?? 1,
  executionMode: raw.executionMode ?? raw.ExecutionMode,
  actions: (raw.actions ?? raw.Actions ?? []).map((action: any) => ({
    actionType: action.actionType ?? action.ActionType,
    orderIndex: action.orderIndex ?? action.OrderIndex ?? 0,
    configJson: action.configJson ?? action.ConfigJson ?? '{}',
  })),
  targetSegments: (raw.targetSegments ?? raw.TargetSegments ?? []).map((segment: any) => ({
    segmentId: segment.segmentId ?? segment.SegmentId,
    name: segment.name ?? segment.Name,
  })),
});

const mapPlaybookRun = (raw: any): PlaybookRun => ({
  id: raw.id ?? raw.Id,
  playbookId: raw.playbookId ?? raw.PlaybookId,
  customerId: raw.customerId ?? raw.CustomerId,
  customerName: raw.customerName ?? raw.CustomerName,
  lifecycleStatus: raw.lifecycleStatus ?? raw.LifecycleStatus,
  outcome: raw.outcome ?? raw.Outcome,
  confidence: raw.confidence ?? raw.Confidence,
  potentialValue: raw.potentialValue ?? raw.PotentialValue,
  reasonShort: raw.reasonShort ?? raw.ReasonShort ?? '',
  decisionSummaryJson: raw.decisionSummaryJson ?? raw.DecisionSummaryJson ?? '{}',
  createdAt: raw.createdAt ?? raw.CreatedAt,
  approvedAt: raw.approvedAt ?? raw.ApprovedAt,
  completedAt: raw.completedAt ?? raw.CompletedAt,
  snoozedUntil: raw.snoozedUntil ?? raw.SnoozedUntil,
});

const mapTriggerExplanation = (raw: any): TriggerExplanation => ({
  playbookName: raw.playbookName ?? raw.PlaybookName,
  customerName: raw.customerName ?? raw.CustomerName,
  verdict: raw.verdict ?? raw.Verdict,
  signalChecks: (raw.signalChecks ?? raw.SignalChecks ?? []).map((check: any) => ({
    signalType: check.signalType ?? check.SignalType,
    isPresent: check.isPresent ?? check.IsPresent,
    conditionsMatched: check.conditionsMatched ?? check.ConditionsMatched,
    details: check.details ?? check.Details,
  })),
  confidenceCheck: {
    required: raw.confidenceCheck?.required ?? raw.ConfidenceCheck?.Required,
    actual: raw.confidenceCheck?.actual ?? raw.ConfidenceCheck?.Actual,
    passed: raw.confidenceCheck?.passed ?? raw.ConfidenceCheck?.Passed,
  },
  suppressionCheck: {
    isSuppressed: raw.suppressionCheck?.isSuppressed ?? raw.SuppressionCheck?.IsSuppressed,
    reason: raw.suppressionCheck?.reason ?? raw.SuppressionCheck?.Reason,
    cooldownEndsAt: raw.suppressionCheck?.cooldownEndsAt ?? raw.SuppressionCheck?.CooldownEndsAt,
    details: raw.suppressionCheck?.details ?? raw.SuppressionCheck?.Details,
  },
  segmentCheck: {
    isMatch: raw.segmentCheck?.isMatch ?? raw.SegmentCheck?.IsMatch,
    matchedSegments: (raw.segmentCheck?.matchedSegments ?? raw.SegmentCheck?.MatchedSegments ?? []).map((segment: any) => ({
      segmentId: segment.segmentId ?? segment.SegmentId,
      name: segment.name ?? segment.Name,
    })),
    missingSegments: (raw.segmentCheck?.missingSegments ?? raw.SegmentCheck?.MissingSegments ?? []).map((segment: any) => ({
      segmentId: segment.segmentId ?? segment.SegmentId,
      name: segment.name ?? segment.Name,
    })),
  },
});

const mapConfidenceDistribution = (raw: any) => ({
  minimal: raw?.minimal ?? raw?.Minimal ?? 0,
  good: raw?.good ?? raw?.Good ?? 0,
  high: raw?.high ?? raw?.High ?? 0,
  excellent: raw?.excellent ?? raw?.Excellent ?? 0,
});

const mapPlaybookConfidenceRecommendation = (raw: any): PlaybookConfidenceRecommendation => ({
  recommendedMinConfidence:
    raw.recommendedMinConfidence ?? raw.RecommendedMinConfidence,
  reasonCodes: raw.reasonCodes ?? raw.ReasonCodes ?? [],
  requiredIntegrations:
    raw.requiredIntegrations ?? raw.RequiredIntegrations ?? [],
  missingCompanyIntegrations:
    raw.missingCompanyIntegrations ??
    raw.MissingCompanyIntegrations ??
    [],
  eligibleCustomersByConfidence: mapConfidenceDistribution(
    raw.eligibleCustomersByConfidence ??
      raw.EligibleCustomersByConfidence,
  ),
});

const mapPlaybookFieldRecommendation = (
  raw: any,
): PlaybookFieldRecommendation => ({
  fieldKey: raw.fieldKey ?? raw.FieldKey ?? '',
  recommendedValue:
    raw.recommendedValue ?? raw.RecommendedValue ?? 'null',
  reasonCode: raw.reasonCode ?? raw.ReasonCode ?? 'unknown',
  humanExplanation:
    raw.humanExplanation ??
    raw.HumanExplanation ??
    'Recommendation generated from deterministic rules.',
  confidence:
    raw.confidence ?? raw.Confidence ?? 0,
});

const mapPlaybookBlueprintRecommendation = (
  raw: any,
): PlaybookBlueprintRecommendation => ({
  identity: {
    category:
      raw.identity?.category ?? raw.Identity?.Category,
    name: raw.identity?.name ?? raw.Identity?.Name ?? '',
    description:
      raw.identity?.description ??
      raw.Identity?.Description ??
      '',
  },
  trigger: {
    signalType:
      raw.trigger?.signalType ??
      raw.Trigger?.SignalType ??
      '',
    conditions: {
      minAmount:
        raw.trigger?.conditions?.minAmount ??
        raw.Trigger?.Conditions?.MinAmount,
      minMrr:
        raw.trigger?.conditions?.minMrr ??
        raw.Trigger?.Conditions?.MinMrr,
      minDaysOverdue:
        raw.trigger?.conditions?.minDaysOverdue ??
        raw.Trigger?.Conditions?.MinDaysOverdue,
      minDaysInactive:
        raw.trigger?.conditions?.minDaysInactive ??
        raw.Trigger?.Conditions?.MinDaysInactive,
    },
    requiredIntegrations:
      raw.trigger?.requiredIntegrations ??
      raw.Trigger?.RequiredIntegrations ??
      [],
  },
  execution: {
    executionMode:
      raw.execution?.executionMode ??
      raw.Execution?.ExecutionMode,
    cooldownHours:
      raw.execution?.cooldownHours ??
      raw.Execution?.CooldownHours ??
      0,
    maxConcurrentRuns:
      raw.execution?.maxConcurrentRuns ??
      raw.Execution?.MaxConcurrentRuns ??
      1,
    priority:
      raw.execution?.priority ??
      raw.Execution?.Priority ??
      100,
  },
  actions: (raw.actions ?? raw.Actions ?? []).map(
    (action: any) => ({
      actionType:
        action.actionType ?? action.ActionType,
      orderIndex:
        action.orderIndex ?? action.OrderIndex ?? 0,
      configJson:
        action.configJson ?? action.ConfigJson ?? '{}',
    }),
  ),
  confidence: mapPlaybookConfidenceRecommendation(
    raw.confidence ?? raw.Confidence ?? {},
  ),
  fieldRecommendations: (
    raw.fieldRecommendations ??
    raw.FieldRecommendations ??
    []
  ).map(mapPlaybookFieldRecommendation),
  explanations:
    raw.explanations ?? raw.Explanations ?? [],
  impact: {
    estimatedEligibleCustomers:
      raw.impact?.estimatedEligibleCustomers ??
      raw.Impact?.EstimatedEligibleCustomers ??
      0,
    estimatedRunsPerDay:
      raw.impact?.estimatedRunsPerDay ??
      raw.Impact?.EstimatedRunsPerDay ??
      0,
    estimatedConfidenceDistribution:
      mapConfidenceDistribution(
        raw.impact?.estimatedConfidenceDistribution ??
          raw.Impact?.EstimatedConfidenceDistribution,
      ),
  },
  warnings: raw.warnings ?? raw.Warnings ?? [],
});

const mapConflictEntry = (raw: any): ConflictLogEntry => ({
  id: raw.id ?? raw.Id,
  suppressedPlaybookName: raw.suppressedPlaybookName ?? raw.SuppressedPlaybookName,
  winningPlaybookName: raw.winningPlaybookName ?? raw.WinningPlaybookName,
  customerName: raw.customerName ?? raw.CustomerName,
  reason: raw.reason ?? raw.Reason,
  createdAt: raw.createdAt ?? raw.CreatedAt,
});

const mapPagedResult = <T,>(raw: any, mapper: (item: any) => T): PagedResult<T> => ({
  items: (raw.items ?? raw.Items ?? []).map(mapper),
  totalCount: raw.totalCount ?? raw.TotalCount ?? 0,
  page: raw.page ?? raw.Page ?? 1,
  pageSize: raw.pageSize ?? raw.PageSize ?? 0,
  totalPages: raw.totalPages ?? raw.TotalPages ?? 0,
  hasNextPage: raw.hasNextPage ?? raw.HasNextPage ?? false,
  hasPreviousPage: raw.hasPreviousPage ?? raw.HasPreviousPage ?? false,
});

const mapWorkQueueItem = (raw: any): WorkQueueItem => ({
  runId: raw.runId ?? raw.RunId,
  customerId: raw.customerId ?? raw.CustomerId,
  customerName: raw.customerName ?? raw.CustomerName,
  customerEmail: raw.customerEmail ?? raw.CustomerEmail,
  playbookName: raw.playbookName ?? raw.PlaybookName,
  reason: raw.reason ?? raw.Reason,
  confidence: raw.confidence ?? raw.Confidence,
  potentialValue: raw.potentialValue ?? raw.PotentialValue,
  createdAt: raw.createdAt ?? raw.CreatedAt,
  snoozedUntil: raw.snoozedUntil ?? raw.SnoozedUntil,
});

const mapWorkQueueResponse = (raw: any): WorkQueueResponse => ({
  summary: {
    pendingApprovals: raw.summary?.pendingApprovals ?? raw.Summary?.PendingApprovals ?? 0,
    highValueCount: raw.summary?.highValueCount ?? raw.Summary?.HighValueCount ?? 0,
    staleCount: raw.summary?.staleCount ?? raw.Summary?.StaleCount ?? 0,
    totalValueAtRisk: raw.summary?.totalValueAtRisk ?? raw.Summary?.TotalValueAtRisk ?? 0,
    oldestPendingAge: raw.summary?.oldestPendingAge ?? raw.Summary?.OldestPendingAge ?? null,
  },
  items: (raw.items ?? raw.Items ?? []).map(mapWorkQueueItem),
});

export const getPlaybooks = async (params?: PlaybookListParams): Promise<PlaybookSummary[]> => {
  const response = await api.get('/playbooks', { params });
  return ((response as unknown as any[]) ?? []).map(mapPlaybookSummary);
};

export const getPlaybookConnectedIntegrations = async (): Promise<PlaybookConnectedIntegrations> => {
  const response = await api.get('/integrations');
  const rawItems = Array.isArray(response)
    ? response
    : [];

  const providers = rawItems
    .filter((item) => {
      const status = String(
        item?.status ?? item?.Status ?? '',
      ).toLowerCase();

      const isExpired = Boolean(
        item?.isTokenExpired ??
          item?.IsTokenExpired ??
          false,
      );

      return status === 'connected' && !isExpired;
    })
    .map((item) =>
      normalizeProvider(item?.type ?? item?.Type),
    )
    .filter(
      (provider): provider is string =>
        provider !== null,
    );

  return {
    providers: Array.from(new Set(providers)).sort(),
  };
};

export const getPlaybooksQueryOptions = (params?: PlaybookListParams) => ({
  queryKey: ['playbooks', params],
  queryFn: () => getPlaybooks(params),
});

export const useGetPlaybooks = (
  params?: PlaybookListParams,
  queryConfig?: QueryConfig<typeof getPlaybooksQueryOptions>,
) => {
  return useQuery({
    ...getPlaybooksQueryOptions(params),
    ...queryConfig,
  });
};

export const getPlaybookConnectedIntegrationsQueryOptions =
  () => ({
    queryKey: ['playbooks', 'connected-integrations'],
    queryFn: getPlaybookConnectedIntegrations,
  });

export const useGetPlaybookConnectedIntegrations = (
  queryConfig?: QueryConfig<
    typeof getPlaybookConnectedIntegrationsQueryOptions
  >,
) => {
  return useQuery({
    ...getPlaybookConnectedIntegrationsQueryOptions(),
    ...queryConfig,
  });
};

export const duplicatePlaybook = async (playbookId: string): Promise<PlaybookDetail> => {
  const response = await api.post(`/playbooks/${playbookId}/duplicate`);
  return mapPlaybookDetail(response);
};

export const useDuplicatePlaybook = (mutationConfig?: MutationConfig<typeof duplicatePlaybook>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: duplicatePlaybook,
    onSuccess: (_data, playbookId) => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      queryClient.invalidateQueries({ queryKey: ['playbooks', playbookId] });
    },
    ...mutationConfig,
  });
};

export const getPlaybook = async (playbookId: string): Promise<PlaybookDetail> => {
  const response = await api.get(`/playbooks/${playbookId}`);
  return mapPlaybookDetail(response);
};

export const getPlaybookQueryOptions = (playbookId?: string) => ({
  queryKey: ['playbooks', playbookId],
  queryFn: () => getPlaybook(playbookId || ''),
  enabled: !!playbookId,
});

export const useGetPlaybook = (
  playbookId?: string,
  queryConfig?: QueryConfig<typeof getPlaybookQueryOptions>,
) => {
  return useQuery({
    ...getPlaybookQueryOptions(playbookId),
    ...queryConfig,
  });
};

export const createPlaybook = async (payload: PlaybookInput): Promise<PlaybookDetail> => {
  const response = await api.post('/playbooks', payload);
  return mapPlaybookDetail(response);
};

export const useCreatePlaybook = (mutationConfig?: MutationConfig<typeof createPlaybook>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlaybook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
    },
    ...mutationConfig,
  });
};

export const updatePlaybook = async ({
  playbookId,
  payload,
}: {
  playbookId: string;
  payload: PlaybookInput;
}): Promise<PlaybookDetail> => {
  const response = await api.put(`/playbooks/${playbookId}`, payload);
  return mapPlaybookDetail(response);
};

export const useUpdatePlaybook = (mutationConfig?: MutationConfig<typeof updatePlaybook>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePlaybook,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      queryClient.invalidateQueries({ queryKey: ['playbooks', variables.playbookId] });
    },
    ...mutationConfig,
  });
};

export const deletePlaybook = async (playbookId: string): Promise<void> => {
  await api.delete(`/playbooks/${playbookId}`);
};

export const useDeletePlaybook = (mutationConfig?: MutationConfig<typeof deletePlaybook>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePlaybook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
    },
    ...mutationConfig,
  });
};

export const activatePlaybook = async (playbookId: string): Promise<PlaybookDetail> => {
  const response = await api.post(`/playbooks/${playbookId}/activate`);
  return mapPlaybookDetail(response);
};

export const useActivatePlaybook = (mutationConfig?: MutationConfig<typeof activatePlaybook>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activatePlaybook,
    onSuccess: (_data, playbookId) => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      queryClient.invalidateQueries({ queryKey: ['playbooks', playbookId] });
    },
    ...mutationConfig,
  });
};

export const pausePlaybook = async (playbookId: string): Promise<PlaybookDetail> => {
  const response = await api.post(`/playbooks/${playbookId}/pause`);
  return mapPlaybookDetail(response);
};

export const usePausePlaybook = (mutationConfig?: MutationConfig<typeof pausePlaybook>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pausePlaybook,
    onSuccess: (_data, playbookId) => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      queryClient.invalidateQueries({ queryKey: ['playbooks', playbookId] });
    },
    ...mutationConfig,
  });
};

export const unarchivePlaybook = async (playbookId: string): Promise<PlaybookDetail> => {
  const response = await api.post(`/playbooks/${playbookId}/unarchive`);
  return mapPlaybookDetail(response);
};

export const useUnarchivePlaybook = (mutationConfig?: MutationConfig<typeof unarchivePlaybook>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unarchivePlaybook,
    onSuccess: (_data, playbookId) => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      queryClient.invalidateQueries({ queryKey: ['playbooks', playbookId] });
    },
    ...mutationConfig,
  });
};

export const getPlaybookRuns = async (playbookId: string): Promise<PlaybookRun[]> => {
  const response = await api.get(`/playbooks/${playbookId}/runs`);
  return ((response as unknown as any[]) ?? []).map(mapPlaybookRun);
};

export const getPlaybookRunsQueryOptions = (playbookId?: string) => ({
  queryKey: ['playbooks', playbookId, 'runs'],
  queryFn: () => getPlaybookRuns(playbookId || ''),
  enabled: !!playbookId,
});

export const useGetPlaybookRuns = (
  playbookId?: string,
  queryConfig?: QueryConfig<typeof getPlaybookRunsQueryOptions>,
) => {
  return useQuery({
    ...getPlaybookRunsQueryOptions(playbookId),
    ...queryConfig,
  });
};

export const getWhyDidntTrigger = async (playbookId: string, customerId: string): Promise<TriggerExplanation> => {
  const response = await api.get(`/playbooks/${playbookId}/debug/${customerId}`);
  return mapTriggerExplanation(response);
};

export const recommendPlaybookConfidence = async (
  payload: RecommendPlaybookConfidenceInput,
): Promise<PlaybookConfidenceRecommendation> => {
  const response = await api.post(
    '/playbooks/recommend-confidence',
    {
      signalType: payload.signalType ?? null,
      actionTypes: payload.actionTypes ?? [],
      executionMode: payload.executionMode ?? null,
      hasTargetSegments: payload.hasTargetSegments ?? false,
    },
  );

  return mapPlaybookConfidenceRecommendation(response);
};

export const getRecommendPlaybookConfidenceQueryOptions = (
  payload: RecommendPlaybookConfidenceInput,
) => ({
  queryKey: ['playbooks', 'recommend-confidence', payload],
  queryFn: () => recommendPlaybookConfidence(payload),
});

export const useRecommendPlaybookConfidence = (
  payload: RecommendPlaybookConfidenceInput,
  queryConfig?: QueryConfig<
    typeof getRecommendPlaybookConfidenceQueryOptions
  >,
) => {
  return useQuery({
    ...getRecommendPlaybookConfidenceQueryOptions(payload),
    ...queryConfig,
  });
};

export const recommendPlaybookBlueprint = async (
  payload: RecommendPlaybookBlueprintRequest,
): Promise<PlaybookBlueprintRecommendation> => {
  const response = await api.post(
    '/playbooks/recommend-blueprint',
    {
      goal: payload.goal ?? null,
      hints: payload.hints ?? null,
      currentDraft: payload.currentDraft ?? null,
    },
  );

  return mapPlaybookBlueprintRecommendation(response);
};

export const getRecommendPlaybookBlueprintQueryOptions = (
  payload: RecommendPlaybookBlueprintRequest,
) => ({
  queryKey: ['playbooks', 'recommend-blueprint', payload],
  queryFn: () => recommendPlaybookBlueprint(payload),
});

export const useRecommendPlaybookBlueprint = (
  payload: RecommendPlaybookBlueprintRequest,
  queryConfig?: QueryConfig<
    typeof getRecommendPlaybookBlueprintQueryOptions
  >,
) => {
  return useQuery({
    ...getRecommendPlaybookBlueprintQueryOptions(payload),
    ...queryConfig,
  });
};

export const useRecommendPlaybookBlueprintMutation = (
  mutationConfig?: MutationConfig<
    typeof recommendPlaybookBlueprint
  >,
) => {
  return useMutation({
    mutationFn: recommendPlaybookBlueprint,
    ...mutationConfig,
  });
};

export const trackPlaybookRecommendationOverride = async (
  payload: TrackPlaybookRecommendationOverrideRequest,
): Promise<void> => {
  await api.post('/playbooks/recommendation-overrides', {
    fieldKey: payload.fieldKey,
    recommendedValue:
      payload.recommendedValue ?? null,
    selectedValue: payload.selectedValue ?? null,
    goal: payload.goal ?? null,
    sessionId: payload.sessionId ?? null,
  });
};

export const useTrackPlaybookRecommendationOverride = (
  mutationConfig?: MutationConfig<
    typeof trackPlaybookRecommendationOverride
  >,
) => {
  return useMutation({
    mutationFn: trackPlaybookRecommendationOverride,
    ...mutationConfig,
  });
};

export const getPlaybookConflicts = async (
  playbookId: string,
  page = 1,
  pageSize = 25,
): Promise<PagedResult<ConflictLogEntry>> => {
  const response = await api.get(`/playbooks/${playbookId}/conflicts`, { params: { page, pageSize } });
  return mapPagedResult(response, mapConflictEntry);
};

export const getWorkQueue = async (): Promise<WorkQueueResponse> => {
  const response = await api.get('/work-queue');
  return mapWorkQueueResponse(response);
};

export const getWorkQueueQueryOptions = () => ({
  queryKey: ['work-queue'],
  queryFn: getWorkQueue,
});

export const useGetWorkQueue = (queryConfig?: QueryConfig<typeof getWorkQueueQueryOptions>) => {
  return useQuery({
    ...getWorkQueueQueryOptions(),
    ...queryConfig,
  });
};

export const getPendingApprovals = async (
  page = 1,
  pageSize = 25,
): Promise<PagedResult<WorkQueueItem>> => {
  const response = await api.get('/work-queue/pending', { params: { page, pageSize } });
  return mapPagedResult(response, mapWorkQueueItem);
};

export const getPendingApprovalsQueryOptions = (page = 1, pageSize = 25) => ({
  queryKey: ['work-queue', 'pending', page, pageSize],
  queryFn: () => getPendingApprovals(page, pageSize),
});

export const useGetPendingApprovals = (
  page = 1,
  pageSize = 25,
  queryConfig?: QueryConfig<typeof getPendingApprovalsQueryOptions>,
) => {
  return useQuery({
    ...getPendingApprovalsQueryOptions(page, pageSize),
    ...queryConfig,
  });
};

export const getWorkQueueRun = async (runId: string): Promise<PlaybookRun> => {
  const response = await api.get(`/work-queue/runs/${runId}`);
  return mapPlaybookRun(response);
};

export const getWorkQueueRunQueryOptions = (runId?: string) => ({
  queryKey: ['work-queue', 'runs', runId],
  queryFn: () => getWorkQueueRun(runId || ''),
  enabled: !!runId,
});

export const useGetWorkQueueRun = (
  runId?: string,
  queryConfig?: QueryConfig<typeof getWorkQueueRunQueryOptions>,
) => {
  return useQuery({
    ...getWorkQueueRunQueryOptions(runId),
    ...queryConfig,
  });
};

export const approveWorkQueueRun = async (runId: string): Promise<PlaybookRun> => {
  const response = await api.post(`/work-queue/runs/${runId}/approve`);
  return mapPlaybookRun(response);
};

export const dismissWorkQueueRun = async (runId: string, dismissalNotes?: string): Promise<void> => {
  await api.post(`/work-queue/runs/${runId}/dismiss`, { dismissalNotes });
};

type DismissWorkQueueRunInput = {
  runId: string;
  dismissalNotes?: string;
};

const dismissWorkQueueRunInput = async ({
  runId,
  dismissalNotes,
}: DismissWorkQueueRunInput): Promise<void> => dismissWorkQueueRun(runId, dismissalNotes);

export const snoozeWorkQueueRun = async (runId: string, snoozeHours: number): Promise<PlaybookRun> => {
  const response = await api.post(`/work-queue/runs/${runId}/snooze`, { snoozeHours });
  return mapPlaybookRun(response);
};

type SnoozeWorkQueueRunInput = {
  runId: string;
  snoozeHours: number;
};

const snoozeWorkQueueRunInput = async ({
  runId,
  snoozeHours,
}: SnoozeWorkQueueRunInput): Promise<PlaybookRun> => snoozeWorkQueueRun(runId, snoozeHours);

export const useApproveWorkQueueRun = (mutationConfig?: MutationConfig<typeof approveWorkQueueRun>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveWorkQueueRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-queue'] });
    },
    ...mutationConfig,
  });
};

export const useDismissWorkQueueRun = (
  mutationConfig?: MutationConfig<typeof dismissWorkQueueRunInput>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dismissWorkQueueRunInput,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-queue'] });
    },
    ...mutationConfig,
  });
};

export const useSnoozeWorkQueueRun = (
  mutationConfig?: MutationConfig<typeof snoozeWorkQueueRunInput>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: snoozeWorkQueueRunInput,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-queue'] });
    },
    ...mutationConfig,
  });
};

export const getWorkQueueConflicts = async (page = 1, pageSize = 25): Promise<PagedResult<ConflictLogEntry>> => {
  const response = await api.get('/work-queue/conflicts', { params: { page, pageSize } });
  return mapPagedResult(response, mapConflictEntry);
};
