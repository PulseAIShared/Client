import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { useAccuracyInsights } from '@/features/insights/api/split-insights';

const RISK_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

export const AccuracyMetricsSection: React.FC = () => {
  const { data, isLoading, error } = useAccuracyInsights();

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
        <h3 className="text-lg font-semibold text-text-primary mb-2">Unable to load accuracy data</h3>
        <p className="text-text-muted text-sm">There was an error loading model accuracy metrics.</p>
      </div>
    );
  }

  const { currentPeriod, avgRiskScores, historicalTrend, byRiskLevel, recommendations } = data;
  const { metrics, confusionMatrix } = currentPeriod;

  const total = confusionMatrix.truePositives + confusionMatrix.trueNegatives + confusionMatrix.falsePositives + confusionMatrix.falseNegatives;

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/5 backdrop-blur-xl p-5 rounded-2xl border border-accent-primary/20 shadow-lg">
          <div className="text-xs font-medium text-accent-primary uppercase tracking-wider mb-2">Accuracy</div>
          <div className="text-3xl font-bold text-text-primary">{(metrics.accuracy * 100).toFixed(1)}%</div>
          <div className="text-sm text-text-muted mt-1">{currentPeriod.totalPredictions.toLocaleString()} predictions</div>
        </div>
        <div className="bg-gradient-to-br from-success/10 to-success/5 backdrop-blur-xl p-5 rounded-2xl border border-success/20 shadow-lg">
          <div className="text-xs font-medium text-success uppercase tracking-wider mb-2">Precision</div>
          <div className="text-3xl font-bold text-text-primary">{(metrics.precision * 100).toFixed(1)}%</div>
          <div className="text-sm text-text-muted mt-1">When flagged as risk</div>
        </div>
        <div className="bg-gradient-to-br from-info/10 to-info/5 backdrop-blur-xl p-5 rounded-2xl border border-info/20 shadow-lg">
          <div className="text-xs font-medium text-info uppercase tracking-wider mb-2">Recall</div>
          <div className="text-3xl font-bold text-text-primary">{(metrics.recall * 100).toFixed(1)}%</div>
          <div className="text-sm text-text-muted mt-1">Churners caught</div>
        </div>
        <div className="bg-gradient-to-br from-warning/10 to-warning/5 backdrop-blur-xl p-5 rounded-2xl border border-warning/20 shadow-lg">
          <div className="text-xs font-medium text-warning uppercase tracking-wider mb-2">F1 Score</div>
          <div className="text-3xl font-bold text-text-primary">{(metrics.f1Score * 100).toFixed(1)}%</div>
          <div className="text-sm text-text-muted mt-1">Balanced measure</div>
        </div>
      </div>

      {/* Confusion Matrix & Risk Score Separation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Confusion Matrix</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-4 bg-success/20 rounded-xl border border-success/30">
              <div className="text-3xl font-bold text-success">{confusionMatrix.truePositives}</div>
              <div className="text-xs text-text-muted mt-1">True Positives</div>
              <div className="text-xs text-success">Correctly identified churners</div>
            </div>
            <div className="text-center p-4 bg-error/20 rounded-xl border border-error/30">
              <div className="text-3xl font-bold text-error">{confusionMatrix.falsePositives}</div>
              <div className="text-xs text-text-muted mt-1">False Positives</div>
              <div className="text-xs text-error">Wrongly flagged</div>
            </div>
            <div className="text-center p-4 bg-warning/20 rounded-xl border border-warning/30">
              <div className="text-3xl font-bold text-warning">{confusionMatrix.falseNegatives}</div>
              <div className="text-xs text-text-muted mt-1">False Negatives</div>
              <div className="text-xs text-warning">Missed churners</div>
            </div>
            <div className="text-center p-4 bg-info/20 rounded-xl border border-info/30">
              <div className="text-3xl font-bold text-info">{confusionMatrix.trueNegatives}</div>
              <div className="text-xs text-text-muted mt-1">True Negatives</div>
              <div className="text-xs text-info">Correctly retained</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-surface-secondary/30 rounded-xl">
              <span className="text-text-muted">False Positive Rate: </span>
              <span className="font-semibold text-error">{(metrics.falsePositiveRate * 100).toFixed(1)}%</span>
            </div>
            <div className="p-3 bg-surface-secondary/30 rounded-xl">
              <span className="text-text-muted">False Negative Rate: </span>
              <span className="font-semibold text-warning">{(metrics.falseNegativeRate * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Risk Score Separation */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Risk Score Separation</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-muted">Avg Score - Churned Customers</span>
                <span className="text-2xl font-bold text-error">{avgRiskScores.churned.toFixed(1)}</span>
              </div>
              <div className="w-full bg-surface-secondary/50 rounded-full h-3">
                <div className="bg-error h-3 rounded-full transition-all" style={{ width: `${avgRiskScores.churned}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-muted">Avg Score - Retained Customers</span>
                <span className="text-2xl font-bold text-success">{avgRiskScores.retained.toFixed(1)}</span>
              </div>
              <div className="w-full bg-surface-secondary/50 rounded-full h-3">
                <div className="bg-success h-3 rounded-full transition-all" style={{ width: `${avgRiskScores.retained}%` }} />
              </div>
            </div>
            <div className="p-4 bg-accent-primary/10 rounded-xl border border-accent-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">Score Separation</span>
                <span className="text-2xl font-bold text-accent-primary">{avgRiskScores.separation.toFixed(1)}</span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Higher separation = better model discrimination between churners and retained
              </p>
            </div>
          </div>
          {currentPeriod.optimalThreshold && (
            <div className="mt-4 p-3 bg-surface-secondary/30 rounded-xl">
              <span className="text-sm text-text-muted">Optimal Threshold: </span>
              <span className="font-semibold text-accent-primary">{currentPeriod.optimalThreshold.toFixed(0)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Historical Trend & By Risk Level */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical Trend */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Historical Accuracy Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
                <XAxis dataKey="period" stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgb(var(--text-muted))" fontSize={12} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} domain={[0.5, 1]} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(var(--surface-primary))',
                    border: '1px solid rgb(var(--border-primary))',
                    borderRadius: '12px',
                    color: 'rgb(var(--text-primary))',
                  }}
                  formatter={(value: number) => [`${(value * 100).toFixed(1)}%`]}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Accuracy" />
                <Line type="monotone" dataKey="precision" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="Precision" />
                <Line type="monotone" dataKey="recall" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} name="Recall" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#6366f1]" />
              <span className="text-sm text-text-muted">Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#22c55e]" />
              <span className="text-sm text-text-muted">Precision</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#06b6d4]" />
              <span className="text-sm text-text-muted">Recall</span>
            </div>
          </div>
        </div>

        {/* By Risk Level */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Accuracy by Risk Level</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byRiskLevel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
                <XAxis type="number" stroke="rgb(var(--text-muted))" fontSize={12} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} domain={[0, 1]} />
                <YAxis type="category" dataKey="level" stroke="rgb(var(--text-muted))" fontSize={11} width={120} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(var(--surface-primary))',
                    border: '1px solid rgb(var(--border-primary))',
                    borderRadius: '12px',
                    color: 'rgb(var(--text-primary))',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'accuracy' ? `${(value * 100).toFixed(1)}%` : value,
                    name === 'accuracy' ? 'Accuracy' : name
                  ]}
                />
                <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                  {byRiskLevel.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {byRiskLevel.map((level, idx) => (
              <div key={level.level} className="flex items-center justify-between text-sm p-2 bg-surface-secondary/30 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: RISK_COLORS[idx % RISK_COLORS.length] }} />
                  <span className="text-text-secondary">{level.level}</span>
                </div>
                <div className="text-text-muted">
                  {level.actualChurns} / {level.predictions} churned
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-accent-primary/10 via-accent-secondary/10 to-info/10 backdrop-blur-xl p-6 rounded-2xl border border-accent-primary/20 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Model Recommendations
          </h3>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="text-accent-primary mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Model Info */}
      <div className="bg-surface-primary/90 backdrop-blur-xl p-4 rounded-2xl border border-border-primary/30 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-text-muted">
          <div>
            <span>Model Version: </span>
            <span className="font-medium text-text-primary">{currentPeriod.modelVersion || 'Default'}</span>
          </div>
          <div>
            <span>Period: </span>
            <span className="font-medium text-text-primary">
              {new Date(currentPeriod.periodStart).toLocaleDateString()} - {new Date(currentPeriod.periodEnd).toLocaleDateString()}
            </span>
          </div>
          {metrics.aucRoc && (
            <div>
              <span>AUC-ROC: </span>
              <span className="font-medium text-accent-primary">{(metrics.aucRoc * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
