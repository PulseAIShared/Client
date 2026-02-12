import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useDriverInsightsDetail,
  useDriversInsights,
} from '@/features/insights/api/split-insights';
import { InsightsQueryFilters } from '@/types/insights';
import { InsightsEmptyState, InsightsErrorState, InsightsLoadingState } from './insights-state';

type DriversSectionProps = {
  filters?: InsightsQueryFilters;
};

type SegmentDrilldown = {
  dimension?: string;
  segment?: string;
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const formatSignedPercent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

const normalizeValue = (value?: string | null) =>
  (value ?? '').trim().toLowerCase().replace(/[_\s-]/g, '');

const resolveCustomerRiskLevel = (riskBucket?: string) => {
  const normalized = normalizeValue(riskBucket);

  if (normalized === 'minimal' || normalized === 'low') return '0';
  if (normalized === 'medium') return '1';
  if (normalized === 'high') return '2';
  if (normalized === 'critical') return '3';

  return undefined;
};

const resolveCustomerFilterForDriver = (driverKey?: string) => {
  const normalized = normalizeValue(driverKey);

  if (normalized === 'paymentfailure') return 'payment-issues';
  if (normalized === 'engagementdecline') return 'high-risk';
  if (normalized === 'supportfriction') return 'high-risk';

  return 'high-risk';
};

const resolvePlanCode = (planName?: string) => {
  const normalized = normalizeValue(planName);
  if (normalized === 'trial') return '0';
  if (normalized === 'basic') return '1';
  if (normalized === 'pro') return '2';
  if (normalized === 'enterprise') return '3';
  return undefined;
};

const buildCustomerListPath = (
  filters?: InsightsQueryFilters,
  driverKey?: string,
  segmentDrilldown?: SegmentDrilldown,
) => {
  const query = new URLSearchParams();
  query.set('page', '1');
  query.set('sortBy', 'churnRiskScore');
  query.set('sortDescending', 'true');

  const mappedFilter = resolveCustomerFilterForDriver(driverKey);
  if (mappedFilter) {
    query.set('filter', mappedFilter);
  }

  const mappedRiskLevel = resolveCustomerRiskLevel(filters?.riskBucket);
  if (mappedRiskLevel) {
    query.set('churnRiskLevel', mappedRiskLevel);
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

  if (segmentDrilldown?.segment && segmentDrilldown?.dimension) {
    const normalizedDimension = normalizeValue(segmentDrilldown.dimension);

    if (normalizedDimension === 'plantier') {
      const planCode = resolvePlanCode(segmentDrilldown.segment);
      if (planCode) {
        query.set('plan', planCode);
      }
    } else if (normalizedDimension === 'lifecyclestage') {
      query.set('lifecycleStage', segmentDrilldown.segment);
    } else if (normalizedDimension === 'geo') {
      query.set('geo', segmentDrilldown.segment);
    }
  }

  return `/app/customers?${query.toString()}`;
};

export const DriversSection: React.FC<DriversSectionProps> = ({ filters }) => {
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    error,
  } = useDriversInsights(filters);

  const [selectedDriverKey, setSelectedDriverKey] = React.useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading, error: detailError } = useDriverInsightsDetail(
    selectedDriverKey,
    filters,
  );

  React.useEffect(() => {
    if (!data) {
      return;
    }

    const candidateKeys = [
      ...data.topDrivers.map((driver) => driver.driverKey),
      ...data.velocitySignals.map((signal) => signal.signalKey),
    ];

    if (candidateKeys.length === 0) {
      if (selectedDriverKey !== null) {
        setSelectedDriverKey(null);
      }
      return;
    }

    if (!selectedDriverKey || !candidateKeys.includes(selectedDriverKey)) {
      setSelectedDriverKey(candidateKeys[0]);
    }
  }, [data, selectedDriverKey]);

  if (isLoading) {
    return <InsightsLoadingState blockHeights={[280, 380, 360]} />;
  }

  if (error || !data) {
    return (
      <InsightsErrorState
        title="Unable to load driver insights"
        description="There was an error loading risk driver and velocity signal data."
      />
    );
  }

  const { topDrivers, velocitySignals, coverage } = data;

  if (topDrivers.length === 0 && velocitySignals.length === 0) {
    return (
      <InsightsEmptyState
        title="No driver signals in this scope"
        description="Run scoring and ingest engagement/payment/support events to populate explainability signals."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-6 shadow-lg">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Top Risk Drivers</h3>
            <p className="text-sm text-text-muted">
              Global contributors to predicted churn with impact and trend changes vs previous window.
            </p>
          </div>
          <button
            onClick={() => navigate(buildCustomerListPath(filters, selectedDriverKey ?? topDrivers[0]?.driverKey))}
            className="rounded-lg border border-border-primary/40 px-3 py-2 text-xs font-medium text-text-primary hover:border-accent-primary/40"
          >
            View customer list
          </button>
        </div>

        {topDrivers.length === 0 ? (
          <InsightsEmptyState
            compact
            title="No top drivers"
            description="Driver attribution appears once customers have scored churn factors."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="border-b border-border-primary/30 text-left text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-3 py-3">Driver</th>
                  <th className="px-3 py-3 text-right">Contribution</th>
                  <th className="px-3 py-3 text-right">Affected</th>
                  <th className="px-3 py-3 text-right">MRR at Risk</th>
                  <th className="px-3 py-3 text-right">Trend</th>
                  <th className="px-3 py-3 text-right">Drilldown</th>
                </tr>
              </thead>
              <tbody>
                {topDrivers.map((driver) => {
                  const isSelected = selectedDriverKey === driver.driverKey;

                  return (
                    <tr
                      key={driver.driverKey}
                      onClick={() => setSelectedDriverKey(driver.driverKey)}
                      className={`cursor-pointer border-b border-border-primary/20 text-sm text-text-primary transition-colors ${
                        isSelected ? 'bg-accent-primary/8' : 'hover:bg-surface-secondary/25'
                      }`}
                    >
                      <td className="px-3 py-3">
                        <div className="font-medium">{driver.driverName}</div>
                        <div className="text-xs text-text-muted">{driver.definition}</div>
                      </td>
                      <td className="px-3 py-3 text-right font-semibold">{formatPercent(driver.contributionPercent)}</td>
                      <td className="px-3 py-3 text-right">{driver.affectedCustomers.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right">{formatCurrency(driver.mrrAtRisk)}</td>
                      <td className="px-3 py-3 text-right">
                        <span
                          className={
                            driver.trendDirection === 'up'
                              ? 'text-error'
                              : driver.trendDirection === 'down'
                                ? 'text-success'
                                : 'text-text-muted'
                          }
                        >
                          {formatSignedPercent(driver.trendDeltaPercent)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(buildCustomerListPath(filters, driver.driverKey));
                          }}
                          className="rounded-lg border border-border-primary/40 px-2 py-1 text-xs font-medium text-text-primary hover:border-accent-primary/40"
                        >
                          View customer list
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {velocitySignals.map((signal) => {
          const isSelected = selectedDriverKey === signal.signalKey;

          return (
            <div
              key={signal.signalKey}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedDriverKey(signal.signalKey)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedDriverKey(signal.signalKey);
                }
              }}
              className={`rounded-2xl border p-5 text-left shadow-lg transition-colors ${
                isSelected
                  ? 'border-accent-primary/45 bg-accent-primary/8'
                  : 'border-border-primary/30 bg-surface-primary/90 hover:border-border-secondary/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold text-text-primary">{signal.signalName}</h4>
                  <p className="mt-1 text-sm text-text-muted">{signal.definition}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    signal.trendDirection === 'up'
                      ? 'bg-error/15 text-error'
                      : signal.trendDirection === 'down'
                        ? 'bg-success/15 text-success'
                        : 'bg-surface-secondary/40 text-text-muted'
                  }`}
                >
                  {signal.changePercent === null ? 'No baseline' : formatSignedPercent(signal.changePercent)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border-primary/25 bg-surface-secondary/25 p-3">
                  <div className="text-xs uppercase text-text-muted">Triggered</div>
                  <div className="mt-1 text-lg font-semibold text-text-primary">
                    {signal.triggeredCustomers.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg border border-border-primary/25 bg-surface-secondary/25 p-3">
                  <div className="text-xs uppercase text-text-muted">MRR at risk</div>
                  <div className="mt-1 text-lg font-semibold text-text-primary">{formatCurrency(signal.triggeredMrr)}</div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(buildCustomerListPath(filters, signal.signalKey));
                  }}
                  className="rounded-lg border border-border-primary/40 px-3 py-2 text-xs font-medium text-text-primary hover:border-accent-primary/40"
                >
                  View customer list
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-6 shadow-lg">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Driver Detail</h3>
            <p className="text-sm text-text-muted">
              Definition, thresholds, correlated behavior, and affected customer evidence.
            </p>
          </div>
          {selectedDriverKey && (
            <button
              onClick={() => navigate(buildCustomerListPath(filters, selectedDriverKey))}
              className="rounded-lg border border-border-primary/40 px-3 py-2 text-xs font-medium text-text-primary hover:border-accent-primary/40"
            >
              View customer list
            </button>
          )}
        </div>

        {detailLoading ? (
          <InsightsLoadingState cardCount={3} blockHeights={[220]} />
        ) : detailError || !detailData ? (
          <InsightsErrorState
            title="Unable to load driver detail"
            description="Select a driver to review affected customers and supporting evidence."
          />
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <div className="rounded-xl border border-border-primary/25 bg-surface-secondary/20 p-4 lg:col-span-2">
                <div className="text-xs uppercase tracking-wide text-text-muted">Definition</div>
                <div className="mt-2 text-sm text-text-secondary">{detailData.definition}</div>
              </div>
              <div className="rounded-xl border border-border-primary/25 bg-surface-secondary/20 p-4">
                <div className="text-xs uppercase tracking-wide text-text-muted">Contribution</div>
                <div className="mt-2 text-2xl font-semibold text-text-primary">
                  {formatPercent(detailData.contributionPercent)}
                </div>
                <div className="text-xs text-text-muted">of total modeled risk</div>
              </div>
              <div className="rounded-xl border border-border-primary/25 bg-surface-secondary/20 p-4">
                <div className="text-xs uppercase tracking-wide text-text-muted">Affected Customers</div>
                <div className="mt-2 text-2xl font-semibold text-text-primary">
                  {detailData.affectedCustomers.toLocaleString()}
                </div>
                <div className="text-xs text-text-muted">{formatCurrency(detailData.mrrAtRisk)} MRR at risk</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div className="rounded-xl border border-border-primary/25 bg-surface-secondary/15 p-4">
                <h4 className="text-sm font-semibold text-text-primary">Thresholds and Suggested Action</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">
                  {detailData.thresholds.map((threshold) => (
                    <li key={threshold}>{threshold}</li>
                  ))}
                </ul>
                <div className="mt-3 rounded-lg border border-accent-primary/25 bg-accent-primary/8 p-3 text-sm text-text-secondary">
                  <span className="font-semibold text-text-primary">Suggested action:</span> {detailData.suggestedAction}
                </div>
              </div>

              <div className="rounded-xl border border-border-primary/25 bg-surface-secondary/15 p-4">
                <h4 className="text-sm font-semibold text-text-primary">Correlated Behaviors</h4>
                {detailData.correlatedBehaviors.length === 0 ? (
                  <p className="mt-2 text-sm text-text-muted">No correlated behavior metrics available.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {detailData.correlatedBehaviors.map((metric) => (
                      <div key={metric.metricKey} className="rounded-lg border border-border-primary/25 bg-surface-secondary/20 p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-text-primary">{metric.metricLabel}</span>
                          <span className={metric.deltaPercent > 0 ? 'text-error' : metric.deltaPercent < 0 ? 'text-success' : 'text-text-muted'}>
                            {formatSignedPercent(metric.deltaPercent)}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-text-muted">
                          Affected: {metric.affectedValue.toFixed(2)} | Baseline: {metric.baselineValue.toFixed(2)}
                        </div>
                        <div className="mt-1 text-xs text-text-secondary">{metric.interpretation}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border-primary/25 bg-surface-secondary/15 p-4">
              <h4 className="text-sm font-semibold text-text-primary">Segment Concentration</h4>
              {detailData.segmentBreakdown.length === 0 ? (
                <p className="mt-2 text-sm text-text-muted">No segment concentration data available.</p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse">
                    <thead>
                      <tr className="border-b border-border-primary/30 text-left text-xs uppercase tracking-wide text-text-muted">
                        <th className="px-3 py-2">Dimension</th>
                        <th className="px-3 py-2">Segment</th>
                        <th className="px-3 py-2 text-right">Customers</th>
                        <th className="px-3 py-2 text-right">Avg Risk</th>
                        <th className="px-3 py-2 text-right">MRR at Risk</th>
                        <th className="px-3 py-2 text-right">Drilldown</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailData.segmentBreakdown.map((row) => (
                        <tr key={`${row.dimension}:${row.segment}`} className="border-b border-border-primary/20 text-sm text-text-primary">
                          <td className="px-3 py-2">{row.dimension}</td>
                          <td className="px-3 py-2">{row.segment}</td>
                          <td className="px-3 py-2 text-right">{row.customers.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right">{row.avgRiskScore.toFixed(1)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.mrrAtRisk)}</td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => navigate(buildCustomerListPath(filters, selectedDriverKey ?? undefined, {
                                dimension: row.dimension,
                                segment: row.segment,
                              }))}
                              className="rounded-lg border border-border-primary/40 px-2 py-1 text-xs font-medium text-text-primary hover:border-accent-primary/40"
                            >
                              View list
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border-primary/25 bg-surface-secondary/15 p-4">
              <h4 className="text-sm font-semibold text-text-primary">Affected Customers (Preview)</h4>
              {detailData.affectedCustomerPreview.length === 0 ? (
                <p className="mt-2 text-sm text-text-muted">No affected customers found for this driver in the selected scope.</p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[820px] border-collapse">
                    <thead>
                      <tr className="border-b border-border-primary/30 text-left text-xs uppercase tracking-wide text-text-muted">
                        <th className="px-3 py-2">Customer</th>
                        <th className="px-3 py-2">Account</th>
                        <th className="px-3 py-2 text-right">Risk</th>
                        <th className="px-3 py-2 text-right">Bucket</th>
                        <th className="px-3 py-2 text-right">MRR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailData.affectedCustomerPreview.map((customer) => (
                        <tr
                          key={customer.customerId}
                          onClick={() => navigate(`/app/customers/${customer.customerId}`)}
                          className="cursor-pointer border-b border-border-primary/20 text-sm text-text-primary hover:bg-surface-secondary/25"
                        >
                          <td className="px-3 py-2 font-medium">{customer.customerName}</td>
                          <td className="px-3 py-2 text-text-secondary">{customer.accountName || 'No account'}</td>
                          <td className="px-3 py-2 text-right">{customer.riskScore.toFixed(1)}</td>
                          <td className="px-3 py-2 text-right">{customer.riskBucketLabel}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(customer.mrr)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border-primary/25 bg-surface-primary/80 p-4 text-sm text-text-muted">
        Coverage: {coverage.scoredCustomers.toLocaleString()} scored customers.
        {' '}
        Payment signals: {coverage.hasPaymentSignals ? 'Yes' : 'No'}.
        {' '}
        Engagement signals: {coverage.hasEngagementSignals ? 'Yes' : 'No'}.
        {' '}
        Support signals: {coverage.hasSupportSignals ? 'Yes' : 'No'}.
      </div>
    </div>
  );
};
