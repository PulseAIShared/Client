import { WorkQueueItem, WorkQueueSummary } from '@/types/playbooks';

export const HIGH_VALUE_THRESHOLD = 100;
export const STALE_THRESHOLD_MINUTES = 60;

export type QueuePriority = 'High' | 'Medium' | 'Low';
export type AgeSeverity = 'fresh' | 'warning' | 'stale' | 'critical';

export const getPriorityFromItem = (item: WorkQueueItem): QueuePriority => {
  if (item.priority) {
    return item.priority;
  }

  const confidence = String(item.confidence).toLowerCase();
  if (confidence.includes('excellent') || confidence.includes('high')) {
    return 'High';
  }
  if (confidence.includes('good')) {
    return 'Medium';
  }
  return 'Low';
};

export const getPriorityRank = (item: WorkQueueItem): number => {
  const priority = getPriorityFromItem(item);
  if (priority === 'High') {
    return 3;
  }
  if (priority === 'Medium') {
    return 2;
  }
  return 1;
};

export const getAgeMs = (createdAt: string): number => {
  return Date.now() - new Date(createdAt).getTime();
};

export const getAgeSeverity = (createdAt: string): AgeSeverity => {
  const ageMs = getAgeMs(createdAt);
  const oneHour = 60 * 60 * 1000;
  const fourHours = 4 * oneHour;
  const oneDay = 24 * oneHour;

  if (ageMs < oneHour) {
    return 'fresh';
  }
  if (ageMs < fourHours) {
    return 'warning';
  }
  if (ageMs < oneDay) {
    return 'stale';
  }
  return 'critical';
};

export const getAgeColorClasses = (createdAt: string) => {
  const severity = getAgeSeverity(createdAt);

  if (severity === 'warning') {
    return {
      text: 'text-amber-700',
      border: 'border-l-amber-300',
      row: 'bg-amber-50/30',
    };
  }
  if (severity === 'stale') {
    return {
      text: 'text-orange-700',
      border: 'border-l-orange-400',
      row: 'bg-orange-50/30',
    };
  }
  if (severity === 'critical') {
    return {
      text: 'text-red-700',
      border: 'border-l-red-400',
      row: 'bg-red-50/40',
    };
  }

  return {
    text: 'text-text-secondary',
    border: 'border-l-transparent',
    row: '',
  };
};

export const formatRelativeAge = (createdAt: string): string => {
  const ageMs = getAgeMs(createdAt);
  const totalMinutes = Math.max(0, Math.floor(ageMs / (1000 * 60)));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h ago`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ago`;
  }
  return `${minutes}m ago`;
};

export const sortItemsByDefault = (items: WorkQueueItem[]): WorkQueueItem[] => {
  return [...items].sort((a, b) => {
    const priorityDiff = getPriorityRank(b) - getPriorityRank(a);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
};

export const buildSummaryFromItems = (items: WorkQueueItem[]): WorkQueueSummary => {
  if (items.length === 0) {
    return {
      pendingApprovals: 0,
      highValueCount: 0,
      staleCount: 0,
      totalValueAtRisk: 0,
      oldestPendingAge: null,
    };
  }

  const now = Date.now();
  let oldestAgeMs = 0;
  let highValueCount = 0;
  let staleCount = 0;
  let totalValueAtRisk = 0;

  items.forEach((item) => {
    const ageMs = now - new Date(item.createdAt).getTime();
    oldestAgeMs = Math.max(oldestAgeMs, ageMs);

    const amount = item.potentialValue ?? 0;
    totalValueAtRisk += amount;
    if (amount > HIGH_VALUE_THRESHOLD) {
      highValueCount += 1;
    }
    if (ageMs >= STALE_THRESHOLD_MINUTES * 60 * 1000) {
      staleCount += 1;
    }
  });

  const oldestHours = Math.floor(oldestAgeMs / (1000 * 60 * 60));
  const oldestMinutes = Math.floor((oldestAgeMs % (1000 * 60 * 60)) / (1000 * 60));
  const oldestPendingAge = `${oldestHours.toString().padStart(2, '0')}:${oldestMinutes
    .toString()
    .padStart(2, '0')}:00`;

  return {
    pendingApprovals: items.length,
    highValueCount,
    staleCount,
    totalValueAtRisk,
    oldestPendingAge,
  };
};
