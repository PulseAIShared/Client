import { QueryKey, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig, QueryConfig } from '@/lib/react-query';
import {
  FailedActionsResponse,
  PlaybookRunActionsResponse,
  RecentlyActedResponse,
  WorkQueueBulkActionRequest,
  WorkQueueBulkActionResponse,
  WorkQueueItem,
  WorkQueueResponse,
} from '@/types/playbooks';
import { buildSummaryFromItems } from '@/features/work-queue/utils';

export type WorkQueueQueryParams = {
  search?: string;
  playbookId?: string;
  priority?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export type RecentlyActedQueryParams = {
  windowHours?: number;
  search?: string;
  playbookId?: string;
  outcome?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export type FailedActionsQueryParams = {
  search?: string;
  playbookId?: string;
  includeDismissed?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export const workQueueBaseQueryKey = ['work-queue'] as const;
export const workQueuePendingQueryKey = [...workQueueBaseQueryKey, 'pending'] as const;
export const workQueueRecentlyActedQueryKey = [...workQueueBaseQueryKey, 'recently-acted'] as const;
export const workQueueFailedQueryKey = [...workQueueBaseQueryKey, 'failed'] as const;

const mapWorkQueueItem = (raw: any): WorkQueueItem => ({
  runId: raw.runId ?? raw.RunId,
  customerId: raw.customerId ?? raw.CustomerId,
  playbookId: raw.playbookId ?? raw.PlaybookId,
  customerName: raw.customerName ?? raw.CustomerName,
  customerEmail: raw.customerEmail ?? raw.CustomerEmail,
  playbookName: raw.playbookName ?? raw.PlaybookName,
  reason: raw.reason ?? raw.Reason,
  priority: raw.priority ?? raw.Priority,
  confidence: raw.confidence ?? raw.Confidence,
  potentialValue: raw.potentialValue ?? raw.PotentialValue,
  currencyCode: raw.currencyCode ?? raw.CurrencyCode,
  createdAt: raw.createdAt ?? raw.CreatedAt,
  snoozedUntil: raw.snoozedUntil ?? raw.SnoozedUntil,
  customerMonthlyRecurringRevenue:
    raw.customerMonthlyRecurringRevenue ?? raw.CustomerMonthlyRecurringRevenue,
  customerPlanTier: raw.customerPlanTier ?? raw.CustomerPlanTier,
  lastPaymentAt: raw.lastPaymentAt ?? raw.LastPaymentAt,
  failedPaymentsLast30d: raw.failedPaymentsLast30d ?? raw.FailedPaymentsLast30d,
  successfulPaymentsLast30d:
    raw.successfulPaymentsLast30d ?? raw.SuccessfulPaymentsLast30d,
  churnRiskScore: raw.churnRiskScore ?? raw.ChurnRiskScore,
  lastActiveAt: raw.lastActiveAt ?? raw.LastActiveAt,
  engagementScore: raw.engagementScore ?? raw.EngagementScore,
  engagementTrend: raw.engagementTrend ?? raw.EngagementTrend,
  customerSince: raw.customerSince ?? raw.CustomerSince,
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

const mapBulkActionResponse = (raw: any): WorkQueueBulkActionResponse => ({
  succeeded: (raw.succeeded ?? raw.Succeeded ?? []).map((id: string) => id),
  failed: (raw.failed ?? raw.Failed ?? []).map((entry: any) => ({
    id: entry.id ?? entry.Id,
    reason: entry.reason ?? entry.Reason,
  })),
});

const mapRecentlyActedResponse = (raw: any): RecentlyActedResponse => ({
  summary: {
    approvedToday: raw.summary?.approvedToday ?? raw.Summary?.ApprovedToday ?? 0,
    dismissedToday: raw.summary?.dismissedToday ?? raw.Summary?.DismissedToday ?? 0,
    snoozedToday: raw.summary?.snoozedToday ?? raw.Summary?.SnoozedToday ?? 0,
    successRatePercent: raw.summary?.successRatePercent ?? raw.Summary?.SuccessRatePercent ?? 0,
  },
  items: (raw.items ?? raw.Items ?? []).map((item: any) => ({
    runId: item.runId ?? item.RunId,
    customerId: item.customerId ?? item.CustomerId,
    playbookId: item.playbookId ?? item.PlaybookId,
    customerName: item.customerName ?? item.CustomerName,
    customerEmail: item.customerEmail ?? item.CustomerEmail,
    playbookName: item.playbookName ?? item.PlaybookName,
    reason: item.reason ?? item.Reason,
    potentialValue: item.potentialValue ?? item.PotentialValue,
    currencyCode: item.currencyCode ?? item.CurrencyCode ?? 'USD',
    decision: item.decision ?? item.Decision,
    actedByUserId: item.actedByUserId ?? item.ActedByUserId,
    actedByName: item.actedByName ?? item.ActedByName ?? 'Unknown',
    actedAt: item.actedAt ?? item.ActedAt,
    outcomeStatus: item.outcomeStatus ?? item.OutcomeStatus,
  })),
});

const mapFailedActionsResponse = (raw: any): FailedActionsResponse => ({
  summary: {
    totalFailures: raw.summary?.totalFailures ?? raw.Summary?.TotalFailures ?? 0,
    oldestFailureAge: raw.summary?.oldestFailureAge ?? raw.Summary?.OldestFailureAge ?? null,
    totalFailedValue: raw.summary?.totalFailedValue ?? raw.Summary?.TotalFailedValue ?? 0,
  },
  items: (raw.items ?? raw.Items ?? []).map((item: any) => ({
    runId: item.runId ?? item.RunId,
    customerId: item.customerId ?? item.CustomerId,
    playbookId: item.playbookId ?? item.PlaybookId,
    customerName: item.customerName ?? item.CustomerName,
    customerEmail: item.customerEmail ?? item.CustomerEmail,
    playbookName: item.playbookName ?? item.PlaybookName,
    reason: item.reason ?? item.Reason,
    potentialValue: item.potentialValue ?? item.PotentialValue,
    currencyCode: item.currencyCode ?? item.CurrencyCode ?? 'USD',
    failedActionId: item.failedActionId ?? item.FailedActionId,
    failedActionType: item.failedActionType ?? item.FailedActionType,
    errorDetails: item.errorDetails ?? item.ErrorDetails,
    failedAt: item.failedAt ?? item.FailedAt,
    outcomeStatus: item.outcomeStatus ?? item.OutcomeStatus,
    dismissalReason: item.dismissalReason ?? item.DismissalReason ?? null,
  })),
});

const mapRunActionsResponse = (raw: any): PlaybookRunActionsResponse => ({
  runId: raw.runId ?? raw.RunId,
  actions: (raw.actions ?? raw.Actions ?? []).map((action: any) => ({
    actionId: action.actionId ?? action.ActionId,
    actionType: action.actionType ?? action.ActionType,
    status: action.status ?? action.Status,
    attemptCount: action.attemptCount ?? action.AttemptCount ?? 0,
    timestamp: action.timestamp ?? action.Timestamp,
    errorCode: action.errorCode ?? action.ErrorCode,
    errorMessage: action.errorMessage ?? action.ErrorMessage,
    detailsJson: action.detailsJson ?? action.DetailsJson,
  })),
});

export const getWorkQueue = async (
  params?: WorkQueueQueryParams,
): Promise<WorkQueueResponse> => {
  const response = await api.get('/work-queue', { params });
  return mapWorkQueueResponse(response);
};

export const getRecentlyActed = async (
  params?: RecentlyActedQueryParams,
): Promise<RecentlyActedResponse> => {
  const response = await api.get('/work-queue/recently-acted', { params });
  return mapRecentlyActedResponse(response);
};

export const getFailedActions = async (
  params?: FailedActionsQueryParams,
): Promise<FailedActionsResponse> => {
  const response = await api.get('/work-queue/failed', { params });
  return mapFailedActionsResponse(response);
};

export const getPlaybookRunActions = async (
  runId: string,
): Promise<PlaybookRunActionsResponse> => {
  const response = await api.get(`/work-queue/runs/${runId}/actions`);
  return mapRunActionsResponse(response);
};

export const getWorkQueueQueryOptions = (params?: WorkQueueQueryParams) => ({
  queryKey: [...workQueuePendingQueryKey, params] as const,
  queryFn: () => getWorkQueue(params),
});

export const getRecentlyActedQueryOptions = (params?: RecentlyActedQueryParams) => ({
  queryKey: [...workQueueRecentlyActedQueryKey, params] as const,
  queryFn: () => getRecentlyActed(params),
});

export const getFailedActionsQueryOptions = (params?: FailedActionsQueryParams) => ({
  queryKey: [...workQueueFailedQueryKey, params] as const,
  queryFn: () => getFailedActions(params),
});

export const getPlaybookRunActionsQueryOptions = (runId: string) => ({
  queryKey: [...workQueueBaseQueryKey, 'run-actions', runId] as const,
  queryFn: () => getPlaybookRunActions(runId),
  enabled: Boolean(runId),
});

export const useGetWorkQueue = (
  params?: WorkQueueQueryParams,
  queryConfig?: QueryConfig<typeof getWorkQueueQueryOptions>,
) => {
  return useQuery({
    ...getWorkQueueQueryOptions(params),
    ...queryConfig,
  });
};

export const useGetRecentlyActed = (
  params?: RecentlyActedQueryParams,
  queryConfig?: QueryConfig<typeof getRecentlyActedQueryOptions>,
) => {
  return useQuery({
    ...getRecentlyActedQueryOptions(params),
    ...queryConfig,
  });
};

export const useGetFailedActions = (
  params?: FailedActionsQueryParams,
  queryConfig?: QueryConfig<typeof getFailedActionsQueryOptions>,
) => {
  return useQuery({
    ...getFailedActionsQueryOptions(params),
    ...queryConfig,
  });
};

export const useGetPlaybookRunActions = (
  runId: string,
  queryConfig?: QueryConfig<typeof getPlaybookRunActionsQueryOptions>,
) => {
  return useQuery({
    ...getPlaybookRunActionsQueryOptions(runId),
    ...queryConfig,
  });
};

type ApproveWorkQueueRunInput = {
  runId: string;
};

type DismissWorkQueueRunInput = {
  runId: string;
  dismissalNotes?: string;
};

type SnoozeWorkQueueRunInput = {
  runId: string;
  snoozeHours: number;
};

type RetryFailedActionInput = {
  runId: string;
  actionId: string;
};

type RetryAllFailedActionsInput = {
  runId: string;
};

type EscalateWorkQueueItemInput = {
  runId: string;
  reason?: string;
};

type UndoWorkQueueActionInput = {
  runId: string;
};

type DismissFailedActionInput = {
  runId: string;
  dismissalNotes?: string;
};

type UndismissFailedActionInput = {
  runId: string;
  reason?: string;
};

type OptimisticCacheState = {
  snapshots: Array<[QueryKey, WorkQueueResponse | undefined]>;
};

type FailedOptimisticCacheState = {
  snapshots: Array<[QueryKey, FailedActionsResponse | undefined]>;
};

type QueueMutationConfig<TMutationFn extends (...args: any[]) => Promise<any>> = Omit<
  MutationConfig<TMutationFn>,
  'onMutate' | 'onError' | 'onSettled'
>;

const removeItemsOptimistically = async (
  queryClient: ReturnType<typeof useQueryClient>,
  runIds: string[],
): Promise<OptimisticCacheState> => {
  await queryClient.cancelQueries({ queryKey: workQueuePendingQueryKey });

  const snapshots = queryClient.getQueriesData<WorkQueueResponse>({
    queryKey: workQueuePendingQueryKey,
  });

  snapshots.forEach(([queryKey, previous]) => {
    if (!previous) {
      return;
    }

    const nextItems = previous.items.filter((item) => !runIds.includes(item.runId));
    queryClient.setQueryData<WorkQueueResponse>(queryKey, {
      summary: buildSummaryFromItems(nextItems),
      items: nextItems,
    });
  });

  return { snapshots };
};

const restoreOptimisticState = (
  queryClient: ReturnType<typeof useQueryClient>,
  state?: OptimisticCacheState,
) => {
  if (!state) {
    return;
  }

  state.snapshots.forEach(([queryKey, previous]) => {
    queryClient.setQueryData(queryKey, previous);
  });
};

const restoreFailedOptimisticState = (
  queryClient: ReturnType<typeof useQueryClient>,
  state?: FailedOptimisticCacheState,
) => {
  if (!state) {
    return;
  }

  state.snapshots.forEach(([queryKey, previous]) => {
    queryClient.setQueryData(queryKey, previous);
  });
};

const setFailedItemsOutcomeOptimistically = async (
  queryClient: ReturnType<typeof useQueryClient>,
  runIds: string[],
  outcomeStatus: 'Dismissed' | 'Failed',
  dismissalReason?: string,
): Promise<FailedOptimisticCacheState> => {
  await queryClient.cancelQueries({ queryKey: workQueueFailedQueryKey });

  const snapshots = queryClient.getQueriesData<FailedActionsResponse>({
    queryKey: workQueueFailedQueryKey,
  });

  snapshots.forEach(([queryKey, previous]) => {
    if (!previous) {
      return;
    }

    const nextItems = previous.items.map((item) => {
      if (!runIds.includes(item.runId)) {
        return item;
      }

      if (outcomeStatus === 'Dismissed') {
        return {
          ...item,
          outcomeStatus: 'Dismissed' as const,
          dismissalReason: dismissalReason?.trim() || item.dismissalReason || 'No reason provided.',
        };
      }

      return {
        ...item,
        outcomeStatus: 'Failed' as const,
        dismissalReason: null,
      };
    });

    const activeFailedItems = nextItems.filter((item) => item.outcomeStatus !== 'Dismissed');
    queryClient.setQueryData<FailedActionsResponse>(queryKey, {
      summary: {
        ...previous.summary,
        totalFailures: activeFailedItems.length,
        totalFailedValue: activeFailedItems.reduce((sum, item) => sum + (item.potentialValue ?? 0), 0),
      },
      items: nextItems,
    });
  });

  return { snapshots };
};

const invalidateQueueQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: workQueueBaseQueryKey });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['notifications'] });
  queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
};

