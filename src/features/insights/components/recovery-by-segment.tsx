import React from 'react';
import { useGetRecoveryInsights } from '@/features/insights/api/recovery-insights';

export const RecoveryBySegment: React.FC = () => {
  const { data, isLoading, error } = useGetRecoveryInsights();
  if (isLoading) {
    return <div className="h-40 bg-surface-primary/80 rounded-2xl border border-border-primary/30 animate-pulse" />;
  }
  if (error || !data) return null;
  const items = data.bySegment;
  if (!items || items.length === 0) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 text-center">
        <div className="text-lg font-semibold text-text-primary mb-2">No segment recovery data</div>
        <div className="text-sm text-text-muted">Create segments to see missed and recovered revenue by segment.</div>
      </div>
    );
  }
  return (
    <div className="bg-surface-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-xl">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Recovery by Segment</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((s: any) => (
          <div key={s.segmentId} className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-text-primary">{s.segmentName}</div>
              <div className="text-sm text-success">{s.recoveryRate}%</div>
            </div>
            <div className="flex items-center justify-between text-sm text-text-muted">
              <div>Missed: ${s.missedAmount.toLocaleString()}</div>
              <div>Recovered: ${s.recoveredAmount.toLocaleString()}</div>
            </div>
            <div className="mt-2 w-full bg-surface-primary/50 rounded-full h-2">
              <div className="bg-success h-2 rounded-full" style={{ width: `${Math.min(100, s.recoveryRate)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};