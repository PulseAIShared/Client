// src/features/dashboard/utils/dashboard-data.ts

import { DashboardStats, ChurnRiskData, CustomerInsight, AtRiskCustomer } from '@/types/api';

export const getDashboardStats = (): DashboardStats => ({
  totalUsers: "12,450",
  churnRisk: "8.2%",
  recoveredRevenue: "$4,730",
  avgLTV: "$135"
});

export const getChurnRiskData = (): ChurnRiskData[] => [
  { week: '-8W', risk: 9.2 },
  { week: '-6W', risk: 7.8 },
  { week: '-4W', risk: 6.5 },
  { week: '-2W', risk: 9.1 },
  { week: '0W', risk: 8.2 }
];

export const getCustomerInsightsData = (): CustomerInsight[] => [
  { name: '<25', value: 30, revenue: 110, color: '#3b82f6' },
  { name: '25-34', value: 35, revenue: 150, color: '#10b981' },
  { name: '35-44', value: 25, revenue: 140, color: '#f59e0b' },
  { name: '45+', value: 10, revenue: 120, color: '#ef4444' }
];

export const getAtRiskCustomers = (): AtRiskCustomer[] => [
  { name: 'John Doe', daysSince: 45, score: 85 },
  { name: 'Jane Smith', daysSince: 30, score: 87 },
  { name: 'Robert Johnson', daysSince: 60, score: 80 },
  { name: 'Emily Brown', daysSince: 15, score: 78 },
  { name: 'Michael Wilson', daysSince: 50, score: 72 }
];