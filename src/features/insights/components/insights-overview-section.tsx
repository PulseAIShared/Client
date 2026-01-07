import React from 'react';
import { useInsightsOverview } from '@/features/insights/api/split-insights';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    );
  }
  if (trend === 'down') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
    </svg>
  );
};

export const InsightsOverviewSection: React.FC = () => {
  const { data, isLoading, error } = useInsightsOverview();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface-primary/80 backdrop-blur-lg p-5 rounded-2xl border border-border-primary/30 animate-pulse">
              <div className="h-3 bg-surface-secondary/50 rounded w-20 mb-3" />
              <div className="h-8 bg-surface-secondary/50 rounded w-24 mb-2" />
              <div className="h-3 bg-surface-secondary/50 rounded w-16" />
            </div>
          ))}
        </div>
        {/* Alerts & Risk Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 animate-pulse h-48" />
          <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 animate-pulse h-48" />
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
        <h3 className="text-lg font-semibold text-text-primary mb-2">Unable to load insights</h3>
        <p className="text-text-muted text-sm mb-4">There was an error loading your insights data.</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const { kpis, alerts, revenueAtRisk, predictionAccuracy } = data;

  const kpiCards = [
    {
      label: 'MRR',
      value: formatCurrency(kpis.mrr.value),
      change: kpis.mrr.change,
      trend: kpis.mrr.trend,
      isGoodUp: true,
    },
    {
      label: 'Active Customers',
      value: kpis.activeCustomers.value.toLocaleString(),
      change: kpis.activeCustomers.change,
      trend: kpis.activeCustomers.trend,
      isGoodUp: true,
    },
    {
      label: 'Churn Rate',
      value: formatPercent(kpis.churnRate.value),
      change: kpis.churnRate.change,
      trend: kpis.churnRate.trend,
      isGoodUp: false,
    },
    {
      label: 'Avg LTV',
      value: formatCurrency(kpis.avgLtv.value),
      change: kpis.avgLtv.change,
      trend: kpis.avgLtv.trend,
      isGoodUp: true,
    },
    {
      label: 'Health Score',
      value: kpis.healthScore.value.toFixed(0),
      change: kpis.healthScore.change,
      trend: kpis.healthScore.trend,
      isGoodUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi) => {
          const isPositiveChange = kpi.change > 0;
          const isGoodChange = kpi.isGoodUp ? isPositiveChange : !isPositiveChange;

          return (
            <div
              key={kpi.label}
              className="group bg-surface-primary/90 backdrop-blur-xl p-5 rounded-2xl border border-border-primary/30 hover:border-border-secondary/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">{kpi.label}</div>
              <div className="text-2xl font-bold text-text-primary mb-1">{kpi.value}</div>
              <div className={`flex items-center gap-1 text-sm font-medium ${isGoodChange ? 'text-success' : 'text-error'}`}>
                <TrendIcon trend={kpi.trend} />
                <span>{isPositiveChange ? '+' : ''}{(kpi.change * 100).toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts & Revenue at Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Active Alerts
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-error/10 rounded-xl border border-error/20">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-error rounded-full animate-pulse" />
                <span className="text-sm font-medium text-text-primary">Critical Risk</span>
              </div>
              <span className="text-lg font-bold text-error">{alerts.criticalRisk}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-warning/10 rounded-xl border border-warning/20">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-warning rounded-full" />
                <span className="text-sm font-medium text-text-primary">High Risk</span>
              </div>
              <span className="text-lg font-bold text-warning">{alerts.highRisk}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-info/10 rounded-xl border border-info/20">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-info rounded-full" />
                <span className="text-sm font-medium text-text-primary">Soft Churn Signals</span>
              </div>
              <span className="text-lg font-bold text-info">{alerts.softChurnSignals}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent-primary/10 rounded-xl border border-accent-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent-primary rounded-full" />
                <span className="text-sm font-medium text-text-primary">Pending Recommendations</span>
              </div>
              <span className="text-lg font-bold text-accent-primary">{alerts.pendingRecommendations}</span>
            </div>
          </div>
        </div>

        {/* Revenue at Risk */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Revenue at Risk
          </h3>
          <div className="mb-6">
            <div className="text-3xl font-bold text-text-primary mb-1">{formatCurrency(revenueAtRisk.total)}</div>
            <div className="text-sm text-text-muted">Total MRR at risk</div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-error rounded" />
                <span className="text-sm text-text-secondary">Critical</span>
              </div>
              <span className="font-semibold text-text-primary">{formatCurrency(revenueAtRisk.critical)}</span>
            </div>
            <div className="w-full bg-surface-secondary/50 rounded-full h-2">
              <div className="bg-error h-2 rounded-full" style={{ width: `${(revenueAtRisk.critical / revenueAtRisk.total) * 100}%` }} />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning rounded" />
                <span className="text-sm text-text-secondary">High</span>
              </div>
              <span className="font-semibold text-text-primary">{formatCurrency(revenueAtRisk.high)}</span>
            </div>
            <div className="w-full bg-surface-secondary/50 rounded-full h-2">
              <div className="bg-warning h-2 rounded-full" style={{ width: `${(revenueAtRisk.high / revenueAtRisk.total) * 100}%` }} />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-info rounded" />
                <span className="text-sm text-text-secondary">Medium</span>
              </div>
              <span className="font-semibold text-text-primary">{formatCurrency(revenueAtRisk.medium)}</span>
            </div>
            <div className="w-full bg-surface-secondary/50 rounded-full h-2">
              <div className="bg-info h-2 rounded-full" style={{ width: `${(revenueAtRisk.medium / revenueAtRisk.total) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Accuracy Summary */}
      <div className="bg-gradient-to-r from-accent-primary/10 via-accent-secondary/10 to-info/10 backdrop-blur-xl p-6 rounded-2xl border border-accent-primary/20 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">AI Prediction Performance</h3>
            <p className="text-sm text-text-muted">Model accuracy metrics from the last evaluation period</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-primary">{(predictionAccuracy.overall * 100).toFixed(1)}%</div>
              <div className="text-xs text-text-muted uppercase tracking-wider">Accuracy</div>
            </div>
            <div className="h-12 w-px bg-border-primary/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{(predictionAccuracy.precision * 100).toFixed(1)}%</div>
              <div className="text-xs text-text-muted uppercase tracking-wider">Precision</div>
            </div>
            <div className="h-12 w-px bg-border-primary/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-info">{(predictionAccuracy.recall * 100).toFixed(1)}%</div>
              <div className="text-xs text-text-muted uppercase tracking-wider">Recall</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
