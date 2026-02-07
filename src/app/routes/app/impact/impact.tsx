import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppPageHeader, ContentLayout } from '@/components/layouts';
import { CompanyAuthorization, useAuthorization } from '@/lib/authorization';
import { Spinner } from '@/components/ui/spinner';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  Clock3,
  DollarSign,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { PeriodSelector } from '@/features/analytics/components/period-selector';
import { ImpactSegmentFilter } from '@/features/analytics/components/segment-filter';
import { RevenueTrendChart } from '@/features/analytics/components/revenue-trend-chart';
import { RecoveryRateChart } from '@/features/analytics/components/recovery-rate-chart';
import { ChurnDistributionChart } from '@/features/analytics/components/churn-distribution-chart';
import { RecoveryFunnel } from '@/features/analytics/components/recovery-funnel';
import {
  ImpactPeriodState,
  applyImpactPeriodToSearchParams,
  getImpactPeriodLabel,
  parseImpactPeriodFromSearchParams,
  resolveImpactPeriodRange,
} from '@/features/analytics/utils/impact-period';
import {
  useGetImpactRecoveryFunnel,
  useGetImpactPlaybookPerformance,
  useGetImpactSegments,
  useGetImpactSummary,
  useGetImpactTrends,
} from '@/features/analytics/api/impact';
import { ImpactPlaybookPerformanceItem } from '@/types/api';

const statusLabels = ['Draft', 'Active', 'Paused', 'Archived'] as const;

const toPercent = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (value <= 1 && value >= 0) {
    return value * 100;
  }

  return value;
};

const normalizeRatio = (value: number): number => {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  if (value <= 1) {
    return value;
  }

  return value / 100;
};

const formatPercent = (value: number): string => {
  if (!Number.isFinite(value)) {
    return '0%';
  }

  return `${value.toFixed(1)}%`;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
};

const resolvePlaybookStatus = (status: string | number): string => {
  if (typeof status === 'number') {
    return statusLabels[status] ?? String(status);
  }

  return status;
};

const ChangeChip: React.FC<{ value: number }> = ({ value }) => {
  if (Math.abs(value) < 0.05) {
    return (
      <span className="inline-flex items-center rounded-full border border-border-primary/40 bg-surface-secondary/60 px-2 py-0.5 text-xs text-text-muted">
        No change vs prior period
      </span>
    );
  }

  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-xs text-success">
        <ArrowUpRight className="h-3.5 w-3.5" />
        +{formatPercent(value)} vs prior period
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-error/40 bg-error/10 px-2 py-0.5 text-xs text-error-muted">
      <ArrowDownRight className="h-3.5 w-3.5" />
      {formatPercent(value)} vs prior period
    </span>
  );
};

const SupportingKpi: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  emphasize?: boolean;
  context: string;
}> = ({ label, value, icon, emphasize, context }) => (
  <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/40 p-4">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-xs uppercase tracking-wide text-text-muted">{label}</span>
      <span>{icon}</span>
    </div>
    <div className={`text-2xl font-semibold ${emphasize ? 'text-success' : 'text-text-primary'}`}>{value}</div>
    <div className="mt-1 text-xs text-text-muted">{context}</div>
  </div>
);

