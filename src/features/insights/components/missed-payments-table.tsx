import React from 'react';
import { useGetInsightsData } from '@/features/insights/api/insights';

export const MissedPaymentsTable: React.FC = () => {
  const { data, isLoading, error } = useGetInsightsData();
  if (isLoading) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-xl">
        <div className="h-6 bg-surface-secondary/50 rounded-xl mb-4 w-1/3"></div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-surface-secondary/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }
  if (error || !data) return null;
  const rows = data.recoveryAnalytics.tables.missedPayments;

  if (!rows || rows.length === 0) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 text-center">
        <div className="text-lg font-semibold text-text-primary mb-2">No missed payments</div>
        <div className="text-sm text-text-muted mb-4">Connect billing to start tracking missed payments and recovery events.</div>
        <button className="px-4 py-2 rounded-lg border border-border-primary/30 hover:bg-surface-secondary/50">Connect Billing</button>
      </div>
    );
  }

  return (
    <div className="bg-surface-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Missed Payments</h3>
        <div className="text-sm text-text-muted">{rows.length} records</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-text-muted">
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Due Date</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Attempts</th>
              <th className="py-2 pr-4">Segments</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border-primary/30">
                <td className="py-3 pr-4 text-text-primary">{r.customer}</td>
                <td className="py-3 pr-4">${r.amount.toLocaleString()}</td>
                <td className="py-3 pr-4">{new Date(r.dueDate).toLocaleDateString()}</td>
                <td className="py-3 pr-4">
                  <span className="px-2 py-1 rounded-full border border-border-primary/30 text-xs">{r.status}</span>
                </td>
                <td className="py-3 pr-4">{r.attempts}</td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-1">
                    {r.segmentTags.map((t) => (
                      <span key={t} className="px-2 py-1 rounded-full bg-surface-secondary/50 text-xs">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <button className="px-2 py-1 text-xs rounded-lg border border-border-primary/30 hover:bg-surface-secondary/50">Retry</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};