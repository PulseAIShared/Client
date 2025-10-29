import React, { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCustomerProfile } from './customer-profile-context';
import { useCustomerAiInsightsStore } from '@/features/customers/state/customer-ai-insights-store';
import { CompanyAuthorization, useAuthorization } from '@/lib/authorization';

const formatScore = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) {
    return 'N/A';
  }
  return `${value.toFixed(1)}`;
};

export const CustomerOverviewTab: React.FC = () => {
  const navigate = useNavigate();
  const { checkCompanyPolicy } = useAuthorization();
  const { overview, header, churnAnalysis, customerId, refetch } = useCustomerProfile();
  const aiStoreStatus = useCustomerAiInsightsStore((state) => state.status);

  const riskTrendData = useMemo(
    () =>
      overview.riskTrend.map((point) => ({
        label: point.label,
        value: point.value,
      })),
    [overview.riskTrend],
  );

  const trendDelta = useMemo(() => {
    if (overview.riskTrend.length < 2) {
      return null;
    }
    const first = overview.riskTrend[0].value;
    const last = overview.riskTrend[overview.riskTrend.length - 1].value;
    const delta = last - first;
    return {
      label: delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1),
      tone: delta >= 0 ? 'text-error' : 'text-success',
    };
  }, [overview.riskTrend]);

  const topRiskFactors = useMemo(() => overview.riskFactors.slice(0, 6), [overview.riskFactors]);

  const quickActions = useMemo(
    () => [
      {
        id: 'outreach',
        title: 'Schedule Outreach',
        description: 'Coordinate proactive conversation with the account owner.',
        onClick: () => navigate(`/app/customers/${customerId}#engagement`),
        restricted: false,
      },
      {
        id: 'rerun',
        title: 'Rerun Analysis',
        description: 'Open the churn analysis workflow to refresh predictions.',
        onClick: () => navigate(`/app/analytics/run-churn-analysis?customerId=${customerId}`),
        restricted: true,
      },
      {
        id: 'refresh',
        title: 'Refresh Profile',
        description: 'Pull latest metrics and AI insights for this customer.',
        onClick: () => refetch(),
        restricted: false,
      },
    ],
    [customerId, navigate, refetch],
  );

  const canEditCustomers = checkCompanyPolicy('customers:write');

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-semibold tracking-wide text-text-muted">Current AI Risk Level</span>
              <div className="text-2xl sm:text-3xl font-bold text-text-primary mt-2">{header.aiRiskLevel}</div>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-text-secondary">Prediction date:</span>{' '}
              <span className="text-text-primary">{churnAnalysis.predictionDate ?? 'No prediction yet'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-surface-primary/90 border border-border-primary/30 rounded-2xl shadow-sm">
              <div className="text-xs uppercase tracking-wide text-text-muted font-semibold">Baseline Model Score</div>
              <div className="text-3xl font-bold text-text-primary mt-2">{formatScore(churnAnalysis.baselineScore)}</div>
              <div className="text-xs text-text-secondary/80 mt-1">Previous snapshot</div>
            </div>
            <div className="p-4 bg-surface-primary/90 border border-border-primary/30 rounded-2xl shadow-sm">
              <div className="text-xs uppercase tracking-wide text-text-muted font-semibold">AI Prediction Score</div>
              <div className="text-3xl font-bold text-accent-primary mt-2">{formatScore(churnAnalysis.aiScore)}</div>
              <div className="text-xs text-text-secondary/80 mt-1">Latest model output</div>
            </div>
            <div className="p-4 bg-surface-primary/90 border border-border-primary/30 rounded-2xl shadow-sm">
              <div className="text-xs uppercase tracking-wide text-text-muted font-semibold">Trend Momentum</div>
              <div className={`text-3xl font-bold mt-2 ${trendDelta ? trendDelta.tone : 'text-text-secondary'}`}>
                {trendDelta ? trendDelta.label : 'N/A'}
              </div>
              <div className="text-xs text-text-secondary/80 mt-1">Delta vs first recorded point</div>
            </div>
          </div>

          <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Risk Trend Sparkline</h3>
                <p className="text-xs text-text-secondary/80">
                  Week-over-week churn risk changes based on connected telemetry.
                </p>
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full border ${aiStoreStatus === 'stale' ? 'text-warning border-warning/40' : 'text-success border-success/40'}`}>
                {aiStoreStatus === 'stale' ? 'Refresh recommended' : 'Up to date'}
              </span>
            </div>
            {riskTrendData.length === 0 ? (
              <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-text-muted text-sm">
                No historical predictions recorded yet. Rerun churn analysis to seed the sparkline.
              </div>
            ) : (
              <div className="h-40 sm:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={riskTrendData}>
                    <defs>
                      <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(var(--accent-primary))" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="rgb(var(--accent-primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      labelStyle={{ color: 'rgb(var(--text-primary))' }}
                      contentStyle={{
                        backgroundColor: 'rgb(var(--surface-primary))',
                        borderRadius: '12px',
                        border: '1px solid rgb(var(--border-primary))',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="rgb(var(--accent-primary))"
                      fill="url(#riskGradient)"
                      strokeWidth={2.5}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface-secondary/40 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const actionButton = (
                <Button
                  key={action.id}
                  variant="outline"
                  className="w-full justify-start border-border-primary/40 hover:border-accent-primary/50 hover:text-accent-primary bg-surface-primary/70"
                  onClick={action.onClick}
                >
                  <div className="flex flex-col text-left">
                    <span className="font-semibold">{action.title}</span>
                    <span className="text-xs text-text-secondary/80">{action.description}</span>
                  </div>
                </Button>
              );

              if (!action.restricted) {
                return actionButton;
              }

              return (
                <CompanyAuthorization key={action.id} policyCheck={canEditCustomers} forbiddenFallback={null}>
                  {actionButton}
                </CompanyAuthorization>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
        <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">Top Risk Drivers</h3>
        {topRiskFactors.length === 0 ? (
          <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-muted">
            AI analysis has not surfaced factor weights yet. Ensure product usage, support, and billing sources are connected.
          </div>
        ) : (
          <div className="space-y-3">
            {topRiskFactors.map((factor) => (
              <div key={factor.key} className="p-4 bg-surface-secondary/40 border border-border-primary/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-primary capitalize">{factor.key.replace(/[_-]/g, ' ')}</span>
                  <span className="text-sm font-semibold text-accent-primary">{(factor.weight * 100).toFixed(1)}%</span>
                </div>
                <div className="mt-2 h-2 bg-border-primary/30 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-primary" style={{ width: `${Math.min(100, Math.abs(factor.weight) * 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
