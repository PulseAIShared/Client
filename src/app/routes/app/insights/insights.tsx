import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import {
  AccuracyMetricsSection,
  DataHealthSection,
  DriversSection,
  InsightsHeader,
  InsightsOverviewSection,
  SegmentInsightsSection,
} from '@/features/insights/components';
import { useTrackInsightsUiEvent } from '@/features/insights/api/split-insights';
import { InsightsQueryFilters } from '@/types/insights';
import { CompanyAuthorization, useAuthorization } from '@/lib/authorization';

type TabId = 'overview' | 'drivers' | 'segments' | 'model_quality' | 'data_health';

type DateRangeFilter = '7d' | '30d' | '90d' | '12m';
type RiskLevelFilter = 'all' | 'critical' | 'high' | 'medium' | 'low' | 'minimal';

const normalizeQueryValue = (value: string | null): string =>
  (value ?? '').trim().toLowerCase().replace(/_/g, '-');

const parseTabFromQuery = (value: string | null): TabId => {
  const normalized = normalizeQueryValue(value);

  if (
    normalized === 'overview'
    || normalized === 'churn-overview'
    || normalized === 'at-risk-customers'
    || normalized === 'risk-queue'
    || normalized === 'risk'
  ) {
    return 'overview';
  }

  if (normalized === 'drivers' || normalized === 'predictors' || normalized === 'engagement') {
    return 'drivers';
  }

  if (
    normalized === 'segments'
    || normalized === 'segments-cohorts'
    || normalized === 'cohorts'
    || normalized === 'geo'
    || normalized === 'geo-risk'
  ) {
    return 'segments';
  }

  if (normalized === 'model-quality' || normalized === 'accuracy') {
    return 'model_quality';
  }

  if (normalized === 'data-health') {
    return 'data_health';
  }

  return 'overview';
};

const toTabQueryValue = (tab: TabId): string => {
  return tab.replace(/_/g, '-');
};

const parseDateRangeFromQuery = (value: string | null): DateRangeFilter => {
  const normalized = normalizeQueryValue(value);
  if (normalized === '7d') return '7d';
  if (normalized === '90d') return '90d';
  if (normalized === '12m') return '12m';
  return '30d';
};

const parseRiskLevelFromQuery = (value: string | null): RiskLevelFilter => {
  const normalized = normalizeQueryValue(value);
  if (normalized === 'critical') return 'critical';
  if (normalized === 'high') return 'high';
  if (normalized === 'medium') return 'medium';
  if (normalized === 'low') return 'low';
  if (normalized === 'minimal') return 'minimal';
  return 'all';
};

const DATE_RANGE_OPTIONS: Array<{ value: DateRangeFilter; label: string }> = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
];

