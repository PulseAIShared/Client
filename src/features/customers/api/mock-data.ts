export const mockEngagementData = [
  { month: 'Jan', logins: 15, feature_usage: 68, support_tickets: 2 },
  { month: 'Feb', logins: 22, feature_usage: 72, support_tickets: 1 },
  { month: 'Mar', logins: 18, feature_usage: 65, support_tickets: 3 },
  { month: 'Apr', logins: 25, feature_usage: 78, support_tickets: 0 },
  { month: 'May', logins: 12, feature_usage: 45, support_tickets: 4 },
  { month: 'Jun', logins: 8, feature_usage: 32, support_tickets: 2 },
];

export const mockChurnRiskTrend = [
  { month: 'Jan', risk: 15 },
  { month: 'Feb', risk: 12 },
  { month: 'Mar', risk: 18 },
  { month: 'Apr', risk: 8 },
  { month: 'May', risk: 45 },
  { month: 'Jun', risk: 85 },
];

export const mockActivityTimeline = [
  { date: '2024-06-01', type: 'login', description: 'Last login to dashboard', timestamp: '2:30 PM' },
  { date: '2024-05-28', type: 'feature', description: 'Used analytics export feature', timestamp: '10:15 AM' },
  { date: '2024-05-25', type: 'support', description: 'Created support ticket: "Payment issue"', timestamp: '4:45 PM' },
  { date: '2024-05-20', type: 'billing', description: 'Payment failed - card expired', timestamp: '11:30 AM' },
  { date: '2024-05-15', type: 'login', description: 'Logged in from mobile app', timestamp: '7:22 AM' },
  { date: '2024-05-10', type: 'feature', description: 'Created new dashboard report', timestamp: '3:15 PM' },
];
