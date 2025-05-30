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
import {
  getDashboardStats,
  getChurnRiskData,
  getCustomerInsightsData,
  getAtRiskCustomers
} from '@/utils/mock-data';

export const DashboardRoute = () => {
  const stats = getDashboardStats();
  const churnRiskData = getChurnRiskData();
  const customerInsightsData = getCustomerInsightsData();
  const atRiskCustomers = getAtRiskCustomers();

  return (
    <ContentLayout>
      <div className="space-y-8">
        {/* Header */}
        <DashboardHeader />

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers}
            color="text-white"
            bgGradient="from-slate-800/80 to-slate-900/80"
          />
          <StatCard 
            title="Churn Risk" 
            value={stats.churnRisk}
            color="text-cyan-400"
            bgGradient="from-cyan-600/20 to-blue-600/20"
          />
          <StatCard 
            title="Recovered Revenue" 
            value={stats.recoveredRevenue}
            color="text-green-400"
            bgGradient="from-green-600/20 to-emerald-600/20"
          />
          <StatCard 
            title="Avg. LTV" 
            value={stats.avgLTV}
            color="text-yellow-400"
            bgGradient="from-yellow-600/20 to-orange-600/20"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Churn Risk Predictor */}
          <ChurnRiskChart data={churnRiskData} />

          {/* At-Risk Customers */}
          <AtRiskCustomersTable customers={atRiskCustomers} />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Insights Chart */}
          <CustomerInsightsPie data={customerInsightsData} />

          {/* Customer Insights Table */}
          <CustomerInsightsTable insights={customerInsightsData} />
        </div>

        {/* Quick Actions */}
        <QuickActionsCard />
      </div>
    </ContentLayout>
  );
};