// src/features/dashboard/components/cards/quick-actions-card.tsx
import React from 'react';

export const QuickActionsCard = () => {
  return (
    <div className="relative bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-accent-primary/30 shadow-xl overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgb(var(--accent-secondary)) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgb(var(--accent-primary)) 0%, transparent 50%)`,
        }}></div>
      </div>

      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-accent-secondary/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-accent-secondary/30 mb-3 sm:mb-4">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success-muted rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium text-accent-secondary">AI Recommendations</span>
            </div>
            
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary mb-2 sm:mb-3">
              Ready to take action?
            </h3>
            <p className="text-text-secondary text-sm sm:text-base lg:text-lg mb-4 sm:mb-6">
              Your AI assistant has identified 12 high-risk customers and 3 optimization opportunities.
            </p>

            {/* Action items - hidden on mobile to save space */}
            <div className="hidden sm:block space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 text-text-secondary">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent-primary rounded-full"></div>
                <span className="text-xs sm:text-sm">5 customers ready for win-back campaigns</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-text-secondary">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent-secondary rounded-full"></div>
                <span className="text-xs sm:text-sm">3 payment failures require retry logic</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-text-secondary">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success-muted rounded-full"></div>
                <span className="text-xs sm:text-sm">4 upsell opportunities identified</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 sm:gap-3 w-full lg:w-auto lg:min-w-fit">
            <button className="w-full lg:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium sm:font-semibold text-sm sm:text-base">
              <span className="hidden sm:inline">Launch Recovery Campaign</span>
              <span className="sm:hidden">Launch Campaign</span>
            </button>
            <div className="flex gap-2 sm:gap-3">
              <button className="flex-1 lg:flex-none px-3 sm:px-6 py-2 sm:py-3 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-primary/50 transition-colors font-medium border border-border-primary/50 text-xs sm:text-base">
                <span className="hidden sm:inline">Export Insights</span>
                <span className="sm:hidden">Export</span>
              </button>
              <button className="flex-1 lg:flex-none px-3 sm:px-6 py-2 sm:py-3 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-primary/50 transition-colors font-medium border border-border-primary/50 text-xs sm:text-base">
                <span className="hidden sm:inline">Schedule Review</span>
                <span className="sm:hidden">Schedule</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border-primary/50">
          <div className="flex items-center justify-between text-xs sm:text-sm text-text-secondary mb-1 sm:mb-2">
            <span>Monthly Goal Progress</span>
            <span>73% Complete</span>
          </div>
          <div className="w-full bg-surface-primary/50 rounded-full h-1.5 sm:h-2">
            <div className="bg-gradient-to-r from-accent-primary to-accent-secondary h-1.5 sm:h-2 rounded-full w-[73%] transition-all duration-1000 ease-out"></div>
          </div>
        </div>
      </div>
    </div>
  );
};