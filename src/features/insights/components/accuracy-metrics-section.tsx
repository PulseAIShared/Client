import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useModelQualityInsights } from '@/features/insights/api/split-insights';
import { InsightsQueryFilters } from '@/types/insights';
import { InsightsInfoTooltip } from './insights-info-tooltip';
import { InsightsEmptyState, InsightsErrorState, InsightsLoadingState } from './insights-state';

const RISK_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'];
const METRIC_DEFINITIONS = {
  accuracy: 'Share of total predictions that were correct.',
  precision: 'Of customers flagged as churn risk, the percentage that actually churned.',
  recall: 'Of all customers who churned, the percentage the model flagged in advance.',
  f1Score: 'Harmonic mean of precision and recall.',
} as const;

const TRUST_STYLES: Record<'high' | 'medium' | 'low', { label: string; tone: string }> = {
  high: {
    label: 'High trust',
    tone: 'border-success/30 bg-success/10 text-success',
  },
  medium: {
    label: 'Medium trust',
    tone: 'border-warning/30 bg-warning/10 text-warning',
  },
  low: {
    label: 'Low trust',
    tone: 'border-error/30 bg-error/10 text-error',
  },
};

type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
  tooltip: string;
  toneClasses: string;
};

const MetricCard: React.FC<MetricCardProps> = ({ label, value, hint, tooltip, toneClasses }) => (
  <div className={`backdrop-blur-xl p-5 rounded-2xl border shadow-lg ${toneClasses}`}>
    <div className="mb-2 flex items-center gap-2">
      <div className="text-xs font-medium uppercase tracking-wider">{label}</div>
      <InsightsInfoTooltip content={tooltip} side="right" />
    </div>
    <div className="text-3xl font-bold text-text-primary">{value}</div>
    <div className="mt-1 text-sm text-text-muted">{hint}</div>
  </div>
);

type CoverageCardProps = {
  label: string;
  value: string;
  hint: string;
};

const CoverageCard: React.FC<CoverageCardProps> = ({ label, value, hint }) => (
  <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-4 shadow-lg">
    <div className="text-xs uppercase tracking-wide text-text-muted">{label}</div>
    <div className="mt-2 text-2xl font-semibold text-text-primary">{value}</div>
    <div className="mt-1 text-xs text-text-muted">{hint}</div>
  </div>
);

type AccuracyMetricsSectionProps = {
  filters?: InsightsQueryFilters;
};

