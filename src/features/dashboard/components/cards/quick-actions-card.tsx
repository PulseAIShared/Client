// src/features/dashboard/components/cards/quick-actions-card.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExportDashboardInsights } from '@/features/dashboard/api/dashboard';

export const QuickActionsCard = () => {
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

  const handleLaunchCampaign = () => {
    navigate('/app/campaigns/create');
  };

  const handleExportInsights = () => {
    exportMutation.mutate(undefined);
  };

  const handleScheduleReview = () => {
    navigate('/app/campaigns');
  };

  return (
    <div className="relative bg-gradient-to-r from-accent-primary/15 to-accent-secondary/15 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-accent-primary/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
      {/* Enhanced background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-300">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgb(var(--accent-secondary)) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgb(var(--accent-primary)) 0%, transparent 50%)`,
        }}></div>
      </div>

      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-accent-secondary/20 backdrop-blur-sm px-4 py-2 rounded-full border border-accent-secondary/30 mb-4 group-hover:bg-accent-secondary/30 transition-all duration-300">
              <div className="w-2 h-2 bg-success-muted rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-accent-secondary">AI Recommendations</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-3 group-hover:scale-105 transition-transform duration-300">
              Ready to take action?
            </h3>
            <p className="text-text-secondary text-base sm:text-lg lg:text-xl mb-6 max-w-2xl">
              Your AI assistant has identified <span className="font-semibold text-accent-primary">12 high-risk customers</span> and <span className="font-semibold text-accent-secondary">3 optimization opportunities</span>.
            </p>

            {/* Mobile: Condensed action summary */}
            <div className="sm:hidden mb-6">
              <div className="flex items-center gap-3 text-text-secondary bg-surface-primary/50 px-4 py-3 rounded-xl border border-border-primary/30">
                <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="text-sm font-medium">12 opportunities ready</span>
              </div>
            </div>

            {/* Desktop: Enhanced detailed action items */}
            <div className="hidden sm:block space-y-3 mb-6">
              <div className="flex items-center gap-3 text-text-secondary group/item hover:text-text-primary transition-colors duration-200">
                <div className="w-2 h-2 bg-accent-primary rounded-full group-hover/item:scale-125 transition-transform duration-200"></div>
                <span className="text-sm">5 customers ready for win-back campaigns</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary group/item hover:text-text-primary transition-colors duration-200">
                <div className="w-2 h-2 bg-accent-secondary rounded-full group-hover/item:scale-125 transition-transform duration-200"></div>
                <span className="text-sm">3 payment failures require retry logic</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary group/item hover:text-text-primary transition-colors duration-200">
                <div className="w-2 h-2 bg-success-muted rounded-full group-hover/item:scale-125 transition-transform duration-200"></div>
                <span className="text-sm">4 upsell opportunities identified</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 sm:gap-4 w-full lg:w-auto lg:min-w-fit">
            <button 
              onClick={handleLaunchCampaign}
              className="group/btn relative w-full lg:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold text-sm sm:text-base overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary to-accent-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"></div>
              <span className="relative hidden sm:inline">Launch Recovery Campaign</span>
              <span className="relative sm:hidden">Launch Campaign</span>
            </button>
            <div className="flex gap-3 sm:gap-4">
              <button 
                onClick={handleExportInsights}
                disabled={exportMutation.isPending}
                className="flex-1 lg:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/30 hover:border-border-secondary hover:shadow-md group/btn"
              >
                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline ml-2">Export</span>
              </button>
              <button 
                onClick={handleScheduleReview}
                className="flex-1 lg:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/30 hover:border-border-secondary hover:shadow-md group/btn"
              >
                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8a1 1 0 011-1h3z" />
                </svg>
                <span className="hidden sm:inline ml-2">Schedule</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};