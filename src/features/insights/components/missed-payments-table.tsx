import React from 'react';
import { useGetInsightsData } from '@/features/insights/api/insights';
import { useRetryPayment, useEnrollInFlow } from '@/features/recovery/api/recovery';

export const MissedPaymentsTable: React.FC = () => {
  const { data, isLoading, error } = useGetInsightsData();
  const retryMutation = useRetryPayment();
  const enrollMutation = useEnrollInFlow();
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const ids = Object.keys(selected).filter((k) => selected[k]);
              ids.forEach((id) => retryMutation.mutate(id));
            }}
            disabled={Object.values(selected).every((v) => !v) || retryMutation.isPending}
            className="px-3 py-2 text-xs rounded-lg border border-border-primary/30 hover:bg-surface-secondary/50"
          >
            Bulk Retry
          </button>
          <div className="text-sm text-text-muted">{rows.length} records</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-text-muted">
              <th className="py-2 pr-4">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const next: Record<string, boolean> = {};
                    rows.forEach((r) => (next[r.id] = checked));
                    setSelected(next);
                  }}
                />
              </th>
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
                <td className="py-3 pr-4">
                  <input
                    type="checkbox"
                    checked={!!selected[r.id]}
                    onChange={(e) =>
                      setSelected((prev) => ({ ...prev, [r.id]: e.target.checked }))
                    }
                    aria-label={`Select ${r.customer}`}
                  />
                </td>
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => retryMutation.mutate(r.id)}
                      className="px-2 py-1 text-xs rounded-lg border border-border-primary/30 hover:bg-surface-secondary/50"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => enrollMutation.mutate({ paymentId: r.id, flowId: 'Payment Recovery Flow' })}
                      className="px-2 py-1 text-xs rounded-lg border border-border-primary/30 hover:bg-surface-secondary/50"
                    >
                      Enroll
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}