export const approveWorkQueueRun = async ({
  runId,
}: ApproveWorkQueueRunInput): Promise<void> => {
  await api.post(`/work-queue/runs/${runId}/approve`);
};

export const dismissWorkQueueRun = async ({
  runId,
  dismissalNotes,
}: DismissWorkQueueRunInput): Promise<void> => {
  await api.post(`/work-queue/runs/${runId}/dismiss`, { dismissalNotes });
};

export const snoozeWorkQueueRun = async ({
  runId,
  snoozeHours,
}: SnoozeWorkQueueRunInput): Promise<void> => {
  await api.post(`/work-queue/runs/${runId}/snooze`, {
    snoozeHours,
    snoozeDurationHours: snoozeHours,
  });
};

export const bulkWorkQueueAction = async (
  request: WorkQueueBulkActionRequest,
): Promise<WorkQueueBulkActionResponse> => {
  const response = await api.post('/work-queue/bulk-action', request);
  return mapBulkActionResponse(response);
};

export const retryFailedAction = async ({ runId, actionId }: RetryFailedActionInput): Promise<void> => {
  await api.post(`/work-queue/runs/${runId}/actions/${actionId}/retry`);
};

export const retryAllFailedActions = async ({ runId }: RetryAllFailedActionsInput): Promise<void> => {
  await api.post(`/work-queue/runs/${runId}/retry-all`);
};

