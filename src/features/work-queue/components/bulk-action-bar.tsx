import React from 'react';
import { Button } from '@/components/ui/button';

type BulkActionBarProps = {
  selectedCount: number;
  isBusy: boolean;
  snoozeHours: number;
  onSnoozeHoursChange: (hours: number) => void;
  onApproveAll: () => void;
  onSnoozeAll: () => void;
  onDismissAll: () => void;
  onClear: () => void;
};

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  isBusy,
  snoozeHours,
  onSnoozeHoursChange,
  onApproveAll,
  onSnoozeAll,
  onDismissAll,
  onClear,
}) => {
  const [confirmDismiss, setConfirmDismiss] = React.useState(false);

  React.useEffect(() => {
    if (selectedCount === 0) {
      setConfirmDismiss(false);
    }
  }, [selectedCount]);

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="sticky bottom-4 z-20 rounded-xl border border-border-primary/40 bg-surface-primary/95 backdrop-blur px-4 py-3 shadow-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">{selectedCount}</span> selected
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={onApproveAll} disabled={isBusy}>
            Approve all
          </Button>
          <select
            value={String(snoozeHours)}
            onChange={(event) => onSnoozeHoursChange(Number(event.target.value))}
            className="h-8 rounded-md border border-border-primary/40 bg-surface-secondary/50 px-2 text-xs text-text-primary"
          >
            <option value="1">1h</option>
            <option value="4">4h</option>
            <option value="24">24h</option>
          </select>
          <Button size="sm" variant="outline" onClick={onSnoozeAll} disabled={isBusy}>
            Snooze all
          </Button>
          <Button
            size="sm"
            variant={confirmDismiss ? 'warning' : 'ghost'}
            onClick={() => {
              if (!confirmDismiss) {
                setConfirmDismiss(true);
                return;
              }
              onDismissAll();
            }}
            disabled={isBusy}
          >
            {confirmDismiss ? 'Confirm dismiss' : 'Dismiss all'}
          </Button>
          <Button size="sm" variant="ghost" onClick={onClear} disabled={isBusy}>
            Deselect
          </Button>
        </div>
      </div>
    </div>
  );
};
