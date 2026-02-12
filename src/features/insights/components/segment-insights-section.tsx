import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSegmentInsights } from '@/features/insights/api/split-insights';
import { InsightsQueryFilters, SegmentDetail, SegmentQueryParams } from '@/types/insights';
import { InsightsEmptyState, InsightsErrorState, InsightsLoadingState } from './insights-state';
import { GeoSegmentMap } from './geo-segment-map';

const SEGMENT_COLORS = ['#2563eb', '#16a34a', '#f97316', '#ef4444', '#06b6d4', '#a855f7', '#ec4899', '#14b8a6'];

const SEGMENT_TYPES: Array<{ value: NonNullable<SegmentQueryParams['segment']>; label: string }> = [
  { value: 'plan_tier', label: 'Plan Tier' },
  { value: 'lifecycle_stage', label: 'Lifecycle Stage' },
  { value: 'company_size', label: 'Company Size' },
  { value: 'acquisition_channel', label: 'Acquisition Channel' },
  { value: 'geo', label: 'Geo' },
];

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const normalizeValue = (value: string) => value.trim().toLowerCase().replace(/[_\s-]/g, '');

const resolveRiskLevelCode = (riskBucket?: string) => {
  const normalized = normalizeValue(riskBucket ?? '');
  if (normalized === 'minimal' || normalized === 'low') return '0';
  if (normalized === 'medium') return '1';
  if (normalized === 'high') return '2';
  if (normalized === 'critical') return '3';
  return undefined;
};

const resolvePlanCode = (planName: string) => {
  const normalized = normalizeValue(planName);
  if (normalized === 'trial') return '0';
  if (normalized === 'basic') return '1';
  if (normalized === 'pro') return '2';
  if (normalized === 'enterprise') return '3';
  return undefined;
};

const canDrilldown = (
  dimension: NonNullable<SegmentQueryParams['segment']>,
  segmentName: string,
) => {
  if (normalizeValue(segmentName) === 'unknown') {
    return dimension !== 'plan_tier';
  }

  if (dimension === 'plan_tier') {
    return !!resolvePlanCode(segmentName);
  }

  return true;
};

const buildCustomerListPath = (
  globalFilters: InsightsQueryFilters | undefined,
  dimension: NonNullable<SegmentQueryParams['segment']>,
  segmentName: string,
) => {
  const query = new URLSearchParams();
  query.set('page', '1');
  query.set('sortBy', 'churnRiskScore');
  query.set('sortDescending', 'true');

  const riskLevel = resolveRiskLevelCode(globalFilters?.riskBucket);
  if (riskLevel) {
    query.set('churnRiskLevel', riskLevel);
  }

  if (globalFilters?.lifecycleStage) {
    query.set('lifecycleStage', globalFilters.lifecycleStage);
  }

  if (globalFilters?.companySize) {
    query.set('companySize', globalFilters.companySize);
  }

  if (globalFilters?.acquisitionChannel) {
    query.set('acquisitionChannel', globalFilters.acquisitionChannel);
  }

  if (globalFilters?.geo) {
    query.set('geo', globalFilters.geo);
  }

  if (globalFilters?.planTier) {
    const globalPlanCode = resolvePlanCode(globalFilters.planTier);
    if (globalPlanCode) {
      query.set('plan', globalPlanCode);
    }
  }

  switch (dimension) {
    case 'plan_tier': {
      const planCode = resolvePlanCode(segmentName);
      if (planCode) {
        query.set('plan', planCode);
      }
      break;
    }
    case 'lifecycle_stage':
      query.set('lifecycleStage', segmentName);
      break;
    case 'company_size':
      query.set('companySize', segmentName);
      break;
    case 'acquisition_channel':
      query.set('acquisitionChannel', segmentName);
      break;
    case 'geo':
      query.set('geo', segmentName);
      break;
    default:
      break;
  }

  return `/app/customers?${query.toString()}`;
};

type SegmentInsightsSectionProps = {
  globalFilters?: InsightsQueryFilters;
};

