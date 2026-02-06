import { Link } from 'react-router-dom';
import { SegmentListItem } from '@/types/api';

type SegmentFilterProps = {
  segments: SegmentListItem[];
  selectedSegmentId?: string;
  onSegmentChange: (segmentId?: string) => void;
  disabled?: boolean;
};

export const SegmentFilter = ({
  segments,
  selectedSegmentId,
  onSegmentChange,
  disabled,
}: SegmentFilterProps) => {
  const hasSegments = segments.length > 0;

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedSegmentId ?? ''}
        disabled={disabled || !hasSegments}
        onChange={(event) => onSegmentChange(event.target.value || undefined)}
        className="h-10 min-w-44 rounded-lg border border-border-primary/40 bg-surface-primary/80 px-3 text-sm text-text-primary outline-none focus:border-accent-primary/50"
      >
        <option value="">{hasSegments ? 'All Customers' : 'No segments'}</option>
        {segments.map((segment) => (
          <option key={segment.id} value={segment.id}>
            {segment.name}
            {typeof segment.customerCount === 'number'
              ? ` (${segment.customerCount})`
              : ''}
          </option>
        ))}
      </select>

      {!hasSegments && (
        <Link
          to="/app/segments"
          className="text-xs text-accent-primary hover:underline"
        >
          Create segment
        </Link>
      )}
    </div>
  );
};

