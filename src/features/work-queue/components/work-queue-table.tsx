import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { WorkQueueItem } from '@/types/playbooks';
import { formatCurrency } from '@/utils/format-currency';
import {
  getAgeColorClasses,
  formatRelativeAge,
  getPriorityFromItem,
} from '@/features/work-queue/utils';
import { QueueItemDetail } from '@/features/work-queue/components/queue-item-detail';
import { formatDateTime } from '@/utils/customer-helpers';

type WorkQueueRowError = {
  message: string;
  retryAction?: 'approve' | 'snooze' | 'dismiss';
};

type WorkQueueTableProps = {
  items: WorkQueueItem[];
  selectedRunIds: Set<string>;
  expandedRunIds: Set<string>;
  actionLoadingRunIds: Set<string>;
  dismissConfirmRunId: string | null;
  snoozeHoursByRunId: Record<string, number>;
  rowErrors: Record<string, WorkQueueRowError | undefined>;
  allVisibleSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelect: (runId: string) => void;
  onToggleExpand: (runId: string) => void;
  onApprove: (item: WorkQueueItem) => void;
  onSnooze: (item: WorkQueueItem) => void;
  onDismiss: (item: WorkQueueItem) => void;
  onSetDismissConfirm: (runId: string | null) => void;
  onSnoozeHoursChange: (runId: string, hours: number) => void;
  onRetry: (runId: string) => void;
};

