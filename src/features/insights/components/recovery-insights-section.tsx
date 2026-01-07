import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { useRecoveryInsights } from '@/features/insights/api/split-insights';
import { RecoveryQueryParams } from '@/types/insights';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
];

const SEGMENT_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

export const RecoveryInsightsSection: React.FC = () => {
  const [params, setParams] = useState<RecoveryQueryParams>({ period: '30d' });
  const { data, isLoading, error } = useRecoveryInsights(params);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface-primary/80 backdrop-blur-lg p-5 rounded-2xl border border-border-primary/30 animate-pulse h-28" />
          ))}
        </div>
        <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 animate-pulse h-80" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-8 rounded-2xl border border-border-primary/30 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">Unable to load recovery data</h3>
        <p className="text-text-muted text-sm">There was an error loading recovery insights.</p>
      </div>
    );
  }

  const { kpis, bySegment, byReason, timeline, flows, outstandingPayments } = data;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-surface-primary/90 backdrop-blur-xl p-4 rounded-2xl border border-border-primary/30 shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-text-muted mr-2">Period:</span>
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setParams({ period: opt.value })}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                params.period === opt.value
                  ? 'bg-accent-primary text-white shadow-lg'
                  : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/80'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-error/10 to-error/5 backdrop-blur-xl p-5 rounded-2xl border border-error/20 shadow-lg">
          <div className="text-xs font-medium text-error uppercase tracking-wider mb-2">Missed Payments</div>
          <div className="text-3xl font-bold text-text-primary">{kpis.missedPayments.count}</div>
          <div className="text-sm text-text-muted mt-1">{formatCurrency(kpis.missedPayments.amount)}</div>
        </div>
        <div className="bg-gradient-to-br from-success/10 to-success/5 backdrop-blur-xl p-5 rounded-2xl border border-success/20 shadow-lg">
          <div className="text-xs font-medium text-success uppercase tracking-wider mb-2">Recovered</div>
          <div className="text-3xl font-bold text-text-primary">{kpis.recoveredPayments.count}</div>
          <div className="text-sm text-text-muted mt-1">{formatCurrency(kpis.recoveredPayments.amount)}</div>
        </div>
        <div className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/5 backdrop-blur-xl p-5 rounded-2xl border border-accent-primary/20 shadow-lg">
          <div className="text-xs font-medium text-accent-primary uppercase tracking-wider mb-2">Recovery Rate</div>
          <div className="text-3xl font-bold text-text-primary">{(kpis.recoveryRate * 100).toFixed(1)}%</div>
          <div className="text-sm text-text-muted mt-1">Success rate</div>
        </div>
        <div className="bg-gradient-to-br from-info/10 to-info/5 backdrop-blur-xl p-5 rounded-2xl border border-info/20 shadow-lg">
          <div className="text-xs font-medium text-info uppercase tracking-wider mb-2">Avg Recovery Time</div>
          <div className="text-3xl font-bold text-text-primary">{kpis.avgRecoveryTimeDays.toFixed(1)}</div>
          <div className="text-sm text-text-muted mt-1">days</div>
        </div>
        <div className="bg-gradient-to-br from-warning/10 to-warning/5 backdrop-blur-xl p-5 rounded-2xl border border-warning/20 shadow-lg">
          <div className="text-xs font-medium text-warning uppercase tracking-wider mb-2">Outstanding</div>
          <div className="text-3xl font-bold text-text-primary">{formatCurrency(kpis.outstandingAmount)}</div>
          <div className="text-sm text-text-muted mt-1">Still pending</div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Recovery Timeline</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
              <XAxis dataKey="date" stroke="rgb(var(--text-muted))" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="rgb(var(--text-muted))" fontSize={12} tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--surface-primary))',
                  border: '1px solid rgb(var(--border-primary))',
                  borderRadius: '12px',
                  color: 'rgb(var(--text-primary))',
                }}
                formatter={(value: number) => [formatCurrency(value)]}
              />
              <Area type="monotone" dataKey="missedAmount" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Missed" />
              <Area type="monotone" dataKey="recoveredAmount" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Recovered" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-error/50 rounded" />
            <span className="text-sm text-text-muted">Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success/50 rounded" />
            <span className="text-sm text-text-muted">Recovered</span>
          </div>
        </div>
      </div>

      {/* By Segment & By Reason */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Segment */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">By Segment</h3>
          <div className="space-y-3">
            {bySegment.map((seg, idx) => (
              <div key={seg.segment} className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: SEGMENT_COLORS[idx % SEGMENT_COLORS.length] }} />
                    <span className="font-medium text-text-primary">{seg.segment}</span>
                  </div>
                  <span className={`text-lg font-bold ${seg.recoveryRate >= 0.5 ? 'text-success' : 'text-warning'}`}>
                    {(seg.recoveryRate * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-text-muted">Missed: </span>
                    <span className="text-error">{formatCurrency(seg.missedAmount)}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Recovered: </span>
                    <span className="text-success">{formatCurrency(seg.recoveredAmount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Reason */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">By Failure Reason</h3>
          <div className="space-y-3">
            {byReason.map((reason) => (
              <div key={reason.reason} className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-text-primary">{reason.reason}</span>
                  <span className="text-sm text-text-muted">{reason.count} cases</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Recovery Rate:</span>
                  <span className={`font-semibold ${reason.recoveryRate >= 0.5 ? 'text-success' : 'text-warning'}`}>
                    {(reason.recoveryRate * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-text-muted">Avg Days:</span>
                  <span className="font-semibold text-text-primary">{reason.avgRecoveryDays.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recovery Flows */}
      {flows.length > 0 && (
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Active Recovery Flows</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flows.map((flow) => (
              <div key={flow.flowId} className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/20">
                <div className="font-medium text-text-primary mb-2">{flow.flowName}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-text-muted">Enrolled: </span>
                    <span className="font-semibold text-text-primary">{flow.enrolledCustomers}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Completed: </span>
                    <span className="font-semibold text-success">{flow.completedCustomers}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Success: </span>
                    <span className="font-semibold text-accent-primary">{(flow.successRate * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Avg Recovered: </span>
                    <span className="font-semibold text-success">{formatCurrency(flow.avgRevenueRecovered)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outstanding Payments */}
      {outstandingPayments.length > 0 && (
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Outstanding Payments</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-primary/30">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Customer</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Amount</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-text-muted">Days Past Due</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-text-muted">Attempts</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Reason</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-text-muted">In Flow</th>
                </tr>
              </thead>
              <tbody>
                {outstandingPayments.slice(0, 10).map((payment) => (
                  <tr key={payment.customerId} className="border-b border-border-primary/20 hover:bg-surface-secondary/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-text-primary">{payment.customerName}</td>
                    <td className="py-3 px-4 text-right font-semibold text-error">{formatCurrency(payment.amount)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.daysPastDue > 30 ? 'bg-error/20 text-error' :
                        payment.daysPastDue > 14 ? 'bg-warning/20 text-warning' :
                        'bg-info/20 text-info'
                      }`}>
                        {payment.daysPastDue}d
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-text-secondary">{payment.attempts}</td>
                    <td className="py-3 px-4 text-sm text-text-muted">{payment.reason}</td>
                    <td className="py-3 px-4 text-center">
                      {payment.enrolledInFlow ? (
                        <span className="text-success">Step {payment.flowStep}</span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