export const escalateWorkQueueItem = async ({ runId, reason }: EscalateWorkQueueItemInput): Promise<void> => {
  await api.post(`/work-queue/runs/${runId}/escalate`, { reason });
};

export const undoWorkQueueAction = async ({ runId }: UndoWorkQueueActionInput): Promise<void> => {
  await api.post(`/work-queue/${runId}/undo`);
};

export const dismissFailedAction = async ({
  runId,
  dismissalNotes,
}: DismissFailedActionInput): Promise<void> => {
  await api.post(`/work-queue/runs/${runId}/failed-dismiss`, { dismissalNotes });
};

export const undismissFailedAction = async ({
  runId,
  reason,
}: UndismissFailedActionInput): Promise<void> => {
  await api.post(`/work-queue/runs/${runId}/failed-undismiss`, { dismissalNotes: reason });
};

export const useApproveWorkQueueRun = (
  mutationConfig?: QueueMutationConfig<typeof approveWorkQueueRun>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveWorkQueueRun,
    onMutate: async (variables): Promise<OptimisticCacheState> =>
      removeItemsOptimistically(queryClient, [variables.runId]),
    onError: (_error, _variables, context) => {
      restoreOptimisticState(queryClient, context as OptimisticCacheState | undefined);
    },
    onSettled: () => {
      invalidateQueueQueries(queryClient);
    },
    ...mutationConfig,
  });
};

