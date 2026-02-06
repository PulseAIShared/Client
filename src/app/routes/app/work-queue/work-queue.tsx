
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/ui/notifications/notifications-store';
import { useUser } from '@/lib/auth';
import { signalRConnection } from '@/lib/signalr';
import {
  useApproveWorkQueueRun,
  useBulkWorkQueueAction,
  useDismissFailedAction,
  useDismissWorkQueueRun,
  useEscalateWorkQueueItem,
  useGetFailedActions,
  useGetRecentlyActed,
  useGetWorkQueue,
  useRetryAllFailedActions,
  useRetryFailedAction,
  useSnoozeWorkQueueRun,
  useUndismissFailedAction,
  useUndoWorkQueueAction,
} from '@/features/work-queue/api/work-queue';
import {
  FailedActionsTab,
  PendingQueueTab,
  RecentlyActedTab,
} from '@/features/work-queue/components';
import {
  HIGH_VALUE_THRESHOLD,
  STALE_THRESHOLD_MINUTES,
  buildSummaryFromItems,
  getPriorityFromItem,
  getPriorityRank,
  sortItemsByDefault,
} from '@/features/work-queue/utils';
import { WorkQueueItem } from '@/types/playbooks';
import { formatCurrency } from '@/utils/format-currency';

type SortOption = 'default' | 'oldest' | 'newest' | 'highest_amount' | 'highest_priority';
type StatFilter = 'all' | 'high_value' | 'stale';
type RowAction = 'approve' | 'snooze' | 'dismiss';
type TabKey = 'pending' | 'recently_acted' | 'failed';

type RowActionSnapshot = {
  action: RowAction;
  snoozeHours?: number;
};

type RowErrorState = {
  message: string;
  retryAction?: RowAction;
};

const parseTabFromQuery = (value: string | null): TabKey => {
  if (!value) {
    return 'pending';
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'failed') {
    return 'failed';
  }
  if (
    normalized === 'recently-acted' ||
    normalized === 'recently_acted' ||
    normalized === 'recent'
  ) {
    return 'recently_acted';
  }

  return 'pending';
};

const toTabQueryValue = (tab: TabKey): string | null => {
  if (tab === 'failed') {
    return 'failed';
  }
  if (tab === 'recently_acted') {
    return 'recently-acted';
  }

  return null;
};

const toErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const maybeAxiosError = error as {
    response?: { data?: { detail?: string; title?: string; message?: string } };
    message?: string;
  };

  return (
    maybeAxiosError.response?.data?.detail ||
    maybeAxiosError.response?.data?.title ||
    maybeAxiosError.response?.data?.message ||
    maybeAxiosError.message ||
    fallback
  );
};

const matchesStatFilter = (item: WorkQueueItem, statFilter: StatFilter) => {
  if (statFilter === 'high_value') {
    return (item.potentialValue ?? 0) > HIGH_VALUE_THRESHOLD;
  }

  if (statFilter === 'stale') {
    return Date.now() - new Date(item.createdAt).getTime() >= STALE_THRESHOLD_MINUTES * 60 * 1000;
  }

  return true;
};

