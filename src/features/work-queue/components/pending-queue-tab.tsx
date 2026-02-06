import React from 'react';
import { Button } from '@/components/ui/button';
import { BulkActionBar } from '@/features/work-queue/components/bulk-action-bar';
import { QueueEmptyState } from '@/features/work-queue/components/queue-empty-state';
import { WorkQueueTable } from '@/features/work-queue/components/work-queue-table';
import { WorkQueueItem } from '@/types/playbooks';

type RowAction = 'approve' | 'snooze' | 'dismiss';

type RowErrorState = {
  message: string;
  retryAction?: RowAction;
};

type PendingQueueTabProps = {
  baseItems: WorkQueueItem[];
  filteredItems: WorkQueueItem[];
  selectedRunIds: Set<string>;
  expandedRunIds: Set<string>;
  actionLoadingRunIds: Set<string>;
  dismissConfirmRunId: string | null;
  snoozeHoursByRunId: Record<string, number>;
  rowErrors: Record<string, RowErrorState | undefined>;
  allVisibleSelected: boolean;
  bulkSnoozeHours: number;
  isAnyMutationPending: boolean;
  onClearFilters: () => void;
  onToggleSelectAll: () => void;
  onToggleSelect: (runId: string) => void;
  onToggleExpand: (runId: string) => void;
  onApprove: (item: WorkQueueItem) => void;
  onSnooze: (item: WorkQueueItem) => void;
  onDismiss: (item: WorkQueueItem) => void;
  onSetDismissConfirm: (runId: string | null) => void;
  onSnoozeHoursChange: (runId: string, hours: number) => void;
  onRetry: (runId: string) => void;
  onBulkSnoozeHoursChange: (hours: number) => void;
  onApproveAll: () => void;
  onSnoozeAll: () => void;
  onDismissAll: () => void;
  onClearSelection: () => void;
};

export const PendingQueueTab: React.FC<PendingQueueTabProps> = ({
  baseItems,
  filteredItems,
  selectedRunIds,
  expandedRunIds,
  actionLoadingRunIds,
  dismissConfirmRunId,
  snoozeHoursByRunId,
  rowErrors,
  allVisibleSelected,
  bulkSnoozeHours,
  isAnyMutationPending,
  onClearFilters,
  onToggleSelectAll,
  onToggleSelect,
  onToggleExpand,
  onApprove,
  onSnooze,
  onDismiss,
  onSetDismissConfirm,
  onSnoozeHoursChange,
  onRetry,
  onBulkSnoozeHoursChange,
  onApproveAll,
  onSnoozeAll,
  onDismissAll,
  onClearSelection,
}) => {
  if (baseItems.length === 0) {
    return <QueueEmptyState />;
  }

  if (filteredItems.length === 0) {
    return (
      <div className="bg-surface-secondary/40 border border-border-primary/30 rounded-2xl p-8 text-center">
        <p className="text-text-primary font-semibold mb-2">No queue items match your filters</p>
        <p className="text-text-muted mb-4">Adjust filters to view more items.</p>
        <Button onClick={onClearFilters}>Clear filters</Button>
      </div>
    );
  }

  return (
    <>
      <WorkQueueTable
        items={filteredItems}
        selectedRunIds={selectedRunIds}
        expandedRunIds={expandedRunIds}
        actionLoadingRunIds={actionLoadingRunIds}
        dismissConfirmRunId={dismissConfirmRunId}
        snoozeHoursByRunId={snoozeHoursByRunId}
        rowErrors={rowErrors}
        allVisibleSelected={allVisibleSelected}
        onToggleSelectAll={onToggleSelectAll}
        onToggleSelect={onToggleSelect}
        onToggleExpand={onToggleExpand}
        onApprove={onApprove}
        onSnooze={onSnooze}
        onDismiss={onDismiss}
        onSetDismissConfirm={onSetDismissConfirm}
        onSnoozeHoursChange={onSnoozeHoursChange}
        onRetry={onRetry}
      />

      <BulkActionBar
        selectedCount={selectedRunIds.size}
        isBusy={isAnyMutationPending}
        snoozeHours={bulkSnoozeHours}
        onSnoozeHoursChange={onBulkSnoozeHoursChange}
        onApproveAll={onApproveAll}
        onSnoozeAll={onSnoozeAll}
        onDismissAll={onDismissAll}
        onClear={onClearSelection}
      />
    </>
  );
};

