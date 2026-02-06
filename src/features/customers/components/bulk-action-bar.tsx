import { PlaybookListItem, SegmentListItem } from '@/types/api';

type BulkActionBarProps = {
  selectedCount: number;
  totalMatching: number;
  isAllMatchingSelected: boolean;
  segments: SegmentListItem[];
  playbooks: PlaybookListItem[];
  onSelectAllMatching: () => void;
  onClearSelection: () => void;
  onAddToSegment: (segmentId: string) => void;
  onTriggerPlaybook: (playbookId: string) => void;
  onAddToWorkQueue: () => void;
  onExportSelected: () => void;
  onDeleteSelected: () => void;
};

export const BulkActionBar = ({
  selectedCount,
  totalMatching,
  isAllMatchingSelected,
  segments,
  playbooks,
  onSelectAllMatching,
  onClearSelection,
  onAddToSegment,
  onTriggerPlaybook,
  onAddToWorkQueue,
  onExportSelected,
  onDeleteSelected,
}: BulkActionBarProps) => {
  return (
    <div className="rounded-xl border border-border-primary/40 bg-surface-secondary/45 p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">
            {selectedCount} customer{selectedCount === 1 ? '' : 's'} selected
          </span>
          {selectedCount > 0
          && selectedCount < totalMatching
          && totalMatching > selectedCount
          && !isAllMatchingSelected && (
            <button
              className="text-accent-primary hover:underline"
              onClick={onSelectAllMatching}
            >
              Select all {totalMatching} matching customers
            </button>
          )}
          <button className="text-text-muted hover:text-text-primary" onClick={onClearSelection}>
            Clear
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-9 rounded-lg border border-border-primary/40 bg-surface-primary px-2 text-xs"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) {
                onAddToSegment(event.target.value);
                event.target.value = '';
              }
            }}
          >
            <option value="">Add to Segment</option>
            {segments.map((segment) => (
              <option key={segment.id} value={segment.id}>{segment.name}</option>
            ))}
          </select>

          <select
            className="h-9 rounded-lg border border-border-primary/40 bg-surface-primary px-2 text-xs"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) {
                onTriggerPlaybook(event.target.value);
                event.target.value = '';
              }
            }}
          >
            <option value="">Trigger Playbook</option>
            {playbooks.map((playbook) => (
              <option key={playbook.id} value={playbook.id}>{playbook.name}</option>
            ))}
          </select>

          <button
            className="h-9 rounded-lg border border-border-primary/40 bg-surface-primary px-3 text-xs hover:border-accent-primary/40"
            onClick={onAddToWorkQueue}
          >
            Add to Work Queue
          </button>

          <button
            className="h-9 rounded-lg border border-border-primary/40 bg-surface-primary px-3 text-xs hover:border-accent-primary/40"
            onClick={onExportSelected}
          >
            Export Selected
          </button>

          <button
            className="h-9 rounded-lg border border-error/40 bg-error/10 px-3 text-xs text-error hover:bg-error/20"
            onClick={onDeleteSelected}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

