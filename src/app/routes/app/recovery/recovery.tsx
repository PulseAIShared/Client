import React from 'react';
import { Link } from 'react-router-dom';
import { AppPageHeader, ContentLayout } from '@/components/layouts';
import { RecoveryWorkQueue, RecoveryFlows } from '@/features/recovery/components';

export const RecoveryRoute: React.FC = () => {
  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <AppPageHeader
          title="Recovery"
          description="Smart queues and automated flows to recover missed payments and protect revenue."
          actions={(
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:flex lg:items-center lg:gap-4">
              <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/40 px-4 py-3 text-center lg:text-right">
                <div className="text-xl font-bold text-success-muted lg:text-2xl">62%</div>
                <div className="text-xs text-text-muted sm:text-sm">recovery rate</div>
              </div>
              <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/40 px-4 py-3 text-center lg:text-right">
                <div className="text-xl font-bold text-accent-primary lg:text-2xl">$78.2k</div>
                <div className="text-xs text-text-muted sm:text-sm">recovered</div>
              </div>
            </div>
          )}
          filters={(
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
              <Link to="/app/playbooks/create" className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-secondary/25 sm:px-8 sm:py-4 sm:text-base">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary to-accent-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                <svg className="relative h-4 w-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                <span className="relative">Create Playbook</span>
              </Link>
              <a href="#flows" className="group inline-flex items-center justify-center gap-2 rounded-xl border border-border-primary/30 bg-surface-secondary/50 px-6 py-3 text-sm font-medium text-text-primary transition-all duration-200 hover:bg-surface-primary/50 hover:shadow-md sm:px-8 sm:py-4 sm:text-base">
                <svg className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                Configure Flows
              </a>
              <a href="#queue" className="group inline-flex items-center justify-center gap-2 rounded-xl border border-border-primary/30 bg-surface-secondary/50 px-6 py-3 text-sm font-medium text-text-primary transition-all duration-200 hover:bg-surface-primary/50 hover:shadow-md sm:px-8 sm:py-4 sm:text-base">
                <svg className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                Work Queue
              </a>
              <Link to="/app/insights?tab=recovery" className="group inline-flex items-center justify-center gap-2 rounded-xl border border-border-primary/30 bg-surface-secondary/50 px-6 py-3 text-sm font-medium text-text-primary transition-all duration-200 hover:bg-surface-primary/50 hover:shadow-md sm:px-8 sm:py-4 sm:text-base">
                <svg className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                View Analytics
              </Link>
            </div>
          )}
        />

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


