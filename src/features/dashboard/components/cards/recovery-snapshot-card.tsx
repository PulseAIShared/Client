import React from 'react';
import { Link } from 'react-router-dom';
import { RecoveryAnalyticsKpis } from '@/types/api';

interface RecoverySnapshotCardProps {
  kpis?: Partial<RecoveryAnalyticsKpis>;
  isLoading?: boolean;
  error?: Error | null;
}

export const RecoverySnapshotCard: React.FC<RecoverySnapshotCardProps> = ({ kpis, isLoading, error }) => {

  return (
    <div className="bg-surface-primary/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Recovery Snapshot</h3>
          <p className="text-sm text-text-muted">Last 7 days performance</p>
        </div>
        <Link to="/app/insights" className="text-sm text-accent-primary hover:underline">Open Insights</Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface-secondary/40 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && !kpis && !error && (
        <div className="text-sm text-text-muted">No recovery data available yet.</div>
      )}

      {!isLoading && kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/30 text-center">
            <div className="text-xs text-text-muted">Missed Amount</div>
            <div className="text-xl font-bold text-text-primary">${(kpis.missedAmount || 0).toLocaleString()}</div>
          </div>
          <div className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/30 text-center">
            <div className="text-xs text-text-muted">Recovered Amount</div>
            <div className="text-xl font-bold text-success">${(kpis.recoveredAmount || 0).toLocaleString()}</div>
          </div>
          <div className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/30 text-center">
            <div className="text-xs text-text-muted">Recovery Rate</div>
            <div className="text-xl font-bold text-text-primary">{Math.round(kpis.recoveryRate || 0)}%</div>
          </div>
          <div className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/30 text-center">
            <div className="text-xs text-text-muted">Avg Days to Recover</div>
            <div className="text-xl font-bold text-text-primary">{(kpis.averageDaysToRecover || 0).toFixed(1)}</div>
          </div>
        </div>
      )}
    </div>
  );
};


