// src/features/dashboard/components/cards/quick-actions-card.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExportDashboardInsights } from '@/features/dashboard/api/dashboard';
import { DashboardSuggestedAction } from '@/types/api';

interface QuickActionsCardProps {
  suggestedAction?: DashboardSuggestedAction;
}

const getSuggestedActionLabel = (actionType?: string): string => {
  switch (actionType) {
    case 'ConnectIntegration':
      return 'Connect Integration';
    case 'ReviewWorkQueue':
      return 'Review Queue';
    case 'ImproveRecoveryPlaybook':
      return 'Improve Recovery';
    case 'LaunchRetentionPlaybook':
      return 'Launch Retention';
    case 'CreateSegment':
      return 'Create Segment';
    default:
      return 'Create Playbook';
  }
};

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ suggestedAction }) => {
  const navigate = useNavigate();
  const exportMutation = useExportDashboardInsights({
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `dashboard-insights-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error) => {
      console.error('Export failed:', error);
      // You could add a toast notification here
    }
  });

  const handlePrimaryAction = () => {
    if (suggestedAction?.actionUrl) {
      navigate(suggestedAction.actionUrl);
      return;
    }

    navigate('/app/playbooks/create');
  };

  const handleExportInsights = () => {
    exportMutation.mutate(undefined);
  };

  const handleReviewQueue = () => {
    navigate('/app/work-queue');
  };

  return (
    <div className="relative bg-gradient-to-r from-surface-primary via-surface-secondary to-surface-primary p-5 sm:p-6 rounded-2xl border border-border-primary/40 shadow-md hover:shadow-lg transition-all duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-text-primary">
            {suggestedAction ? 'Recommended next step' : 'Ready to take action?'}
          </h3>
          <p className="text-sm text-text-muted">
            {suggestedAction?.description ?? 'Create a playbook, export insights, or review the work queue.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-start lg:justify-end">
          <button
            onClick={handlePrimaryAction}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m0 0l-4-4m4 4l4-4" />
            </svg>
            {getSuggestedActionLabel(suggestedAction?.actionType)}
          </button>
          <button
            onClick={handleExportInsights}
            disabled={exportMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-secondary text-text-primary text-sm font-semibold border border-border-primary/50 hover:border-border-secondary hover:shadow-sm transition-all duration-150 disabled:opacity-60"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
          <button
            onClick={handleReviewQueue}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-secondary text-text-primary text-sm font-semibold border border-border-primary/50 hover:border-border-secondary hover:shadow-sm transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8a1 1 0 011-1h3z" />
            </svg>
            Work Queue
          </button>
        </div>
      </div>
    </div>
  );
};