export const SegmentInsightsSection: React.FC<SegmentInsightsSectionProps> = ({ globalFilters }) => {
  const navigate = useNavigate();
  const [params, setParams] = React.useState<SegmentQueryParams>({ segment: 'plan_tier' });
  const [geoViewMode, setGeoViewMode] = React.useState<'table' | 'map'>('table');
  const [selectedGeoRegion, setSelectedGeoRegion] = React.useState<string | null>(null);

  const activeDimension = params.segment ?? 'plan_tier';

  React.useEffect(() => {
    if (activeDimension !== 'geo') {
      setGeoViewMode('table');
      setSelectedGeoRegion(null);
    }
  }, [activeDimension]);

  const mergedParams = React.useMemo(
    () => ({ ...globalFilters, ...params }),
    [globalFilters, params],
  );

  const { data, isLoading, error } = useSegmentInsights(mergedParams);

  const openCustomerList = React.useCallback(
    (segmentName: string) => {
      navigate(buildCustomerListPath(globalFilters, activeDimension, segmentName));
    },
    [activeDimension, globalFilters, navigate],
  );

  if (isLoading) {
    return <InsightsLoadingState blockHeights={[72, 140, 420]} />;
  }

  if (error || !data) {
    return (
      <InsightsErrorState
        title="Unable to load segment data"
        description="There was an error loading segment insights."
      />
    );
  }

  const { segments, comparisons, insights, distribution } = data;

  if (segments.length === 0) {
    return (
      <InsightsEmptyState
        title="No segment data available"
        description="No segment records were found for the selected scope."
      />
    );
  }

  const tableSegments = activeDimension === 'geo' && selectedGeoRegion
    ? segments.filter((segment) => normalizeValue(segment.name) === normalizeValue(selectedGeoRegion))
    : segments;

  const mrrChartData = segments.map((segment, index) => ({
    name: segment.name,
    mrr: segment.mrr,
    color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
  }));

  const distributionData = distribution.byMrr.map((item, index) => ({
    name: item.segment,
    value: item.percentage,
    color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
  }));

  const findSegmentByName = (name?: string | null): SegmentDetail | undefined => {
    if (!name) return undefined;
    return segments.find((segment) => normalizeValue(segment.name) === normalizeValue(name));
  };

  const comparisonCards = [
    {
      title: 'Best Retention',
      value: comparisons.bestRetention,
      hint: 'Lowest actual churn rate',
      tone: 'from-success/10 to-success/5 border-success/20',
    },
    {
      title: 'Highest Growth',
      value: comparisons.highestGrowth,
      hint: 'Largest MRR concentration',
      tone: 'from-info/10 to-info/5 border-info/20',
    },
    {
      title: 'Most at Risk',
      value: comparisons.mostAtRisk,
      hint: 'Highest average churn risk',
      tone: 'from-error/10 to-error/5 border-error/20',
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-sm font-medium text-text-muted">Dimension:</span>
          {SEGMENT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setParams({ segment: type.value })}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeDimension === type.value
                  ? 'bg-accent-primary text-white shadow-lg'
                  : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/80'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {activeDimension === 'geo' && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-2 text-sm font-medium text-text-muted">View:</span>
            <button
              onClick={() => setGeoViewMode('table')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                geoViewMode === 'table'
                  ? 'bg-accent-primary text-white'
                  : 'bg-surface-secondary/45 text-text-secondary hover:bg-surface-secondary/75'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setGeoViewMode('map')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                geoViewMode === 'map'
                  ? 'bg-accent-primary text-white'
                  : 'bg-surface-secondary/45 text-text-secondary hover:bg-surface-secondary/75'
              }`}
            >
              Map
            </button>
            {selectedGeoRegion && (
              <button
                onClick={() => setSelectedGeoRegion(null)}
                className="rounded-lg border border-border-primary/40 px-3 py-1.5 text-sm text-text-secondary hover:border-accent-primary/40"
              >
                Clear region filter ({selectedGeoRegion})
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {comparisonCards.map((card) => {
          const targetSegment = findSegmentByName(card.value);
          const drilldownEnabled = !!targetSegment && canDrilldown(activeDimension, targetSegment.name);

          return (
            <div key={card.title} className={`rounded-2xl border bg-gradient-to-br p-5 shadow-lg ${card.tone}`}>
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">{card.title}</div>
              <div className="text-xl font-bold text-text-primary">{card.value || 'N/A'}</div>
              <div className="mt-1 text-sm text-text-muted">{card.hint}</div>
              <button
                onClick={() => {
                  if (!targetSegment || !drilldownEnabled) return;
                  openCustomerList(targetSegment.name);
                }}
                disabled={!drilldownEnabled}
                className="mt-3 rounded-lg border border-border-primary/40 px-3 py-1.5 text-xs font-medium text-text-primary hover:border-accent-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                View customer list
              </button>
            </div>
          );
        })}
      </div>

      {activeDimension === 'geo' && geoViewMode === 'map' && (
        <GeoSegmentMap
          segments={segments.map((segment) => ({
            name: segment.name,
            customerCount: segment.customerCount,
            mrr: segment.mrr,
            avgRiskScore: segment.avgRiskScore,
          }))}
          selectedRegion={selectedGeoRegion}
          onRegionSelect={(region) => setSelectedGeoRegion(region)}
        />
      )}

      <div className="overflow-x-auto rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Segment Performance</h3>
            <p className="text-sm text-text-muted">Click a row to drill into the equivalent customer list filter.</p>
          </div>
          {activeDimension === 'geo' && selectedGeoRegion && canDrilldown(activeDimension, selectedGeoRegion) && (
            <button
              onClick={() => openCustomerList(selectedGeoRegion)}
              className="rounded-lg border border-border-primary/40 px-3 py-2 text-xs font-medium text-text-primary hover:border-accent-primary/40"
            >
              View selected region customers
            </button>
          )}
        </div>

        {tableSegments.length === 0 ? (
          <InsightsEmptyState
            compact
            title="No segment rows in this filter"
            description="Try clearing the selected geo region filter."
          />
        ) : (
          <table className="w-full min-w-[1320px] border-collapse">
            <thead>
              <tr className="border-b border-border-primary/30 text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-3 py-3">Segment</th>
                <th className="px-3 py-3 text-right">Customers</th>
                <th className="px-3 py-3 text-right">MRR</th>
                <th className="px-3 py-3 text-right">Avg Risk</th>
                <th className="px-3 py-3 text-right">MRR at Risk</th>
                <th className="px-3 py-3 text-right">Pred. Churn (30d)</th>
                <th className="px-3 py-3 text-right">Actual Churn</th>
                <th className="px-3 py-3 text-right">Payment Failures</th>
                <th className="px-3 py-3 text-right">Engagement Health</th>
                <th className="px-3 py-3">Top Drivers</th>
                {activeDimension === 'geo' && <th className="px-3 py-3">Geo Source</th>}
                <th className="px-3 py-3 text-right">Drilldown</th>
              </tr>
            </thead>
            <tbody>
              {tableSegments.map((segment, index) => {
                const drilldownEnabled = canDrilldown(activeDimension, segment.name);

                return (
                  <tr
                    key={`${segment.name}-${index}`}
                    onClick={() => {
                      if (!drilldownEnabled) return;
                      openCustomerList(segment.name);
                    }}
                    className={`border-b border-border-primary/20 text-sm transition-colors ${
                      drilldownEnabled
                        ? 'cursor-pointer text-text-primary hover:bg-surface-secondary/25'
                        : 'text-text-muted'
                    }`}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded"
                          style={{ backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }}
                        />
                        <span className="font-medium">{segment.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">{segment.customerCount.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right font-semibold">{formatCurrency(segment.mrr)}</td>
                    <td className="px-3 py-3 text-right">{segment.avgRiskScore.toFixed(1)}</td>
                    <td className="px-3 py-3 text-right">{formatCurrency(segment.mrrAtRisk)}</td>
                    <td className="px-3 py-3 text-right">{segment.predictedChurn30d.toFixed(1)}</td>
                    <td className="px-3 py-3 text-right">{formatPercent(segment.actualChurnRate)}</td>
                    <td className="px-3 py-3 text-right">{formatPercent(segment.paymentFailureRate)}</td>
                    <td className="px-3 py-3 text-right">{formatPercent(segment.engagementHealth)}</td>
                    <td className="px-3 py-3">
                      {segment.topDrivers.length === 0 ? (
                        <span className="text-text-muted">No drivers</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {segment.topDrivers.map((driver) => (
                            <span
                              key={`${segment.name}-${driver}`}
                              className="rounded-full border border-border-primary/35 bg-surface-secondary/40 px-2 py-0.5 text-xs"
                            >
                              {driver}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    {activeDimension === 'geo' && (
                      <td className="px-3 py-3 text-xs text-text-secondary">{segment.geoSource || 'unknown'}</td>
                    )}
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          if (!drilldownEnabled) return;
                          openCustomerList(segment.name);
                        }}
                        disabled={!drilldownEnabled}
                        className="rounded-lg border border-border-primary/40 px-2 py-1 text-xs font-medium text-text-primary hover:border-accent-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        View list
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">MRR by Segment</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mrrChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
                <XAxis type="number" stroke="rgb(var(--text-muted))" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                <YAxis type="category" dataKey="name" stroke="rgb(var(--text-muted))" fontSize={11} width={120} tickLine={false} />
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
                    <Cell key={`mrr-${entry.name}-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">MRR Distribution</h3>
          {distributionData.length === 0 ? (
            <InsightsEmptyState
              compact
              title="No distribution data"
              description="Segment MRR distribution is not available in this scope."
            />
          ) : (
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
                        <Cell key={`dist-${entry.name}-${index}`} fill={entry.color} />
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
                      <div className="h-3 w-3 rounded" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-text-secondary">{item.name}</span>
                    </div>
                    <span className="font-semibold text-text-primary">{item.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {insights.length > 0 && (
        <div className="rounded-2xl border border-accent-primary/20 bg-gradient-to-r from-accent-primary/10 via-accent-secondary/10 to-info/10 p-6 shadow-lg">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
            <svg className="h-5 w-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Segment Insights
          </h3>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={`${insight}-${index}`} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="mt-0.5 text-accent-primary">-</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
