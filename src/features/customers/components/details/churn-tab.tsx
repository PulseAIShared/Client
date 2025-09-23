import React, { useMemo } from 'react';
import { CustomerDetailData, formatCurrency } from '@/types/api';
import { formatDate, getRiskColor } from '@/utils/customer-helpers';

interface CustomerChurnTabProps {
  customer: CustomerDetailData;
  canEditCustomers: boolean;
}

const formatPercent = (value?: number | null, fallback = 'N/A') => {
  if (value == null || Number.isNaN(value)) {
    return fallback;
  }

  return `${value.toFixed(1)}%`;
};

const getTopFactors = (factors: Record<string, number> | undefined, limit = 8) => {
  if (!factors) {
    return [] as Array<[string, number]>;
  }

  return Object.entries(factors)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, limit);
};

export const CustomerChurnTab: React.FC<CustomerChurnTabProps> = ({ customer }) => {
  const currentPrediction = customer.churnOverview?.currentPrediction ?? null;
  const storedPrediction = customer.churnOverview?.storedPrediction ?? null;
  const primaryRiskFactors = useMemo(
    () =>
      getTopFactors(
        currentPrediction?.riskFactors ?? customer.churnOverview?.riskFactors,
      ),
    [currentPrediction?.riskFactors, customer.churnOverview?.riskFactors],
  );

  const churnHistory = customer.churnHistory ?? [];
  const riskPeers = customer.riskPeers ?? [];
  const recommendations = customer.churnOverview?.recommendations ?? [];
  const qualityRecommendations = customer.qualityMetrics?.recommendedActions ?? [];
  const completenessRecommendations = customer.completeness?.recommendedActions ?? [];

  const riskScore = currentPrediction?.riskScore ?? customer.churnRiskScore;
  const riskLevelName = customer.display?.riskLevelName ?? customer.riskStatus ?? 'Unknown';
  const riskBadgeClasses = getRiskColor(riskScore ?? 0);
  const currency = customer.currency ?? 'USD';

  const showNoFactorsState = primaryRiskFactors.length === 0;

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="relative bg-surface-secondary/40 border border-border-primary/30 rounded-2xl p-6 shadow-lg">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-error/10 via-error/5 to-error/0 opacity-20"></div>
          <div className="relative space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Current Risk</span>
            <div className="flex items-end gap-3">
              <span className="text-4xl sm:text-5xl font-bold text-text-primary">{formatPercent(riskScore)}</span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${riskBadgeClasses}`}>
                {riskLevelName}
              </span>
            </div>
            <div className="space-y-2 text-sm text-text-secondary">
              <div>Predicted {currentPrediction?.predictionDate ? formatDate(currentPrediction.predictionDate) : 'recently'}</div>
              {storedPrediction && (
                <div>Previous stored prediction: {formatPercent(storedPrediction.riskScore)} ({storedPrediction.modelVersion ?? 'v1'})</div>
              )}
              {customer.quickMetrics?.overallHealthScore && (
                <div>Overall health: {customer.quickMetrics.overallHealthScore}</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface-secondary/40 border border-border-primary/30 rounded-2xl p-6 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Signals</span>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-surface-primary/80 rounded-xl border border-border-primary/30">
              <span className="text-xs text-text-muted">Data Freshness</span>
              <div className="text-lg font-semibold text-text-primary">
                {customer.dataSources?.quality?.dataFreshnessDisplay ?? 'N/A'}
              </div>
            </div>
            <div className="p-3 bg-surface-primary/80 rounded-xl border border-border-primary/30">
              <span className="text-xs text-text-muted">Churn Predictions</span>
              <div className="text-lg font-semibold text-text-primary">
                {customer.quickMetrics?.totalChurnPredictions ?? churnHistory.length}
              </div>
            </div>
            <div className="p-3 bg-surface-primary/80 rounded-xl border border-border-primary/30">
              <span className="text-xs text-text-muted">Support Tickets Open</span>
              <div className="text-lg font-semibold text-text-primary">
                {customer.openSupportTickets ?? 0}
              </div>
            </div>
            <div className="p-3 bg-surface-primary/80 rounded-xl border border-border-primary/30">
              <span className="text-xs text-text-muted">Payment Failures</span>
              <div className="text-lg font-semibold text-text-primary">
                {customer.paymentFailureCount ?? 0}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-secondary/40 border border-border-primary/30 rounded-2xl p-6 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Priority Actions</span>
          <div className="mt-4 space-y-2">
            {[...recommendations, ...qualityRecommendations, ...completenessRecommendations].slice(0, 6).map((action, index) => (
              <div key={`${action}-${index}`} className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-error/70"></span>
                <span className="text-sm text-text-secondary">{action}</span>
              </div>
            ))}
            {recommendations.length === 0 && qualityRecommendations.length === 0 && completenessRecommendations.length === 0 && (
              <div className="text-sm text-text-muted">No AI recommendations available for this customer yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface-primary/90 backdrop-blur-xl border border-border-primary/30 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary">Risk Factors</h3>
          {customer.churnOverview?.modelVersion && (
            <span className="text-sm text-text-muted">Model {customer.churnOverview.modelVersion}</span>
          )}
        </div>
        {showNoFactorsState ? (
          <div className="p-6 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl text-text-muted text-sm">
            No risk factor breakdown is available yet. Ensure engagement, billing, and support data sources are connected to unlock deeper insights.
          </div>
        ) : (
          <div className="space-y-4">
            {primaryRiskFactors.map(([factor, contribution]) => (
              <div key={factor} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <span className="font-semibold text-text-primary">{factor}</span>
                  <span className="font-semibold text-text-primary">{formatPercent(contribution)}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-secondary/50 overflow-hidden">
                  <div
                    className="h-full bg-error/70"
                    style={{ width: `${Math.max(5, Math.min(100, contribution ?? 0))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-surface-primary/90 backdrop-blur-xl border border-border-primary/30 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">Prediction History</h3>
          {churnHistory.length === 0 ? (
            <div className="p-6 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl text-text-muted text-sm">
              No historical churn predictions yet for this customer.
            </div>
          ) : (
            <div className="space-y-4">
              {churnHistory.map((entry) => (
                <div key={entry.id} className="p-4 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl">
                  <div className="flex items-center justify-between text-sm text-text-muted">
                    <span>{formatDate(entry.predictionDate)}</span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full border border-border-primary/40 bg-surface-primary/60 text-text-secondary">
                      {entry.modelVersion ?? 'v1'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-text-primary">{formatPercent(entry.riskScore)}</span>
                    <span className="text-sm text-text-secondary">Level {entry.riskLevel}</span>
                  </div>
                  {entry.riskFactors && (
                    <div className="mt-3 text-xs text-text-muted">
                      Top drivers: {getTopFactors(entry.riskFactors, 3).map(([factor]) => factor).join(', ') || 'N/A'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface-primary/90 backdrop-blur-xl border border-border-primary/30 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">Peer Comparison</h3>
          {riskPeers.length === 0 ? (
            <div className="p-6 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl text-text-muted text-sm">
              No similar high-risk peers found.
            </div>
          ) : (
            <div className="space-y-3">
              {riskPeers.map((peer) => (
                <div key={peer.customerId} className="p-4 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl">
                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span className="font-semibold text-text-primary">{peer.name}</span>
                    <span>{formatPercent(peer.riskScore)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                    <span>{peer.email}</span>
                    <span className="opacity-60">•</span>
                    <span>{peer.plan}</span>
                    <span className="opacity-60">•</span>
                    <span>{peer.subscriptionStatus}</span>
                    <span className="opacity-60">•</span>
                    <span>{formatCurrency(peer.monthlyRecurringRevenue, currency)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
