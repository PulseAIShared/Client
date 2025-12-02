import React from 'react';
import { Link } from 'react-router-dom';

interface SegmentWatchlistCardProps {
  segments?: Array<{ name: string; value: number; customers: number; color: string }>;
  isLoading?: boolean;
}

export const SegmentWatchlistCard: React.FC<SegmentWatchlistCardProps> = ({
  segments = [],
  isLoading,
}) => {

  return (
    <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Segment Watchlist</h3>
          <p className="text-sm text-text-muted">Pinned segments at a glance</p>
        </div>
        <Link to="/app/segments" className="text-sm text-accent-primary hover:underline">Manage</Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-secondary/40 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 flex-1 content-start">
          {segments.slice(0, 6).map((s: any) => (
            <Link key={s.name} to="/app/segments" className="group block p-5 bg-surface-secondary/30 rounded-2xl border border-border-primary/30 hover:border-accent-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-text-primary truncate group-hover:text-accent-primary">{s.name}</div>
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              </div>
              <div className="text-sm text-text-muted">{Number(s.customers || 0).toLocaleString()} customers</div>
            </Link>
          ))}
          {segments.length === 0 && (
            <div className="p-6 text-center text-sm text-text-muted bg-surface-secondary/30 rounded-2xl border border-border-primary/30">
              No pinned segments yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};


