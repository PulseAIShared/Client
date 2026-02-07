// src/app/routes/app/dashboard/dashboard.tsx
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { DashboardHeader, GettingStarted, SegmentEmptyState, SegmentFilter } from '@/features/dashboard/components';
import {
  WorkQueueCard,
  RecoverySnapshotCard,
  QuickActionsCard,
} from '@/features/dashboard/components/cards';
import {
  useGetDashboardData,
  useGetDashboardIntegrationStatus,
  useGetDashboardSegmentsList,
} from '@/features/dashboard/api/dashboard';
import { Spinner } from '@/components/ui/spinner';
import { CompanyAuthorization, useAuthorization } from '@/lib/authorization';
import { AlertTriangle } from 'lucide-react';
import { NoIntegrationState } from '@/features/dashboard/components/no-integration-state';

const getRiskDriverLabel = (riskDriver?: string | null): string => {
  switch (riskDriver) {
    case 'PaymentDistress':
      return 'Payment distress';
    case 'Inactivity':
      return 'Recent inactivity';
    case 'LowEngagement':
      return 'Low product engagement';
    case 'HighModelScore':
      return 'Elevated churn score';
    case 'Composite':
      return 'Mixed risk factors';
    default:
      return 'Elevated churn risk';
  }
};

const parseDashboardCount = (value?: string): number | null => {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[^0-9-]/g, '');
  if (!normalized) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export const DashboardRoute = () => {
  const { checkCompanyPolicy } = useAuthorization();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSegmentId = searchParams.get('segmentId') ?? undefined;
  const dashboardQueryParams = React.useMemo(
    () => ({
      segmentId: selectedSegmentId,
    }),
    [selectedSegmentId],
  );

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error,
  } = useGetDashboardData(dashboardQueryParams);
  const {
    data: integrationStatus,
    isLoading: integrationStatusLoading,
  } = useGetDashboardIntegrationStatus();
  const {
    data: segmentOptions = [],
    isLoading: segmentsLoading,
  } = useGetDashboardSegmentsList();
  const isLoading = dashboardLoading || integrationStatusLoading;
  const selectedSegment = segmentOptions.find((segment) => segment.id === selectedSegmentId);

  // Check if user has read access to analytics
  const canViewAnalytics = checkCompanyPolicy('analytics:read');

  const handleSegmentChange = (segmentId?: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (segmentId) {
      nextParams.set('segmentId', segmentId);
    } else {
      nextParams.delete('segmentId');
    }

    setSearchParams(nextParams, { replace: true });
  };

  if (isLoading) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="relative">
              <Spinner size="xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <p className="text-text-secondary font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-surface-primary/80 backdrop-blur-xl p-8 rounded-3xl border border-border-primary/50 shadow-2xl max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Failed to Load Dashboard</h2>
            <p className="text-text-muted mb-4">
              {error instanceof Error ? error.message : 'Unable to load dashboard data'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (
    integrationStatus &&
    !integrationStatus.hasActiveIntegration
  ) {
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
                  You need analytics read permissions to view the dashboard. Please contact your company owner.
                </p>
              </div>
            </div>
          </ContentLayout>
        }
      >
        <ContentLayout>
          <NoIntegrationState />
        </ContentLayout>
      </CompanyAuthorization>
    );
  }

  const scopedCustomerCount = parseDashboardCount(dashboardData?.stats?.totalUsers);
  const hasNoSignalsInScope =
    (dashboardData?.atRiskCustomers?.length ?? 0) === 0 &&
    (dashboardData?.customerInsights?.length ?? 0) === 0 &&
    (dashboardData?.churnRiskTrend?.length ?? 0) === 0;
  const hasNoCustomersInScope = scopedCustomerCount === 0 || (scopedCustomerCount === null && hasNoSignalsInScope);
  const isSegmentScopeEmpty = Boolean(selectedSegmentId) && hasNoCustomersInScope;
  const hasNoCustomers = !selectedSegmentId && hasNoCustomersInScope;

  if (isSegmentScopeEmpty) {
    return (
      <ContentLayout>
        <div className="space-y-6 sm:space-y-8">
          <DashboardHeader stats={dashboardData?.stats} workQueueSummary={dashboardData?.workQueueSummary} />
          <SegmentFilter
            segments={segmentOptions}
            selectedSegmentId={selectedSegmentId}
            onChange={handleSegmentChange}
            isLoading={segmentsLoading}
          />
          <SegmentEmptyState
            segmentName={selectedSegment?.name}
            onClearFilter={() => handleSegmentChange(undefined)}
          />
        </div>
      </ContentLayout>
    );
  }

  if (hasNoCustomers) {
    return (
      <ContentLayout>
        <div className="space-y-8">
          <DashboardHeader stats={dashboardData?.stats} workQueueSummary={dashboardData?.workQueueSummary} />
          <GettingStarted />
        </div>
      </ContentLayout>
    );
  }

  const topRiskCustomers = (dashboardData?.atRiskCustomers ?? []).slice(0, 5);

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
                You need analytics read permissions to view the dashboard. Please contact your company owner.
              </p>
            </div>
          </div>
        </ContentLayout>
      }
    >
      <ContentLayout>
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          {/* Header - action-first */}
          <DashboardHeader stats={dashboardData?.stats} workQueueSummary={dashboardData?.workQueueSummary} />
          <SegmentFilter
            segments={segmentOptions}
            selectedSegmentId={selectedSegmentId}
            onChange={handleSegmentChange}
            isLoading={segmentsLoading}
          />

          {/* Primary Panel: Work Queue + High-risk customers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="min-h-[360px]">
              <WorkQueueCard
                workQueueSummary={dashboardData?.workQueueSummary}
                isLoading={isLoading}
              />
            </div>

            {/* High-risk customers */}
            <div className="bg-surface-primary/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 shadow-lg h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">High-Risk Customers</h3>
                  <p className="text-sm text-text-muted">Customers most likely to churn</p>
                </div>
                <Link to="/app/customers" className="text-sm text-accent-primary hover:underline">View all</Link>
              </div>

              {topRiskCustomers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center flex-1">
                  <AlertTriangle className="w-8 h-8 text-success mb-2" />
                  <p className="text-sm text-text-muted">No high-risk customers detected.</p>
                </div>
              )}

              {topRiskCustomers.length > 0 && (
                <div className="flex-1 overflow-y-auto pr-1">
                  <ul className="divide-y divide-border-primary/30">
                    {topRiskCustomers.map((customer, index) => (
                      <li key={customer.name + index} className="py-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-medium text-text-primary truncate">
                            {customer.name}
                          </div>
                          <div className="text-xs text-text-muted truncate">
                            {customer.riskDriver === 'Inactivity' && customer.daysSince > 0
                              ? `${getRiskDriverLabel(customer.riskDriver)} • ${customer.daysSince} days`
                              : getRiskDriverLabel(customer.riskDriver)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/30">
                            {Math.round(customer.score)}%
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Recovery snapshot */}
          <RecoverySnapshotCard
            kpis={dashboardData?.recoveryAnalytics?.kpis}
            isLoading={isLoading}
            error={error && typeof error === 'object' ? (error as Error) : null}
          />

          {/* Footer links */}
          <div className="flex flex-wrap gap-4">
            <Link
              to="/app/insights"
              className="px-4 py-2.5 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary transition-colors font-medium text-sm border border-border-primary/50"
            >
              View analytics
            </Link>
            <Link
              to="/app/playbooks"
              className="px-4 py-2.5 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary transition-colors font-medium text-sm border border-border-primary/50"
            >
              View playbook runs
            </Link>
            <Link
              to="/app/insights"
              className="px-4 py-2.5 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary transition-colors font-medium text-sm border border-border-primary/50"
            >
              View outcomes
            </Link>
          </div>

          {/* Quick actions */}
          <QuickActionsCard suggestedAction={dashboardData?.suggestedAction} />
        </div>
      </ContentLayout>
    </CompanyAuthorization>
  );
};
