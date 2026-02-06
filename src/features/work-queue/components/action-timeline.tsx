import React from 'react';
import { Loader2, AlertCircle, CheckCircle2, Clock3 } from 'lucide-react';
import { useGetPlaybookRunActions } from '@/features/work-queue/api/work-queue';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/utils/customer-helpers';

type ActionTimelineProps = {
  runId: string;
};

const getStatusIcon = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === 'failed') {
    return <AlertCircle className="h-4 w-4 text-error" />;
  }
  if (normalized === 'dismissed') {
    return <Clock3 className="h-4 w-4 text-text-muted" />;
  }
  if (normalized === 'completed' || normalized === 'succeeded' || normalized === 'skipped') {
    return <CheckCircle2 className="h-4 w-4 text-success" />;
  }
  return <Clock3 className="h-4 w-4 text-accent-primary" />;
};

const getStatusLabelClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === 'failed') {
    return 'text-error bg-error/10 border-error/30';
  }
  if (normalized === 'dismissed') {
    return 'text-text-secondary bg-surface-secondary/40 border-border-primary/40';
  }
  if (normalized === 'completed' || normalized === 'succeeded' || normalized === 'skipped') {
    return 'text-success bg-success/10 border-success/30';
  }
  return 'text-accent-primary bg-accent-primary/10 border-accent-primary/30';
};

export const ActionTimeline: React.FC<ActionTimelineProps> = ({ runId }) => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGetPlaybookRunActions(runId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading action timeline...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-error/30 bg-error/10 p-3">
        <p className="text-sm text-error font-medium">Failed to load timeline.</p>
        <Button size="sm" variant="ghost" className="mt-2" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data || data.actions.length === 0) {
    return (
      <div className="text-sm text-text-muted">
        No action execution logs available yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.actions.map((action) => (
        <div
          key={action.actionId}
          className="rounded-lg border border-border-primary/30 bg-surface-secondary/20 p-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(action.status)}
              <span className="font-medium text-text-primary">{action.actionType}</span>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${getStatusLabelClass(
                  action.status,
                )}`}
              >
                {action.status}
              </span>
            </div>
            <span className="text-xs text-text-muted">
              {formatDateTime(action.timestamp)}
            </span>
          </div>

          <div className="mt-2 text-xs text-text-secondary">
            Attempt {action.attemptCount}
          </div>

          {action.errorMessage && (
            <div className="mt-2 text-xs text-error">
              {action.errorCode ? `${action.errorCode}: ` : ''}
              {action.errorMessage}
            </div>
          )}

          {action.detailsJson && (
            <pre className="mt-2 overflow-x-auto rounded bg-surface-secondary/40 p-2 text-[11px] text-text-muted">
              {action.detailsJson}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
};
