import React from 'react';
import { useGetInsightsData } from '@/features/insights/api/insights';

export const RecoveryReasons: React.FC = () => {
  const { data, isLoading, error } = useGetInsightsData();
  if (isLoading) return <div className="h-32 bg-surface-primary/80 rounded-2xl border border-border-primary/30 animate-pulse" />;
  if (error || !data) return null;
  const reasons = data.recoveryAnalytics.reasons;
  if (!reasons || reasons.length === 0) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 text-center">
        <div className="text-lg font-semibold text-text-primary mb-2">No payment failure reasons</div>
        <div className="text-sm text-text-muted">Once you collect billing error data, we’ll show common failure reasons here.</div>
      </div>
    );
  }
  const total = reasons.reduce((acc, r) => acc + r.count, 0) || 1;

  return (
    <div className="bg-surface-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-xl">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Failure Reasons</h3>
      <div className="space-y-3">
        {reasons.map((r) => (
          <div key={r.reason} className="">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm text-text-primary">{r.reason}</div>
              <div className="text-xs text-text-muted">{Math.round((r.count / total) * 100)}%</div>
            </div>
            <div className="w-full bg-surface-secondary/50 rounded-full h-2">
              <div className="bg-warning h-2 rounded-full" style={{ width: `${(r.count / total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};