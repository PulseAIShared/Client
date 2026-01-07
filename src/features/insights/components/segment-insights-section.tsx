import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { useSegmentInsights } from '@/features/insights/api/split-insights';
import { SegmentQueryParams } from '@/types/insights';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const SEGMENT_TYPES = [
  { value: 'plan_tier', label: 'Plan Tier' },
  { value: 'lifecycle_stage', label: 'Lifecycle Stage' },
  { value: 'company_size', label: 'Company Size' },
  { value: 'acquisition_channel', label: 'Acquisition Channel' },
] as const;

const SEGMENT_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'];

export const SegmentInsightsSection: React.FC = () => {
  const [params, setParams] = useState<SegmentQueryParams>({ segment: 'plan_tier' });
  const { data, isLoading, error } = useSegmentInsights(params);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 animate-pulse h-16" />
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
        <h3 className="text-lg font-semibold text-text-primary mb-2">Unable to load segment data</h3>
        <p className="text-text-muted text-sm">There was an error loading segment insights.</p>
      </div>
    );
  }

  const { segments, comparisons, insights, distribution } = data;

  // Prepare chart data
  const mrrChartData = segments.map((s, idx) => ({
    name: s.name,
    mrr: s.mrr,
    color: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
  }));

  const distributionData = distribution.byMrr.map((d, idx) => ({
    name: d.segment,
    value: d.percentage,
    color: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Segment Type Selector */}
      <div className="bg-surface-primary/90 backdrop-blur-xl p-4 rounded-2xl border border-border-primary/30 shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-text-muted mr-2">Segment by:</span>
          {SEGMENT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setParams({ segment: type.value })}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                params.segment === type.value
                  ? 'bg-accent-primary text-white shadow-lg'
                  : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/80'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparisons Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-success/10 to-success/5 backdrop-blur-xl p-5 rounded-2xl border border-success/20 shadow-lg">
          <div className="text-xs font-medium text-success uppercase tracking-wider mb-2">Best Retention</div>
          <div className="text-xl font-bold text-text-primary">{comparisons.bestRetention || 'N/A'}</div>
          <div className="text-sm text-text-muted mt-1">Lowest churn rate</div>
        </div>
        <div className="bg-gradient-to-br from-info/10 to-info/5 backdrop-blur-xl p-5 rounded-2xl border border-info/20 shadow-lg">
          <div className="text-xs font-medium text-info uppercase tracking-wider mb-2">Highest Growth</div>
          <div className="text-xl font-bold text-text-primary">{comparisons.highestGrowth || 'N/A'}</div>
          <div className="text-sm text-text-muted mt-1">Fastest growing</div>
        </div>
        <div className="bg-gradient-to-br from-error/10 to-error/5 backdrop-blur-xl p-5 rounded-2xl border border-error/20 shadow-lg">
          <div className="text-xs font-medium text-error uppercase tracking-wider mb-2">Most at Risk</div>
          <div className="text-xl font-bold text-text-primary">{comparisons.mostAtRisk || 'N/A'}</div>
          <div className="text-sm text-text-muted mt-1">Highest churn risk</div>
        </div>
      </div>

      {/* MRR Chart & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MRR by Segment */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">MRR by Segment</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mrrChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
                <XAxis type="number" stroke="rgb(var(--text-muted))" fontSize={12} tickFormatter={(v) => formatCurrency(v)} />
                <YAxis type="category" dataKey="name" stroke="rgb(var(--text-muted))" fontSize={11} width={100} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(var(--surface-primary))',
                    border: '1px solid rgb(var(--border-primary))',
                    borderRadius: '12px',
                    color: 'rgb(var(--text-primary))',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'MRR']}
                />
                <Bar dataKey="mrr" radius={[0, 4, 4, 0]}>
                  {mrrChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">MRR Distribution</h3>
          <div className="flex items-center gap-4">
            <div className="h-56 w-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
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
                    formatter={(value: number) => [`${value.toFixed(1)}%`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {distributionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-text-secondary">{item.name}</span>
                  </div>
                  <span className="font-semibold text-text-primary">{item.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Segment Details */}
      <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Segment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments.map((segment, idx) => (
            <div key={segment.name} className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/20 hover:border-border-secondary/50 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: SEGMENT_COLORS[idx % SEGMENT_COLORS.length] }} />
                  <span className="font-semibold text-text-primary">{segment.name}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  segment.healthScore >= 70 ? 'bg-success/20 text-success' :
                  segment.healthScore >= 40 ? 'bg-warning/20 text-warning' :
                  'bg-error/20 text-error'
                }`}>
                  {segment.healthScore.toFixed(0)} health
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-text-muted">Customers</div>
                  <div className="font-semibold text-text-primary">{segment.customerCount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-text-muted">MRR</div>
                  <div className="font-semibold text-text-primary">{formatCurrency(segment.mrr)}</div>
                </div>
                <div>
                  <div className="text-text-muted">Avg MRR</div>
                  <div className="font-semibold text-text-primary">{formatCurrency(segment.avgMrr)}</div>
                </div>
                <div>
                  <div className="text-text-muted">Churn Rate</div>
                  <div className={`font-semibold ${segment.churnRate < 5 ? 'text-success' : segment.churnRate < 10 ? 'text-warning' : 'text-error'}`}>
                    {segment.churnRate.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-text-muted">Avg Risk</div>
                  <div className={`font-semibold ${segment.avgRiskScore < 30 ? 'text-success' : segment.avgRiskScore < 60 ? 'text-warning' : 'text-error'}`}>
                    {segment.avgRiskScore.toFixed(0)}
                  </div>
                </div>
                <div>
                  <div className="text-text-muted">Avg LTV</div>
                  <div className="font-semibold text-text-primary">{formatCurrency(segment.avgLtv)}</div>
                </div>
              </div>
              {/* Trends */}
              <div className="mt-3 pt-3 border-t border-border-primary/20 flex items-center gap-3 text-xs">
                <span className={segment.trends.mrrChange >= 0 ? 'text-success' : 'text-error'}>
                  MRR: {segment.trends.mrrChange >= 0 ? '+' : ''}{(segment.trends.mrrChange * 100).toFixed(1)}%
                </span>
                <span className={segment.trends.customerChange >= 0 ? 'text-success' : 'text-error'}>
                  Customers: {segment.trends.customerChange >= 0 ? '+' : ''}{segment.trends.customerChange}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-accent-primary/10 via-accent-secondary/10 to-info/10 backdrop-blur-xl p-6 rounded-2xl border border-accent-primary/20 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Insights
          </h3>
          <ul className="space-y-2">
            {insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="text-accent-primary mt-0.5">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