const sortPendingItems = (items: WorkQueueItem[], sortBy: SortOption) => {
  if (sortBy === 'default') {
    return sortItemsByDefault(items);
  }

  return [...items].sort((a, b) => {
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'highest_amount') {
      return (b.potentialValue ?? 0) - (a.potentialValue ?? 0);
    }

    const priorityDiff = getPriorityRank(b) - getPriorityRank(a);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
};

const parseTimeSpanToLabel = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  const parts = value.split(':').map((part) => Number(part));
  if (parts.length < 2 || parts.some((part) => Number.isNaN(part))) {
    return value;
  }

  const [hours, minutes] = parts;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

export const WorkQueueRoute = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addNotification } = useNotifications();
  const user = useUser();
  const userId = user.data?.id;

  const {
    data: workQueue,
    isLoading: workQueueLoading,
    error: workQueueError,
    refetch: refetchWorkQueue,
  } = useGetWorkQueue();
  const {
    data: recentlyActed,
    isLoading: recentlyActedLoading,
    error: recentlyActedError,
    refetch: refetchRecentlyActed,
  } = useGetRecentlyActed();
  const {
    data: failedActions,
    isLoading: failedActionsLoading,
    error: failedActionsError,
    refetch: refetchFailedActions,
  } = useGetFailedActions({ includeDismissed: true });

  const approveMutation = useApproveWorkQueueRun();
  const dismissMutation = useDismissWorkQueueRun();
  const snoozeMutation = useSnoozeWorkQueueRun();
  const bulkActionMutation = useBulkWorkQueueAction();
  const undoMutation = useUndoWorkQueueAction();
  const retryFailedMutation = useRetryFailedAction();
  const retryAllMutation = useRetryAllFailedActions();
  const escalateMutation = useEscalateWorkQueueItem();
  const dismissFailedMutation = useDismissFailedAction();
  const undismissFailedMutation = useUndismissFailedAction();

  const tabFromQuery = React.useMemo(
    () => parseTabFromQuery(searchParams.get('tab')),
    [searchParams],
  );

  const activeTab = tabFromQuery;
  const [searchTerm, setSearchTerm] = React.useState('');
  const [playbookFilter, setPlaybookFilter] = React.useState('all');
  const [priorityFilter, setPriorityFilter] = React.useState<'all' | 'High' | 'Medium' | 'Low'>('all');
  const [outcomeFilter, setOutcomeFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState<SortOption>('default');
  const [statFilter, setStatFilter] = React.useState<StatFilter>('all');

  const [selectedRunIds, setSelectedRunIds] = React.useState<Set<string>>(new Set());
  const [expandedRunIds, setExpandedRunIds] = React.useState<Set<string>>(new Set());
  const [dismissConfirmRunId, setDismissConfirmRunId] = React.useState<string | null>(null);
  const [snoozeHoursByRunId, setSnoozeHoursByRunId] = React.useState<Record<string, number>>({});
  const [bulkSnoozeHours, setBulkSnoozeHours] = React.useState(4);
  const [rowErrors, setRowErrors] = React.useState<Record<string, RowErrorState | undefined>>({});
  const [lastRowActions, setLastRowActions] = React.useState<Record<string, RowActionSnapshot | undefined>>({});
  const [actionLoadingRunIds, setActionLoadingRunIds] = React.useState<Set<string>>(new Set());
  const [failedBusyRunIds, setFailedBusyRunIds] = React.useState<Set<string>>(new Set());

  const setActiveTabWithQuery = React.useCallback(
    (tab: TabKey) => {
      const next = new URLSearchParams(searchParams);
      const tabValue = toTabQueryValue(tab);
      if (tabValue) {
        next.set('tab', tabValue);
      } else {
        next.delete('tab');
      }

      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const baseItems = workQueue?.items ?? [];
  const summary = workQueue?.summary ?? buildSummaryFromItems(baseItems);
  const recentlyItems = recentlyActed?.items ?? [];
  const recentlySummary = recentlyActed?.summary;
  const failedItems = failedActions?.items ?? [];
  const failedSummary = failedActions?.summary;

  React.useEffect(() => {
    if (activeTab === 'pending') {
      return;
    }

    if (activeTab === 'recently_acted') {
      void refetchRecentlyActed();
      return;
    }

    void refetchFailedActions();
  }, [activeTab, refetchFailedActions, refetchRecentlyActed]);

  React.useEffect(() => {
    const availableIds = new Set(baseItems.map((item) => item.runId));

    setSelectedRunIds((previous) => new Set([...previous].filter((id) => availableIds.has(id))));
    setExpandedRunIds((previous) => new Set([...previous].filter((id) => availableIds.has(id))));
    setActionLoadingRunIds((previous) => new Set([...previous].filter((id) => availableIds.has(id))));
    setRowErrors((previous) => {
      const next: Record<string, RowErrorState | undefined> = {};
      Object.entries(previous).forEach(([id, value]) => {
        if (availableIds.has(id)) {
          next[id] = value;
        }
      });
      return next;
    });
    setLastRowActions((previous) => {
      const next: Record<string, RowActionSnapshot | undefined> = {};
      Object.entries(previous).forEach(([id, value]) => {
        if (availableIds.has(id)) {
          next[id] = value;
        }
      });
      return next;
    });
    if (dismissConfirmRunId && !availableIds.has(dismissConfirmRunId)) {
      setDismissConfirmRunId(null);
    }
  }, [baseItems, dismissConfirmRunId]);

  React.useEffect(() => {
    const handleExternalAction = (payload: any) => {
      if (!payload || !payload.actedByUserId || payload.actedByUserId === userId) {
        return;
      }

      addNotification({
        type: 'info',
        title: `${payload.customerName ?? 'Queue item'} was ${payload.actionType ?? 'updated'} by ${payload.actedByName ?? 'teammate'}`,
      });
    };

    signalRConnection.on('work_queue_item_resolved', handleExternalAction);
    signalRConnection.on('work_queue_item_snoozed', handleExternalAction);

    return () => {
      signalRConnection.off('work_queue_item_resolved', handleExternalAction);
      signalRConnection.off('work_queue_item_snoozed', handleExternalAction);
    };
  }, [addNotification, userId]);

  const playbookOptions = React.useMemo(() => {
    const unique = new Map<string, string>();
    [...baseItems, ...recentlyItems, ...failedItems].forEach((item: any) => {
      const key = item.playbookId ?? item.playbookName;
      if (!unique.has(key)) {
        unique.set(key, item.playbookName);
      }
    });
    return Array.from(unique.entries()).map(([value, label]) => ({ value, label }));
  }, [baseItems, recentlyItems, failedItems]);

  const filteredPendingItems = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = baseItems.filter((item) => {
      if (!matchesStatFilter(item, statFilter)) {
        return false;
      }
      if (normalizedSearch && !item.customerName.toLowerCase().includes(normalizedSearch)) {
        return false;
      }

      if (playbookFilter !== 'all') {
        const itemPlaybookValue = item.playbookId ?? item.playbookName;
        if (itemPlaybookValue !== playbookFilter) {
          return false;
        }
      }

      if (priorityFilter !== 'all' && getPriorityFromItem(item) !== priorityFilter) {
        return false;
      }

      return true;
    });

    return sortPendingItems(filtered, sortBy);
  }, [baseItems, searchTerm, playbookFilter, priorityFilter, sortBy, statFilter]);

  const filteredRecentlyItems = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    let items = recentlyItems.filter((item) => {
      if (normalizedSearch && !item.customerName.toLowerCase().includes(normalizedSearch)) {
        return false;
      }
      if (playbookFilter !== 'all' && item.playbookId !== playbookFilter) {
        return false;
      }
      if (outcomeFilter !== 'all' && item.outcomeStatus !== outcomeFilter) {
        return false;
      }
      return true;
    });

    if (sortBy === 'highest_amount') {
      items = [...items].sort((a, b) => (b.potentialValue ?? 0) - (a.potentialValue ?? 0));
    } else if (sortBy === 'oldest') {
      items = [...items].sort((a, b) => new Date(a.actedAt).getTime() - new Date(b.actedAt).getTime());
    } else {
      items = [...items].sort((a, b) => new Date(b.actedAt).getTime() - new Date(a.actedAt).getTime());
    }

    return items;
  }, [recentlyItems, searchTerm, playbookFilter, outcomeFilter, sortBy]);

  const filteredFailedItems = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    let items = failedItems.filter((item) => {
      if (normalizedSearch && !item.customerName.toLowerCase().includes(normalizedSearch)) {
        return false;
      }
      if (playbookFilter !== 'all' && item.playbookId !== playbookFilter) {
        return false;
      }
      if (outcomeFilter !== 'all' && item.outcomeStatus !== outcomeFilter) {
        return false;
      }
      return true;
    });

    if (sortBy === 'highest_amount') {
      items = [...items].sort((a, b) => (b.potentialValue ?? 0) - (a.potentialValue ?? 0));
    } else if (sortBy === 'oldest') {
      items = [...items].sort((a, b) => new Date(a.failedAt).getTime() - new Date(b.failedAt).getTime());
    } else {
      items = [...items].sort((a, b) => new Date(b.failedAt).getTime() - new Date(a.failedAt).getTime());
    }

    return items;
  }, [failedItems, searchTerm, playbookFilter, outcomeFilter, sortBy]);

  const setRunBusy = (runId: string, busy: boolean) => {
    setActionLoadingRunIds((previous) => {
      const next = new Set(previous);
      if (busy) {
        next.add(runId);
      } else {
        next.delete(runId);
      }
      return next;
    });
  };

  const setFailedBusy = (runId: string, busy: boolean) => {
    setFailedBusyRunIds((previous) => {
      const next = new Set(previous);
      if (busy) {
        next.add(runId);
      } else {
        next.delete(runId);
      }
      return next;
    });
  };

  const clearRowError = (runId: string) => {
    setRowErrors((previous) => ({ ...previous, [runId]: undefined }));
  };

  const setRowError = (runId: string, message: string, retryAction?: RowAction) => {
    setRowErrors((previous) => ({ ...previous, [runId]: { message, retryAction } }));
  };

  const rememberRowAction = (runId: string, action: RowAction, snoozeHours?: number) => {
    setLastRowActions((previous) => ({ ...previous, [runId]: { action, snoozeHours } }));
  };

  const handleApprove = (item: WorkQueueItem) => {
    setRunBusy(item.runId, true);
    clearRowError(item.runId);
    rememberRowAction(item.runId, 'approve');

    approveMutation.mutate(
      { runId: item.runId },
      {
        onSuccess: () => {
          addNotification(
            {
              type: 'success',
              title: `Approved - ${item.customerName}`,
              message: `Retrying ${formatCurrency(item.potentialValue, item.currencyCode ?? 'USD')}.`,
              actionLabel: 'Undo',
              actionHandler: () => {
                undoMutation.mutate(
                  { runId: item.runId },
                  {
                    onSuccess: () => {
                      addNotification({
                        type: 'info',
                        title: 'Approval undone',
                        message: `${item.customerName} returned to pending queue.`,
                      });
                    },
                    onError: (error) => {
                      addNotification({
                        type: 'error',
                        title: 'Undo failed',
                        message: toErrorMessage(error, 'Undo window expired.'),
                      });
                    },
                  },
                );
              },
            },
            true,
            7000,
          );
          setSelectedRunIds((previous) => {
            const next = new Set(previous);
            next.delete(item.runId);
            return next;
          });
          setExpandedRunIds((previous) => {
            const next = new Set(previous);
            next.delete(item.runId);
            return next;
          });
        },
        onError: (error) => {
          setRowError(item.runId, toErrorMessage(error, 'Approval failed.'), 'approve');
          addNotification({
            type: 'error',
            title: 'Approve failed',
            message: toErrorMessage(error, `Could not approve ${item.customerName}.`),
          });
        },
        onSettled: () => {
          setRunBusy(item.runId, false);
        },
      },
    );
  };

  const handleSnooze = (item: WorkQueueItem) => {
    const snoozeHours = snoozeHoursByRunId[item.runId] ?? 4;
    if (snoozeHours <= 0) {
      addNotification({
        type: 'warning',
        title: 'Enter a valid snooze duration',
      });
      return;
    }

    setRunBusy(item.runId, true);
    clearRowError(item.runId);
    rememberRowAction(item.runId, 'snooze', snoozeHours);

    snoozeMutation.mutate(
      { runId: item.runId, snoozeHours },
      {
        onSuccess: () => {
          addNotification({
            type: 'success',
            title: `Snoozed for ${snoozeHours} hour${snoozeHours === 1 ? '' : 's'}`,
          });
          setSelectedRunIds((previous) => {
            const next = new Set(previous);
            next.delete(item.runId);
            return next;
          });
        },
        onError: (error) => {
          setRowError(item.runId, toErrorMessage(error, 'Snooze failed.'), 'snooze');
          addNotification({
            type: 'error',
            title: 'Snooze failed',
            message: toErrorMessage(error, `Could not snooze ${item.customerName}.`),
          });
        },
        onSettled: () => {
          setRunBusy(item.runId, false);
        },
      },
    );
  };

  const handleDismiss = (item: WorkQueueItem) => {
    setRunBusy(item.runId, true);
    clearRowError(item.runId);
    rememberRowAction(item.runId, 'dismiss');

    dismissMutation.mutate(
      { runId: item.runId },
      {
        onSuccess: () => {
          addNotification({
            type: 'info',
            title: `Dismissed - ${item.customerName}`,
            message: `${item.customerName} removed from queue.`,
          });
          setDismissConfirmRunId(null);
          setSelectedRunIds((previous) => {
            const next = new Set(previous);
            next.delete(item.runId);
            return next;
          });
        },
        onError: (error) => {
          setRowError(item.runId, toErrorMessage(error, 'Dismiss failed.'), 'dismiss');
          addNotification({
            type: 'error',
            title: 'Dismiss failed',
            message: toErrorMessage(error, `Could not dismiss ${item.customerName}.`),
          });
        },
        onSettled: () => {
          setRunBusy(item.runId, false);
        },
      },
    );
  };

  const handleRetry = (runId: string) => {
    const item = baseItems.find((candidate) => candidate.runId === runId);
    const action = lastRowActions[runId];
    if (!item || !action) {
      return;
    }

    if (action.action === 'approve') {
      handleApprove(item);
      return;
    }
    if (action.action === 'dismiss') {
      handleDismiss(item);
      return;
    }

    setSnoozeHoursByRunId((previous) => ({
      ...previous,
      [runId]: action.snoozeHours ?? previous[runId] ?? 4,
    }));
    handleSnooze(item);
  };

  const runBulkAction = (action: RowAction) => {
    const itemIds = Array.from(selectedRunIds);
    if (itemIds.length === 0) {
      return;
    }

    itemIds.forEach((id) => setRunBusy(id, true));

    bulkActionMutation.mutate(
      {
        itemIds,
        action,
        snoozeDurationHours: action === 'snooze' ? bulkSnoozeHours : undefined,
      },
      {
        onSuccess: (response) => {
          if (response.failed.length > 0) {
            response.failed.forEach((entry) => {
              setRowError(entry.id, entry.reason, action);
            });
            setSelectedRunIds(new Set(response.failed.map((entry) => entry.id)));
            addNotification({
              type: 'warning',
              title: `${response.succeeded.length} succeeded, ${response.failed.length} failed`,
              message: 'Retry failed items from the row error state.',
            });
          } else {
            setSelectedRunIds(new Set());
            addNotification({
              type: 'success',
              title:
                action === 'approve'
                  ? `Approved ${response.succeeded.length} items`
                  : action === 'snooze'
                    ? `Snoozed ${response.succeeded.length} items`
                    : `Dismissed ${response.succeeded.length} items`,
            });
          }
        },
        onError: (error) => {
          addNotification({
            type: 'error',
            title: 'Bulk action failed',
            message: toErrorMessage(error, 'Could not complete bulk action.'),
          });
        },
        onSettled: () => {
          itemIds.forEach((id) => setRunBusy(id, false));
        },
      },
    );
  };

  const handleRetryFailed = (runId: string, actionId: string) => {
    setFailedBusy(runId, true);
    retryFailedMutation.mutate(
      { runId, actionId },
      {
        onSuccess: () => {
          addNotification({ type: 'success', title: 'Retry queued' });
        },
        onError: (error) => {
          addNotification({
            type: 'error',
            title: 'Retry failed',
            message: toErrorMessage(error, 'Could not retry failed action.'),
          });
        },
        onSettled: () => setFailedBusy(runId, false),
      },
    );
  };

  const handleRetryAllFailed = (runId: string) => {
    setFailedBusy(runId, true);
    retryAllMutation.mutate(
      { runId },
      {
        onSuccess: () => {
          addNotification({ type: 'success', title: 'Retry all queued' });
        },
        onError: (error) => {
          addNotification({
            type: 'error',
            title: 'Retry all failed',
            message: toErrorMessage(error, 'Could not retry all failed actions.'),
          });
        },
        onSettled: () => setFailedBusy(runId, false),
      },
    );
  };

  const handleEscalate = (runId: string, reason?: string) => {
    setFailedBusy(runId, true);
    escalateMutation.mutate(
      { runId, reason },
      {
        onSuccess: () => {
          addNotification({
            type: 'warning',
            title: 'Escalated',
            message: 'Manual intervention was requested.',
          });
        },
        onError: (error) => {
          addNotification({
            type: 'error',
            title: 'Escalation failed',
            message: toErrorMessage(error, 'Could not escalate failed item.'),
          });
        },
        onSettled: () => setFailedBusy(runId, false),
      },
    );
  };

  const handleDismissFailed = (runId: string, reason?: string) => {
    setFailedBusy(runId, true);
    dismissFailedMutation.mutate(
      { runId, dismissalNotes: reason },
      {
        onSuccess: () => {
          addNotification({
            type: 'info',
            title: 'Failure dismissed',
            message: reason ? `Reason saved: ${reason}` : 'Reason saved to dismissed history.',
          });
        },
        onError: (error) => {
          addNotification({
            type: 'error',
            title: 'Dismiss failed item failed',
            message: toErrorMessage(error, 'Could not dismiss failed item.'),
          });
        },
        onSettled: () => setFailedBusy(runId, false),
      },
    );
  };

  const handleUndismissFailed = (runId: string, reason?: string) => {
    setFailedBusy(runId, true);
    undismissFailedMutation.mutate(
      { runId, reason },
      {
        onSuccess: () => {
          addNotification({
            type: 'warning',
            title: 'Failure restored',
            message: 'This item is active in the failed queue again.',
          });
        },
        onError: (error) => {
          addNotification({
            type: 'error',
            title: 'Undismiss failed item failed',
            message: toErrorMessage(error, 'Could not restore dismissed failed item.'),
          });
        },
        onSettled: () => setFailedBusy(runId, false),
      },
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPlaybookFilter('all');
    setPriorityFilter('all');
    setOutcomeFilter('all');
    setSortBy('default');
    setStatFilter('all');
  };

  const allVisibleSelected =
    filteredPendingItems.length > 0 &&
    filteredPendingItems.every((item) => selectedRunIds.has(item.runId));

  const tabCounts = {
    pending: summary.pendingApprovals,
    recentlyActed: recentlyItems.length,
    failed: failedSummary?.totalFailures ?? failedItems.length,
  };

  const summaryCards = React.useMemo(() => {
    if (activeTab === 'recently_acted') {
      return [
        {
          key: 'recent-approved',
          value: recentlySummary?.approvedToday ?? 0,
          label: 'Approved today',
          detail: 'Queue decisions',
          passive: true,
        },
        {
          key: 'recent-dismissed',
          value: recentlySummary?.dismissedToday ?? 0,
          label: 'Dismissed today',
          detail: 'Rejected decisions',
          passive: true,
        },
        {
          key: 'recent-success',
          value: `${Math.round(recentlySummary?.successRatePercent ?? 0)}%`,
          label: 'Success rate',
          detail: 'Approved outcomes',
          passive: true,
        },
      ];
    }

    if (activeTab === 'failed') {
      const dismissedCount = failedItems.filter((item) => item.outcomeStatus === 'Dismissed').length;
      return [
        {
          key: 'failed-count',
          value: failedSummary?.totalFailures ?? 0,
          label: 'Total failures',
          detail: 'Needs intervention',
          passive: true,
        },
        {
          key: 'failed-oldest',
          value: parseTimeSpanToLabel(failedSummary?.oldestFailureAge),
          label: 'Oldest failure',
          detail: 'Time waiting',
          passive: true,
        },
        {
          key: 'failed-value',
          value: formatCurrency(failedSummary?.totalFailedValue ?? 0, 'USD'),
          label: 'Total failed value',
          detail: 'Financial impact',
          passive: true,
        },
        {
          key: 'failed-dismissed',
          value: dismissedCount,
          label: 'Dismissed outcomes',
          detail: 'Hidden from active intervention',
          passive: true,
        },
      ];
    }

    return [
      {
        key: 'all' as StatFilter,
        value: summary.pendingApprovals,
        label: 'Pending approvals',
        detail: 'All queue items',
      },
      {
        key: 'high_value' as StatFilter,
        value: summary.highValueCount,
        label: `High value - above ${formatCurrency(HIGH_VALUE_THRESHOLD, 'USD')}`,
        detail: 'Financially sensitive',
      },
      {
        key: 'stale' as StatFilter,
        value: summary.staleCount,
        label: 'Stale - waiting >1h',
        detail: 'Needs urgent attention',
      },
      {
        key: 'all' as StatFilter,
        value: formatCurrency(summary.totalValueAtRisk, 'USD'),
        label: 'Total value at risk',
        detail: 'Pending queue value',
        passive: true,
      },
    ];
  }, [activeTab, failedItems, failedSummary, recentlySummary, summary]);

  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Work Queue</h1>
            <p className="text-text-muted">Review pending approvals and track downstream outcomes.</p>
          </div>
          <Link to="/app/playbooks">
            <Button variant="outline">View playbooks</Button>
          </Link>
        </div>

        <div className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 lg:p-10 space-y-6">
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border-primary/30 bg-surface-secondary/20 p-2">
              <Button size="sm" variant={activeTab === 'pending' ? 'default' : 'ghost'} onClick={() => setActiveTabWithQuery('pending')}>
                Pending ({tabCounts.pending})
              </Button>
              <Button size="sm" variant={activeTab === 'recently_acted' ? 'default' : 'ghost'} onClick={() => setActiveTabWithQuery('recently_acted')}>
                Recently Acted ({tabCounts.recentlyActed})
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'failed' ? 'warning' : 'ghost'}
                className={activeTab !== 'failed' && tabCounts.failed > 0 ? 'text-error' : ''}
                onClick={() => setActiveTabWithQuery('failed')}
              >
                Failed ({tabCounts.failed})
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {summaryCards.map((stat: any) => {
                const isPendingStat = activeTab === 'pending' && !stat.passive;
                const isActive = isPendingStat && statFilter === stat.key;
                return (
                  <button
                    key={String(stat.key)}
                    onClick={() => {
                      if (isPendingStat) {
                        setStatFilter(stat.key);
                      }
                    }}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      stat.passive || activeTab !== 'pending'
                        ? 'cursor-default border-border-primary/30 bg-surface-secondary/20'
                        : isActive
                          ? 'border-accent-primary/40 bg-accent-primary/10'
                          : 'border-border-primary/30 hover:bg-surface-secondary/30'
                    }`}
                  >
                    <div className="text-text-primary font-semibold text-lg">{stat.value}</div>
                    <div className="text-sm text-text-secondary">{stat.label}</div>
                    <div className="text-xs text-text-muted mt-1">{stat.detail}</div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Search</label>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by customer name"
                  className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Playbook</label>
                <select
                  value={playbookFilter}
                  onChange={(event) => setPlaybookFilter(event.target.value)}
                  className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                >
                  <option value="all">All playbooks</option>
                  {playbookOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {activeTab === 'pending' ? (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Priority</label>
                  <select
                    value={priorityFilter}
                    onChange={(event) => setPriorityFilter(event.target.value as 'all' | 'High' | 'Medium' | 'Low')}
                    className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                  >
                    <option value="all">All priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Outcome</label>
                  <select
                    value={outcomeFilter}
                    onChange={(event) => setOutcomeFilter(event.target.value)}
                    className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                  >
                    <option value="all">All outcomes</option>
                    <option value="Executing">Executing</option>
                    <option value="Succeeded">Succeeded</option>
                    <option value="PartiallyFailed">Partially failed</option>
                    <option value="Failed">Failed</option>
                    <option value="Dismissed">Dismissed</option>
                    <option value="Snoozed">Snoozed</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                >
                  <option value="default">Default</option>
                  <option value="oldest">Oldest first</option>
                  <option value="newest">Newest first</option>
                  <option value="highest_amount">Highest amount</option>
                  <option value="highest_priority">Highest priority</option>
                </select>
              </div>
            </div>

            {activeTab === 'pending' && (
              <>
                {workQueueLoading && <div className="text-text-muted">Loading work queue...</div>}
                {workQueueError && (
                  <div className="rounded-xl border border-error/40 bg-error/10 p-4">
                    <p className="text-error font-medium">Failed to load work queue.</p>
                    <Button size="sm" className="mt-3" onClick={() => refetchWorkQueue()}>
                      Retry
                    </Button>
                  </div>
                )}
                {!workQueueLoading && !workQueueError && (
                  <PendingQueueTab
                    baseItems={baseItems}
                    filteredItems={filteredPendingItems}
                    selectedRunIds={selectedRunIds}
                    expandedRunIds={expandedRunIds}
                    actionLoadingRunIds={actionLoadingRunIds}
                    dismissConfirmRunId={dismissConfirmRunId}
                    snoozeHoursByRunId={snoozeHoursByRunId}
                    rowErrors={rowErrors}
                    allVisibleSelected={allVisibleSelected}
                    bulkSnoozeHours={bulkSnoozeHours}
                    isAnyMutationPending={
                      approveMutation.isPending ||
                      dismissMutation.isPending ||
                      snoozeMutation.isPending ||
                      bulkActionMutation.isPending
                    }
                    onClearFilters={clearFilters}
                    onToggleSelectAll={() => {
                      if (allVisibleSelected) {
                        setSelectedRunIds((previous) => {
                          const next = new Set(previous);
                          filteredPendingItems.forEach((item) => next.delete(item.runId));
                          return next;
                        });
                        return;
                      }

                      setSelectedRunIds((previous) => {
                        const next = new Set(previous);
                        filteredPendingItems.forEach((item) => next.add(item.runId));
                        return next;
                      });
                    }}
                    onToggleSelect={(runId) => {
                      setSelectedRunIds((previous) => {
                        const next = new Set(previous);
                        if (next.has(runId)) {
                          next.delete(runId);
                        } else {
                          next.add(runId);
                        }
                        return next;
                      });
                    }}
                    onToggleExpand={(runId) => {
                      setExpandedRunIds((previous) => {
                        const next = new Set(previous);
                        if (next.has(runId)) {
                          next.delete(runId);
                        } else {
                          next.add(runId);
                        }
                        return next;
                      });
                    }}
                    onApprove={handleApprove}
                    onSnooze={handleSnooze}
                    onDismiss={handleDismiss}
                    onSetDismissConfirm={(runId) => setDismissConfirmRunId((current) => (current === runId ? null : runId))}
                    onSnoozeHoursChange={(runId, hours) => setSnoozeHoursByRunId((previous) => ({ ...previous, [runId]: hours }))}
                    onRetry={handleRetry}
                    onBulkSnoozeHoursChange={setBulkSnoozeHours}
                    onApproveAll={() => runBulkAction('approve')}
                    onSnoozeAll={() => runBulkAction('snooze')}
                    onDismissAll={() => runBulkAction('dismiss')}
                    onClearSelection={() => setSelectedRunIds(new Set())}
                  />
                )}
              </>
            )}

            {activeTab === 'recently_acted' && (
              <RecentlyActedTab
                items={filteredRecentlyItems}
                isLoading={recentlyActedLoading}
                isError={Boolean(recentlyActedError)}
                currentUserId={userId}
                onRetryLoad={() => refetchRecentlyActed()}
              />
            )}

            {activeTab === 'failed' && (
              <FailedActionsTab
                items={filteredFailedItems}
                isLoading={failedActionsLoading}
                isError={Boolean(failedActionsError)}
                busyRunIds={failedBusyRunIds}
                onRetryLoad={() => refetchFailedActions()}
                onRetryAction={handleRetryFailed}
                onRetryAll={handleRetryAllFailed}
                onEscalate={handleEscalate}
                onDismiss={handleDismissFailed}
                onUndismiss={handleUndismissFailed}
              />
            )}
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};
