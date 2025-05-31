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
  CustomerInsightsTable
} from '@/features/dashboard/components';

export const DashboardRoute = () => {
  return (
    <ContentLayout>
      <div className="space-y-8">
        {/* Header */}
        <DashboardHeader />

        {/* Top Stats Grid */}
        <StatCard />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Churn Risk Predictor */}
          <ChurnRiskChart />

          {/* At-Risk Customers */}
          <AtRiskCustomersTable />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Insights Chart */}
          <CustomerInsightsPie />

          {/* Customer Insights Table */}
          <CustomerInsightsTable />
        </div>

        {/* Quick Actions */}
        <QuickActionsCard />
      </div>
    </ContentLayout>
  );
};