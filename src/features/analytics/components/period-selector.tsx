import React, { useEffect, useState } from 'react';
import { ImpactPeriodPreset, ImpactPeriodState } from '@/features/analytics/utils/impact-period';

type PeriodSelectorProps = {
  value: ImpactPeriodState;
  onChange: (next: ImpactPeriodState) => void;
};

const periodOptions: Array<{ value: ImpactPeriodPreset; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom range' },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ value, onChange }) => {
  const [customFrom, setCustomFrom] = useState(value.from ?? '');
  const [customTo, setCustomTo] = useState(value.to ?? '');

  useEffect(() => {
    if (value.period !== 'custom') {
      return;
    }

    setCustomFrom(value.from ?? '');
    setCustomTo(value.to ?? '');
  }, [value.from, value.period, value.to]);

  const hasValidCustomRange = Boolean(
    customFrom
    && customTo
    && customFrom <= customTo,
  );

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
      <div className="min-w-[170px]">
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-text-muted">
          Period
        </label>
        <select
          value={value.period}
          onChange={(event) => {
            const nextPeriod = event.target.value as ImpactPeriodPreset;
            if (nextPeriod === 'custom') {
              onChange({
                period: nextPeriod,
                from: customFrom || undefined,
                to: customTo || undefined,
              });
              return;
            }

            onChange({ period: nextPeriod });
          }}
          className="h-10 w-full rounded-lg border border-border-primary/40 bg-surface-secondary/50 px-3 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
        >
          {periodOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {value.period === 'custom' && (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-text-muted">
              From
            </label>
            <input
              type="date"
              value={customFrom}
              onChange={(event) => setCustomFrom(event.target.value)}
              className="h-10 rounded-lg border border-border-primary/40 bg-surface-secondary/50 px-3 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-text-muted">
              To
            </label>
            <input
              type="date"
              value={customTo}
              onChange={(event) => setCustomTo(event.target.value)}
              className="h-10 rounded-lg border border-border-primary/40 bg-surface-secondary/50 px-3 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <button
            type="button"
            disabled={!hasValidCustomRange}
            onClick={() =>
              onChange({
                period: 'custom',
                from: customFrom || undefined,
                to: customTo || undefined,
              })
            }
            className="h-10 rounded-lg border border-border-primary/40 bg-surface-secondary/50 px-3 text-sm text-text-primary hover:border-accent-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply
          </button>
        </>
      )}
    </div>
  );
};

