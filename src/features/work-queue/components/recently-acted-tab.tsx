import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { RecentlyActedItem } from '@/types/playbooks';
import { formatCurrency } from '@/utils/format-currency';
import { formatRelativeAge } from '@/features/work-queue/utils';
import { ActionTimeline } from '@/features/work-queue/components/action-timeline';
import { Button } from '@/components/ui/button';

type RecentlyActedTabProps = {
  items: RecentlyActedItem[];
  isLoading: boolean;
  isError: boolean;
  currentUserId?: string | null;
  onRetryLoad: () => void;
};

const badgeClassByDecision: Record<string, string> = {
  Approved: 'bg-success/10 text-success border-success/30',
  Dismissed: 'bg-surface-secondary/60 text-text-secondary border-border-primary/40',
  Snoozed: 'bg-accent-primary/10 text-accent-primary border-accent-primary/30',
};

const badgeClassByOutcome: Record<string, string> = {
  Executing: 'bg-accent-primary/10 text-accent-primary border-accent-primary/30',
  Succeeded: 'bg-success/10 text-success border-success/30',
  PartiallyFailed: 'bg-warning/10 text-warning border-warning/30',
  Failed: 'bg-error/10 text-error border-error/30',
  Dismissed: 'bg-surface-secondary/60 text-text-secondary border-border-primary/40',
  Snoozed: 'bg-accent-primary/10 text-accent-primary border-accent-primary/30',
};

export const RecentlyActedTab: React.FC<RecentlyActedTabProps> = ({
  items,
  isLoading,
  isError,
  currentUserId,
  onRetryLoad,
}) => {
  const [expandedRunIds, setExpandedRunIds] = React.useState<Set<string>>(new Set());

  if (isLoading) {
    return <div className="text-text-muted">Loading recent activity...</div>;
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-error/40 bg-error/10 p-4">
        <p className="text-error font-medium">Failed to load recently acted items.</p>
        <Button size="sm" className="mt-3" onClick={onRetryLoad}>
          Retry
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border-primary/30 bg-surface-secondary/20 p-10 text-center">
        <p className="font-semibold text-text-primary">No recent activity</p>
        <p className="mt-2 text-text-muted">
          Items you approve, dismiss, or snooze appear here for 48 hours.
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
              <th className="w-[110px] px-4 py-3 text-right text-xs font-semibold text-text-secondary">Amount</th>
              <th className="w-[120px] px-4 py-3 text-left text-xs font-semibold text-text-secondary">Decision</th>
              <th className="w-[130px] px-4 py-3 text-left text-xs font-semibold text-text-secondary">Acted by</th>
              <th className="w-[130px] px-4 py-3 text-left text-xs font-semibold text-text-secondary">Acted at</th>
              <th className="w-[160px] px-4 py-3 text-left text-xs font-semibold text-text-secondary">Outcome</th>
              <th className="w-[60px] px-4 py-3 text-right text-xs font-semibold text-text-secondary">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary/20 bg-surface-primary/70">
            {items.map((item) => {
              const isExpanded = expandedRunIds.has(item.runId);
              return (
                <React.Fragment key={item.runId}>
                  <tr className="hover:bg-surface-secondary/40 transition-colors">
                    <td className="px-4 py-3 align-top">
                      <p className="font-semibold text-text-primary">{item.customerName}</p>
                      <p className="text-xs text-text-muted">
                        {item.playbookName} · {item.reason}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top text-right font-semibold text-text-primary">
                      {formatCurrency(item.potentialValue, item.currencyCode)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClassByDecision[item.decision]}`}>
                        {item.decision}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-text-secondary">
                      {currentUserId && item.actedByUserId === currentUserId ? 'You' : item.actedByName}
                    </td>
                    <td className="px-4 py-3 align-top text-text-secondary text-xs">
                      {formatRelativeAge(item.actedAt)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClassByOutcome[item.outcomeStatus]}`}>
                        {item.outcomeStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <Button
                        size="sm"
                        variant="ghost"
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
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="bg-surface-secondary/15 px-4 py-3">
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
          return (
            <div key={item.runId} className="rounded-xl border border-border-primary/30 bg-surface-primary p-4">
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
                <p className="text-xs text-text-muted mt-1">
                  {item.playbookName} · {item.reason}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 ${badgeClassByDecision[item.decision]}`}>
                    {item.decision}
                  </span>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 ${badgeClassByOutcome[item.outcomeStatus]}`}>
                    {item.outcomeStatus}
                  </span>
                  <span className="text-text-muted">{formatRelativeAge(item.actedAt)}</span>
                </div>
              </button>

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