const getPriorityBadgeClass = (item: WorkQueueItem) => {
  const priority = getPriorityFromItem(item);
  if (priority === 'High') {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  if (priority === 'Medium') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

const QueueActions: React.FC<{
  item: WorkQueueItem;
  isBusy: boolean;
  isConfirmingDismiss: boolean;
  snoozeHours: number;
  rowError?: WorkQueueRowError;
  onApprove: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
  onToggleDismissConfirm: () => void;
  onSnoozeHoursChange: (hours: number) => void;
  onRetry: () => void;
}> = ({
  item,
  isBusy,
  isConfirmingDismiss,
  snoozeHours,
  rowError,
  onApprove,
  onSnooze,
  onDismiss,
  onToggleDismissConfirm,
  onSnoozeHoursChange,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onApprove} disabled={isBusy}>
          Approve
        </Button>
        <select
          value={String(snoozeHours)}
          onChange={(event) => onSnoozeHoursChange(Number(event.target.value))}
          className="h-8 rounded-md border border-border-primary/40 bg-surface-secondary/50 px-2 text-xs text-text-primary"
          disabled={isBusy}
        >
          <option value="1">1h</option>
          <option value="4">4h</option>
          <option value="24">24h</option>
        </select>
        <Button size="sm" variant="outline" onClick={onSnooze} disabled={isBusy}>
          Snooze
        </Button>
        <Button
          size="sm"
          variant={isConfirmingDismiss ? 'warning' : 'ghost'}
          onClick={() => {
            if (!isConfirmingDismiss) {
              onToggleDismissConfirm();
              return;
            }
            onDismiss();
          }}
          disabled={isBusy}
        >
          {isConfirmingDismiss ? 'Confirm dismiss' : 'Dismiss'}
        </Button>
      </div>

      {rowError && (
        <div className="flex items-center gap-2 rounded-md border border-error/40 bg-error/10 px-2 py-1 text-xs text-error">
          <span>{rowError.message}</span>
          <Button size="sm" variant="ghost" className="h-6 px-2 text-error" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}

      {!rowError && isConfirmingDismiss && (
        <p className="text-xs text-text-muted">Dismiss permanently removes this queue item.</p>
      )}

      {!rowError && isBusy && (
        <p className="text-xs text-text-muted">Updating {item.customerName}...</p>
      )}
    </div>
  );
};

export const WorkQueueTable: React.FC<WorkQueueTableProps> = ({
  items,
  selectedRunIds,
  expandedRunIds,
  actionLoadingRunIds,
  dismissConfirmRunId,
  snoozeHoursByRunId,
  rowErrors,
  allVisibleSelected,
  onToggleSelectAll,
  onToggleSelect,
  onToggleExpand,
  onApprove,
  onSnooze,
  onDismiss,
  onSetDismissConfirm,
  onSnoozeHoursChange,
  onRetry,
}) => {
  return (
    <>
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border-primary/30">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-secondary/40">
            <tr>
              <th className="w-10 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={() => onToggleSelectAll()}
                  className="rounded border-border-primary bg-surface-secondary focus:ring-accent-primary"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Customer</th>
              <th className="w-[120px] px-4 py-3 text-right text-xs font-semibold text-text-secondary">Amount</th>
              <th className="w-[90px] px-4 py-3 text-left text-xs font-semibold text-text-secondary">Priority</th>
              <th className="w-[140px] px-4 py-3 text-left text-xs font-semibold text-text-secondary">Age</th>
              <th className="w-[290px] px-4 py-3 text-right text-xs font-semibold text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary/20 bg-surface-primary/70">
            {items.map((item) => {
              const isSelected = selectedRunIds.has(item.runId);
              const isExpanded = expandedRunIds.has(item.runId);
              const isBusy = actionLoadingRunIds.has(item.runId);
              const ageColors = getAgeColorClasses(item.createdAt);
              const isConfirmingDismiss = dismissConfirmRunId === item.runId;
              const snoozeHours = snoozeHoursByRunId[item.runId] ?? 4;
              const rowError = rowErrors[item.runId];

              return (
                <React.Fragment key={item.runId}>
                  <tr
                    className={`border-l-4 ${ageColors.border} ${ageColors.row} hover:bg-surface-secondary/40 transition-colors cursor-pointer ${
                      isBusy ? 'opacity-80' : ''
                    }`}
                    onClick={() => onToggleExpand(item.runId)}
                  >
                    <td className="px-3 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => onToggleSelect(item.runId)}
                        className="rounded border-border-primary bg-surface-secondary focus:ring-accent-primary"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="min-w-0">
                        <p className="font-semibold text-text-primary truncate">{item.customerName}</p>
                        <p className="text-xs text-text-muted truncate">
                          {item.playbookName} · {item.reason}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-right font-semibold text-text-primary whitespace-nowrap">
                      {formatCurrency(item.potentialValue, item.currencyCode ?? 'USD')}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityBadgeClass(
                          item,
                        )}`}
                      >
                        {getPriorityFromItem(item)}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Tooltip content={formatDateTime(item.createdAt)} side="top" widthClassName="min-w-[180px]">
                        <span className={`text-xs font-medium ${ageColors.text}`}>{formatRelativeAge(item.createdAt)}</span>
                      </Tooltip>
                    </td>
                    <td className="px-4 py-3 align-top text-right" onClick={(event) => event.stopPropagation()}>
                      <QueueActions
                        item={item}
                        isBusy={isBusy}
                        isConfirmingDismiss={isConfirmingDismiss}
                        snoozeHours={snoozeHours}
                        rowError={rowError}
                        onApprove={() => onApprove(item)}
                        onSnooze={() => onSnooze(item)}
                        onDismiss={() => onDismiss(item)}
                        onToggleDismissConfirm={() => onSetDismissConfirm(item.runId)}
                        onSnoozeHoursChange={(hours) => onSnoozeHoursChange(item.runId, hours)}
                        onRetry={() => onRetry(item.runId)}
                      />
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={6} className="bg-surface-secondary/15 px-4 py-3">
                        <QueueItemDetail item={item} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {items.map((item) => {
          const isSelected = selectedRunIds.has(item.runId);
          const isExpanded = expandedRunIds.has(item.runId);
          const isBusy = actionLoadingRunIds.has(item.runId);
          const isConfirmingDismiss = dismissConfirmRunId === item.runId;
          const ageColors = getAgeColorClasses(item.createdAt);
          const snoozeHours = snoozeHoursByRunId[item.runId] ?? 4;
          const rowError = rowErrors[item.runId];

          return (
            <div
              key={item.runId}
              className={`rounded-xl border-l-4 ${ageColors.border} border border-border-primary/30 bg-surface-primary p-4 shadow-sm`}
            >
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(item.runId)}
                  className="mt-1 rounded border-border-primary bg-surface-secondary focus:ring-accent-primary"
                />
                <button
                  className="flex-1 text-left"
                  onClick={() => onToggleExpand(item.runId)}
                  type="button"
                >
                  <p className="font-semibold text-text-primary">{item.customerName}</p>
                  <p className="text-xs text-text-muted">
                    {item.playbookName} · {item.reason}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-text-primary">
                      {formatCurrency(item.potentialValue, item.currencyCode ?? 'USD')}
                    </span>
                    <span className={ageColors.text}>{formatRelativeAge(item.createdAt)}</span>
                  </div>
                </button>
              </div>

              <div className="mt-3">
                <QueueActions
                  item={item}
                  isBusy={isBusy}
                  isConfirmingDismiss={isConfirmingDismiss}
                  snoozeHours={snoozeHours}
                  rowError={rowError}
                  onApprove={() => onApprove(item)}
                  onSnooze={() => onSnooze(item)}
                  onDismiss={() => onDismiss(item)}
                  onToggleDismissConfirm={() => onSetDismissConfirm(item.runId)}
                  onSnoozeHoursChange={(hours) => onSnoozeHoursChange(item.runId, hours)}
                  onRetry={() => onRetry(item.runId)}
                />
              </div>

              {isExpanded && (
                <div className="mt-3">
                  <QueueItemDetail item={item} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
