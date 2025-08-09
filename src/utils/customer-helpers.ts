import { SubscriptionStatus } from "@/types/api";

// Helper functions
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const calculateTenure = (startDate: string) => {
  const start = new Date(startDate);
  const now = new Date();
  const months = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  return months;
};

export const getPlanName = (plan: number) => {
  switch (plan) {
    case 0: return 'Basic';
    case 1: return 'Pro';
    case 2: return 'Enterprise';
    default: return 'Unknown';
  }
};

export const getSubscriptionStatusName = (status: number) => {
  switch (status) {
    case 0: return 'Inactive';
    case 1: return 'Active';
    case 2: return 'Cancelled';
    case 3: return 'Past Due';
    case 4: return 'Paused';
    default: return 'Unknown';
  }
};

export const getPaymentStatusName = (status: number) => {
  switch (status) {
    case 0: return 'Current';
    case 1: return 'Failed';
    case 2: return 'Overdue';
    case 3: return 'Pending';
    default: return 'Unknown';
  }
};

export const getHealthScoreColor = (score: string) => {
  switch (score.toLowerCase()) {
    case 'excellent':
      return 'text-green-400 bg-green-500/20 border-green-500/30';
    case 'good':
      return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    case 'fair':
      return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    case 'poor':
      return 'text-red-400 bg-red-500/20 border-red-500/30';
    default:
      return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
};

export const getRiskColor = (risk: number) => {
  if (risk >= 80) return 'text-red-400 bg-red-500/20 border-red-500/30';
  if (risk >= 60) return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
  if (risk >= 40) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
  return 'text-green-400 bg-green-500/20 border-green-500/30';
};


export const getActivityColor = (frequency: string) => {
  if (frequency === 'High') return 'text-green-400 bg-green-500/20 border-green-500/30';
  if (frequency === 'Medium') return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
  return 'text-red-400 bg-red-500/20 border-red-500/30';
};

export const getSubscriptionStatusColor = (status: SubscriptionStatus) => {
  switch (status) {
    case SubscriptionStatus.Active:
      return 'text-green-400 bg-green-500/20 border-green-500/30';
    case SubscriptionStatus.Cancelled:
      return 'text-red-400 bg-red-500/20 border-red-500/30';
    case SubscriptionStatus.PastDue:
      return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    case SubscriptionStatus.Paused:
      return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    default:
      return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
  }
};

// Helper function to format sync status
export const getSyncStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'current':
    case 'active':
      return 'text-green-400 bg-green-500/20 border-green-500/30';
    case 'stale':
    case 'outdated':
      return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    case 'error':
    case 'failed':
      return 'text-red-400 bg-red-500/20 border-red-500/30';
    default:
      return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
  }
};

export const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};