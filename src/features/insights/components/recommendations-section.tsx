import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useRecommendationInsights } from '@/features/insights/api/split-insights';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const OUTCOME_COLORS = {
  retained: '#22c55e',
  churned: '#ef4444',
  downgraded: '#f97316',
  unknown: '#6b7280',
};

export const RecommendationsSection: React.FC = () => {
  const { data, isLoading, error } = useRecommendationInsights();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-primary/80 backdrop-blur-lg p-5 rounded-2xl border border-border-primary/30 animate-pulse h-28" />
          ))}
        </div>
        <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 animate-pulse h-96" />
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
        <h3 className="text-lg font-semibold text-text-primary mb-2">Unable to load recommendations</h3>
        <p className="text-text-muted text-sm">There was an error loading recommendation insights.</p>
      </div>
    );
  }

  const { summary, byUrgency, byCategory, outcomes, topPerforming, recoveryExamples, pendingActions } = data;

  const outcomesData = [
    { name: 'Retained', value: outcomes.retained, color: OUTCOME_COLORS.retained },
    { name: 'Churned', value: outcomes.churned, color: OUTCOME_COLORS.churned },
    { name: 'Downgraded', value: outcomes.downgraded, color: OUTCOME_COLORS.downgraded },
    { name: 'Unknown', value: outcomes.unknown, color: OUTCOME_COLORS.unknown },
  ].filter((d) => d.value > 0);

  const categoryEntries = Object.entries(byCategory);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/5 backdrop-blur-xl p-5 rounded-2xl border border-accent-primary/20 shadow-lg">
          <div className="text-xs font-medium text-accent-primary uppercase tracking-wider mb-2">Total Recommendations</div>
          <div className="text-3xl font-bold text-text-primary">{summary.totalRecommendations}</div>
          <div className="text-sm text-text-muted mt-1">{summary.pending} pending</div>
        </div>
        <div className="bg-gradient-to-br from-success/10 to-success/5 backdrop-blur-xl p-5 rounded-2xl border border-success/20 shadow-lg">
          <div className="text-xs font-medium text-success uppercase tracking-wider mb-2">Acted Upon</div>
          <div className="text-3xl font-bold text-text-primary">{summary.actedUpon}</div>
          <div className="text-sm text-text-muted mt-1">{(summary.avgActedUponRate * 100).toFixed(0)}% rate</div>
        </div>
        <div className="bg-gradient-to-br from-info/10 to-info/5 backdrop-blur-xl p-5 rounded-2xl border border-info/20 shadow-lg">
          <div className="text-xs font-medium text-info uppercase tracking-wider mb-2">Success Rate</div>
          <div className="text-3xl font-bold text-text-primary">{(summary.avgSuccessRate * 100).toFixed(0)}%</div>
          <div className="text-sm text-text-muted mt-1">When acted upon</div>
        </div>
        <div className="bg-gradient-to-br from-warning/10 to-warning/5 backdrop-blur-xl p-5 rounded-2xl border border-warning/20 shadow-lg">
          <div className="text-xs font-medium text-warning uppercase tracking-wider mb-2">Urgent Today</div>
          <div className="text-3xl font-bold text-text-primary">{byUrgency.today.count}</div>
          <div className="text-sm text-text-muted mt-1">{byUrgency.thisWeek.count} this week</div>
        </div>
      </div>

      {/* Outcomes Chart & By Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outcomes */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Recommendation Outcomes</h3>
          <div className="flex items-center gap-6">
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outcomesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {outcomesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(var(--surface-primary))',
                      border: '1px solid rgb(var(--border-primary))',
                      borderRadius: '12px',
                      color: 'rgb(var(--text-primary))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {outcomesData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-text-secondary">{item.name}</span>
                  </div>
                  <span className="font-semibold text-text-primary">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* By Category */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">By Category</h3>
          <div className="space-y-3">
            {categoryEntries.map(([category, metrics]) => (
              <div key={category} className="p-3 bg-surface-secondary/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-text-primary capitalize">{category}</span>
                  <span className="text-sm text-text-muted">{metrics.count} recommendations</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-success/10 rounded">
                    <div className="font-semibold text-success">{(metrics.successProbability * 100).toFixed(0)}%</div>
                    <div className="text-text-muted">Success</div>
                  </div>
                  <div className="text-center p-2 bg-info/10 rounded">
                    <div className="font-semibold text-info">{metrics.avgDaysToOutcome || '-'}</div>
                    <div className="text-text-muted">Avg Days</div>
                  </div>
                  <div className="text-center p-2 bg-accent-primary/10 rounded">
                    <div className="font-semibold text-accent-primary">{metrics.recoveredCustomers}</div>
                    <div className="text-text-muted">Recovered</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing & Recovery Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Top Performing Recommendations</h3>
          <div className="space-y-3">
            {topPerforming.slice(0, 5).map((rec, idx) => (
              <div key={idx} className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/20">
                <div className="font-medium text-text-primary mb-2">{rec.recommendation}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">{rec.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-success">{(rec.successRate * 100).toFixed(0)}% success</span>
                    <span className="text-info">-{(rec.avgRiskReduction * 100).toFixed(0)}% risk</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recovery Examples */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Recovery Examples</h3>
          <div className="space-y-3">
            {recoveryExamples.slice(0, 5).map((example, idx) => (
              <div key={idx} className="p-4 bg-success/10 rounded-xl border border-success/20">
                <div className="font-medium text-text-primary mb-1">{example.summary}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">{example.category}</span>
                  <span className="text-success">{example.daysToRecovery} days to recover</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Pending Actions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-primary/30">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Recommendation</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-text-muted">Urgency</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-text-muted">Risk</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">MRR</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-text-muted">Success Prob</th>
                </tr>
              </thead>
              <tbody>
                {pendingActions.slice(0, 10).map((action) => (
                  <tr key={action.customerId} className="border-b border-border-primary/20 hover:bg-surface-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-text-primary">{action.customerName}</div>
                      <div className="text-xs text-text-muted">{action.customerEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary max-w-xs truncate">{action.recommendation}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        action.urgency === 'today' ? 'bg-error/20 text-error' :
                        action.urgency === 'this_week' ? 'bg-warning/20 text-warning' :
                        'bg-info/20 text-info'
                      }`}>
                        {action.urgency}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${
                        action.riskScore >= 70 ? 'text-error' :
                        action.riskScore >= 40 ? 'text-warning' : 'text-success'
                      }`}>
                        {action.riskScore.toFixed(0)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-text-primary">{formatCurrency(action.mrr)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-success">{(action.successProbability * 100).toFixed(0)}%</span>
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
