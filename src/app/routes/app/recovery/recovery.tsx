import React from 'react';
import { Link } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { RecoveryWorkQueue, RecoveryFlows } from '@/features/recovery/components';

export const RecoveryRoute: React.FC = () => {
  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Header (mirrors InsightsHeader style) */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-accent-secondary/5 to-accent-primary/5 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              <div className="flex-1 space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary mb-2">
                  Recovery
                </h1>
                <p className="text-text-secondary text-base sm:text-lg lg:text-xl max-w-2xl">
                  Smart queues and automated flows to recover missed payments and protect revenue
                </p>
              </div>

              {/* Sidebar quick stats (mocked from insights recovery KPIs) */}
              <div className="hidden lg:flex items-center gap-6">
                <div className="text-right">
                  <div className="text-3xl font-bold text-success-muted">62%</div>
                  <div className="text-sm text-text-muted">recovery rate</div>
                </div>
                <div className="w-px h-12 bg-border-primary/30"></div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-accent-primary">$78.2k</div>
                  <div className="text-sm text-text-muted">recovered</div>
                </div>
              </div>
            </div>

            {/* Enhanced Quick actions */}
            <div className="mt-6 sm:mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Link to="/app/playbooks/create" className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary to-accent-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <svg className="relative w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                  <span className="relative">Create Playbook</span>
                </Link>
                <a href="#flows" className="group px-6 sm:px-8 py-3 sm:py-4 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/30 hover:border-border-secondary hover:shadow-md inline-flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  Configure Flows
                </a>
                <a href="#queue" className="group px-6 sm:px-8 py-3 sm:py-4 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/30 hover:border-border-secondary hover:shadow-md inline-flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  Work Queue
                </a>
                <Link to="/app/insights?tab=recovery" className="group px-6 sm:px-8 py-3 sm:py-4 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/30 hover:border-border-secondary hover:shadow-md inline-flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                  View Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Work Queue: main functionality */}
        <RecoveryWorkQueue />

        {/* Recovery Flows: flow management */}
        <div id="flows">
          <RecoveryFlows />
        </div>
      </div>
    </ContentLayout>
  );
};


