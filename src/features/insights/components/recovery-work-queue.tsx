import React from 'react';
import { useGetInsightsData } from '@/features/insights/api/insights';
import { useEnrollInFlow, useRetryPayment } from '@/features/recovery/api/recovery';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/ui/notifications/notifications-store';
import { useModal } from '@/app/modal-provider';

type FilterState = {
  status: 'All' | 'Open' | 'In Progress' | 'Recovered';
  minAmount?: number;
  segment?: string;
  search?: string;
};

export const RecoveryWorkQueue: React.FC = () => {
  const { data, isLoading, error } = useGetInsightsData();
  const retryMutation = useRetryPayment();
  const enrollMutation = useEnrollInFlow();
  const { addNotification } = useNotifications();

  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [filters, setFilters] = React.useState<FilterState>({ status: 'All' });
  const { openModal, closeModal } = useModal();
  const [selectedFlowId, setSelectedFlowId] = React.useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl animate-pulse">
        <div className="h-6 bg-surface-secondary/50 rounded-xl mb-4 w-1/3"></div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-surface-secondary/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }
  if (error || !data) return null;

  const allRows = data.recoveryAnalytics.tables.missedPayments;
  const flows = data.recoveryFlows.flows;
  const segments = Array.from(new Set(allRows.flatMap((r) => r.segmentTags)));

  const rows = allRows.filter((r) => {
    if (filters.status !== 'All' && r.status !== filters.status) return false;
    if (filters.minAmount && r.amount < filters.minAmount) return false;
    if (filters.segment && !r.segmentTags.includes(filters.segment)) return false;
    if (filters.search && !r.customer.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const selectedIds = Object.keys(selected).filter((k) => selected[k]);

  const onBulkRetry = () => {
    selectedIds.forEach((id) => retryMutation.mutate(id));
    addNotification({ type: 'info', title: `Retrying ${selectedIds.length} payments` });
  };

  const onBulkEnroll = () => {
    if (!selectedFlowId) {
      openModal(
        <div className="fixed inset-0">
          <div className="fixed inset-0 bg-bg-primary/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface-primary/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-border-primary/30">
                <h4 className="text-lg font-semibold text-text-primary">Choose Recovery Flow</h4>
                <button className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary/50 rounded-lg transition-colors" onClick={closeModal} aria-label="Close">✕</button>
              </div>
              <div className="p-6 space-y-2 max-h-64 overflow-y-auto">
                {flows.map((f) => (
                  <label key={f.id} className="flex items-center gap-2 p-3 rounded-xl border border-border-primary/30 hover:bg-surface-secondary/50">
                    <input type="radio" name="flow" value={f.id} checked={selectedFlowId === f.id} onChange={() => setSelectedFlowId(f.id)} />
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">{f.name}</div>
                      <div className="text-xs text-text-muted">Trigger: {f.trigger} • Success: {f.success_rate}%</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="p-6 flex items-center justify-end gap-2 border-t border-border-primary/30">
                <Button variant="outline" onClick={closeModal}>Cancel</Button>
                <Button onClick={() => { closeModal(); runBulkEnroll(); }}>Enroll Selected</Button>
              </div>
            </div>
          </div>
        </div>
      );
      return;
    }
    runBulkEnroll();
  };

  const runBulkEnroll = () => {
    if (!selectedFlowId) return;
    selectedIds.forEach((id) => enrollMutation.mutate({ paymentId: id, flowId: selectedFlowId }));
    addNotification({ type: 'success', title: `Enrolled ${selectedIds.length} payments into flow` });
  };

  const onExportCsv = () => {
    const header = ['id', 'customer', 'amount', 'dueDate', 'status', 'attempts', 'segments'];
    const lines = rows.map((r) => [r.id, r.customer, r.amount, r.dueDate, r.status, r.attempts, r.segmentTags.join('|')].join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recovery-queue.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="queue" className="bg-surface-primary/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-1">Recovery Work Queue</h2>
          <p className="text-sm text-text-muted">Filter, select, and take action on missed payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExportCsv}
            icon={(<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-8m0 8l-3-3m3 3l3-3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H7l-2 2H5"/></svg>)}
          >Export</Button>
          <Button variant="secondary" size="sm" onClick={onBulkRetry} disabled={selectedIds.length === 0 || retryMutation.isPending} isLoading={retryMutation.isPending}
            icon={(<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>)}
          >Bulk Retry</Button>
          <Button size="sm" onClick={onBulkEnroll} disabled={selectedIds.length === 0 || enrollMutation.isPending} isLoading={enrollMutation.isPending}
            icon={(<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>)}
          >Enroll</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <select className="w-full px-4 py-3 rounded-xl bg-surface-secondary/50 border border-border-primary/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as any }))}>
          {['All', 'Open', 'In Progress', 'Recovered'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="w-full px-4 py-3 rounded-xl bg-surface-secondary/50 border border-border-primary/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all" value={filters.segment || ''} onChange={(e) => setFilters((f) => ({ ...f, segment: e.target.value || undefined }))}>
          <option value="">All Segments</option>
          {segments.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input type="number" min={0} placeholder="Min amount" className="w-full px-4 py-3 rounded-xl bg-surface-secondary/50 border border-border-primary/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all" value={filters.minAmount ?? ''} onChange={(e) => setFilters((f) => ({ ...f, minAmount: e.target.value ? Number(e.target.value) : undefined }))} />
        <input placeholder="Search customer" className="w-full px-4 py-3 rounded-xl bg-surface-secondary/50 border border-border-primary/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all" value={filters.search || ''} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-text-muted">
              <th className="py-2 pr-4"><input type="checkbox" aria-label="Select all" onChange={(e) => {
                const checked = e.target.checked; const next: Record<string, boolean> = {}; rows.forEach((r) => (next[r.id] = checked)); setSelected(next);
              }} /></th>
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
              <tr key={r.id} className="border-t border-border-primary/30 hover:bg-surface-secondary/30 transition-colors">
                <td className="py-3 pr-4"><input type="checkbox" checked={!!selected[r.id]} onChange={(e) => setSelected((prev) => ({ ...prev, [r.id]: e.target.checked }))} aria-label={`Select ${r.customer}`} /></td>
                <td className="py-3 pr-4 text-text-primary">
                  <div className="font-medium">{r.customer}</div>
                  <div className="text-xs text-text-muted">#{r.id}</div>
                </td>
                <td className="py-3 pr-4">${r.amount.toLocaleString()}</td>
                <td className="py-3 pr-4">{new Date(r.dueDate).toLocaleDateString()}</td>
                <td className="py-3 pr-4"><span className="px-2 py-1 rounded-full border border-border-primary/30 text-xs">{r.status}</span></td>
                <td className="py-3 pr-4">{r.attempts}</td>
                <td className="py-3 pr-4"><div className="flex flex-wrap gap-1">{r.segmentTags.map((t: string) => (<span key={t} className="px-2 py-1 rounded-full bg-surface-secondary/50 text-xs">{t}</span>))}</div></td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => retryMutation.mutate(r.id)} isLoading={retryMutation.isPending}
                      icon={(<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>)}
                    >Retry</Button>
                    <Button variant="secondary" size="sm" onClick={() => { setSelected((prev) => ({ ...prev, [r.id]: true })); setSelectedFlowId(null); onBulkEnroll(); }}
                      icon={(<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>)}
                    >Enroll</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


