import React from 'react';

type SegmentOption = {
  id: string;
  name: string;
  customerCount?: number;
};

type ImpactSegmentFilterProps = {
  segments: SegmentOption[];
  selectedSegmentId?: string;
  onChange: (segmentId?: string) => void;
  isLoading?: boolean;
};

export const ImpactSegmentFilter: React.FC<ImpactSegmentFilterProps> = ({
  segments,
  selectedSegmentId,
  onChange,
  isLoading,
}) => {
  return (
    <div className="min-w-[200px]">
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-text-muted">
        Segment
      </label>
      <select
        value={selectedSegmentId ?? ''}
        onChange={(event) => onChange(event.target.value || undefined)}
        disabled={isLoading}
        className="h-10 w-full rounded-lg border border-border-primary/40 bg-surface-secondary/50 px-3 text-sm text-text-primary focus:border-accent-primary focus:outline-none disabled:opacity-60"
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
  );
};