const PlaybookPerformanceCard: React.FC<{
  item: ImpactPlaybookPerformanceItem;
}> = ({ item }) => {
  const status = resolvePlaybookStatus(item.status);
  const coverageRatio = normalizeRatio(item.coverageRate);
  const coveragePercent = coverageRatio * 100;
  const recoveryRatePercent = toPercent(item.recoveryRate);

  return (
    <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-5 shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-text-primary">{item.name}</div>
          <div className="mt-1 text-xs text-text-muted">
            Priority {item.priority}
            {item.signalType ? ` · Signal: ${item.signalType}` : ''}
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
          status === 'Active'
            ? 'bg-success/10 text-success border-success/30'
            : status === 'Paused'
              ? 'bg-warning/10 text-warning border-warning/30'
              : 'bg-surface-secondary/60 text-text-secondary border-border-primary/30'
        }`}>
          {status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg bg-surface-secondary/40 p-3">
          <div className="text-xs text-text-muted">Customers reached</div>
          <div className="text-lg font-semibold text-text-primary">{item.customersReached}</div>
        </div>
        <div className="rounded-lg bg-surface-secondary/40 p-3">
          <div className="text-xs text-text-muted">Runs</div>
          <div className="text-lg font-semibold text-text-primary">{item.runs}</div>
        </div>
        <div className="rounded-lg bg-surface-secondary/40 p-3">
          <div className="text-xs text-text-muted">Recovered revenue</div>
          <div className="text-lg font-semibold text-success">{formatCurrency(item.recoveredRevenue)}</div>
        </div>
        <div className="rounded-lg bg-surface-secondary/40 p-3">
          <div className="text-xs text-text-muted">Recovery rate</div>
          <div className="text-lg font-semibold text-text-primary">{formatPercent(recoveryRatePercent)}</div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border-primary/30 bg-surface-secondary/30 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
          <span>Coverage (actioned vs eligible)</span>
          {item.eligibleCustomers > 0 ? (
            <span>
              {item.actionedCustomers}/{item.eligibleCustomers} customers · {formatCurrency(item.actionedAmount)}/{formatCurrency(item.eligibleAmount)}
            </span>
          ) : (
            <span>No eligible opportunities in this period</span>
          )}
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-surface-secondary/70">
          <div
            className="h-2 rounded-full bg-accent-primary transition-all"
            style={{ width: `${Math.min(100, Math.max(0, coveragePercent))}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-text-muted">
        <div>Avg recovery time: {item.averageRecoveryTimeDays.toFixed(1)} days</div>
        <Link to={`/app/playbooks/${item.playbookId}`} className="inline-flex items-center gap-1 text-accent-primary hover:underline text-xs font-medium">
          View playbook
          <TrendingUp className="h-3.5 w-3.5" />
        </Link>
      </div>

      {item.missedWhilePaused > 0 && (
        <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-text-primary">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Missed while paused
          </div>
          <div className="mt-1 text-text-muted">
            {item.missedWhilePaused} eligible customers were missed in this period · {formatCurrency(item.missedWhilePausedAmount)} at risk
          </div>
        </div>
      )}
    </div>
  );
};

