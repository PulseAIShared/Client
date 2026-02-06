import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const QueueEmptyState: React.FC = () => {
  return (
    <div className="bg-surface-secondary/40 border border-border-primary/30 rounded-2xl p-10 text-center">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <p className="text-text-primary font-semibold mb-2">All caught up!</p>
      <p className="text-text-muted">
        No pending approvals right now. New items will appear here when playbooks trigger in
        approval mode.
      </p>
    </div>
  );
};