const RISK_LEVEL_OPTIONS: Array<{ value: RiskLevelFilter; label: string }> = [
  { value: 'all', label: 'All risk levels' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'minimal', label: 'Minimal' },
];

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2" />
      </svg>
    ),
  },
  {
    id: 'drivers',
    label: 'Drivers',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 15l4-4 4 4 4-6" />
      </svg>
    ),
  },
  {
    id: 'segments',
    label: 'Segments',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
      </svg>
    ),
  },
  {
    id: 'model_quality',
    label: 'Model & Quality',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a10 10 0 11-20 0 10 10 0 0120 0z" />
      </svg>
    ),
  },
  {
    id: 'data_health',
    label: 'Data Health',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4V9m4 12H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export const InsightsRoute = () => {
  const { checkCompanyPolicy } = useAuthorization();
  const canViewAnalytics = checkCompanyPolicy('analytics:read');
  const [searchParams, setSearchParams] = useSearchParams();
  const trackInsightsUiEventMutation = useTrackInsightsUiEvent();

  const activeTab = React.useMemo(
    () => parseTabFromQuery(searchParams.get('tab')),
    [searchParams],
  );
  const dateRange = React.useMemo(
    () => parseDateRangeFromQuery(searchParams.get('range')),
    [searchParams],
  );
  const riskLevel = React.useMemo(
    () => parseRiskLevelFromQuery(searchParams.get('riskLevel')),
    [searchParams],
  );

  const sharedInsightsFilters = React.useMemo<InsightsQueryFilters>(() => ({
    range: dateRange,
    riskBucket: riskLevel === 'all' ? undefined : riskLevel,
    planTier: searchParams.get('planTier') ?? undefined,
    lifecycleStage: searchParams.get('lifecycleStage') ?? undefined,
    acquisitionChannel: searchParams.get('acquisitionChannel') ?? undefined,
    companySize: searchParams.get('companySize') ?? undefined,
    geo: searchParams.get('geo') ?? undefined,
    paymentStatus: searchParams.get('paymentStatus') ?? undefined,
  }), [dateRange, riskLevel, searchParams]);

  const trackInsightsUiEvent = React.useCallback(
    (eventName: string, context: string, metadata?: Record<string, unknown>) => {
      trackInsightsUiEventMutation.mutate({
        eventName,
        tab: activeTab,
        context,
        metadata,
      });
    },
    [activeTab, trackInsightsUiEventMutation],
  );

  const updateSearchParams = React.useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
          next.delete(key);
          return;
        }

        next.set(key, value);
      });

      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const handleTabChange = (tab: TabId) => {
    if (tab === activeTab) {
      return;
    }

    trackInsightsUiEvent('insights_tab_selected', 'tab_navigation', {
      fromTab: activeTab,
      toTab: tab,
    });

    updateSearchParams({ tab: toTabQueryValue(tab) });
  };

  const handleDateRangeChange = (value: DateRangeFilter) => {
    if (value === dateRange) {
      return;
    }

    trackInsightsUiEvent('insights_filter_changed', 'global_filters', {
      filterKey: 'date_range',
      previousValue: dateRange,
      value,
    });

    updateSearchParams({ range: value });
  };

  const handleRiskLevelChange = (value: RiskLevelFilter) => {
    if (value === riskLevel) {
      return;
    }

    trackInsightsUiEvent('insights_filter_changed', 'global_filters', {
      filterKey: 'risk_level',
      previousValue: riskLevel,
      value,
    });

    updateSearchParams({ riskLevel: value === 'all' ? undefined : value });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <InsightsOverviewSection filters={sharedInsightsFilters} />;
      case 'drivers':
        return <DriversSection filters={sharedInsightsFilters} />;
      case 'segments':
        return <SegmentInsightsSection globalFilters={sharedInsightsFilters} />;
      case 'model_quality':
        return <AccuracyMetricsSection filters={sharedInsightsFilters} />;
      case 'data_health':
        return <DataHealthSection filters={sharedInsightsFilters} />;
      default:
        return <InsightsOverviewSection filters={sharedInsightsFilters} />;
    }
  };

  return (
    <CompanyAuthorization
      policyCheck={canViewAnalytics}
      forbiddenFallback={
        <ContentLayout>
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="max-w-md rounded-3xl border border-border-primary/50 bg-surface-primary/80 p-8 text-center shadow-2xl backdrop-blur-xl">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-warning/20 to-warning-muted/20">
                <svg className="h-8 w-8 text-warning-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-text-primary">Access Restricted</h2>
              <p className="text-text-muted">
                You need analytics read permissions to view insights. Please contact your company owner.
              </p>
            </div>
          </div>
        </ContentLayout>
      }
    >
      <ContentLayout>
        <div className="space-y-6">
          <InsightsHeader />

          <div className="overflow-hidden rounded-2xl border border-border-primary/30 bg-surface-primary/80 shadow-lg backdrop-blur-xl">
            <div className="overflow-x-auto">
              <div className="flex min-w-max">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`shrink-0 min-w-[180px] sm:min-w-[190px] flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-accent-primary bg-accent-primary/5 text-accent-primary'
                        : 'border-transparent text-text-secondary hover:bg-surface-secondary/30 hover:text-text-primary'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border-primary/20 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-text-muted">
                    Date range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(event) => handleDateRangeChange(event.target.value as DateRangeFilter)}
                    className="h-10 w-full rounded-lg border border-border-primary/40 bg-surface-secondary/50 px-3 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  >
                    {DATE_RANGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-text-muted">
                    Risk level
                  </label>
                  <select
                    value={riskLevel}
                    onChange={(event) => handleRiskLevelChange(event.target.value as RiskLevelFilter)}
                    className="h-10 w-full rounded-lg border border-border-primary/40 bg-surface-secondary/50 px-3 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  >
                    {RISK_LEVEL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-4 shadow-lg">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm text-text-muted">
                Insights surfaces churn risk and diagnosis. Execute interventions in Work Queue/Playbooks and measure outcomes in Impact.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/app/work-queue"
                  className="rounded-lg border border-border-primary/40 bg-surface-secondary/40 px-3 py-2 text-xs font-medium text-text-primary hover:border-accent-primary/40"
                >
                  Take action
                </Link>
                <Link
                  to="/app/playbooks"
                  className="rounded-lg border border-border-primary/40 bg-surface-secondary/40 px-3 py-2 text-xs font-medium text-text-primary hover:border-accent-primary/40"
                >
                  Open playbooks
                </Link>
                <Link
                  to="/app/impact"
                  className="rounded-lg border border-accent-primary/30 bg-accent-primary/10 px-3 py-2 text-xs font-medium text-accent-primary hover:border-accent-primary/50"
                >
                  View intervention impact
                </Link>
              </div>
            </div>
          </div>

          <div className="min-h-[400px]">{renderTabContent()}</div>
        </div>
      </ContentLayout>
    </CompanyAuthorization>
  );
};