export const useDismissWorkQueueRun = (
  mutationConfig?: QueueMutationConfig<typeof dismissWorkQueueRun>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dismissWorkQueueRun,
    onMutate: async (variables): Promise<OptimisticCacheState> =>
      removeItemsOptimistically(queryClient, [variables.runId]),
    onError: (_error, _variables, context) => {
      restoreOptimisticState(queryClient, context as OptimisticCacheState | undefined);
    },
    onSettled: () => {
      invalidateQueueQueries(queryClient);
    },
    ...mutationConfig,
  });
};

export const useSnoozeWorkQueueRun = (
  mutationConfig?: QueueMutationConfig<typeof snoozeWorkQueueRun>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: snoozeWorkQueueRun,
    onMutate: async (variables): Promise<OptimisticCacheState> =>
      removeItemsOptimistically(queryClient, [variables.runId]),
    onError: (_error, _variables, context) => {
      restoreOptimisticState(queryClient, context as OptimisticCacheState | undefined);
    },
    onSettled: () => {
      invalidateQueueQueries(queryClient);
    },
    ...mutationConfig,
  });
};

export const useBulkWorkQueueAction = (
  mutationConfig?: QueueMutationConfig<typeof bulkWorkQueueAction>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkWorkQueueAction,
    onMutate: async (variables): Promise<OptimisticCacheState> =>
      removeItemsOptimistically(queryClient, variables.itemIds),
    onError: (_error, _variables, context) => {
      restoreOptimisticState(queryClient, context as OptimisticCacheState | undefined);
    },
    onSettled: () => {
      invalidateQueueQueries(queryClient);
    },
    ...mutationConfig,
  });
};

