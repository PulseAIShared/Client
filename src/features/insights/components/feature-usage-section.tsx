import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { useFeatureInsights } from '@/features/insights/api/split-insights';

export const FeatureUsageSection: React.FC = () => {
  const { data, isLoading, error } = useFeatureInsights();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-primary/80 backdrop-blur-lg p-5 rounded-2xl border border-border-primary/30 animate-pulse h-24" />
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
        <h3 className="text-lg font-semibold text-text-primary mb-2">Unable to load feature data</h3>
        <p className="text-text-muted text-sm">There was an error loading feature insights.</p>
      </div>
    );
  }

  const { stickyFeatures, abandonedFeatures, usageTrends, adoptionFunnel, recommendations } = data;

  // Prepare chart data for sticky features
  const stickyChartData = stickyFeatures.slice(0, 8).map((f) => ({
    name: f.featureName,
    correlation: f.retentionCorrelation * 100,
    users: f.usersWithFeature,
  }));

  return (
    <div className="space-y-6">
      {/* Adoption Funnel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-success/10 to-success/5 backdrop-blur-xl p-5 rounded-2xl border border-success/20 shadow-lg">
          <div className="text-xs font-medium text-success uppercase tracking-wider mb-2">Core Features</div>
          <div className="text-3xl font-bold text-text-primary">{adoptionFunnel.core.adoptedPercent.toFixed(0)}%</div>
          <div className="text-sm text-text-muted mt-1">adopted • avg {adoptionFunnel.core.avgDaysToAdopt}d to adopt</div>
        </div>
        <div className="bg-gradient-to-br from-info/10 to-info/5 backdrop-blur-xl p-5 rounded-2xl border border-info/20 shadow-lg">
          <div className="text-xs font-medium text-info uppercase tracking-wider mb-2">Advanced Features</div>
          <div className="text-3xl font-bold text-text-primary">{adoptionFunnel.advanced.adoptedPercent.toFixed(0)}%</div>
          <div className="text-sm text-text-muted mt-1">adopted • avg {adoptionFunnel.advanced.avgDaysToAdopt}d to adopt</div>
        </div>
        <div className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/5 backdrop-blur-xl p-5 rounded-2xl border border-accent-primary/20 shadow-lg">
          <div className="text-xs font-medium text-accent-primary uppercase tracking-wider mb-2">Power Features</div>
          <div className="text-3xl font-bold text-text-primary">{adoptionFunnel.power.adoptedPercent.toFixed(0)}%</div>
          <div className="text-sm text-text-muted mt-1">adopted • avg {adoptionFunnel.power.avgDaysToAdopt}d to adopt</div>
        </div>
      </div>

      {/* Sticky Features Chart */}
      <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Sticky Features (Retention Correlation)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stickyChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
              <XAxis type="number" stroke="rgb(var(--text-muted))" fontSize={12} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" stroke="rgb(var(--text-muted))" fontSize={11} width={120} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--surface-primary))',
                  border: '1px solid rgb(var(--border-primary))',
                  borderRadius: '12px',
                  color: 'rgb(var(--text-primary))',
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Retention Correlation']}
              />
              <Bar dataKey="correlation" radius={[0, 4, 4, 0]}>
                {stickyChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index < 3 ? '#22c55e' : index < 6 ? '#06b6d4' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sticky Features Details & Abandoned Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sticky Features */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Top Sticky Features</h3>
          <div className="space-y-3">
            {stickyFeatures.slice(0, 5).map((feature) => (
              <div key={feature.featureKey} className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-text-primary">{feature.featureName}</span>
                  <span className="text-sm font-semibold text-success">{feature.retentionLift}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-text-muted">
                  <span>{feature.usersWithFeature.toLocaleString()} users</span>
                  <span>{feature.category}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-success/10 rounded text-center">
                    <div className="text-success font-semibold">{(feature.churnRateWithFeature * 100).toFixed(1)}%</div>
                    <div className="text-text-muted">with feature</div>
                  </div>
                  <div className="p-2 bg-error/10 rounded text-center">
                    <div className="text-error font-semibold">{(feature.churnRateWithoutFeature * 100).toFixed(1)}%</div>
                    <div className="text-text-muted">without</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Abandoned Features */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Abandoned Features (Risk Indicators)</h3>
          <div className="space-y-3">
            {abandonedFeatures.slice(0, 5).map((feature) => (
              <div key={feature.featureKey} className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-text-primary">{feature.featureName}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    feature.riskLevel === 'High' ? 'bg-error/20 text-error' :
                    feature.riskLevel === 'Medium' ? 'bg-warning/20 text-warning' :
                    'bg-info/20 text-info'
                  }`}>
                    {feature.riskLevel} Risk
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-text-muted">
                  <span>{feature.customersAbandoned30d} abandoned (30d)</span>
                  <span>{(feature.correlationWithChurn * 100).toFixed(0)}% churn correlation</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Trends */}
      <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Usage Trends (30d)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {usageTrends.map((trend) => (
            <div key={trend.featureKey} className="p-3 bg-surface-secondary/30 rounded-xl text-center">
              <div className="text-sm font-medium text-text-primary truncate">{trend.featureName}</div>
              <div className={`text-lg font-bold mt-1 ${
                trend.trend === 'up' ? 'text-success' :
                trend.trend === 'down' ? 'text-error' : 'text-text-muted'
              }`}>
                {trend.trend === 'up' ? '↑' : trend.trend === 'down' ? '↓' : '→'}
                {Math.abs(trend.changePercent).toFixed(0)}%
              </div>
              <div className="text-xs text-text-muted mt-1">{trend.activeUsers30d.toLocaleString()} users</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-accent-primary/10 via-accent-secondary/10 to-info/10 backdrop-blur-xl p-6 rounded-2xl border border-accent-primary/20 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Feature Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 bg-surface-primary/50 rounded-xl border border-border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    rec.type === 'promote' ? 'bg-success/20 text-success' :
                    rec.type === 'improve' ? 'bg-warning/20 text-warning' :
                    'bg-error/20 text-error'
                  }`}>
                    {rec.type}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-accent-primary/20 text-accent-primary">
                    {rec.priority}
                  </span>
                </div>
                <div className="font-medium text-text-primary mb-1">{rec.feature}</div>
                <div className="text-sm text-text-muted mb-2">Target: {rec.targetSegment}</div>
                <div className="text-sm text-success">{rec.expectedImpact}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
