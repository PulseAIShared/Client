import React from 'react';
import { DashboardSegmentOption } from '@/features/dashboard/api/dashboard';

type SegmentFilterProps = {
  segments: DashboardSegmentOption[];
  selectedSegmentId?: string;
  onChange: (segmentId?: string) => void;
  isLoading?: boolean;
};

export const SegmentFilter: React.FC<SegmentFilterProps> = ({
  segments,
  selectedSegmentId,
  onChange,
  isLoading,
}) => {
  return (
    <div className="bg-surface-primary/60 backdrop-blur-lg p-4 rounded-xl border border-border-primary/30">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold text-text-primary">Segment view</div>
          <div className="text-xs text-text-muted">
            Apply a segment lens across dashboard metrics.
          </div>
        </div>

        <div className="min-w-[240px]">
          <select
            value={selectedSegmentId ?? ''}
            onChange={(event) => onChange(event.target.value || undefined)}
            disabled={isLoading}
            className="w-full rounded-lg border border-border-primary/40 bg-surface-secondary/50 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none disabled:opacity-60"
          >
            <option value="">All customers</option>
            {segments.map((segment) => (
              <option key={segment.id} value={segment.id}>
                {segment.name}
                {typeof segment.customerCount === 'number'
                  ? ` (${segment.customerCount})`
                  : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
