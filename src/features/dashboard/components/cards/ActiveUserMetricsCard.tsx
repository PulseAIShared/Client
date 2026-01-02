import React from 'react';
import { Users, Calendar, BarChart2, TrendingUp } from 'lucide-react';
import { ActiveUserMetrics } from '@/types/api';

interface ActiveUserMetricsCardProps {
  data?: ActiveUserMetrics;
  isLoading?: boolean;
  error?: Error | null;
}

export const ActiveUserMetricsCard: React.FC<ActiveUserMetricsCardProps> = ({
  data,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg space-y-4">
        <div className="h-6 bg-gradient-to-r from-surface-secondary to-surface-primary rounded-lg w-48" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gradient-to-r from-surface-secondary to-surface-primary rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-error-muted/5 border border-error-muted/20 p-6 rounded-2xl">
        <div className="text-error-muted text-sm">
          Failed to load active user metrics
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Last 7 Days',
      value: data.last7Days,
      percentage: Math.round(data.percentage7Days),
      color: 'from-blue-500 to-cyan-500',
      icon: <Calendar className="w-5 h-5 text-blue-400" />,
    },
    {
      label: 'Last 14 Days',
      value: data.last14Days,
      percentage: Math.round(data.percentage14Days),
      color: 'from-purple-500 to-pink-500',
      icon: <BarChart2 className="w-5 h-5 text-purple-400" />,
    },
    {
      label: 'Last 30 Days',
      value: data.last30Days,
      percentage: Math.round(data.percentage30Days),
      color: 'from-green-500 to-emerald-500',
      icon: <TrendingUp className="w-5 h-5 text-green-400" />,
    },
  ];

  return (
    <div className="bg-surface-primary/80 backdrop-blur-lg rounded-2xl border border-border-primary/30 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-surface-primary to-surface-secondary p-6 border-b border-border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">Active Users</h3>
        </div>
        <p className="text-text-muted text-sm">User engagement across time windows</p>
      </div>

      <div className="p-6 space-y-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {metric.icon}
                <label className="text-sm font-medium text-text-primary">
                  {metric.label}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-text-primary">
                  {metric.value.toLocaleString()}
                </span>
                <span className="text-sm font-semibold bg-gradient-to-r from-success to-success-muted bg-clip-text text-transparent">
                  {metric.percentage}%
                </span>
              </div>
            </div>
            <div className="relative h-2 bg-surface-secondary rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${metric.color} transition-all duration-500`}
                style={{ width: `${Math.min(metric.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 bg-surface-secondary/50 border-t border-border-primary/10">
        <p className="text-xs text-text-muted">
          Shows the number and percentage of active users for each time period
        </p>
      </div>
    </div>
  );
};
