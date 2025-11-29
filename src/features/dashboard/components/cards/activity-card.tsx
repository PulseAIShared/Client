import React from 'react';
import { DashboardStats } from '@/types/api';

interface ActivityCardProps {
  stats?: DashboardStats;
  isLoading?: boolean;
  error?: Error | null;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ stats, isLoading, error }) => {
  if (isLoading) {
    return <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg animate-pulse min-h-[240px]" />;
  }

  if (error || !stats) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg min-h-[240px] flex items-center justify-center">
        <p className="text-text-muted text-sm">Activity data unavailable</p>
      </div>
    );
  }

  const rows = [
    { label: 'Active users (7d)', value: stats.activeUsers7 ?? '—', accent: 'bg-success/70' },
    { label: 'Active users (14d)', value: stats.activeUsers14 ?? '—', accent: 'bg-warning/70' },
    { label: 'Active users (30d)', value: stats.activeUsers30 ?? '—', accent: 'bg-accent-primary/70' },
    { label: 'Activation rate', value: stats.activationRate ?? '—', accent: 'bg-info/70' },
  ];

  return (
    <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Engagement snapshot</h3>
          <p className="text-text-muted text-sm">Recent activity & healthy usage</p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs bg-success-bg/30 text-success-muted border border-success/20">
          Live
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between bg-surface-secondary/60 border border-border-primary/30 rounded-xl px-3 py-3">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${row.accent}`} />
              <span className="text-sm text-text-secondary">{row.label}</span>
            </div>
            <span className="text-base font-semibold text-text-primary">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
