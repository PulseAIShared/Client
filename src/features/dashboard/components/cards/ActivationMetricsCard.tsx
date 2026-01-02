import React from 'react';
import { Zap, Rocket, Star, Moon } from 'lucide-react';
import { ActivationMetrics } from '@/types/api';

interface ActivationMetricsCardProps {
  data?: ActivationMetrics;
  isLoading?: boolean;
  error?: Error | null;
}

export const ActivationMetricsCard: React.FC<ActivationMetricsCardProps> = ({
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
            <div key={i} className="h-20 bg-gradient-to-r from-surface-secondary to-surface-primary rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-error-muted/5 border border-error-muted/20 p-6 rounded-2xl">
        <div className="text-error-muted text-sm">
          Failed to load activation metrics
        </div>
      </div>
    );
  }

  const activationTypes = [
    {
      label: 'Frequent Users',
      description: '4+ logins per week',
      percentage: Math.round(data.frequentUserPercentage),
      color: 'from-green-500 to-emerald-500',
      icon: <Rocket className="w-5 h-5 text-green-400" />,
      bg: 'bg-green-500/10',
    },
    {
      label: 'Regular Users',
      description: '2-3 logins per week',
      percentage: Math.round(data.regularUserPercentage),
      color: 'from-blue-500 to-cyan-500',
      icon: <Star className="w-5 h-5 text-blue-400" />,
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Inactive Users',
      description: '< 1 login per week',
      percentage: Math.round(data.inactiveUserPercentage),
      color: 'from-orange-500 to-red-500',
      icon: <Moon className="w-5 h-5 text-orange-400" />,
      bg: 'bg-orange-500/10',
    },
  ];

  const avgFeatureUsage = Math.round(data.avgFeatureUsagePercentage);
  const avgSessionMinutes = Math.round(data.avgSessionDuration);

  return (
    <div className="bg-surface-primary/80 backdrop-blur-lg rounded-2xl border border-border-primary/30 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-surface-primary to-surface-secondary p-6 border-b border-border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">Activation Metrics</h3>
        </div>
        <p className="text-text-muted text-sm">User engagement frequency distribution</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Activation Distribution */}
        <div className="space-y-3">
          {activationTypes.map((type, idx) => (
            <div key={idx} className={`${type.bg} border border-border-primary/10 rounded-xl p-4`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {type.icon}
                    <h4 className="font-semibold text-text-primary">{type.label}</h4>
                  </div>
                  <p className="text-xs text-text-muted">{type.description}</p>
                </div>
                <span className={`text-lg font-bold bg-gradient-to-r ${type.color} bg-clip-text text-transparent`}>
                  {type.percentage}%
                </span>
              </div>
              <div className="relative h-2 bg-surface-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${type.color} transition-all duration-500`}
                  style={{ width: `${Math.min(type.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="h-px bg-border-primary/10" />

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-surface-secondary/50 to-surface-primary/50 rounded-xl p-4 border border-border-primary/10">
            <p className="text-text-muted text-xs font-medium mb-1">Avg Feature Usage</p>
            <p className="text-2xl font-bold text-text-primary">{avgFeatureUsage}%</p>
            <p className="text-text-muted text-xs mt-1">of available features</p>
          </div>
          <div className="bg-gradient-to-br from-surface-secondary/50 to-surface-primary/50 rounded-xl p-4 border border-border-primary/10">
            <p className="text-text-muted text-xs font-medium mb-1">Avg Session</p>
            <p className="text-2xl font-bold text-text-primary">{avgSessionMinutes}m</p>
            <p className="text-text-muted text-xs mt-1">per session</p>
          </div>
        </div>

        {/* Total Active Users */}
        <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-xl p-4 border border-accent-primary/20">
          <p className="text-text-muted text-xs font-medium mb-1">Total Active Users</p>
          <p className="text-3xl font-bold text-text-primary">{data.totalActiveUsers.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};
