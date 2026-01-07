import React, { useState } from 'react';
import { useCohortInsights } from '@/features/insights/api/split-insights';
import { CohortQueryParams } from '@/types/insights';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const COHORT_TYPES = [
  { value: 'signup_month', label: 'Signup Month' },
  { value: 'plan_tier', label: 'Plan Tier' },
  { value: 'acquisition_channel', label: 'Acquisition Channel' },
] as const;

export const CohortAnalysisSection: React.FC = () => {
  const [params, setParams] = useState<CohortQueryParams>({ cohortType: 'signup_month' });
  const { data, isLoading, error } = useCohortInsights(params);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 animate-pulse h-16" />
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
        <h3 className="text-lg font-semibold text-text-primary mb-2">Unable to load cohort data</h3>
        <p className="text-text-muted text-sm">There was an error loading cohort insights.</p>
      </div>
    );
  }

  const { cohorts, retentionMatrix, comparisons, insights } = data;

  const getRetentionColor = (value: number | null) => {
    if (value === null) return 'bg-surface-secondary/30 text-text-muted';
    if (value >= 90) return 'bg-success/20 text-success';
    if (value >= 70) return 'bg-info/20 text-info';
    if (value >= 50) return 'bg-warning/20 text-warning';
    return 'bg-error/20 text-error';
  };

  return (
    <div className="space-y-6">
      {/* Cohort Type Selector */}
      <div className="bg-surface-primary/90 backdrop-blur-xl p-4 rounded-2xl border border-border-primary/30 shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-text-muted mr-2">Cohort by:</span>
          {COHORT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setParams({ cohortType: type.value })}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                params.cohortType === type.value
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
          <div className="text-xl font-bold text-text-primary">{comparisons.bestPerforming?.cohort || 'N/A'}</div>
          <div className="text-sm text-text-muted mt-1">
            {comparisons.bestPerforming?.retentionRate ? `${(comparisons.bestPerforming.retentionRate * 100).toFixed(1)}% retention` : '-'}
          </div>
        </div>
        <div className="bg-gradient-to-br from-error/10 to-error/5 backdrop-blur-xl p-5 rounded-2xl border border-error/20 shadow-lg">
          <div className="text-xs font-medium text-error uppercase tracking-wider mb-2">Worst Retention</div>
          <div className="text-xl font-bold text-text-primary">{comparisons.worstPerforming?.cohort || 'N/A'}</div>
          <div className="text-sm text-text-muted mt-1">
            {comparisons.worstPerforming?.retentionRate ? `${(comparisons.worstPerforming.retentionRate * 100).toFixed(1)}% retention` : '-'}
          </div>
        </div>
        <div className="bg-gradient-to-br from-info/10 to-info/5 backdrop-blur-xl p-5 rounded-2xl border border-info/20 shadow-lg">
          <div className="text-xs font-medium text-info uppercase tracking-wider mb-2">Avg Retention</div>
          <div className="text-xl font-bold text-text-primary">{(comparisons.avgRetentionRate * 100).toFixed(1)}%</div>
          <div className="text-sm text-text-muted mt-1">Across all cohorts</div>
        </div>
      </div>

      {/* Retention Matrix */}
      <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg overflow-x-auto">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Retention Matrix</h3>
        <div className="min-w-[600px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-primary/30">
                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Cohort</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-text-muted">M0</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-text-muted">M1</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-text-muted">M2</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-text-muted">M3</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-text-muted">M6</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-text-muted">M12</th>
              </tr>
            </thead>
            <tbody>
              {retentionMatrix.map((row) => (
                <tr key={row.cohort} className="border-b border-border-primary/20 hover:bg-surface-secondary/30 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-text-primary">{row.cohort}</td>
                  <td className="py-3 px-2">
                    <div className={`text-center text-sm font-semibold py-1 px-2 rounded ${getRetentionColor(row.month0)}`}>
                      {row.month0}%
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className={`text-center text-sm font-semibold py-1 px-2 rounded ${getRetentionColor(row.month1)}`}>
                      {row.month1 !== null ? `${row.month1}%` : '-'}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className={`text-center text-sm font-semibold py-1 px-2 rounded ${getRetentionColor(row.month2)}`}>
                      {row.month2 !== null ? `${row.month2}%` : '-'}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className={`text-center text-sm font-semibold py-1 px-2 rounded ${getRetentionColor(row.month3)}`}>
                      {row.month3 !== null ? `${row.month3}%` : '-'}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className={`text-center text-sm font-semibold py-1 px-2 rounded ${getRetentionColor(row.month6)}`}>
                      {row.month6 !== null ? `${row.month6}%` : '-'}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className={`text-center text-sm font-semibold py-1 px-2 rounded ${getRetentionColor(row.month12)}`}>
                      {row.month12 !== null ? `${row.month12}%` : '-'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cohort Details */}
      <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Cohort Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cohorts.map((cohort) => (
            <div key={cohort.cohortValue} className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/20 hover:border-border-secondary/50 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-text-primary">{cohort.cohortValue}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cohort.avgRiskScore < 30 ? 'bg-success/20 text-success' :
                  cohort.avgRiskScore < 60 ? 'bg-warning/20 text-warning' :
                  'bg-error/20 text-error'
                }`}>
                  {cohort.avgRiskScore.toFixed(0)} risk
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-text-muted">Customers</div>
                  <div className="font-semibold text-text-primary">{cohort.currentCustomers} / {cohort.totalCustomers}</div>
                </div>
                <div>
                  <div className="text-text-muted">Retention</div>
                  <div className="font-semibold text-success">{(cohort.retentionRate * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-text-muted">MRR at Risk</div>
                  <div className="font-semibold text-warning">{formatCurrency(cohort.mrrAtRisk)}</div>
                </div>
                <div>
                  <div className="text-text-muted">MRR Lost</div>
                  <div className="font-semibold text-error">{formatCurrency(cohort.mrrLost)}</div>
                </div>
              </div>
              {(cohort.highRiskCustomers > 0 || cohort.criticalRiskCustomers > 0) && (
                <div className="mt-3 pt-3 border-t border-border-primary/20 flex items-center gap-3 text-xs">
                  {cohort.criticalRiskCustomers > 0 && (
                    <span className="text-error">{cohort.criticalRiskCustomers} critical</span>
                  )}
                  {cohort.highRiskCustomers > 0 && (
                    <span className="text-warning">{cohort.highRiskCustomers} high risk</span>
                  )}
                </div>
              )}
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
