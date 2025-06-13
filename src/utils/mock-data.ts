// src/utils/mock-data.ts (fixed)

import { DashboardStats, ChurnRiskData, CustomerInsight, AtRiskCustomer, CustomerDisplayData, SubscriptionPlan, SubscriptionStatus, PaymentStatus, ChurnRiskLevel } from '@/types/api';

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
  { 
    name: '<25', 
    value: 30, 
    revenue: 110, 
    color: '#3b82f6'
  },
  { 
    name: '25-34', 
    value: 35, 
    revenue: 150, 
    color: '#10b981'
  },
  { 
    name: '35-44', 
    value: 25, 
    revenue: 140, 
    color: '#f59e0b'
  },
  { 
    name: '45+', 
    value: 10, 
    revenue: 120, 
    color: '#ef4444'
  }
];

export const getAtRiskCustomers = (): AtRiskCustomer[] => [
  { 
    name: 'John Doe', 
    daysSince: 45, 
    score: 85
  },
  { 
    name: 'Jane Smith', 
    daysSince: 30, 
    score: 87
  },
  { 
    name: 'Robert Johnson', 
    daysSince: 60, 
    score: 80
  },
  { 
    name: 'Emily Brown', 
    daysSince: 15, 
    score: 78
  },
  { 
    name: 'Michael Wilson', 
    daysSince: 50, 
    score: 72
  }
];

