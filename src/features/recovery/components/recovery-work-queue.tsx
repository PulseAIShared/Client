import React from 'react';
import { useGetRecoveryData, useEnrollInFlow, useRetryPayment, useBulkEnrollInFlow } from '@/features/recovery/api/recovery';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/ui/notifications/notifications-store';
import { useModal } from '@/app/modal-provider';
import { MissedPaymentRow } from '@/types/recovery';

type FilterState = {
  status: 'All' | 'Open' | 'In Progress' | 'Recovered';
  minAmount?: number;
  segment?: string;
  search?: string;
};

type SortConfig = {
  key: keyof MissedPaymentRow;
  direction: 'asc' | 'desc';
} | null;

export const RecoveryWorkQueue: React.FC = () => {
  const { data, isLoading, error } = useGetRecoveryData();
  const retryMutation = useRetryPayment();
  const enrollMutation = useEnrollInFlow();
  const bulkEnrollMutation = useBulkEnrollInFlow();
  const { addNotification } = useNotifications();

  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [filters, setFilters] = React.useState<FilterState>({ status: 'All' });
  const [sortConfig, setSortConfig] = React.useState<SortConfig>(null);
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

  const allRows = data.analytics.tables.missedPayments;
  const flows = data.flows.flows;
  const segments = Array.from(new Set(allRows.flatMap((r) => r.segmentTags)));

  // Filter and sort data
  let rows = allRows.filter((r) => {
    if (filters.status !== 'All' && r.status !== filters.status) return false;
    if (filters.minAmount && r.amount < filters.minAmount) return false;
    if (filters.segment && !r.segmentTags.includes(filters.segment)) return false;
    if (filters.search && !r.customer.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Apply sorting
  if (sortConfig) {
    rows = [...rows].sort((a, b) => {
      const aValue = a[sortConfig.key] as any;
      const bValue = b[sortConfig.key] as any;
      
      if (aValue === bValue) return 0;
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
  }

  const handleSort = (key: keyof MissedPaymentRow) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null; // Clear sort
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key: keyof MissedPaymentRow) => {
    if (!sortConfig || sortConfig.key !== key) {
      return (
        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const selectedIds = Object.keys(selected).filter((k) => selected[k]);

  const onBulkRetry = () => {
    selectedIds.forEach((id) => retryMutation.mutate(id));
    addNotification({ type: 'info', title: `Retrying ${selectedIds.length} payments` });
  };

  const onBulkEnroll = () => {
    if (!selectedFlowId) {
      openModal(
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-bg-primary/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-surface-primary/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-border-primary/30">
                <div>
                  <h4 className="text-xl font-semibold text-text-primary">Enroll in Recovery Flow</h4>
                  <p className="text-sm text-text-muted mt-1">Select an automated flow to recover {selectedIds.length} missed payment{selectedIds.length !== 1 ? 's' : ''}</p>
                </div>
                <button className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary/50 rounded-lg transition-colors" onClick={closeModal} aria-label="Close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4 p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-accent-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-text-primary text-sm">What happens when you enroll?</div>
                      <div className="text-sm text-text-muted mt-1">Selected customers will automatically receive the flow's sequence of emails, SMS, or calls designed to recover their missed payments.</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {flows.map((f) => (
                    <label key={f.id} className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${selectedFlowId === f.id 
                      ? 'border-accent-primary/50 bg-accent-primary/10 shadow-lg' 
                      : 'border-border-primary/30 hover:border-accent-primary/30 hover:bg-surface-secondary/30'}`}>
                      <input 
                        type="radio" 
                        name="flow" 
                        value={f.id} 
                        checked={selectedFlowId === f.id} 
                        onChange={() => setSelectedFlowId(f.id)}
                        className="mt-1 text-accent-primary focus:ring-accent-primary/30"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-text-primary">{f.name}</h5>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              f.status === 'Active' 
                                ? 'bg-success/20 text-success' 
                                : 'bg-warning/20 text-warning'
                            }`}>
                              {f.status}
                            </span>
                            <span className="text-sm font-semibold text-success">{f.successRate}% success</span>
                          </div>
                        </div>
                        <p className="text-sm text-text-muted mb-3">{f.trigger}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {f.channels.map((channel) => (
                              <span key={channel} className="px-2 py-1 bg-surface-secondary/50 text-xs rounded-md">{channel}</span>
                            ))}
                          </div>
                          <div className="text-xs text-text-muted">•</div>
                          <div className="text-xs text-text-muted">{f.steps.length} step{f.steps.length !== 1 ? 's' : ''}</div>
                          <div className="text-xs text-text-muted">•</div>
                          <div className="text-xs font-medium text-success">{f.recoveredRevenue} recovered</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="p-6 flex items-center justify-between border-t border-border-primary/30">
                <div className="text-sm text-text-muted">
                  {selectedFlowId ? `Ready to enroll ${selectedIds.length} payment${selectedIds.length !== 1 ? 's' : ''}` : 'Please select a recovery flow'}
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={closeModal}>Cancel</Button>
                  <Button 
                    onClick={() => { closeModal(); runBulkEnroll(); }} 
                    disabled={!selectedFlowId}
                    className="bg-gradient-to-r from-accent-primary to-accent-secondary"
                  >
                    Enroll Selected
                  </Button>
                </div>
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
    bulkEnrollMutation.mutate(
      { paymentIds: selectedIds, flowId: selectedFlowId },
      {
        onSuccess: () => {
          addNotification({ type: 'success', title: `Enrolled ${selectedIds.length} payments into flow` });
          setSelected({});
          setSelectedFlowId(null);
        },
        onError: () => {
          addNotification({ type: 'error', title: 'Failed to enroll payments' });
        }
      }
    );
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

      {/* Enhanced Filters */}
      <div className="bg-surface-secondary/20 p-4 rounded-xl border border-border-primary/20 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">Filters & Search</h3>
          <div className="text-xs text-text-muted">{rows.length} of {allRows.length} payments</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Status</label>
            <select className="w-full px-3 py-2 rounded-lg bg-surface-primary/80 border border-border-primary/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all text-sm" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as any }))}>
              {['All', 'Open', 'In Progress', 'Recovered'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Segment</label>
            <select className="w-full px-3 py-2 rounded-lg bg-surface-primary/80 border border-border-primary/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all text-sm" value={filters.segment || ''} onChange={(e) => setFilters((f) => ({ ...f, segment: e.target.value || undefined }))}>
              <option value="">All Segments</option>
              {segments.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Min Amount</label>
            <input type="number" min={0} placeholder="$0" className="w-full px-3 py-2 rounded-lg bg-surface-primary/80 border border-border-primary/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all text-sm" value={filters.minAmount ?? ''} onChange={(e) => setFilters((f) => ({ ...f, minAmount: e.target.value ? Number(e.target.value) : undefined }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Search Customer</label>
            <div className="relative">
              <input placeholder="Search by name..." className="w-full px-3 py-2 pr-8 rounded-lg bg-surface-primary/80 border border-border-primary/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all text-sm" value={filters.search || ''} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
              <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="overflow-x-auto rounded-xl border border-border-primary/30">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-secondary/30">
            <tr className="text-left text-text-secondary">
              <th className="py-3 px-4 border-b border-border-primary/20">
                <input 
                  type="checkbox" 
                  aria-label="Select all" 
                  className="rounded text-accent-primary focus:ring-accent-primary/30"
                  onChange={(e) => {
                    const checked = e.target.checked; 
                    const next: Record<string, boolean> = {}; 
                    rows.forEach((r) => (next[r.id] = checked)); 
                    setSelected(next);
                  }} 
                />
              </th>
              <th className="py-3 px-4 border-b border-border-primary/20">
                <button 
                  onClick={() => handleSort('customer')}
                  className="flex items-center gap-2 font-medium hover:text-text-primary transition-colors"
                >
                  Customer
                  {getSortIcon('customer')}
                </button>
              </th>
              <th className="py-3 px-4 border-b border-border-primary/20">
                <button 
                  onClick={() => handleSort('amount')}
                  className="flex items-center gap-2 font-medium hover:text-text-primary transition-colors"
                >
                  Amount
                  {getSortIcon('amount')}
                </button>
              </th>
              <th className="py-3 px-4 border-b border-border-primary/20">
                <button 
                  onClick={() => handleSort('dueDate')}
                  className="flex items-center gap-2 font-medium hover:text-text-primary transition-colors"
                >
                  Due Date
                  {getSortIcon('dueDate')}
                </button>
              </th>
              <th className="py-3 px-4 border-b border-border-primary/20">
                <button 
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2 font-medium hover:text-text-primary transition-colors"
                >
                  Status
                  {getSortIcon('status')}
                </button>
              </th>
              <th className="py-3 px-4 border-b border-border-primary/20">
                <button 
                  onClick={() => handleSort('attempts')}
                  className="flex items-center gap-2 font-medium hover:text-text-primary transition-colors"
                >
                  Attempts
                  {getSortIcon('attempts')}
                </button>
              </th>
              <th className="py-3 px-4 border-b border-border-primary/20 font-medium">Segments</th>
              <th className="py-3 px-4 border-b border-border-primary/20 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-surface-primary/50">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="text-text-muted">No payments match your filters</div>
                    <button 
                      onClick={() => setFilters({ status: 'All' })}
                      className="text-sm text-accent-primary hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((r, index) => (
                <tr key={r.id} className={`hover:bg-surface-secondary/40 transition-colors ${index % 2 === 0 ? 'bg-surface-primary/30' : 'bg-surface-primary/20'}`}>
                  <td className="py-4 px-4">
                    <input 
                      type="checkbox" 
                      checked={!!selected[r.id]} 
                      onChange={(e) => setSelected((prev) => ({ ...prev, [r.id]: e.target.checked }))} 
                      aria-label={`Select ${r.customer}`}
                      className="rounded text-accent-primary focus:ring-accent-primary/30"
                    />
                  </td>
                  <td className="py-4 px-4 text-text-primary">
                    <div className="font-medium">{r.customer}</div>
                    <div className="text-xs text-text-muted">#{r.id}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-text-primary">${r.amount.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4 text-text-muted">
                    {new Date(r.dueDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      r.status === 'Recovered' 
                        ? 'bg-success/20 text-success border border-success/30'
                        : r.status === 'In Progress'
                        ? 'bg-warning/20 text-warning border border-warning/30'
                        : 'bg-error/20 text-error border border-error/30'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <span className="text-text-primary font-medium">{r.attempts}</span>
                      {r.attempts > 2 && (
                        <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1 max-w-32">
                      {r.segmentTags.map((t: string) => (
                        <span key={t} className="px-2 py-1 rounded-md bg-surface-secondary/60 text-xs text-text-muted truncate">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => retryMutation.mutate(r.id)} isLoading={retryMutation.isPending}
                        icon={(<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>)}
                      >Retry</Button>
                      <Button variant="secondary" size="sm" onClick={() => { setSelected((prev) => ({ ...prev, [r.id]: true })); setSelectedFlowId(null); onBulkEnroll(); }}
                        icon={(<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>)}
                      >Enroll</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
