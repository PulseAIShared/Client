import React from 'react';
import { useModal } from '@/app/modal-provider';
import { FailedActionItem } from '@/types/playbooks';
import { formatCurrency } from '@/utils/format-currency';
import { formatRelativeAge, getAgeColorClasses } from '@/features/work-queue/utils';
import { Button } from '@/components/ui/button';
import { ActionTimeline } from '@/features/work-queue/components/action-timeline';

type FailedActionsTabProps = {
  items: FailedActionItem[];
  isLoading: boolean;
  isError: boolean;
  busyRunIds: Set<string>;
  onRetryLoad: () => void;
  onRetryAction: (runId: string, actionId: string) => void;
  onRetryAll: (runId: string) => void;
  onEscalate: (runId: string, reason?: string) => void;
  onDismiss: (runId: string, reason?: string) => void;
  onUndismiss: (runId: string, reason?: string) => void;
};

type ReasonModalProps = {
  title: string;
  description: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
};

const ReasonModal: React.FC<ReasonModalProps> = ({
  title,
  description,
  confirmLabel,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = React.useState('');

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border-primary/40 bg-surface-primary p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="mt-2 text-sm text-text-muted">{description}</p>

        <label className="mt-4 block text-sm font-medium text-text-secondary" htmlFor="work-queue-reason-input">
          Reason (optional)
        </label>
        <textarea
          id="work-queue-reason-input"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={4}
          placeholder="Add context for teammates"
          className="mt-2 w-full resize-none rounded-xl border border-border-primary/30 bg-surface-secondary/30 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
        />

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={() => onConfirm(reason.trim() ? reason.trim() : undefined)}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const FailedActionsTab: React.FC<FailedActionsTabProps> = ({
  items,
  isLoading,
  isError,
  busyRunIds,
  onRetryLoad,
  onRetryAction,
  onRetryAll,
  onEscalate,
  onDismiss,
  onUndismiss,
}) => {
  const { openModal, closeModal } = useModal();
  const emptyGuid = '00000000-0000-0000-0000-000000000000';
  const [expandedRunIds, setExpandedRunIds] = React.useState<Set<string>>(new Set());

  const openReasonModal = React.useCallback(
    (
      config: {
        title: string;
        description: string;
        confirmLabel: string;
        runId: string;
        onSubmit: (runId: string, reason?: string) => void;
      },
    ) => {
      openModal(
        <ReasonModal
          title={config.title}
          description={config.description}
          confirmLabel={config.confirmLabel}
          onClose={closeModal}
          onConfirm={(reason) => {
            closeModal();
            config.onSubmit(config.runId, reason);
          }}
        />,
      );
    },
    [openModal, closeModal],
  );

  if (isLoading) {
    return <div className="text-text-muted">Loading failed actions...</div>;
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-error/40 bg-error/10 p-4">
        <p className="text-error font-medium">Failed to load failed actions.</p>
        <Button size="sm" className="mt-3" onClick={onRetryLoad}>
          Retry
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border-primary/30 bg-surface-secondary/20 p-10 text-center">
        <p className="font-semibold text-text-primary">No failures</p>
        <p className="mt-2 text-text-muted">
          All approved actions have executed successfully.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border-primary/30">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-secondary/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Customer</th>
              <th className="w-[120px] px-4 py-3 text-right text-xs font-semibold text-text-secondary">Amount</th>
              <th className="w-[220px] px-4 py-3 text-left text-xs font-semibold text-text-secondary">Failed action</th>
              <th className="w-[130px] px-4 py-3 text-left text-xs font-semibold text-text-secondary">Failed at</th>
              <th className="w-[340px] px-4 py-3 text-right text-xs font-semibold text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary/20 bg-surface-primary/70">
            {items.map((item) => {
              const isExpanded = expandedRunIds.has(item.runId);
              const isBusy = busyRunIds.has(item.runId);
              const isDismissed = item.outcomeStatus === 'Dismissed';
              const hasRetryableAction = item.failedActionId !== emptyGuid && !isDismissed;
              const ageColors = getAgeColorClasses(item.failedAt);

              return (
                <React.Fragment key={`${item.runId}-${item.failedActionId}`}>
                  <tr className={`border-l-4 ${ageColors.border} ${ageColors.row} hover:bg-surface-secondary/40`}>
                    <td className="px-4 py-3 align-top">
                      <button
                        type="button"
                        className="text-left"
                        onClick={() =>
                          setExpandedRunIds((previous) => {
                            const next = new Set(previous);
                            if (next.has(item.runId)) {
                              next.delete(item.runId);
                            } else {
                              next.add(item.runId);
                            }
                            return next;
                          })
                        }
                      >
                        <p className="font-semibold text-text-primary">{item.customerName}</p>
                        <p className="text-xs text-text-muted">{item.playbookName} - {item.reason}</p>
                      </button>
                    </td>
                    <td className="px-4 py-3 align-top text-right font-semibold text-text-primary">
                      {formatCurrency(item.potentialValue, item.currencyCode)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className={`text-sm font-semibold ${isDismissed ? 'text-text-secondary' : 'text-error'}`}>
                        {item.failedActionType}
                      </p>
                      <p className="text-xs text-text-muted">{item.errorDetails}</p>
                      {isDismissed && (
                        <p className="mt-1 text-xs text-text-secondary">
                          Dismiss reason: {item.dismissalReason ?? 'No reason provided.'}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`text-xs font-medium ${ageColors.text}`}>
                        {formatRelativeAge(item.failedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {isDismissed ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              openReasonModal({
                                title: 'Restore dismissed failure',
                                description: `Optionally add a reason before restoring ${item.customerName} to the failed queue.`,
                                confirmLabel: 'Undismiss',
                                runId: item.runId,
                                onSubmit: onUndismiss,
                              });
                            }}
                            disabled={isBusy}
                          >
                            Undismiss
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              onClick={() => onRetryAction(item.runId, item.failedActionId)}
                              disabled={isBusy || !hasRetryableAction}
                              title={hasRetryableAction ? undefined : 'No individual failed action is available for retry.'}
                            >
                              Retry
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onRetryAll(item.runId)}
                              disabled={isBusy}
                            >
                              Retry all
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                openReasonModal({
                                  title: 'Escalate failed run',
                                  description: `Add details for the escalation of ${item.customerName}.`,
                                  confirmLabel: 'Escalate',
                                  runId: item.runId,
                                  onSubmit: onEscalate,
                                });
                              }}
                              disabled={isBusy}
                            >
                              Escalate
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                openReasonModal({
                                  title: 'Dismiss failed run',
                                  description: `Add a reason before moving ${item.customerName} to dismissed outcomes.`,
                                  confirmLabel: 'Dismiss',
                                  runId: item.runId,
                                  onSubmit: onDismiss,
                                });
                              }}
                              disabled={isBusy}
                            >
                              Dismiss
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={5} className="bg-surface-secondary/15 px-4 py-3">
                        <ActionTimeline runId={item.runId} />
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
          const isExpanded = expandedRunIds.has(item.runId);
          const isBusy = busyRunIds.has(item.runId);
          const isDismissed = item.outcomeStatus === 'Dismissed';
          const hasRetryableAction = item.failedActionId !== emptyGuid && !isDismissed;
          const ageColors = getAgeColorClasses(item.failedAt);

          return (
            <div
              key={`${item.runId}-${item.failedActionId}`}
              className={`rounded-xl border-l-4 ${ageColors.border} border border-border-primary/30 bg-surface-primary p-4`}
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() =>
                  setExpandedRunIds((previous) => {
                    const next = new Set(previous);
                    if (next.has(item.runId)) {
                      next.delete(item.runId);
                    } else {
                      next.add(item.runId);
                    }
                    return next;
                  })
                }
              >
                <p className="font-semibold text-text-primary">{item.customerName}</p>
                <p className="text-xs text-text-muted mt-1">{item.failedActionType} - {item.errorDetails}</p>
                {isDismissed && (
                  <p className="text-xs text-text-secondary mt-1">Dismiss reason: {item.dismissalReason ?? 'No reason provided.'}</p>
                )}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-primary">{formatCurrency(item.potentialValue, item.currencyCode)}</span>
                  <span className={ageColors.text}>{formatRelativeAge(item.failedAt)}</span>
                </div>
              </button>

              <div className="mt-3 flex flex-wrap gap-2">
                {isDismissed ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      openReasonModal({
                        title: 'Restore dismissed failure',
                        description: `Optionally add a reason before restoring ${item.customerName} to the failed queue.`,
                        confirmLabel: 'Undismiss',
                        runId: item.runId,
                        onSubmit: onUndismiss,
                      })
                    }
                    disabled={isBusy}
                  >
                    Undismiss
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onRetryAction(item.runId, item.failedActionId)}
                      disabled={isBusy || !hasRetryableAction}
                      title={hasRetryableAction ? undefined : 'No individual failed action is available for retry.'}
                    >
                      Retry
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onRetryAll(item.runId)} disabled={isBusy}>
                      Retry all
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        openReasonModal({
                          title: 'Escalate failed run',
                          description: `Add details for the escalation of ${item.customerName}.`,
                          confirmLabel: 'Escalate',
                          runId: item.runId,
                          onSubmit: onEscalate,
                        })
                      }
                      disabled={isBusy}
                    >
                      Escalate
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        openReasonModal({
                          title: 'Dismiss failed run',
                          description: `Add a reason before moving ${item.customerName} to dismissed outcomes.`,
                          confirmLabel: 'Dismiss',
                          runId: item.runId,
                          onSubmit: onDismiss,
                        })
                      }
                      disabled={isBusy}
                    >
                      Dismiss
                    </Button>
                  </>
                )}
              </div>

              {isExpanded && (
                <div className="mt-3">
                  <ActionTimeline runId={item.runId} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
