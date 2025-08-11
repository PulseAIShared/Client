import React from 'react';
import { Link } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import {
  RecoveryKpis,
  RecoveryTimeline,
  RecoveryBySegment,
  RecoveryReasons,
  RecoveryFlows,
} from '@/features/insights/components';
import { RecoveryWorkQueue } from '@/features/insights/components/recovery-work-queue';

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

            {/* Quick actions */}
            <div className="mt-6 sm:mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Link to="/app/campaigns/create" className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary to-accent-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <svg className="relative w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                  <span className="relative">Create Campaign</span>
                </Link>
                <a href="#flows" className="group px-6 sm:px-8 py-3 sm:py-4 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/30 hover:border-border-secondary hover:shadow-md inline-flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5v3a6 6 0 10-12 0v3l-5 5h5"/></svg>
                  Configure Flows
                </a>
                <a href="#queue" className="group px-6 sm:px-8 py-3 sm:py-4 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/30 hover:border-border-secondary hover:shadow-md inline-flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18"/></svg>
                  Jump to Queue
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <RecoveryKpis />

        {/* Work Queue: full width */}
        <RecoveryWorkQueue />

        {/* Recovery Flows: full width below */}
        <div id="flows">
          <RecoveryFlows />
        </div>

        {/* Timeline */}
        <RecoveryTimeline />

        {/* Segment analytics and reasons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          <RecoveryBySegment />
          <RecoveryReasons />
        </div>
      </div>
    </ContentLayout>
  );
};


