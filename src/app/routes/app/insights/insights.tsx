// src/app/routes/app/insights/insights.tsx
import React from 'react';
import { ContentLayout } from '@/components/layouts';
import {
  InsightsHeader,
  ChurnPredictionCard,
  AnalyticsOverview,
  LTVAnalytics,
  DemographicInsights,
  RecoveryFlows
} from '@/features/insights/components';
import { CompanyAuthorization, useAuthorization } from '@/lib/authorization';
import { SegmentPerformance, SegmentAnalytics } from '@/features/segments/components';
import { RecoveryKpis } from '@/features/insights/components/recovery-kpis';
import { RecoveryTimeline } from '@/features/insights/components/recovery-timeline';
import { RecoveryBySegment } from '@/features/insights/components/recovery-by-segment';
import { RecoveryReasons } from '@/features/insights/components/recovery-reasons';
import { MissedPaymentsTable } from '@/features/insights/components/missed-payments-table';

export const InsightsRoute = () => {
  const { checkCompanyPolicy } = useAuthorization();
  const canViewAnalytics = checkCompanyPolicy('analytics:read');
  const canManageRecoveryFlows = checkCompanyPolicy('company:write');

  const [activeTab, setActiveTab] = React.useState<'overview' | 'segments' | 'ltv' | 'demographics' | 'recovery'>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <InsightsHeader />
            <AnalyticsOverview />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
              <ChurnPredictionCard />
              <LTVAnalytics />
            </div>
          </div>
        );
      case 'segments':
        return (
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <InsightsHeader />
            <SegmentPerformance />
            <SegmentAnalytics />
          </div>
        );
      case 'ltv':
        return (
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <InsightsHeader />
            <LTVAnalytics />
          </div>
        );
      case 'demographics':
        return (
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <InsightsHeader />
            <DemographicInsights />
          </div>
        );
      case 'recovery':
        return (
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <InsightsHeader />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              <div className="lg:col-span-2 space-y-6">
                <RecoveryKpis />
                <RecoveryTimeline />
                <RecoveryBySegment />
                <RecoveryReasons />
                <MissedPaymentsTable />
              </div>
              <div className="lg:col-span-1">
                <RecoveryFlows />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <CompanyAuthorization
      policyCheck={canViewAnalytics}
      forbiddenFallback={
        <ContentLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center bg-surface-primary/80 backdrop-blur-xl p-8 rounded-3xl border border-border-primary/50 shadow-2xl max-w-md">
              <div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-warning-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-warning-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">Access Restricted</h2>
              <p className="text-text-muted">
                You need analytics read permissions to view insights. Please contact your company owner.
              </p>
            </div>
          </div>
        </ContentLayout>
      }
    >
      <ContentLayout>
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          <div className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl border border-border-primary/30">
            <div className="flex flex-wrap">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'segments', label: 'Segments' },
                { id: 'ltv', label: 'LTV' },
                { id: 'demographics', label: 'Demographics' },
                { id: 'recovery', label: 'Revenue Recovery' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-4 sm:px-6 py-3 border-b-2 text-sm sm:text-base ${
                    activeTab === (t.id as any)
                      ? 'border-accent-primary text-accent-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {renderTab()}
        </div>
      </ContentLayout>
    </CompanyAuthorization>
  );
};