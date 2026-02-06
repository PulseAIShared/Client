import React from 'react';
import { enumLabelMap, formatEnumLabel } from '@/features/playbooks/utils';

type BadgeProps = {
  label: string;
  tone: string;
};

const Badge: React.FC<BadgeProps> = ({ label, tone }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${tone}`}>
    {label}
  </span>
);

export const PlaybookStatusBadge: React.FC<{ status: number | string }> = ({ status }) => {
  const label = formatEnumLabel(status, enumLabelMap.status);
  const tone = {
    Draft: 'bg-surface-secondary/60 text-text-muted border-border-primary/40',
    Active: 'bg-success/15 text-success border-success/40',
    Paused: 'bg-warning/15 text-warning border-warning/40',
    Archived: 'bg-border-primary/20 text-text-muted border-border-primary/30',
  }[label] ?? 'bg-border-primary/20 text-text-muted border-border-primary/30';

  return <Badge label={label} tone={tone} />;
};

export const PlaybookCategoryBadge: React.FC<{ category: number | string }> = ({ category }) => {
  const label = formatEnumLabel(category, enumLabelMap.category);
  const tone = {
    Payment: 'bg-accent-primary/10 text-accent-primary border-accent-primary/40',
    Engagement: 'bg-purple-500/10 text-purple-500 border-purple-500/40',
    Support: 'bg-blue-500/10 text-blue-500 border-blue-500/40',
    Cancellation: 'bg-orange-500/10 text-orange-500 border-orange-500/40',
    Custom: 'bg-surface-secondary/60 text-text-secondary border-border-primary/40',
  }[label] ?? 'bg-surface-secondary/60 text-text-secondary border-border-primary/40';

  return <Badge label={label} tone={tone} />;
};

export const ConfidenceBadge: React.FC<{ confidence: number | string }> = ({ confidence }) => {
  const label = formatEnumLabel(confidence, enumLabelMap.confidence);
  const tone = {
    Minimal: 'bg-border-primary/20 text-text-muted border-border-primary/30',
    Good: 'bg-success/10 text-success border-success/40',
    High: 'bg-accent-primary/10 text-accent-primary border-accent-primary/40',
    Excellent: 'bg-purple-500/10 text-purple-500 border-purple-500/40',
  }[label] ?? 'bg-border-primary/20 text-text-muted border-border-primary/30';

  return <Badge label={label} tone={tone} />;
};

export const LifecycleBadge: React.FC<{ status: number | string }> = ({ status }) => {
  const label = formatEnumLabel(status, enumLabelMap.lifecycle);
  const tone = {
    Pending: 'bg-warning/10 text-warning border-warning/40',
    'Pending Approval': 'bg-warning/10 text-warning border-warning/40',
    Executing: 'bg-accent-primary/10 text-accent-primary border-accent-primary/40',
    Terminal: 'bg-success/10 text-success border-success/40',
  }[label] ?? 'bg-border-primary/20 text-text-muted border-border-primary/30';

  return <Badge label={label} tone={tone} />;
};

export const OutcomeBadge: React.FC<{ outcome?: number | string | null }> = ({ outcome }) => {
  const label = formatEnumLabel(outcome ?? '—', enumLabelMap.outcome);
  const tone = {
    Succeeded: 'bg-success/10 text-success border-success/40',
    'Partial Success': 'bg-warning/10 text-warning border-warning/40',
    Failed: 'bg-error/10 text-error border-error/40',
    Inconclusive: 'bg-border-primary/20 text-text-muted border-border-primary/30',
    Cancelled: 'bg-border-primary/20 text-text-muted border-border-primary/30',
    Rejected: 'bg-border-primary/20 text-text-muted border-border-primary/30',
  }[label] ?? 'bg-border-primary/20 text-text-muted border-border-primary/30';

  return <Badge label={label} tone={tone} />;
};
