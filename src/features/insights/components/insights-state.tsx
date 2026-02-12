import React from 'react';
import { Link } from 'react-router-dom';

type InsightsLoadingStateProps = {
  cardCount?: number;
  blockHeights?: number[];
};

type InsightsErrorStateProps = {
  title: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
};

type InsightsEmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  compact?: boolean;
};

export const InsightsLoadingState: React.FC<InsightsLoadingStateProps> = ({
  cardCount = 0,
  blockHeights = [],
}) => {
  return (
    <div className="space-y-6">
      {cardCount > 0 && (
        <div className={`grid gap-4 ${cardCount <= 4 ? 'grid-cols-2 xl:grid-cols-4' : 'grid-cols-2 lg:grid-cols-5'}`}>
          {Array.from({ length: cardCount }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-2xl border border-border-primary/30 bg-surface-primary/80 animate-pulse"
            />
          ))}
        </div>
      )}

      {blockHeights.map((height, index) => (
        <div
          key={`${height}-${index}`}
          className="rounded-2xl border border-border-primary/30 bg-surface-primary/80 animate-pulse"
          style={{ height }}
        />
      ))}
    </div>
  );
};

export const InsightsErrorState: React.FC<InsightsErrorStateProps> = ({
  title,
  description,
  retryLabel = 'Retry',
  onRetry,
}) => {
  return (
    <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
        <svg className="h-7 w-7 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-7.5 4h15c1.3 0 2.11-1.4 1.46-2.5l-7.5-13c-.65-1.1-2.27-1.1-2.92 0l-7.5 13C2.39 17.6 3.2 19 4.5 19z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-muted">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg border border-border-primary/40 bg-surface-secondary/40 px-4 py-2 text-sm font-medium text-text-primary hover:border-accent-primary/40"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
};

export const InsightsEmptyState: React.FC<InsightsEmptyStateProps> = ({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  compact = false,
}) => {
  const containerClass = compact
    ? 'rounded-xl border border-border-primary/30 bg-surface-secondary/20 p-4 text-center'
    : 'rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-8 text-center';

  return (
    <div className={containerClass}>
      <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-text-primary`}>{title}</h3>
      <p className="mt-2 text-sm text-text-muted">{description}</p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          onClick={onAction}
          className="mt-4 inline-flex rounded-lg border border-accent-primary/35 bg-accent-primary/10 px-3 py-1.5 text-xs font-semibold text-accent-primary hover:border-accent-primary/60"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && !actionTo && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex rounded-lg border border-accent-primary/35 bg-accent-primary/10 px-3 py-1.5 text-xs font-semibold text-accent-primary hover:border-accent-primary/60"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
