import { Link } from 'react-router-dom';

type SegmentEmptyStateProps = {
  segmentName?: string;
  onClearFilter: () => void;
};

export const SegmentEmptyState = ({ segmentName, onClearFilter }: SegmentEmptyStateProps) => {
  return (
    <div className="rounded-2xl border border-border-primary/40 bg-surface-primary/80 backdrop-blur-lg p-8 sm:p-10 shadow-lg">
      <div className="mx-auto max-w-2xl text-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-warning/15 text-warning-muted">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 01.8 1.6L14 13.5V20a1 1 0 01-1.447.894l-2-1A1 1 0 0110 19v-5.5L3.2 4.6A1 1 0 013 4z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-text-primary">
          {segmentName ? `No customers currently match "${segmentName}"` : 'No customers match this segment'}
        </h2>
        <p className="text-text-muted">
          This segment filter is active, but there are no customers in scope right now. Try a different segment
          or clear the filter to return to the full dashboard.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClearFilter}
            className="inline-flex items-center justify-center rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-white hover:bg-accent-secondary transition-colors"
          >
            Clear Segment Filter
          </button>
          <Link
            to="/app/segments"
            className="inline-flex items-center justify-center rounded-lg border border-border-primary/50 bg-surface-secondary/40 px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-secondary transition-colors"
          >
            Manage Segments
          </Link>
        </div>
      </div>
    </div>
  );
};
