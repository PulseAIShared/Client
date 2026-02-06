import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig, QueryConfig } from '@/lib/react-query';
import {
  ConflictLogEntry,
  PagedResult,
  PlaybookDetail,
  PlaybookRun,
  PlaybookSummary,
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

export type PlaybookInput = {
  name: string;
  description?: string | null;
  category: number;
  triggerType: number;
  triggerConditionsJson: string;
  minConfidence: number;
  cooldownHours: number;
  maxConcurrentRuns: number;
  executionMode: number;
  priority: number;
  targetSegmentIds: string[];
  actions: PlaybookActionInput[];
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

const mapPlaybookDetail = (raw: any): PlaybookDetail => ({
  ...mapPlaybookSummary(raw),
  description: raw.description ?? raw.Description,
  triggerType: raw.triggerType ?? raw.TriggerType,
  triggerConditionsJson: raw.triggerConditionsJson ?? raw.TriggerConditionsJson ?? '{}',
  minConfidence: raw.minConfidence ?? raw.MinConfidence,
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
