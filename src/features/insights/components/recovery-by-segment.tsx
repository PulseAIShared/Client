import React from 'react';
import { useGetInsightsData } from '@/features/insights/api/insights';

export const RecoveryBySegment: React.FC = () => {
  const { data, isLoading, error } = useGetInsightsData();
  if (isLoading) {
    return <div className="h-40 bg-surface-primary/80 rounded-2xl border border-border-primary/30 animate-pulse" />;
  }
  if (error || !data) return null;
  const items = data.recoveryAnalytics.bySegment;
  return (
    <div className="bg-surface-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-xl">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Recovery by Segment</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((s) => (
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