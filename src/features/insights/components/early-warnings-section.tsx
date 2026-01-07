import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useEarlyWarnings } from '@/features/insights/api/split-insights';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
};

export const EarlyWarningsSection: React.FC = () => {
  const { data, isLoading, error } = useEarlyWarnings();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
        <h3 className="text-lg font-semibold text-text-primary mb-2">Unable to load early warnings</h3>
        <p className="text-text-muted text-sm">There was an error loading early warning data.</p>
      </div>
    );
  }

  const { summary, byType, trends, indicators, correlations } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-warning/10 to-warning/5 backdrop-blur-xl p-5 rounded-2xl border border-warning/20 shadow-lg">
          <div className="text-xs font-medium text-warning uppercase tracking-wider mb-2">Total Indicators</div>
          <div className="text-3xl font-bold text-text-primary">{summary.totalIndicators}</div>
          <div className="text-sm text-text-muted mt-1">{summary.unacknowledged} unacknowledged</div>
        </div>
        <div className="bg-gradient-to-br from-error/10 to-error/5 backdrop-blur-xl p-5 rounded-2xl border border-error/20 shadow-lg">
          <div className="text-xs font-medium text-error uppercase tracking-wider mb-2">Critical</div>
          <div className="text-3xl font-bold text-error">{summary.bySeverity.critical}</div>
        </div>
        <div className="bg-gradient-to-br from-warning/10 to-warning/5 backdrop-blur-xl p-5 rounded-2xl border border-warning/20 shadow-lg">
          <div className="text-xs font-medium text-warning uppercase tracking-wider mb-2">High</div>
          <div className="text-3xl font-bold text-warning">{summary.bySeverity.high}</div>
        </div>
        <div className="bg-gradient-to-br from-info/10 to-info/5 backdrop-blur-xl p-5 rounded-2xl border border-info/20 shadow-lg">
          <div className="text-xs font-medium text-info uppercase tracking-wider mb-2">Medium</div>
          <div className="text-3xl font-bold text-info">{summary.bySeverity.medium}</div>
        </div>
        <div className="bg-gradient-to-br from-success/10 to-success/5 backdrop-blur-xl p-5 rounded-2xl border border-success/20 shadow-lg">
          <div className="text-xs font-medium text-success uppercase tracking-wider mb-2">Low</div>
          <div className="text-3xl font-bold text-success">{summary.bySeverity.low}</div>
        </div>
      </div>

      {/* Trends Chart & Correlations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trends */}
        <div className="lg:col-span-2 bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Warning Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
                <XAxis dataKey="week" stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(var(--surface-primary))',
                    border: '1px solid rgb(var(--border-primary))',
                    borderRadius: '12px',
                    color: 'rgb(var(--text-primary))',
                  }}
                />
                <Area type="monotone" dataKey="newIndicators" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="New" />
                <Area type="monotone" dataKey="resolvedIndicators" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-error/50 rounded" />
              <span className="text-sm text-text-muted">New Indicators</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success/50 rounded" />
              <span className="text-sm text-text-muted">Resolved</span>
            </div>
          </div>
        </div>

        {/* Correlations */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Churn Correlations</h3>
          <div className="space-y-4">
            <div className="p-4 bg-surface-secondary/30 rounded-xl">
              <div className="text-sm text-text-muted mb-1">Usage Decline</div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-error">{(correlations.usageDeclineToChurn.correlation * 100).toFixed(0)}%</span>
                <span className="text-sm text-text-muted">{correlations.usageDeclineToChurn.avgDaysToChurn || '-'} avg days</span>
              </div>
            </div>
            <div className="p-4 bg-surface-secondary/30 rounded-xl">
              <div className="text-sm text-text-muted mb-1">Feature Abandonment</div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-warning">{(correlations.featureAbandonmentToChurn.correlation * 100).toFixed(0)}%</span>
                <span className="text-sm text-text-muted">{correlations.featureAbandonmentToChurn.avgDaysToChurn || '-'} avg days</span>
              </div>
            </div>
            <div className="p-4 bg-surface-secondary/30 rounded-xl">
              <div className="text-sm text-text-muted mb-1">Plan Downgrade</div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-info">{(correlations.planDowngradeToChurn.correlation * 100).toFixed(0)}%</span>
                <span className="text-sm text-text-muted">{correlations.planDowngradeToChurn.avgDaysToChurn || '-'} avg days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* By Type */}
      <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Indicators by Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {byType.map((type) => (
            <div key={type.type} className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-text-primary">{type.displayName}</span>
                <span className="text-lg font-bold text-text-primary">{type.count}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-text-muted">Churn Rate</span>
                  <div className="font-semibold text-error">{(type.historicalChurnRate * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-text-muted">MRR at Risk</span>
                  <div className="font-semibold text-warning">{formatCurrency(type.mrrAtRisk)}</div>
                </div>
              </div>
              {type.avgChangePercent !== null && (
                <div className="mt-2 text-xs text-text-muted">
                  Avg change: <span className={type.avgChangePercent < 0 ? 'text-error' : 'text-success'}>{type.avgChangePercent.toFixed(1)}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Indicators List */}
      {indicators.length > 0 && (
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Indicators</h3>
          <div className="space-y-3">
            {indicators.slice(0, 10).map((indicator) => (
              <div
                key={indicator.id}
                className={`p-4 rounded-xl border transition-colors ${
                  indicator.isAcknowledged
                    ? 'bg-surface-secondary/20 border-border-primary/20'
                    : 'bg-surface-secondary/40 border-border-secondary/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        indicator.severity === 'Critical' ? 'bg-error/20 text-error' :
                        indicator.severity === 'High' ? 'bg-warning/20 text-warning' :
                        indicator.severity === 'Medium' ? 'bg-info/20 text-info' :
                        'bg-success/20 text-success'
                      }`}>
                        {indicator.severity}
                      </span>
                      <span className="text-xs text-text-muted">{indicator.type}</span>
                      {!indicator.isAcknowledged && (
                        <span className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                      )}
                    </div>
                    <div className="font-medium text-text-primary">{indicator.customerName}</div>
                    <div className="text-sm text-text-muted mt-1">{indicator.description}</div>
                    {indicator.suggestedAction && (
                      <div className="text-sm text-accent-primary mt-2">
                        Suggested: {indicator.suggestedAction}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-text-primary">{formatCurrency(indicator.mrr)}</div>
                    <div className="text-xs text-text-muted">MRR</div>
                    {indicator.changePercent !== null && (
                      <div className={`text-sm font-medium mt-1 ${indicator.changePercent < 0 ? 'text-error' : 'text-success'}`}>
                        {indicator.changePercent > 0 ? '+' : ''}{indicator.changePercent.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
