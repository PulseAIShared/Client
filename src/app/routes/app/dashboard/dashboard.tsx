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

export const DashboardRoute = () => {
  const { data: dashboardData, isLoading, error } = useGetDashboardData();

  if (isLoading) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Spinner size="xl" />
            <p className="mt-4 text-text-secondary">Loading dashboard...</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center bg-surface-secondary/50 backdrop-blur-lg p-8 rounded-2xl border border-border-primary/50">
            <div className="text-error-muted text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Failed to Load Dashboard</h2>
            <p className="text-text-muted">
              {error instanceof Error ? error.message : 'Unable to load dashboard data'}
            </p>
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
    <ContentLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <DashboardHeader />

        {/* Top Stats Grid */}
        <StatCard 
          stats={dashboardData?.stats} 
          isLoading={isLoading} 
          error={error} 
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Churn Risk Predictor */}
          <ChurnRiskChart 
            data={dashboardData?.churnRiskTrend} 
            isLoading={isLoading} 
            error={error} 
          />

          {/* At-Risk Customers */}
          <AtRiskCustomersTable 
            data={dashboardData?.atRiskCustomers} 
            isLoading={isLoading} 
            error={error} 
          />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Customer Insights Chart */}
          <CustomerInsightsPie 
            data={dashboardData?.customerInsights} 
            isLoading={isLoading} 
            error={error} 
          />

          {/* Customer Insights Table */}
          <CustomerInsightsTable 
            data={dashboardData?.customerInsights} 
            isLoading={isLoading} 
            error={error} 
          />
        </div>

        {/* Quick Actions */}
        <QuickActionsCard />
      </div>
    </ContentLayout>
  );
};