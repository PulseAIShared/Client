// src/app/routes/app/insights/insights.tsx
import React from 'react';
import { ContentLayout } from '@/components/layouts';
import {
  InsightsHeader,
  InsightsOverviewSection,
  ChurnAnalysisSection,
  CohortAnalysisSection,
  FeatureUsageSection,
  RecommendationsSection,
  EarlyWarningsSection,
  AccuracyMetricsSection,
  RecoveryInsightsSection,
  SegmentInsightsSection,
} from '@/features/insights/components';
import { useGetDashboardData } from '@/features/dashboard/api/dashboard';
import {
  ActiveUserMetricsCard,
  ActivationMetricsCard,
  AlertsAndAutomationCard,
  DemographicInsightsCard,
  RecoverySnapshotCard,
  SegmentSuggestionsCard,
  SegmentWatchlistCard,
  ActivityCard,
  GeoInsightsCard,
} from '@/features/dashboard/components/cards';
import { ChurnRiskChart, CustomerTrendChart, GeoMap } from '@/features/dashboard/components/charts';
import { CompanyAuthorization, useAuthorization } from '@/lib/authorization';

type TabId = 'overview' | 'risk' | 'engagement' | 'segments' | 'geo' | 'outcomes';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: 'risk',
    label: 'Risk',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
  },
  {
    id: 'engagement',
    label: 'Engagement',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 15l4-4 4 4 4-6" />
      </svg>
    ),
  },
  {
    id: 'segments',
    label: 'Segments',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'geo',
    label: 'Geo',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zm0 0v10m-7-6h14" />
      </svg>
    ),
  },
  {
    id: 'outcomes',
    label: 'Outcomes',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a10 10 0 11-20 0 10 10 0 0120 0z" />
      </svg>
    ),
  },
];

export const InsightsRoute = () => {
  const { checkCompanyPolicy } = useAuthorization();
  const canViewAnalytics = checkCompanyPolicy('analytics:read');
  const [activeTab, setActiveTab] = React.useState<TabId>('overview');
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useGetDashboardData();
  const dashboardErrorValue = dashboardError && typeof dashboardError === 'object'
    ? (dashboardError as Error)
    : null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <InsightsOverviewSection />;
      case 'risk':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ChurnRiskChart
                data={dashboardData?.churnRiskTrend}
                currentRisk={dashboardData?.stats?.churnRisk}
                isLoading={dashboardLoading}
                error={dashboardErrorValue}
              />
              <CustomerTrendChart
                data={dashboardData?.customerTrends}
                isLoading={dashboardLoading}
                error={dashboardErrorValue}
              />
            </div>
            <ChurnAnalysisSection />
            <EarlyWarningsSection />
            <AccuracyMetricsSection />
          </div>
        );
      case 'engagement':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActiveUserMetricsCard
                data={dashboardData?.activeUserMetrics}
                isLoading={dashboardLoading}
                error={dashboardErrorValue}
              />
              <ActivationMetricsCard
                data={dashboardData?.activationMetrics}
                isLoading={dashboardLoading}
                error={dashboardErrorValue}
              />
            </div>
            <ActivityCard
              stats={dashboardData?.stats}
              isLoading={dashboardLoading}
              error={dashboardErrorValue}
            />
            <FeatureUsageSection />
          </div>
        );
      case 'segments':
        return (
          <div className="space-y-8">
            <SegmentInsightsSection />
            <CohortAnalysisSection />
            <SegmentSuggestionsCard
              data={dashboardData?.segmentSuggestions}
              isLoading={dashboardLoading}
              error={dashboardErrorValue}
            />
            <SegmentWatchlistCard
              segments={dashboardData?.segmentAnalytics?.segmentDistribution}
              isLoading={dashboardLoading}
            />
          </div>
        );
      case 'geo':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <GeoMap
                data={dashboardData?.geoBreakdown}
                isLoading={dashboardLoading}
                error={dashboardErrorValue}
              />
              <GeoInsightsCard
                data={dashboardData?.geoBreakdown}
                isLoading={dashboardLoading}
                error={dashboardErrorValue}
              />
            </div>
            <DemographicInsightsCard
              data={dashboardData?.demographicInsights}
              isLoading={dashboardLoading}
              error={dashboardErrorValue}
            />
          </div>
        );
      case 'outcomes':
        return (
          <div className="space-y-8">
            <RecoverySnapshotCard
              kpis={dashboardData?.recoveryAnalytics?.kpis}
              isLoading={dashboardLoading}
              error={dashboardErrorValue}
            />
            <RecommendationsSection />
            <RecoveryInsightsSection />
            <AlertsAndAutomationCard
              data={dashboardData?.dashboardAlerts}
              isLoading={dashboardLoading}
              error={dashboardErrorValue}
            />
          </div>
        );
      default:
        return <InsightsOverviewSection />;
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
        <div className="space-y-6">
          {/* Header */}
          <InsightsHeader />

          {/* Tab Navigation */}
          <div className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl border border-border-primary/30 shadow-lg overflow-hidden">
            <div className="flex">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-accent-primary text-accent-primary bg-accent-primary/5'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary/30'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {renderTabContent()}
          </div>
        </div>
      </ContentLayout>
    </CompanyAuthorization>
  );
};
