import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useInsightsOverview } from '@/features/insights/api/split-insights';
import {
  InsightsPaymentHealthCode,
  InsightsQueryFilters,
  InsightsRiskBucketCode,
} from '@/types/insights';
import {
  InsightsEmptyState,
  InsightsErrorState,
  InsightsLoadingState,
} from './insights-state';

const RISK_COLORS: Record<InsightsRiskBucketCode, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
  Minimal: '#3b82f6',
};

const PAYMENT_HEALTH_BADGES: Record<InsightsPaymentHealthCode, string> = {
  Healthy: 'bg-success/15 text-success border-success/30',
  Watch: 'bg-info/15 text-info border-info/30',
  AtRisk: 'bg-warning/15 text-warning border-warning/30',
  PastDue: 'bg-warning/15 text-warning border-warning/30',
  Failed: 'bg-error/15 text-error border-error/30',
  Cancelled: 'bg-error/20 text-error border-error/40',
  Unknown: 'bg-surface-secondary/50 text-text-muted border-border-primary/40',
};

const CUSTOMER_RISK_LEVEL_BY_BUCKET: Record<InsightsRiskBucketCode, string> = {
  Minimal: '0',
  Low: '0',
  Medium: '1',
  High: '2',
  Critical: '3',
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const formatSignedPercent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

const formatLastActivity = (rawDate?: string | null) => {
  if (!rawDate) {
    return 'No activity data';
  }

  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) {
    return 'No activity data';
  }

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    return 'Today';
  }

  if (diffDays === 1) {
    return '1 day ago';
  }

  if (diffDays < 30) {
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString();
};