export const ImpactRoute = () => {
  const { checkCompanyPolicy } = useAuthorization();
  const canViewAnalytics = checkCompanyPolicy('analytics:read');
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedSegmentId = searchParams.get('segmentId') ?? undefined;
  const periodState = React.useMemo<ImpactPeriodState>(
    () => parseImpactPeriodFromSearchParams(searchParams),
    [searchParams],
  );
  const resolvedRange = React.useMemo(
    () => resolveImpactPeriodRange(periodState),
    [periodState],
  );
  const periodLabel = React.useMemo(
    () => getImpactPeriodLabel(periodState),
    [periodState],
  );
  const trendInterval = React.useMemo<'daily' | 'weekly'>(() => {
    if (!resolvedRange.isValid) {
      return 'daily';
    }

    const fromMs = new Date(resolvedRange.fromIso).getTime();
    const toMs = new Date(resolvedRange.toIso).getTime();
    const rangeDays = Math.max(1, Math.ceil((toMs - fromMs) / (1000 * 60 * 60 * 24)));

    return rangeDays > 45 ? 'weekly' : 'daily';
  }, [resolvedRange.fromIso, resolvedRange.isValid, resolvedRange.toIso]);

  const impactQueryParams = React.useMemo(
    () => ({
      from: resolvedRange.fromIso,
      to: resolvedRange.toIso,
      segmentId: selectedSegmentId,
    }),
    [resolvedRange.fromIso, resolvedRange.toIso, selectedSegmentId],
  );

  const {
    data: impactSummary,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useGetImpactSummary(impactQueryParams, resolvedRange.isValid);
  const { data: segmentOptions = [], isLoading: segmentsLoading } = useGetImpactSegments();
  const {
    data: playbookPerformance,
    isLoading: performanceLoading,
    isError: performanceError,
  } = useGetImpactPlaybookPerformance(impactQueryParams, resolvedRange.isValid);
  const {
    data: impactTrends,
    isLoading: trendsLoading,
    isError: trendsError,
  } = useGetImpactTrends(
    {
      ...impactQueryParams,
      interval: trendInterval,
    },
    resolvedRange.isValid,
  );
  const {
    data: impactFunnel,
    isLoading: funnelLoading,
    isError: funnelError,
  } = useGetImpactRecoveryFunnel(impactQueryParams, resolvedRange.isValid);

  const isLoading = summaryLoading || performanceLoading || trendsLoading || funnelLoading;
  const hasDataError = summaryError || performanceError || trendsError || funnelError;

  const kpis = impactSummary?.recoveryKpis;
  const recoveryRate = toPercent(kpis?.recoveryRate ?? 0);
  const priorRecoveryRate = toPercent(kpis?.recoveryRatePriorPeriod ?? 0);
  const recoveryRateDelta = recoveryRate - priorRecoveryRate;

  const playbooks = playbookPerformance?.playbooks ?? [];
  const totalRuns = playbookPerformance?.totalRunsInPeriod ?? 0;
  const activePlaybooks = playbookPerformance?.activePlaybookCount ?? 0;
  const pausedPlaybooks = playbookPerformance?.pausedPlaybookCount ?? 0;
  const totalPlaybooks = playbookPerformance?.totalPlaybooks ?? 0;
  const totalRecoveredRevenueInPeriod = playbookPerformance?.totalRecoveredRevenueInPeriod ?? 0;

  const showRecoveryEmptyState = (kpis?.missedAmount ?? 0) > 0 && (kpis?.recoveredAmount ?? 0) <= 0;

  const handlePeriodChange = (next: ImpactPeriodState) => {
    const nextParams = applyImpactPeriodToSearchParams(searchParams, next);
    setSearchParams(nextParams, { replace: true });
  };

  const handleSegmentChange = (segmentId?: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (segmentId) {
      nextParams.set('segmentId', segmentId);
    } else {
      nextParams.delete('segmentId');
    }

    setSearchParams(nextParams, { replace: true });
  };

  return (
    <CompanyAuthorization
      policyCheck={canViewAnalytics}
      forbiddenFallback={
        <ContentLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center bg-surface-primary/80 backdrop-blur-xl p-8 rounded-3xl border border-border-primary/50 shadow-2xl max-w-md">
              <h2 className="text-xl font-semibold text-text-primary mb-2">Access Restricted</h2>
              <p className="text-text-muted">You need analytics read permissions to view impact data.</p>
            </div>
          </div>
        </ContentLayout>
      }
    >
      <ContentLayout>
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          <AppPageHeader
            title="Impact"
            description="Measure how PulseLTV protects your revenue."
            filters={(
              <>
                <PeriodSelector
                  value={periodState}
                  onChange={handlePeriodChange}
                />
                <ImpactSegmentFilter
                  segments={segmentOptions}
                  selectedSegmentId={selectedSegmentId}
                  onChange={handleSegmentChange}
                  isLoading={segmentsLoading}
                />
              </>
            )}
          />

          {!resolvedRange.isValid && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-warning-muted">
              Select a valid custom date range to load impact data.
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Spinner size="xl" />
            </div>
          )}

          {!isLoading && resolvedRange.isValid && (
            <>
              {hasDataError && (
                <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-error-muted">
                  We could not load all impact data for this view. Please retry.
                </div>
              )}

              <section className="rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-6 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-text-primary">Revenue Impact</h2>
                  <span className="text-xs text-text-muted">Selected period: {periodLabel}</span>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                  <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/40 p-5 text-center">
                    <div className="text-xs uppercase tracking-wide text-text-muted">Recovery Rate</div>
                    <div className="mt-2 text-5xl font-bold text-accent-primary">{formatPercent(recoveryRate)}</div>
                    <div className="mt-3">
                      <ChangeChip value={recoveryRateDelta} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SupportingKpi
                      label="Revenue at risk"
                      value={formatCurrency(kpis?.missedAmount ?? 0)}
                      icon={<XCircle className="h-4 w-4 text-error" />}
                      context="Selected period"
                    />
                    <SupportingKpi
                      label="Revenue recovered"
                      value={formatCurrency(kpis?.recoveredAmount ?? 0)}
                      icon={<DollarSign className="h-4 w-4 text-success" />}
                      emphasize
                      context="Selected period"
                    />
                    <SupportingKpi
                      label="Avg days to recover"
                      value={(kpis?.averageDaysToRecover ?? 0).toFixed(1)}
                      icon={<Clock3 className="h-4 w-4 text-info-muted" />}
                      context="Selected period"
                    />
                    <SupportingKpi
                      label="Recovered revenue"
                      value={formatCurrency(kpis?.allTimeRecoveredAmount ?? 0)}
                      icon={<CheckCircle className="h-4 w-4 text-accent-primary" />}
                      context="All-time"
                    />
                  </div>
                </div>

                {showRecoveryEmptyState && (
                  <div className="mt-5 rounded-xl border border-warning/30 bg-warning/10 p-4">
                    <div className="text-sm font-medium text-text-primary">No recovery activity in this period.</div>
                    <p className="mt-1 text-sm text-text-muted">
                      Revenue at risk: <span className="font-semibold text-text-primary">{formatCurrency(kpis?.missedAmount ?? 0)}</span>. Activate a playbook to start recovering revenue.
                    </p>
                    <Link
                      to="/app/playbooks"
                      className="mt-3 inline-flex items-center text-sm font-medium text-accent-primary hover:underline"
                    >
                      Go to playbooks
                    </Link>
                  </div>
                )}

                <RecoveryFunnel
                  funnel={impactFunnel}
                  isLoading={funnelLoading}
                />
              </section>

              <section>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-text-primary">Trends</h2>
                  <div className="text-sm text-text-muted">
                    Aggregation: {impactTrends?.interval ?? trendInterval}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <RevenueTrendChart
                    points={impactTrends?.points ?? []}
                    interval={impactTrends?.interval ?? trendInterval}
                    hasSufficientData={impactTrends?.hasSufficientData ?? false}
                    isLoading={trendsLoading}
                  />
                  <RecoveryRateChart
                    points={impactTrends?.points ?? []}
                    interval={impactTrends?.interval ?? trendInterval}
                    hasSufficientData={impactTrends?.hasSufficientData ?? false}
                    isLoading={trendsLoading}
                  />
                </div>

                <div className="mt-4">
                  <ChurnDistributionChart
                    buckets={impactTrends?.churnDistribution ?? []}
                    isLoading={trendsLoading}
                  />
                </div>
              </section>

              <section>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-text-primary">Playbook Performance</h2>
                  <div className="text-sm text-text-muted">
                    {activePlaybooks} active playbooks · {totalRuns} runs this period · {formatCurrency(totalRecoveredRevenueInPeriod)} recovered this period
                  </div>
                </div>

                {totalPlaybooks === 0 && (
                  <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-6 text-center shadow-lg">
                    <div className="text-base font-medium text-text-primary">No playbooks yet</div>
                    <p className="mt-2 text-sm text-text-muted">Create your first playbook to start automated recovery actions.</p>
                    <Link to="/app/playbooks/create" className="mt-3 inline-flex text-sm font-medium text-accent-primary hover:underline">
                      Create playbook
                    </Link>
                  </div>
                )}

                {totalPlaybooks > 0 && playbookPerformance?.noActivePlaybooks && (
                  <div className="mb-4 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-text-primary">
                    No active playbooks. Turn on at least one playbook to start taking recovery actions.
                  </div>
                )}

                {totalPlaybooks > 0 && playbookPerformance?.allPlaybooksPaused && (
                  <div className="mb-4 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-text-primary">
                    All playbooks are paused ({pausedPlaybooks}). Unpause a playbook to resume automated coverage.
                  </div>
                )}

                {totalPlaybooks > 0 && playbookPerformance?.noActivityInPeriod && (
                  <div className="mb-4 rounded-xl border border-border-primary/30 bg-surface-secondary/30 p-4 text-sm text-text-muted">
                    No playbook activity in this period. Try expanding the period or activating playbooks with live eligible signals.
                  </div>
                )}

                {playbooks.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {playbooks.map((item) => (
                      <PlaybookPerformanceCard key={item.playbookId} item={item} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </ContentLayout>
    </CompanyAuthorization>
  );
};
