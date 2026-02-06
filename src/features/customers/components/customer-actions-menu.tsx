import { useState } from 'react';
import { PlaybookListItem, SegmentListItem } from '@/types/api';

type CustomerActionsMenuProps = {
  customerId: string;
  customerName: string;
  segments: SegmentListItem[];
  playbooks: PlaybookListItem[];
  onViewDetails: (customerId: string) => void;
  onAddToSegment: (customerIds: string[], segmentId: string) => void;
  onTriggerPlaybook: (customerIds: string[], playbookId: string) => void;
  onAddToWorkQueue: (customerIds: string[]) => void;
  onDeleteCustomer: (customerId: string) => void;
};

export const CustomerActionsMenu = ({
  customerId,
  customerName,
  segments,
  playbooks,
  onViewDetails,
  onAddToSegment,
  onTriggerPlaybook,
  onAddToWorkQueue,
  onDeleteCustomer,
}: CustomerActionsMenuProps) => {
  const [segmentId, setSegmentId] = useState('');
  const [playbookId, setPlaybookId] = useState('');

  return (
    <details className="relative">
      <summary className="list-none cursor-pointer rounded-md p-2 text-text-muted hover:bg-surface-secondary/50 hover:text-text-primary">
        <span className="text-lg leading-none">...</span>
      </summary>

      <div className="absolute right-0 top-10 z-20 w-60 rounded-lg border border-border-primary/40 bg-surface-primary p-3 shadow-xl">
        <div className="mb-2 text-xs font-semibold text-text-muted">
          {customerName}
        </div>

        <button
          className="mb-2 w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-secondary/60"
          onClick={() => onViewDetails(customerId)}
        >
          View Details
        </button>

        <div className="mb-2 space-y-1">
          <div className="text-xs text-text-muted">Add to Segment</div>
          <div className="flex gap-1">
            <select
              value={segmentId}
              onChange={(event) => setSegmentId(event.target.value)}
              className="h-8 flex-1 rounded border border-border-primary/40 bg-surface-secondary/50 px-2 text-xs"
            >
              <option value="">Select</option>
              {segments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                </option>
              ))}
            </select>
            <button
              className="h-8 rounded bg-accent-primary/15 px-2 text-xs text-accent-primary disabled:opacity-50"
              disabled={!segmentId}
              onClick={() => onAddToSegment([customerId], segmentId)}
            >
              Add
            </button>
          </div>
        </div>

        <div className="mb-2 space-y-1">
          <div className="text-xs text-text-muted">Trigger Playbook</div>
          <div className="flex gap-1">
            <select
              value={playbookId}
              onChange={(event) => setPlaybookId(event.target.value)}
              className="h-8 flex-1 rounded border border-border-primary/40 bg-surface-secondary/50 px-2 text-xs"
            >
              <option value="">Select</option>
              {playbooks.map((playbook) => (
                <option key={playbook.id} value={playbook.id}>
                  {playbook.name}
                </option>
              ))}
            </select>
            <button
              className="h-8 rounded bg-warning/15 px-2 text-xs text-warning disabled:opacity-50"
              disabled={!playbookId}
              onClick={() => onTriggerPlaybook([customerId], playbookId)}
            >
              Run
            </button>
          </div>
        </div>

        <button
          className="mb-2 w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-secondary/60"
          onClick={() => onAddToWorkQueue([customerId])}
        >
          Create Work Queue Item
        </button>

        <div className="my-2 h-px bg-border-primary/50" />

        <button
          className="w-full rounded-md px-2 py-1.5 text-left text-sm text-error hover:bg-error/10"
          onClick={() => onDeleteCustomer(customerId)}
        >
          Delete Customer
        </button>
      </div>
    </details>
  );
};