export const useRetryFailedAction = (
  mutationConfig?: MutationConfig<typeof retryFailedAction>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryFailedAction,
    onSuccess: () => {
      invalidateQueueQueries(queryClient);
    },
    ...mutationConfig,
  });
};

export const useRetryAllFailedActions = (
  mutationConfig?: MutationConfig<typeof retryAllFailedActions>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryAllFailedActions,
    onSuccess: () => {
      invalidateQueueQueries(queryClient);
    },
    ...mutationConfig,
  });
};

export const useEscalateWorkQueueItem = (
  mutationConfig?: MutationConfig<typeof escalateWorkQueueItem>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: escalateWorkQueueItem,
    onSuccess: () => {
      invalidateQueueQueries(queryClient);
    },
    ...mutationConfig,
  });
};

export const useUndoWorkQueueAction = (
  mutationConfig?: MutationConfig<typeof undoWorkQueueAction>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: undoWorkQueueAction,
    onSuccess: () => {
      invalidateQueueQueries(queryClient);
    },
    ...mutationConfig,
  });
};

export const useDismissFailedAction = (
  mutationConfig?: QueueMutationConfig<typeof dismissFailedAction>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dismissFailedAction,
    onMutate: async (variables): Promise<FailedOptimisticCacheState> =>
      setFailedItemsOutcomeOptimistically(
        queryClient,
        [variables.runId],
        'Dismissed',
        variables.dismissalNotes,
      ),
    onError: (_error, _variables, context) => {
      restoreFailedOptimisticState(queryClient, context as FailedOptimisticCacheState | undefined);
    },
    onSettled: () => {
      invalidateQueueQueries(queryClient);
    },
    ...mutationConfig,
  });
};

export const useUndismissFailedAction = (
  mutationConfig?: QueueMutationConfig<typeof undismissFailedAction>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: undismissFailedAction,
    onMutate: async (variables): Promise<FailedOptimisticCacheState> =>
      setFailedItemsOutcomeOptimistically(queryClient, [variables.runId], 'Failed', variables.reason),
    onError: (_error, _variables, context) => {
      restoreFailedOptimisticState(queryClient, context as FailedOptimisticCacheState | undefined);
    },
    onSettled: () => {
      invalidateQueueQueries(queryClient);
    },
    ...mutationConfig,
  });
};
