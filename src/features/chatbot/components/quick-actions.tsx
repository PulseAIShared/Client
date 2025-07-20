import React, { useState } from 'react';
import { type QuickAction } from '../store';

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (action: QuickAction) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions, onActionClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (actions.length === 0) return null;

  const displayedActions = isExpanded ? actions : actions.slice(0, 3);
  const hasMoreActions = actions.length > 3;

  return (
    <div className="border-t border-border-primary bg-surface-secondary">
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 md:px-4 py-2 flex items-center justify-between hover:bg-surface-primary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm font-medium text-text-secondary">Quick Actions</span>
          {hasMoreActions && !isExpanded && (
            <span className="text-xs text-text-muted bg-surface-primary px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
              {actions.length}
            </span>
          )}
        </div>
        <svg 
          className={`w-3 h-3 md:w-4 md:h-4 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Actions Grid */}
      {isExpanded && (
        <div className="px-3 md:px-4 pb-3 md:pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {displayedActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onActionClick(action)}
                className="
                  px-2 md:px-3 py-2 text-xs md:text-sm
                  bg-surface-primary hover:bg-accent-primary/10
                  text-text-primary hover:text-accent-primary
                  border border-border-primary hover:border-accent-primary
                  rounded-lg
                  transition-all duration-200
                  flex items-center gap-2
                  text-left
                "
              >
                {action.icon && (
                  <span className="text-xs flex-shrink-0" role="img" aria-label={action.label}>
                    {action.icon}
                  </span>
                )}
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compact Actions Row (when collapsed) */}
      {!isExpanded && (
        <div className="px-3 md:px-4 pb-2 md:pb-3">
          <div className="flex gap-1.5 md:gap-2 overflow-x-auto">
            {displayedActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onActionClick(action)}
                className="
                  px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm
                  bg-surface-primary hover:bg-accent-primary/10
                  text-text-primary hover:text-accent-primary
                  border border-border-primary hover:border-accent-primary
                  rounded-md md:rounded-lg
                  transition-all duration-200
                  flex items-center gap-1 md:gap-2
                  whitespace-nowrap
                  flex-shrink-0
                "
              >
                {action.icon && (
                  <span className="text-xs" role="img" aria-label={action.label}>
                    {action.icon}
                  </span>
                )}
                <span className="text-xs">{action.label}</span>
              </button>
            ))}
            {hasMoreActions && (
              <button
                onClick={() => setIsExpanded(true)}
                className="
                  px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm
                  bg-accent-primary/10 hover:bg-accent-primary/20
                  text-accent-primary
                  border border-accent-primary/30 hover:border-accent-primary
                  rounded-md md:rounded-lg
                  transition-all duration-200
                  flex items-center gap-1
                  whitespace-nowrap
                  flex-shrink-0
                "
              >
                <span className="text-xs">+{actions.length - 3}</span>
                <span className="text-xs">More</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};