// Updated function for customers data with proper enum values
export const getCustomersData = (): CustomerDisplayData[] => [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@techflow.com',
    monthsSubbed: 24,
    ltv: '$3,240',
    churnRisk: 85,
    activityFrequency: 'Low',
    lastActivity: '2024-05-15',
    plan: 'Pro',
    planEnum: SubscriptionPlan.Pro,
    subscriptionStatus: SubscriptionStatus.Active,
    paymentStatus: PaymentStatus.Current,
    churnRiskLevel: ChurnRiskLevel.Critical
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    email: 'marcus.r@learnhub.co',
    monthsSubbed: 18,
    ltv: '$2,890',
    churnRisk: 35,
    activityFrequency: 'High',
    lastActivity: '2024-05-29',
    plan: 'Enterprise',
    planEnum: SubscriptionPlan.Enterprise,
    subscriptionStatus: SubscriptionStatus.Active,
    paymentStatus: PaymentStatus.Current,
    churnRiskLevel: ChurnRiskLevel.Low
  },
  {
    id: '3',
    name: 'Emily Foster',
    email: 'emily.foster@fitnesspro.com',
    monthsSubbed: 12,
    ltv: '$1,680',
    churnRisk: 62,
    activityFrequency: 'Medium',
    lastActivity: '2024-05-28',
    plan: 'Basic',
    planEnum: SubscriptionPlan.Basic,
    subscriptionStatus: SubscriptionStatus.Active,
    paymentStatus: PaymentStatus.Current,
    churnRiskLevel: ChurnRiskLevel.High
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@startup.io',
    monthsSubbed: 36,
    ltv: '$4,320',
    churnRisk: 15,
    activityFrequency: 'High',
    lastActivity: '2024-05-30',
    plan: 'Enterprise',
    planEnum: SubscriptionPlan.Enterprise,
    subscriptionStatus: SubscriptionStatus.Active,
    paymentStatus: PaymentStatus.Current,
    churnRiskLevel: ChurnRiskLevel.Low
  },
  {
    id: '5',
    name: 'Lisa Zhang',
    email: 'lisa.zhang@design.co',
    monthsSubbed: 8,
    ltv: '$960',
    churnRisk: 45,
    activityFrequency: 'Medium',
    lastActivity: '2024-05-27',
    plan: 'Pro',
    planEnum: SubscriptionPlan.Pro,
    subscriptionStatus: SubscriptionStatus.Active,
    paymentStatus: PaymentStatus.Current,
    churnRiskLevel: ChurnRiskLevel.Medium
  },
  {
    id: '6',
    name: 'John Mitchell',
    email: 'j.mitchell@corp.com',
    monthsSubbed: 42,
    ltv: '$5,040',
    churnRisk: 25,
    activityFrequency: 'High',
    lastActivity: '2024-05-30',
    plan: 'Enterprise',
    planEnum: SubscriptionPlan.Enterprise,
    subscriptionStatus: SubscriptionStatus.Active,
    paymentStatus: PaymentStatus.Current,
    churnRiskLevel: ChurnRiskLevel.Low
  },
  {
    id: '7',
    name: 'Anna Petrov',
    email: 'anna.petrov@media.com',
    monthsSubbed: 6,
    ltv: '$720',
    churnRisk: 78,
    activityFrequency: 'Low',
    lastActivity: '2024-05-20',
    plan: 'Basic',
    planEnum: SubscriptionPlan.Basic,
    subscriptionStatus: SubscriptionStatus.Active,
    paymentStatus: PaymentStatus.Failed,
    churnRiskLevel: ChurnRiskLevel.High
  },
  {
    id: '8',
    name: 'Carlos Santos',
    email: 'carlos.santos@consulting.com',
    monthsSubbed: 28,
    ltv: '$3,360',
    churnRisk: 40,
    activityFrequency: 'Medium',
    lastActivity: '2024-05-29',
    plan: 'Pro',
    planEnum: SubscriptionPlan.Pro,
    subscriptionStatus: SubscriptionStatus.Active,
    paymentStatus: PaymentStatus.Current,
    churnRiskLevel: ChurnRiskLevel.Medium
  },
  {
    id: '9',
    name: 'Rachel Adams',
    email: 'rachel.adams@agency.co',
    monthsSubbed: 15,
    ltv: '$1,800',
    churnRisk: 55,
    activityFrequency: 'Medium',
    lastActivity: '2024-05-26',
    plan: 'Pro',
    planEnum: SubscriptionPlan.Pro,
    subscriptionStatus: SubscriptionStatus.Active,
    paymentStatus: PaymentStatus.Current,
    churnRiskLevel: ChurnRiskLevel.Medium
  },
  {
    id: '10',
    name: 'Michael Thompson',
    email: 'mike.thompson@logistics.com',
    monthsSubbed: 33,
    ltv: '$3,960',
    churnRisk: 20,
    activityFrequency: 'High',
    lastActivity: '2024-05-30',
    plan: 'Enterprise',
    planEnum: SubscriptionPlan.Enterprise,
    subscriptionStatus: SubscriptionStatus.Active,
    paymentStatus: PaymentStatus.Current,
    churnRiskLevel: ChurnRiskLevel.Low
  },
  {
    id: '13',
    name: 'Sophie Williams',
    email: 'sophie.w@ecommerce.com',
    monthsSubbed: 14,
    ltv: '$1,680',
    churnRisk: 52,
    activityFrequency: 'Medium',
    lastActivity: '2024-05-28',
    plan: 'Pro',
    planEnum: SubscriptionPlan.Pro,
    subscriptionStatus: SubscriptionStatus.Active,
    paymentStatus: PaymentStatus.Current,
    churnRiskLevel: ChurnRiskLevel.Medium
  },
  {
    id: '14',
    name: 'Daniel Brown',
    email: 'daniel.brown@manufacturing.com',
    monthsSubbed: 31,
    ltv: '$3,720',
    churnRisk: 18,
    activityFrequency: 'High',
    lastActivity: '2024-05-30',
    plan: 'Enterprise',
    planEnum: SubscriptionPlan.Enterprise,
    subscriptionStatus: SubscriptionStatus.Active,
    paymentStatus: PaymentStatus.Current,
    churnRiskLevel: ChurnRiskLevel.Low
  },
  {
    id: '15',
    name: 'Maria Garcia',
    email: 'maria.garcia@nonprofit.org',
    monthsSubbed: 4,
    ltv: '$480',
    churnRisk: 88,
    activityFrequency: 'Low',
    lastActivity: '2024-05-18',
    plan: 'Basic',
    planEnum: SubscriptionPlan.Basic,
    subscriptionStatus: SubscriptionStatus.PastDue,
    paymentStatus: PaymentStatus.Failed,
    churnRiskLevel: ChurnRiskLevel.Critical
  }
];