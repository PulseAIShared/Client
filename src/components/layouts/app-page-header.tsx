import React from 'react';
import { cn } from '@/utils/cn';

type AppPageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export const AppPageHeader = ({
  title,
  description,
  actions,
  filters,
  className,
  compact = false,
}: AppPageHeaderProps) => {
  return (
    <div
      className={cn(
        'bg-surface-primary/80 backdrop-blur-lg rounded-2xl border border-border-primary/30 shadow-lg',
        compact ? 'p-4 sm:p-5' : 'p-6 sm:p-8',
        className,
      )}
    >
      <div className={cn(
        'flex flex-col gap-4',
        actions && 'sm:flex-row sm:items-center sm:justify-between',
      )}
      >
        <div>
          <h1 className={cn(
            'font-bold text-text-primary',
            compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl',
          )}
          >
            {title}
          </h1>
          {description && (
            <p className={cn(
              'text-text-muted',
              compact ? 'text-sm' : 'text-sm sm:text-base',
            )}
            >
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>

      {filters && (
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          {filters}
        </div>
      )}
    </div>
  );
};

