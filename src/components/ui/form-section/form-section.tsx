import * as React from 'react';
import { cn } from '@/utils/cn';

type FormSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
};

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className,
  action,
}) => {
  return (
    <div
      className={cn(
        'bg-surface-primary/80 backdrop-blur-xl rounded-2xl',
        'border border-border-primary/30 shadow-xl',
        'p-6 sm:p-8',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-text-muted mt-1">
              {description}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
};
