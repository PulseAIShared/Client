import React from 'react';
import { Tooltip } from '@/components/ui/tooltip';

type InsightsInfoTooltipProps = {
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
};

export const InsightsInfoTooltip: React.FC<InsightsInfoTooltipProps> = ({
  content,
  side = 'top',
}) => {
  return (
    <Tooltip content={content} side={side} widthClassName="min-w-[220px] max-w-[300px]">
      <span
        tabIndex={0}
        aria-label="More information"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border-primary/40 text-text-muted hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
    </Tooltip>
  );
};
