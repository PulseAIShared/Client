export const enumLabelMap = {
  status: ['Draft', 'Active', 'Paused', 'Archived'],
  category: ['Payment', 'Engagement', 'Support', 'Cancellation', 'Custom'],
  triggerType: ['Signal', 'Segment', 'Manual'],
  executionMode: ['Immediate', 'Approval', 'Scheduled'],
  actionType: ['Stripe Retry', 'Slack Alert', 'CRM Task', 'HubSpot Workflow', 'Email', 'Webhook'],
  confidence: ['Minimal', 'Good', 'High', 'Excellent'],
  lifecycle: ['Pending', 'Pending Approval', 'Executing', 'Terminal'],
  outcome: ['Succeeded', 'Partial Success', 'Failed', 'Inconclusive', 'Cancelled', 'Rejected'],
};

export const confidenceLevelDetails = [
  {
    value: 0,
    label: 'Minimal',
    threshold: '0-1 active providers',
    description:
      'Single-source coverage. Best for simple provider-native automations.',
  },
  {
    value: 1,
    label: 'Good',
    threshold: '2 active providers',
    description:
      'Balanced coverage for multi-source workflows and segment filters.',
  },
  {
    value: 2,
    label: 'High',
    threshold: '3 active providers',
    description:
      'Stronger stitched profile coverage for higher-impact actions.',
  },
  {
    value: 3,
    label: 'Excellent',
    threshold: '4+ active providers',
    description:
      'Strictest coverage requirement for sensitive, broad automation.',
  },
] as const;

export const getConfidenceLevelDetail = (
  value: number | string | null | undefined,
) => {
  const numericValue =
    typeof value === 'number'
      ? value
      : Number.isFinite(Number(value))
        ? Number(value)
        : undefined;

  if (numericValue === undefined) {
    return undefined;
  }

  return confidenceLevelDetails.find(
    (detail) => detail.value === numericValue,
  );
};

export const formatEnumLabel = (value: number | string | null | undefined, labels: string[]) => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') {
    return labels[value] ?? String(value);
  }
  if (!value) return '—';
  const normalized = value.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
  return normalized
    .split(' ')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
    .join(' ');
};

export const formatTimespan = (value?: string | null) => {
  if (!value) return '—';
  const [hours, minutes, seconds] = value.split(':').map((part) => Number(part));
  if ([hours, minutes, seconds].some((part) => Number.isNaN(part))) {
    return value;
  }
  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (!hours && !minutes) parts.push(`${seconds || 0}s`);
  return parts.join(' ');
};

// Priority helpers
export const getPriorityLabel = (priority: number) => {
  if (priority >= 1 && priority <= 25) return 'Critical';
  if (priority <= 50) return 'High';
  if (priority <= 75) return 'Medium';
  return 'Low';
};

export const getPriorityColor = (priority: number) => {
  const label = getPriorityLabel(priority);
  switch (label) {
    case 'Critical':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'High':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'Medium':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

// Signal helpers (basic mapping; expand as needed)
export const getSignalDisplayName = (signalType?: string | number | null) => {
  if (signalType === null || signalType === undefined) return undefined;
  const map: Record<string, string> = {
    payment_failure: 'Payment failed',
    inactivity_7d: 'Inactive for 7 days',
    deal_lost: 'Deal lost',
  };
  const key = String(signalType).toLowerCase();
  return map[key] ?? formatEnumLabel(String(signalType), []);
};

export const formatRelativeDate = (iso?: string) => {
  if (!iso) return '';
  const now = new Date();
  const then = new Date(iso);
  const diffMs = then.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const minutes = Math.round(absMs / (1000 * 60));
  if (minutes < 60) return rtf.format(Math.sign(diffMs) * Math.max(1, Math.round(minutes)), 'minute');
  const hours = Math.round(absMs / (1000 * 60 * 60));
  if (hours < 24) return rtf.format(Math.sign(diffMs) * Math.max(1, Math.round(hours)), 'hour');
  const days = Math.round(absMs / (1000 * 60 * 60 * 24));
  if (days < 30) return rtf.format(Math.sign(diffMs) * Math.max(1, Math.round(days)), 'day');
  const months = Math.round(days / 30);
  if (months < 12) return rtf.format(Math.sign(diffMs) * Math.max(1, Math.round(months)), 'month');
  const years = Math.round(months / 12);
  return rtf.format(Math.sign(diffMs) * Math.max(1, Math.round(years)), 'year');
};
