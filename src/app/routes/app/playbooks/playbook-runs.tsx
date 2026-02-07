import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppPageHeader, ContentLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { useGetPlaybook, useGetPlaybookRuns } from '@/features/playbooks/api/playbooks';
import { ConfidenceBadge, LifecycleBadge, OutcomeBadge } from '@/features/playbooks/components';
import { formatDateTime } from '@/utils/customer-helpers';

export const PlaybookRunsRoute = () => {
  const { playbookId } = useParams<{ playbookId: string }>();
  const { data: playbook } = useGetPlaybook(playbookId);
  const { data: runs, isLoading, error } = useGetPlaybookRuns(playbookId);

  if (!playbookId) {
    return (
      <ContentLayout>
        <div className="text-text-muted">Playbook not found.</div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <AppPageHeader
          title={playbook?.name ?? 'Playbook runs'}
          description="History of executions and outcomes."
          compact
          actions={(
            <Link to={`/app/playbooks/${playbookId}`}>
              <Button variant="outline">Back to playbook</Button>
            </Link>
          )}
        />

        <div className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl p-6 sm:p-8">
          {isLoading && <div className="text-text-muted">Loading runs...</div>}
          {error && <div className="text-error">Failed to load playbook runs.</div>}

          {!isLoading && runs && runs.length === 0 && (
            <div className="text-text-muted">No runs yet.</div>
          )}

          {runs && runs.length > 0 && (
            <div className="space-y-4">
              {runs.map((run) => (
                <div
                  key={run.id}
                  className="border border-border-primary/30 rounded-2xl p-4 bg-surface-secondary/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-text-primary font-semibold">{run.customerName}</div>
                      <div className="text-xs text-text-muted">
                        Created {formatDateTime(run.createdAt)} · {run.reasonShort}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <LifecycleBadge status={run.lifecycleStatus} />
                      <OutcomeBadge outcome={run.outcome} />
                      <ConfidenceBadge confidence={run.confidence} />
                      <span className="text-sm text-text-muted">
                        {run.potentialValue ? `$${run.potentialValue.toLocaleString()}` : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-text-muted">
                    Decision summary JSON available on the run detail endpoint.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ContentLayout>
  );
};