const Sparkline = ({ points }: { points: number[] }) => {
  if (!points || points.length < 2) {
    return (
      <div className="mt-2 h-8 text-xs text-text-muted">
        Trend data pending
      </div>
    );
  }

  const width = 120;
  const height = 32;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(max - min, 1);

  const coordinates = points
    .map((value, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg
      className="mt-2 h-8 w-full"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-accent-primary"
        points={coordinates}
      />
    </svg>
  );
};

type InsightsOverviewSectionProps = {
  filters?: InsightsQueryFilters;
};

export const InsightsOverviewSection: React.FC<InsightsOverviewSectionProps> = ({ filters }) => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useInsightsOverview(filters);

  const buildCustomerListPath = React.useCallback(
    ({
      highRiskOnly,
      riskBucket,
    }: {
      highRiskOnly?: boolean;
      riskBucket?: InsightsRiskBucketCode;
    } = {}) => {
      const query = new URLSearchParams();
      query.set('page', '1');
      query.set('sortBy', 'churnRiskScore');
      query.set('sortDescending', 'true');

      if (highRiskOnly) {
        query.set('filter', 'high-risk');
      }

      if (riskBucket) {
        query.set('churnRiskLevel', CUSTOMER_RISK_LEVEL_BY_BUCKET[riskBucket]);
      }

      if (filters?.lifecycleStage) {
        query.set('lifecycleStage', filters.lifecycleStage);
      }

      if (filters?.companySize) {
        query.set('companySize', filters.companySize);
      }

      if (filters?.acquisitionChannel) {
        query.set('acquisitionChannel', filters.acquisitionChannel);
      }

      if (filters?.geo) {
        query.set('geo', filters.geo);
      }

      return `/app/customers?${query.toString()}`;
    },
    [filters?.acquisitionChannel, filters?.companySize, filters?.geo, filters?.lifecycleStage],
  );

  if (isLoading) {
    return <InsightsLoadingState cardCount={5} blockHeights={[320, 420]} />;
  }

  if (error || !data) {
    return (
      <InsightsErrorState
        title="Unable to load risk command center"
        description="There was an error loading Insights overview data."
        onRetry={() => window.location.reload()}
      />
    );
  }

  const {
    kpis,
    riskDistribution,
    churnTrend,
    topAtRiskCustomers,
    dataAvailability,
    emptyStateHints,
  } = data;

  const hasContent = dataAvailability.scoredCustomers > 0
    || riskDistribution.length > 0
    || churnTrend.length > 0
    || topAtRiskCustomers.length > 0;

  if (!hasContent) {
    return (
      <div className="space-y-4">
        {emptyStateHints.map((hint) => (
          <div
            key={hint.code}
            className="rounded-xl border border-warning/25 bg-warning/5 p-4"
          >
            <h4 className="text-sm font-semibold text-text-primary">{hint.title}</h4>
            <p className="mt-1 text-sm text-text-muted">{hint.description}</p>
          </div>
        ))}
        <InsightsEmptyState
          title="No risk scores available"
          description="Run churn scoring for the selected scope to populate Insights overview widgets."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {emptyStateHints.length > 0 && (
        <div className="space-y-3">
          {emptyStateHints.map((hint) => (
            <div
              key={hint.code}
              className="rounded-xl border border-warning/25 bg-warning/5 p-4"
            >
              <h4 className="text-sm font-semibold text-text-primary">{hint.title}</h4>
              <p className="mt-1 text-sm text-text-muted">{hint.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <button
          onClick={() => navigate(buildCustomerListPath({ highRiskOnly: true }))}
          className="rounded-2xl border border-error/20 bg-error/5 p-4 text-left transition-colors hover:border-error/40"
        >
          <div className="text-xs uppercase tracking-wide text-error">MRR at Risk</div>
          <div className="mt-2 text-2xl font-bold text-text-primary">{formatCurrency(kpis.mrrAtRisk)}</div>
          <div className="mt-1 text-xs text-text-muted">View high-risk customers</div>
        </button>

        <button
          onClick={() => navigate(buildCustomerListPath({ highRiskOnly: true }))}
          className="rounded-2xl border border-error/20 bg-error/5 p-4 text-left transition-colors hover:border-error/40"
        >
          <div className="text-xs uppercase tracking-wide text-error">Customers at Risk</div>
          <div className="mt-2 text-2xl font-bold text-text-primary">{kpis.customersAtRisk.toLocaleString()}</div>
          <div className="mt-1 text-xs text-text-muted">{formatPercent(kpis.customersAtRiskPercent)} of scored customers</div>
        </button>

        <button
          onClick={() => navigate(buildCustomerListPath({ highRiskOnly: true }))}
          className="rounded-2xl border border-info/20 bg-info/5 p-4 text-left transition-colors hover:border-info/40"
        >
          <div className="text-xs uppercase tracking-wide text-info">Predicted Churn (30d)</div>
          <div className="mt-2 text-2xl font-bold text-text-primary">{kpis.predictedChurn30d.toFixed(1)}</div>
          <div className="mt-1 text-xs text-text-muted">Expected churn count</div>
        </button>

        <button
          onClick={() => navigate(buildCustomerListPath({ highRiskOnly: true }))}
          className="rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-4 text-left transition-colors hover:border-border-secondary/50"
        >
          <div className="text-xs uppercase tracking-wide text-text-muted">Current Churn Rate</div>
          <div className="mt-2 text-2xl font-bold text-text-primary">{formatPercent(kpis.currentChurnRate)}</div>
          <div className="mt-1 text-xs text-text-muted">Actual churn in selected period</div>
        </button>

        <button
          onClick={() => navigate(buildCustomerListPath({ highRiskOnly: true }))}
          className="rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-4 text-left transition-colors hover:border-border-secondary/50"
        >
          <div className="text-xs uppercase tracking-wide text-text-muted">Risk Trend</div>
          <div className={`mt-2 text-2xl font-bold ${kpis.riskTrendChangePercent > 0 ? 'text-error' : kpis.riskTrendChangePercent < 0 ? 'text-success' : 'text-text-primary'}`}>
            {formatSignedPercent(kpis.riskTrendChangePercent)}
          </div>
          <div className="text-xs text-text-muted">vs previous equivalent window</div>
          <Sparkline points={kpis.riskTrendSparkline} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Risk Distribution</h3>
              <p className="text-sm text-text-muted">Counts and MRR by risk bucket</p>
            </div>
            <button
              onClick={() => navigate(buildCustomerListPath({ highRiskOnly: true }))}
              className="rounded-lg border border-border-primary/40 px-3 py-2 text-xs font-medium text-text-primary hover:border-accent-primary/40"
            >
              View customer list
            </button>
          </div>

          {riskDistribution.length === 0 ? (
            <InsightsEmptyState
              compact
              title="No distribution data"
              description="Risk bucket distribution appears after scoring runs complete."
            />
          ) : (
            <>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskDistribution} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
                    <XAxis type="number" stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="bucketLabel" type="category" stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(var(--surface-primary))',
                        border: '1px solid rgb(var(--border-primary))',
                        borderRadius: '12px',
                        color: 'rgb(var(--text-primary))',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'count' ? value.toLocaleString() : formatCurrency(value),
                        name === 'count' ? 'Customers' : 'MRR',
                      ]}
                    />
                    <Bar dataKey="count" radius={[0, 5, 5, 0]}>
                      {riskDistribution.map((item) => (
                        <Cell key={item.bucket} fill={RISK_COLORS[item.bucket]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-2">
                {riskDistribution.map((item) => (
                  <button
                    key={item.bucket}
                    onClick={() => navigate(buildCustomerListPath({ riskBucket: item.bucket }))}
                    className="flex w-full items-center justify-between rounded-lg border border-border-primary/25 bg-surface-secondary/25 px-3 py-2 text-left hover:border-accent-primary/35"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: RISK_COLORS[item.bucket] }} />
                      <span className="text-sm text-text-secondary">{item.bucketLabel}</span>
                    </div>
                    <div className="text-sm text-text-primary">
                      <span className="font-semibold">{item.count.toLocaleString()}</span>
                      <span className="ml-2 text-text-muted">{formatCurrency(item.mrr)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Predicted vs Actual Trend</h3>
              <p className="text-sm text-text-muted">Predicted high-risk rate compared to observed churn</p>
            </div>
            <button
              onClick={() => navigate(buildCustomerListPath({ highRiskOnly: true }))}
              className="rounded-lg border border-border-primary/40 px-3 py-2 text-xs font-medium text-text-primary hover:border-accent-primary/40"
            >
              View customer list
            </button>
          </div>

          {churnTrend.length === 0 ? (
            <InsightsEmptyState
              compact
              title="No trend data"
              description={dataAvailability.hasChurnLabels
                ? 'Predicted trend points appear after additional scoring windows.'
                : 'Actual trend requires churn labels in this scope.'}
            />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={churnTrend} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
                  <XAxis dataKey="month" stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="rgb(var(--text-muted))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(var(--surface-primary))',
                      border: '1px solid rgb(var(--border-primary))',
                      borderRadius: '12px',
                      color: 'rgb(var(--text-primary))',
                    }}
                    formatter={(value: number, name: string) => [
                      `${(value * 100).toFixed(1)}%`,
                      name === 'predictedChurnRate' ? 'Predicted' : 'Actual',
                    ]}
                  />
                  <Line type="monotone" dataKey="predictedChurnRate" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="actualChurnRate" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="6 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Top At-Risk Customers</h3>
            <p className="text-sm text-text-muted">Prioritized by risk score, probability, and MRR exposure</p>
          </div>
          <button
            onClick={() => navigate(buildCustomerListPath({ highRiskOnly: true }))}
            className="rounded-lg border border-border-primary/40 px-3 py-2 text-xs font-medium text-text-primary hover:border-accent-primary/40"
          >
            View customer list
          </button>
        </div>

        {topAtRiskCustomers.length === 0 ? (
          <InsightsEmptyState
            compact
            title="No at-risk customers in scope"
            description="Try expanding the date range or removing restrictive filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="border-b border-border-primary/30 text-left text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-3 py-3">Customer / Account</th>
                  <th className="px-3 py-3">Risk</th>
                  <th className="px-3 py-3">Primary Driver</th>
                  <th className="px-3 py-3">Last Activity</th>
                  <th className="px-3 py-3">Payment Health</th>
                  <th className="px-3 py-3 text-right">MRR</th>
                </tr>
              </thead>
              <tbody>
                {topAtRiskCustomers.map((customer) => (
                  <tr
                    key={customer.customerId}
                    onClick={() => navigate(`/app/customers/${customer.customerId}`)}
                    className="cursor-pointer border-b border-border-primary/20 text-sm text-text-primary hover:bg-surface-secondary/25"
                  >
                    <td className="px-3 py-3">
                      <div className="font-medium">{customer.customerName}</div>
                      <div className="text-xs text-text-muted">{customer.accountName || 'No account name'}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold" style={{ borderColor: `${RISK_COLORS[customer.riskBucket]}55`, color: RISK_COLORS[customer.riskBucket] }}>
                          {customer.riskBucketLabel}
                        </span>
                        <span>{customer.riskScore.toFixed(0)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-text-secondary">{customer.primaryDriver}</td>
                    <td className="px-3 py-3 text-text-secondary">{formatLastActivity(customer.lastActivityAt)}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${PAYMENT_HEALTH_BADGES[customer.paymentHealth]}`}>
                        {customer.paymentHealthLabel}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold">{formatCurrency(customer.mrr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
