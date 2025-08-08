// src/app/routes/app/dashboard/dashboard.tsx
import React from 'react';
import { ContentLayout } from '@/components/layouts';
import {
  DashboardHeader,
  StatCard,
  QuickActionsCard,
  ChurnRiskChart,
  CustomerInsightsPie,
  AtRiskCustomersTable,
  CustomerInsightsTable,
  GettingStarted
} from '@/features/dashboard/components';
import { useGetDashboardData } from '@/features/dashboard/api/dashboard';
import { Spinner } from '@/components/ui/spinner';
import { CompanyAuthorization, useAuthorization } from '@/lib/authorization';

export const DashboardRoute = () => {
  const { checkCompanyPolicy } = useAuthorization();
  const { data: dashboardData, isLoading, error } = useGetDashboardData();

  // Check if user has read access to analytics
  const canViewAnalytics = checkCompanyPolicy('analytics:read');

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
            <p className="text-text-muted text-sm">Preparing AI-powered insights</p>
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

  // Check if there are no customers (totalUsers is "0" or empty arrays)
  const hasNoCustomers = !dashboardData || 
    dashboardData.stats?.totalUsers === '0' || 
    (dashboardData.atRiskCustomers?.length === 0 && 
     dashboardData.customerInsights?.length === 0 &&
     dashboardData.churnRiskTrend?.length === 0);

  if (hasNoCustomers) {
    return (
      <ContentLayout>
        <div className="space-y-8">
          <DashboardHeader />
          <GettingStarted />
        </div>
      </ContentLayout>
    );
  }

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
          {/* Header */}
          <DashboardHeader />

          {/* Top Stats Grid */}
          <StatCard 
            stats={dashboardData?.stats} 
            isLoading={isLoading} 
            error={error} 
          />

          {/* Main Content Grid - Enhanced spacing and heights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 min-h-[600px]">
            {/* Churn Risk Predictor */}
            <div className="h-full">
              <ChurnRiskChart 
                data={dashboardData?.churnRiskTrend} 
                isLoading={isLoading} 
                error={error} 
              />
            </div>

            {/* At-Risk Customers */}
            <div className="h-full">
              <AtRiskCustomersTable 
                data={dashboardData?.atRiskCustomers} 
                isLoading={isLoading} 
                error={error} 
              />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 min-h-[500px]">
            {/* Customer Insights Chart */}
            <div className="h-full">
              <CustomerInsightsPie 
                data={dashboardData?.customerInsights} 
                isLoading={isLoading} 
                error={error} 
              />
            </div>

            {/* Customer Insights Table */}
            <div className="h-full">
              <CustomerInsightsTable 
                data={dashboardData?.customerInsights} 
                isLoading={isLoading} 
                error={error} 
              />
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActionsCard />
        </div>
      </ContentLayout>
    </CompanyAuthorization>
  );
};