import React from 'react';
import { type QuickAction } from '../store';

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (action: QuickAction) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions, onActionClick }) => {
  if (actions.length === 0) return null;

  return (
    <div className="p-4 border-t border-border-primary">
      <h4 className="text-sm font-medium text-text-secondary mb-3">Quick Actions</h4>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action)}
            className="
              px-3 py-2 text-sm
              bg-surface-secondary hover:bg-accent-primary/10
              text-text-primary hover:text-accent-primary
              border border-border-primary hover:border-accent-primary
              rounded-lg
              transition-all duration-200
              flex items-center gap-2
            "
          >
            {action.icon && (
              <span className="text-xs" role="img" aria-label={action.label}>
                {action.icon}
              </span>
            )}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};