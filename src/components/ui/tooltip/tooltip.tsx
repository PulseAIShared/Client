import React from 'react';
import { cn } from '@/utils/cn';

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  widthClassName?: string; // optional override for tooltip width
};

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className, side = 'top', widthClassName }) => {
  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  } as const;

  const arrowSideClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-surface-primary/90',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-surface-primary/90',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-surface-primary/90',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-surface-primary/90',
  } as const;

  return (
    <span className={cn('relative inline-flex group', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100',
          'absolute z-50 text-xs text-text-secondary bg-surface-primary/90 border border-border-primary/50 rounded-md px-3 py-2 shadow-lg backdrop-blur',
          'whitespace-pre-wrap break-words leading-snug',
          widthClassName ?? 'min-w-[240px] max-w-sm',
          sideClasses[side]
        )}
      >
        {content}
        <span
          className={cn(
            'absolute w-0 h-0 border-8 border-transparent',
            arrowSideClasses[side]
          )}
        />
      </span>
    </span>
  );
};

export default Tooltip;


