import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { useChurnInsights } from '@/features/insights/api/split-insights';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const RISK_COLORS: Record<string, string> = {
  'Critical': '#ef4444',
  'High': '#f97316',
  'Medium': '#eab308',
  'Low': '#22c55e',
};

export const ChurnAnalysisSection: React.FC = () => {
  const { data, isLoading, error } = useChurnInsights();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-primary/80 backdrop-blur-lg p-5 rounded-2xl border border-border-primary/30 animate-pulse h-28" />
          ))}
        </div>
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 animate-pulse h-80" />
          <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 animate-pulse h-80" />
        </div>
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
        <h3 className="text-lg font-semibold text-text-primary mb-2">Unable to load churn data</h3>
        <p className="text-text-muted text-sm mb-4">There was an error loading churn insights.</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const { summary, riskDistribution, riskFactors, trends, velocitySignals, renewalWindow } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-error/10 to-error/5 backdrop-blur-xl p-5 rounded-2xl border border-error/20 shadow-lg">
          <div className="text-xs font-medium text-error uppercase tracking-wider mb-2">Total at Risk</div>
          <div className="text-3xl font-bold text-text-primary">{summary.totalAtRisk}</div>
          <div className="text-sm text-text-muted mt-1">{formatCurrency(summary.totalMrrAtRisk)} MRR</div>
        </div>
        <div className="bg-gradient-to-br from-error/10 to-error/5 backdrop-blur-xl p-5 rounded-2xl border border-error/20 shadow-lg">
          <div className="text-xs font-medium text-error uppercase tracking-wider mb-2">Critical</div>
          <div className="text-3xl font-bold text-error">{summary.criticalCount}</div>
          <div className="text-sm text-text-muted mt-1">Immediate attention</div>
        </div>
        <div className="bg-gradient-to-br from-warning/10 to-warning/5 backdrop-blur-xl p-5 rounded-2xl border border-warning/20 shadow-lg">
          <div className="text-xs font-medium text-warning uppercase tracking-wider mb-2">High Risk</div>
          <div className="text-3xl font-bold text-warning">{summary.highCount}</div>
          <div className="text-sm text-text-muted mt-1">Monitor closely</div>
        </div>
        <div className="bg-gradient-to-br from-info/10 to-info/5 backdrop-blur-xl p-5 rounded-2xl border border-info/20 shadow-lg">
          <div className="text-xs font-medium text-info uppercase tracking-wider mb-2">Predicted (30d)</div>
          <div className="text-3xl font-bold text-info">{summary.predictedChurns30d}</div>
          <div className="text-sm text-text-muted mt-1">Expected churns</div>
        </div>
      </div>

      {/* Risk Distribution & Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Risk Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
                <XAxis type="number" stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="level" stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(var(--surface-primary))',
                    border: '1px solid rgb(var(--border-primary))',
                    borderRadius: '12px',
                    color: 'rgb(var(--text-primary))',
                  }}
                  formatter={(value: number, name: string) => [value, name === 'count' ? 'Customers' : formatCurrency(value)]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.level] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {riskDistribution.map((item) => (
              <div key={item.level} className="flex items-center justify-between p-2 bg-surface-secondary/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: RISK_COLORS[item.level] || '#6b7280' }} />
                  <span className="text-sm text-text-secondary">{item.level}</span>
                </div>
                <span className="text-sm font-semibold text-text-primary">{formatCurrency(item.mrr)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Churn Trend */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Churn Trend (Predicted vs Actual)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
                <XAxis dataKey="month" stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgb(var(--text-muted))" fontSize={12} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(var(--surface-primary))',
                    border: '1px solid rgb(var(--border-primary))',
                    borderRadius: '12px',
                    color: 'rgb(var(--text-primary))',
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)}%`]}
                />
                <Line type="monotone" dataKey="predictedChurnRate" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Predicted" />
                <Line type="monotone" dataKey="actualChurnRate" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-[#6366f1]" />
              <span className="text-sm text-text-muted">Predicted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-[#22c55e]" style={{ borderStyle: 'dashed' }} />
              <span className="text-sm text-text-muted">Actual</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors & Velocity Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Factors */}
        <div className="lg:col-span-2 bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Top Risk Factors</h3>
          <div className="space-y-4">
            {riskFactors.slice(0, 6).map((factor, idx) => (
              <div key={idx} className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/20 hover:border-border-secondary/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-text-primary">{factor.factor}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      factor.impact === 'High' ? 'bg-error/20 text-error border border-error/30' :
                      factor.impact === 'Medium' ? 'bg-warning/20 text-warning border border-warning/30' :
                      'bg-success/20 text-success border border-success/30'
                    }`}>
                      {factor.impact}
                    </span>
                    <span className={`text-xs ${
                      factor.trend === 'increasing' ? 'text-error' :
                      factor.trend === 'decreasing' ? 'text-success' : 'text-text-muted'
                    }`}>
                      {factor.trend === 'increasing' ? '↑' : factor.trend === 'decreasing' ? '↓' : '→'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">{factor.affectedCustomers} customers affected</span>
                  <span className="font-semibold text-text-primary">{(factor.avgContribution * 100).toFixed(1)}% contribution</span>
                </div>
                <div className="mt-2 w-full bg-surface-secondary/50 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      factor.impact === 'High' ? 'bg-error' :
                      factor.impact === 'Medium' ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${Math.min(factor.avgContribution * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Velocity Signals & Renewal Window */}
        <div className="space-y-6">
          {/* Velocity Signals */}
          <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Velocity Signals</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-error/10 rounded-xl border border-error/20">
                <span className="text-sm text-text-secondary">Degrading Payment</span>
                <span className="font-bold text-error">{velocitySignals.degradingPayment}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-xl border border-warning/20">
                <span className="text-sm text-text-secondary">Declining Engagement</span>
                <span className="font-bold text-warning">{velocitySignals.decliningEngagement}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-xl border border-success/20">
                <span className="text-sm text-text-secondary">Improving Health</span>
                <span className="font-bold text-success">{velocitySignals.improvingHealth}</span>
              </div>
            </div>
          </div>

          {/* Renewal Window */}
          <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Renewal Window</h3>
            <div className="mb-4">
              <div className="text-2xl font-bold text-text-primary">{formatCurrency(renewalWindow.mrrInWindow)}</div>
              <div className="text-sm text-text-muted">MRR in renewal window</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Within 30 days</span>
                <span className="font-semibold text-text-primary">{renewalWindow.within30Days}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Within 60 days</span>
                <span className="font-semibold text-text-primary">{renewalWindow.within60Days}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Within 90 days</span>
                <span className="font-semibold text-text-primary">{renewalWindow.within90Days}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
