import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { DashboardWorkQueueSummary } from '@/types/api';

interface WorkQueueCardProps {
  workQueueSummary?: DashboardWorkQueueSummary;
  isLoading?: boolean;
}

export const WorkQueueCard: React.FC<WorkQueueCardProps> = ({
  workQueueSummary,
  isLoading,
}) => {
  const navigate = useNavigate();

  const items = useMemo(() => workQueueSummary?.topItems ?? [], [workQueueSummary]);

  return (
    <div className="bg-surface-primary/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Work Queue</h3>
          <p className="text-sm text-text-muted">Prioritized actions for today</p>
        </div>
        <Link to="/app/work-queue" className="text-sm text-accent-primary hover:underline">View queue</Link>
      </div>

      {workQueueSummary && !isLoading && (
        <div className="grid grid-cols-3 gap-3 text-xs text-text-muted mb-4">
          <div className="rounded-lg border border-border-primary/30 p-3">
            <div className="text-text-primary font-semibold text-sm">{workQueueSummary.pendingApprovals}</div>
            <div>Pending approvals</div>
          </div>
          <div className="rounded-lg border border-border-primary/30 p-3">
            <div className="text-text-primary font-semibold text-sm">{workQueueSummary.highValueCount}</div>
            <div>High value items</div>
          </div>
          <div className="rounded-lg border border-border-primary/30 p-3">
            <div className="text-text-primary font-semibold text-sm">
              ${workQueueSummary.revenueSavedLast7d.toLocaleString()}
            </div>
            <div>Saved last 7d</div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3 flex-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-surface-secondary/40 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle className="w-8 h-8 text-success mb-2" />
          <p className="text-sm text-text-muted">No urgent items. You're all caught up!</p>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="flex-1 overflow-y-auto pr-1">
          <ul className="divide-y divide-border-primary/30">
            {items.map((item) => (
              <li key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-text-primary truncate">{item.customerName}</div>
                  <div className="text-xs text-text-muted truncate">
                    {item.playbookName} · {item.reason}
                  </div>
                </div>
                <button
                  onClick={() => navigate('/app/work-queue')}
                  className="px-3.5 py-2 bg-accent-primary/15 text-accent-primary rounded-lg text-xs hover:bg-accent-primary/25 whitespace-nowrap"
                >
                  Review
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