export const AccuracyMetricsSection: React.FC<AccuracyMetricsSectionProps> = ({ filters }) => {
  const { data, isLoading, error } = useModelQualityInsights(filters);

  if (isLoading) {
    return <InsightsLoadingState cardCount={4} blockHeights={[420]} />;
  }

  if (error || !data) {
    return (
      <InsightsErrorState
        title="Unable to load model quality data"
        description="There was an error loading model trust and coverage diagnostics."
      />
    );
  }

  const { currentPeriod, coverage, trustSummary, avgRiskScores, historicalTrend, byRiskLevel, recommendations } = data;
  const { metrics, confusionMatrix } = currentPeriod;
  const trustStyle = TRUST_STYLES[trustSummary.trustLevel];

  const hasData = currentPeriod.totalPredictions > 0
    || coverage.customersScored > 0
    || historicalTrend.length > 0
    || byRiskLevel.length > 0;

  if (!hasData) {
    return (
      <InsightsEmptyState
        title="No model quality data yet"
        description="Run scoring and collect churn outcomes to populate trust and calibration diagnostics."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Accuracy"
          value={`${(metrics.accuracy * 100).toFixed(1)}%`}
          hint={`${currentPeriod.totalPredictions.toLocaleString()} observations`}
          tooltip={METRIC_DEFINITIONS.accuracy}
          toneClasses="from-accent-primary/10 to-accent-secondary/5 border-accent-primary/20 text-accent-primary bg-gradient-to-br"
        />
        <MetricCard
          label="Precision"
          value={`${(metrics.precision * 100).toFixed(1)}%`}
          hint="When flagged as risk"
          tooltip={METRIC_DEFINITIONS.precision}
          toneClasses="from-success/10 to-success/5 border-success/20 text-success bg-gradient-to-br"
        />
        <MetricCard
          label="Recall"
          value={`${(metrics.recall * 100).toFixed(1)}%`}
          hint="Churners caught"
          tooltip={METRIC_DEFINITIONS.recall}
          toneClasses="from-info/10 to-info/5 border-info/20 text-info bg-gradient-to-br"
        />
        <MetricCard
          label="F1 Score"
          value={`${(metrics.f1Score * 100).toFixed(1)}%`}
          hint="Balanced quality"
          tooltip={METRIC_DEFINITIONS.f1Score}
          toneClasses="from-warning/10 to-warning/5 border-warning/20 text-warning bg-gradient-to-br"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <CoverageCard
          label="Scoring Coverage"
          value={`${coverage.scoringCoveragePercent.toFixed(1)}%`}
          hint={`${coverage.customersScored.toLocaleString()} / ${coverage.customersInScope.toLocaleString()} customers`}
        />
        <CoverageCard
          label="Label Coverage"
          value={`${coverage.labelCoveragePercent.toFixed(1)}%`}
          hint={`${coverage.customersWithLabels.toLocaleString()} labeled outcomes`}
        />
        <CoverageCard
          label="Labeled Outcomes"
          value={currentPeriod.labeledOutcomes.toLocaleString()}
          hint={`Minimum for confusion matrix: ${currentPeriod.minimumLabeledOutcomesForConfusionMatrix}`}
        />
        <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-4 shadow-lg">
          <div className="mb-2 text-xs uppercase tracking-wide text-text-muted">Trust Summary</div>
          <div className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${trustStyle.tone}`}>
            {trustStyle.label}
          </div>
          <p className="mt-2 text-sm text-text-secondary">{trustSummary.summary}</p>
          <div className="mt-3 text-xs text-text-muted">
            Calibration gap: {trustSummary.calibrationGap.toFixed(3)} | Risk separation: {trustSummary.riskSeparation.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Confusion Matrix</h3>
          {!currentPeriod.isConfusionMatrixAvailable ? (
            <InsightsEmptyState
              compact
              title="Model evaluation unavailable"
              description={
                currentPeriod.confusionMatrixStatusMessage
                ?? 'Additional labeled churn outcomes are required before confusion-matrix diagnostics can be shown.'
              }
            />
          ) : (
            <>
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
            </>
          )}
        </div>

        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Risk Score Separation</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-muted">Avg score - churned customers</span>
                <span className="text-2xl font-bold text-error">{avgRiskScores.churned.toFixed(1)}</span>
              </div>
              <div className="w-full bg-surface-secondary/50 rounded-full h-3">
                <div className="bg-error h-3 rounded-full transition-all" style={{ width: `${avgRiskScores.churned}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-muted">Avg score - retained customers</span>
                <span className="text-2xl font-bold text-success">{avgRiskScores.retained.toFixed(1)}</span>
              </div>
              <div className="w-full bg-surface-secondary/50 rounded-full h-3">
                <div className="bg-success h-3 rounded-full transition-all" style={{ width: `${avgRiskScores.retained}%` }} />
              </div>
            </div>
            <div className="p-4 bg-accent-primary/10 rounded-xl border border-accent-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">Score separation</span>
                <span className="text-2xl font-bold text-accent-primary">{avgRiskScores.separation.toFixed(1)}</span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Larger separation indicates cleaner distinction between churners and retained customers.
              </p>
            </div>
          </div>
          {currentPeriod.optimalThreshold !== null && (
            <div className="mt-4 p-3 bg-surface-secondary/30 rounded-xl">
              <span className="text-sm text-text-muted">Suggested threshold: </span>
              <span className="font-semibold text-accent-primary">{currentPeriod.optimalThreshold.toFixed(0)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Historical Quality Trend</h3>
          {historicalTrend.length === 0 ? (
            <InsightsEmptyState
              compact
              title="No historical trend"
              description="More scoring periods are required to render model-quality trends."
            />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
                  <XAxis dataKey="period" stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgb(var(--text-muted))" fontSize={12} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} domain={[0, 1]} tickLine={false} axisLine={false} />
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
          )}
        </div>

        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Calibration by Risk Bucket</h3>
          {byRiskLevel.length === 0 ? (
            <InsightsEmptyState
              compact
              title="No calibration data"
              description="Risk-bucket diagnostics appear once each bucket has enough observations."
            />
          ) : (
            <>
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
                        name === 'accuracy' ? 'Observed churn rate' : name,
                      ]}
                    />
                    <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                      {byRiskLevel.map((_, index) => (
                        <Cell key={`calibration-cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
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
            </>
          )}
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-accent-primary/10 via-accent-secondary/10 to-info/10 backdrop-blur-xl p-6 rounded-2xl border border-accent-primary/20 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Model Recommendations</h3>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="text-accent-primary mt-0.5">-</span>
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-surface-primary/90 backdrop-blur-xl p-4 rounded-2xl border border-border-primary/30 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-text-muted">
          <div>
            <span>Model version: </span>
            <span className="font-medium text-text-primary">{currentPeriod.modelVersion || 'Default'}</span>
          </div>
          <div>
            <span>Period: </span>
            <span className="font-medium text-text-primary">
              {new Date(currentPeriod.periodStart).toLocaleDateString()} - {new Date(currentPeriod.periodEnd).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span>Labeled outcomes: </span>
            <span className="font-medium text-text-primary">{currentPeriod.labeledOutcomes.toLocaleString()}</span>
          </div>
          {metrics.aucRoc !== null && (
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
