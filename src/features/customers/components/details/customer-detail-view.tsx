import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CustomerDetailSectionsSpec,
  useCustomerDetailQuery,
  useGetCustomerChurnHistory,
  useGetCustomerDataSources,
  useGetCustomerEngagementFeaturesTop,
  useGetCustomerEngagementHistory,
  useGetCustomerEngagementSessions,
  useGetCustomerOverview,
  useGetCustomerPaymentHistory,
  useGetCustomerSupportHistory,
  useGetCustomerSupportTickets,
  useGetCustomerTimeline,
  useTrackCustomerDetailUiEvent,
} from '@/features/customers/api/customers';
import { formatCurrency } from '@/types/api';

type CustomerDetailViewProps = {
  customerId: string;
};

type DetailTabId = 'summary' | 'revenue' | 'product' | 'operations' | 'data-quality';

const TAB_ORDER: Array<{ id: DetailTabId; label: string; description: string }> = [
  { id: 'summary', label: 'Summary', description: 'Risk posture, drivers, and actions' },
  { id: 'revenue', label: 'Revenue', description: 'Billing health and renewal timing' },
  { id: 'product', label: 'Product', description: 'Usage depth and engagement signals' },
  { id: 'operations', label: 'Operations', description: 'Support workload and playbook execution' },
  { id: 'data-quality', label: 'Data Quality', description: 'Completeness, freshness, and anomalies' },
];

const SUBSCRIPTION_STATUS_LABELS = ['Trial', 'Active', 'Cancelled', 'Expired', 'Past Due'];
const PLAN_LABELS = ['Trial', 'Basic', 'Pro', 'Enterprise'];
const PAYMENT_STATUS_LABELS = ['Active', 'Failed', 'Cancelled', 'Past Due'];
const RISK_LEVEL_LABELS = ['Unanalyzed', 'Low', 'Medium', 'High', 'Critical'];
const CONFIDENCE_LEVEL_LABELS = ['Minimal', 'Good', 'High', 'Excellent'];

const EMPTY_VALUE = 'N/A';

const CLOSED_STATUSES = new Set(['closed', 'resolved', 'done', 'cancelled', 'canceled']);

const isDetailTabId = (value: string | null): value is DetailTabId =>
  TAB_ORDER.some((tab) => tab.id === value);

const humanizeToken = (value: string) =>
  value
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());

const enumLabel = (
  value: string | number | null | undefined,
  labels: string[],
  fallback = EMPTY_VALUE,
) => {
  if (value == null) {
    return fallback;
  }

  if (typeof value === 'number') {
    return labels[value] ?? String(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return fallback;
    }

    const parsedAsNumber = Number(trimmed);
    if (!Number.isNaN(parsedAsNumber) && Number.isInteger(parsedAsNumber)) {
      return labels[parsedAsNumber] ?? trimmed;
    }

    return humanizeToken(trimmed);
  }

  return fallback;
};

const toDateLabel = (value?: string | null, includeTime = false) => {
  if (!value) {
    return EMPTY_VALUE;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-US', includeTime
    ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { year: 'numeric', month: 'short', day: 'numeric' });
};

const toPercentLabel = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) {
    return EMPTY_VALUE;
  }

  return `${Math.round(value)}%`;
};

const toRiskTone = (score?: number | null) => {
  if (score == null || Number.isNaN(score)) return 'bg-slate-500/10 text-slate-500 border-slate-500/30';
  if (score >= 75) return 'bg-error/10 text-error border-error/30';
  if (score >= 50) return 'bg-warning/10 text-warning border-warning/30';
  return 'bg-success/10 text-success border-success/30';
};

const toStatusTone = (status?: string | null) => {
  const normalized = (status ?? '').toLowerCase();
  if (normalized === 'ok' || normalized === 'success' || normalized === 'active') {
    return 'bg-success/10 text-success border-success/30';
  }
  if (normalized === 'warning' || normalized === 'pending') {
    return 'bg-warning/10 text-warning border-warning/30';
  }
  if (normalized === 'error' || normalized === 'failed') {
    return 'bg-error/10 text-error border-error/30';
  }
  return 'bg-surface-secondary/60 text-text-secondary border-border-primary/40';
};

const daysUntil = (date?: string | null) => {
  if (!date) return null;
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return null;
  const diffMs = target.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const collectStrings = (value: unknown, output: string[]) => {
  if (value == null) return;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) output.push(trimmed);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, output));
    return;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const fields = ['provider', 'source', 'name', 'id'];
    let foundDirect = false;
    fields.forEach((field) => {
      if (record[field]) {
        collectStrings(record[field], output);
        foundDirect = true;
      }
    });

    if (!foundDirect) {
      Object.values(record).forEach((item) => collectStrings(item, output));
    }
  }
};

const extractProviders = (raw?: string | null) => {
  if (!raw) return [] as string[];

  const source = raw.trim();
  if (!source) return [] as string[];

  const collected: string[] = [];
  if (source.startsWith('[') || source.startsWith('{')) {
    try {
      const parsed = JSON.parse(source);
      collectStrings(parsed, collected);
    } catch {
      // Ignore parse errors and fallback to delimited parsing.
    }
  }

  if (collected.length === 0) {
    source
      .replace(/[()[\]{}"]/g, '')
      .split(/[,;|]/)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => collected.push(part));
  }

  const deduped = new Map<string, string>();
  collected.forEach((value) => {
    const key = value.toLowerCase();
    if (!deduped.has(key)) {
      deduped.set(key, value);
    }
  });

  return Array.from(deduped.values()).slice(0, 8);
};

const scoreBarTone = (score: number) => {
  if (score >= 70) return 'bg-success';
  if (score >= 40) return 'bg-warning';
  return 'bg-error/80';
};

const SectionCard = ({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-5 shadow-sm">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {description && <p className="text-sm text-text-secondary">{description}</p>}
      </div>
      {actions}
    </div>
    {children}
  </section>
);

const StatTile = ({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) => (
  <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/40 p-3">
    <div className="text-xs uppercase tracking-wide text-text-muted">{label}</div>
    <div className="mt-1 text-lg font-semibold text-text-primary">{value}</div>
    {hint ? <div className="mt-1 text-xs text-text-secondary">{hint}</div> : null}
  </div>
);

const EmptyState = ({
  message,
  actionLabel,
  actionTo,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}) => (
  <div className="rounded-xl border border-border-primary/25 bg-surface-secondary/30 p-4 text-sm text-text-muted">
    <div>{message}</div>
    {actionLabel ? (
      actionTo ? (
        <Link
          to={actionTo}
          onClick={onAction}
          className="mt-3 inline-flex rounded-lg border border-accent-primary/40 bg-accent-primary/10 px-3 py-1.5 text-xs font-semibold text-accent-primary"
        >
          {actionLabel}
        </Link>
      ) : (
        <button
          onClick={onAction}
          className="mt-3 inline-flex rounded-lg border border-accent-primary/40 bg-accent-primary/10 px-3 py-1.5 text-xs font-semibold text-accent-primary"
        >
          {actionLabel}
        </button>
      )
    ) : null}
  </div>
);

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type PaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  setPage: (nextPage: number) => void;
  setPageSize: (nextPageSize: number) => void;
};

type ClientPaginationResult<T> = PaginationMeta & {
  items: T[];
};

const useClientPagination = <T,>(items: T[], initialPageSize = 10): ClientPaginationResult<T> => {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  React.useEffect(() => {
    setPage((current) => clampNumber(current, 1, totalPages));
  }, [totalPages]);

  const pagedItems = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const setSafePage = React.useCallback((nextPage: number) => {
    setPage(clampNumber(nextPage, 1, totalPages));
  }, [totalPages]);

  const setSafePageSize = React.useCallback((nextPageSize: number) => {
    if (!Number.isFinite(nextPageSize) || nextPageSize < 1) {
      return;
    }
    setPageSize(Math.floor(nextPageSize));
    setPage(1);
  }, []);

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(totalItems, page * pageSize);

  return {
    items: pagedItems,
    page,
    pageSize,
    totalItems,
    totalPages,
    startItem,
    endItem,
    setPage: setSafePage,
    setPageSize: setSafePageSize,
  };
};

const PaginationControls = ({ pagination }: { pagination: PaginationMeta }) => {
  if (pagination.totalItems <= pagination.pageSize) {
    return null;
  }

  const pageSizeOptions = Array.from(new Set<number>([...PAGE_SIZE_OPTIONS, pagination.pageSize]))
    .sort((a, b) => a - b);

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-border-primary/20 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-text-muted">
        Showing {pagination.startItem}-{pagination.endItem} of {pagination.totalItems}
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-text-muted">Rows</label>
        <select
          value={pagination.pageSize}
          onChange={(event) => pagination.setPageSize(Number(event.target.value))}
          className="rounded-lg border border-border-primary/35 bg-surface-secondary/40 px-2 py-1 text-xs text-text-primary"
          aria-label="Rows per page"
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="inline-flex items-center rounded-lg border border-border-primary/35 bg-surface-secondary/40">
          <button
            onClick={() => pagination.setPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-2 py-1 text-xs text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          <span className="border-x border-border-primary/30 px-2 py-1 text-xs text-text-secondary">
            {pagination.page}/{pagination.totalPages}
          </span>
          <button
            onClick={() => pagination.setPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-2 py-1 text-xs text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const isClosedTicket = (status?: string | null) =>
  !!status && CLOSED_STATUSES.has(status.toLowerCase());

const playbookSections: CustomerDetailSectionsSpec = {
  overview: false,
  history: undefined,
  aiInsights: false,
  playbooks: {
    summary: true,
    runs: {
      page: 1,
      pageSize: 200,
    },
  },
  dataSources: false,
};

const summarySections: CustomerDetailSectionsSpec = {
  overview: false,
  history: undefined,
  aiInsights: false,
  playbooks: undefined,
  dataSources: false,
  v2: {
    summary: true,
    risk: true,
    revenue: false,
    engagement: false,
    operations: false,
    dataQuality: false,
    timeline: false,
  },
};

export const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({ customerId }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: DetailTabId = isDetailTabId(rawTab) ? rawTab : 'summary';
  const [expandedAnomalies, setExpandedAnomalies] = React.useState<Record<string, boolean>>({});
  const trackUiEventMutation = useTrackCustomerDetailUiEvent();

  const setActiveTab = (nextTab: DetailTabId) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', nextTab);
    setSearchParams(nextParams, { replace: true });
  };

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, tabId: DetailTabId) => {
    const currentIndex = TAB_ORDER.findIndex((tab) => tab.id === tabId);
    if (currentIndex < 0) {
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % TAB_ORDER.length;
      setActiveTab(TAB_ORDER[nextIndex].id);
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const nextIndex = (currentIndex - 1 + TAB_ORDER.length) % TAB_ORDER.length;
      setActiveTab(TAB_ORDER[nextIndex].id);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setActiveTab(TAB_ORDER[0].id);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setActiveTab(TAB_ORDER[TAB_ORDER.length - 1].id);
    }
  };

  const trackUiEvent = React.useCallback((eventName: string, context: string, metadata?: Record<string, unknown>) => {
    trackUiEventMutation.mutate({
      customerId,
      payload: {
        eventName,
        tab: activeTab,
        context,
        metadata,
      },
    });
  }, [activeTab, customerId, trackUiEventMutation]);

  const toggleAnomaly = (key: string, metadata: Record<string, unknown>) => {
    setExpandedAnomalies((current) => {
      const isOpening = !current[key];
      if (isOpening) {
        trackUiEvent('customer_detail_anomaly_opened', 'anomaly_details', metadata);
      }

      return {
        ...current,
        [key]: isOpening,
      };
    });
  };

  const overviewQuery = useGetCustomerOverview(customerId);
  const summaryV2Query = useCustomerDetailQuery(customerId, summarySections, {
    enabled: activeTab === 'summary',
  });

  const churnHistoryQuery = useGetCustomerChurnHistory(customerId, {
    enabled: activeTab === 'summary',
  });

  const paymentHistoryQuery = useGetCustomerPaymentHistory(customerId, {
    enabled: activeTab === 'revenue',
  });

  const engagementHistoryQuery = useGetCustomerEngagementHistory(customerId, {
    enabled: activeTab === 'product',
  });

  const engagementSessionsQuery = useGetCustomerEngagementSessions(customerId, 3, {
    enabled: activeTab === 'product',
  });

  const engagementFeaturesQuery = useGetCustomerEngagementFeaturesTop(customerId, 3, {
    enabled: activeTab === 'product',
  });

  const supportHistoryQuery = useGetCustomerSupportHistory(customerId, {
    enabled: activeTab === 'operations',
  });

  const supportTicketsQuery = useGetCustomerSupportTickets(customerId, false, 200, {
    enabled: activeTab === 'operations',
  });

  const playbooksQuery = useCustomerDetailQuery(customerId, playbookSections, {
    enabled: activeTab === 'operations',
  });

  const dataSourcesQuery = useGetCustomerDataSources(customerId, {
    enabled: activeTab === 'data-quality',
  });

  const timelineQuery = useGetCustomerTimeline(customerId, 90, 200, {
    enabled: activeTab === 'operations' || activeTab === 'data-quality',
  });

  const churnHistoryRows = churnHistoryQuery.data?.history ?? [];
  const paymentTrendRows = paymentHistoryQuery.data?.trends ?? [];
  const engagementTrendRows = engagementHistoryQuery.data?.trends ?? [];
  const sessionRows = engagementSessionsQuery.data?.sessions ?? [];
  const featureRows = engagementFeaturesQuery.data?.topFeatures ?? [];
  const supportTrendRows = supportHistoryQuery.data?.trends ?? [];
  const supportTicketRows = supportTicketsQuery.data?.tickets ?? [];
  const openTicketRows = supportTicketRows.filter((ticket) => !isClosedTicket(ticket.status));
  const playbookSummary = playbooksQuery.data?.playbooks?.summary;
  const playbookRuns = playbooksQuery.data?.playbooks?.runs?.items ?? [];
  const dataSources = dataSourcesQuery.data?.sources ?? [];
  const timelineEvents = timelineQuery.data?.events ?? [];

  const anomalyEvents = timelineEvents.filter(
    (event) => event.severity === 'warning' || event.severity === 'critical',
  );
  const missingCategories = overviewQuery.data?.completeness?.missingCategories ?? [];

  const churnHistoryPagination = useClientPagination(churnHistoryRows, 8);
  const paymentTrendPagination = useClientPagination(paymentTrendRows, 8);
  const engagementTrendPagination = useClientPagination(engagementTrendRows, 8);
  const sessionPagination = useClientPagination(sessionRows, 8);
  const featurePagination = useClientPagination(featureRows, 8);
  const supportTrendPagination = useClientPagination(supportTrendRows, 8);
  const openTicketsPagination = useClientPagination(openTicketRows, 8);
  const playbookRunsPagination = useClientPagination(playbookRuns, 8);
  const timelinePagination = useClientPagination(timelineEvents, 10);
  const dataSourcesPagination = useClientPagination(dataSources, 8);
  const anomaliesPagination = useClientPagination(anomalyEvents, 8);
  const missingCategoriesPagination = useClientPagination(missingCategories, 8);

  if (overviewQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-6 text-text-secondary">
        Loading customer details...
      </div>
    );
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-error/30 bg-error/10 p-6 text-error">
          Unable to load this customer detail view.
        </div>
        <Link
          to="/app/customers"
          className="inline-flex items-center rounded-lg border border-border-primary/30 px-4 py-2 text-sm text-text-primary hover:bg-surface-secondary/60"
        >
          Back to customers
        </Link>
      </div>
    );
  }

  const overview = overviewQuery.data;
  const fullName = `${overview.firstName ?? ''} ${overview.lastName ?? ''}`.trim() || overview.email;
  const riskScore = Number(overview.churnRiskScore ?? 0);
  const dataCompleteness = overview.completeness?.overall ?? null;
  const renewalDays = daysUntil(overview.nextBillingDate);

  const sourceProviders = (() => {
    const sources = [
      ...extractProviders(overview.primaryCrmSource),
      ...extractProviders(overview.primaryPaymentSource),
      ...extractProviders(overview.primaryEngagementSource),
      ...extractProviders(overview.primarySupportSource),
      ...extractProviders(overview.primaryMarketingSource),
    ];

    const unique = new Map<string, string>();
    sources.forEach((value) => {
      const normalized = value.toLowerCase();
      if (!unique.has(normalized)) unique.set(normalized, value);
    });

    return Array.from(unique.values());
  })();

  const riskFactorSource = summaryV2Query.data?.v2?.summary?.topRiskFactors ?? overview.riskFactors ?? {};
  const riskFactors = Object.entries(riskFactorSource)
    .map(([key, rawValue]) => {
      const value = Number(rawValue);
      const score = value > 1 ? value : value * 100;
      return {
        key,
        label: humanizeToken(key),
        score: Math.max(0, Math.min(100, Math.round(score))),
      };
    })
    .sort((a, b) => b.score - a.score);

  const recommendations = (
    summaryV2Query.data?.v2?.summary?.recommendations ??
    overview.aiRecommendations ??
    []
  ).map((item, index) => ({
    id: item.id || `overview-rec-${index + 1}`,
    label: item.label,
    priority: item.priority ?? 'medium',
    category: item.category,
  }));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border-primary/30 bg-surface-primary/95 p-6 shadow-lg">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">{fullName}</h1>
              <p className="text-sm text-text-secondary">{overview.email}</p>
              <p className="text-xs text-text-muted">
                Last synced {overview.lastSyncedDisplay ?? toDateLabel(overview.lastSyncedAt, true)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {sourceProviders.length > 0 ? sourceProviders.map((provider) => (
                <span
                  key={provider}
                  className="rounded-full border border-border-primary/30 bg-surface-secondary/50 px-3 py-1 text-xs font-medium text-text-secondary"
                >
                  {provider}
                </span>
              )) : (
                <span className="rounded-full border border-border-primary/30 bg-surface-secondary/50 px-3 py-1 text-xs text-text-muted">
                  No source metadata
                </span>
              )}
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-3 lg:max-w-xl">
            <StatTile
              label="Risk"
              value={(
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-sm ${toRiskTone(riskScore)}`}>
                  {toPercentLabel(riskScore)} {overview.churnRiskLevelLabel ?? enumLabel(overview.churnRiskLevel, RISK_LEVEL_LABELS)}
                </span>
              )}
              hint={`As of ${toDateLabel(overview.churnPredictionDate || overview.lastSyncedAt)}`}
            />
            <StatTile
              label="MRR"
              value={formatCurrency(overview.monthlyRecurringRevenue, 'USD')}
              hint={`LTV ${formatCurrency(overview.lifetimeValue, 'USD')}`}
            />
            <StatTile
              label="Renewal"
              value={renewalDays == null ? EMPTY_VALUE : `${renewalDays} days`}
              hint={toDateLabel(overview.nextBillingDate)}
            />
            <StatTile
              label="Open Tickets"
              value={overview.openTickets ?? 0}
              hint={dataCompleteness == null ? 'Data confidence unavailable' : `Data confidence ${dataCompleteness}%`}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Customer detail sections">
          {TAB_ORDER.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => onTabKeyDown(event, tab.id)}
              role="tab"
              id={`customer-tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`customer-panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                activeTab === tab.id
                  ? 'border-accent-primary/50 bg-accent-primary/15 text-accent-primary'
                  : 'border-border-primary/35 bg-surface-secondary/35 text-text-secondary hover:border-accent-primary/30'
              }`}
            >
              <div className="font-medium">{tab.label}</div>
              <div className="text-xs opacity-80">{tab.description}</div>
            </button>
          ))}
        </div>
      </section>

      {activeTab === 'summary' && (
        <div
          role="tabpanel"
          id="customer-panel-summary"
          aria-labelledby="customer-tab-summary"
          className="grid grid-cols-1 gap-4 xl:grid-cols-5"
        >
          <div className="space-y-4 xl:col-span-3">
            <SectionCard
              title="Quick Actions"
              description="Jump directly to the workflow domain that needs attention."
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  onClick={() => setActiveTab('revenue')}
                  className="rounded-lg border border-border-primary/30 bg-surface-secondary/40 px-3 py-2 text-left text-sm text-text-primary hover:border-accent-primary/35"
                >
                  Review revenue and renewal risk
                </button>
                <button
                  onClick={() => setActiveTab('product')}
                  className="rounded-lg border border-border-primary/30 bg-surface-secondary/40 px-3 py-2 text-left text-sm text-text-primary hover:border-accent-primary/35"
                >
                  Inspect product adoption
                </button>
                <button
                  onClick={() => setActiveTab('operations')}
                  className="rounded-lg border border-border-primary/30 bg-surface-secondary/40 px-3 py-2 text-left text-sm text-text-primary hover:border-accent-primary/35"
                >
                  Triage support and playbooks
                </button>
                <button
                  onClick={() => setActiveTab('data-quality')}
                  className="rounded-lg border border-border-primary/30 bg-surface-secondary/40 px-3 py-2 text-left text-sm text-text-primary hover:border-accent-primary/35"
                >
                  Fix data quality blockers
                </button>
              </div>
            </SectionCard>

            <SectionCard
              title="Risk Drivers"
              description="Top model factors that contribute to current risk score."
            >
              {riskFactors.length > 0 ? (
                <div className="space-y-3">
                  {riskFactors.slice(0, 6).map((factor) => (
                    <div key={factor.key}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-text-primary">{factor.label}</span>
                        <span className="text-text-secondary">{factor.score}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-secondary">
                        <div
                          className="h-2 rounded-full bg-accent-primary"
                          style={{ width: `${factor.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  message="No risk factors are available yet. Insights populate automatically after integration syncs."
                  actionLabel="Review data quality"
                  onAction={() => setActiveTab('data-quality')}
                />
              )}
            </SectionCard>

            <SectionCard
              title="Churn History"
              description="Real prediction snapshots from historical runs."
            >
              {churnHistoryRows.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px]">
                      <thead className="text-left text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                          <th className="pb-2">Date</th>
                          <th className="pb-2">Risk Score</th>
                          <th className="pb-2">Risk Level</th>
                          <th className="pb-2">Model</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-text-primary">
                        {churnHistoryPagination.items.map((row) => (
                          <tr key={`${row.predictionDate}-${row.modelVersion ?? 'model'}`} className="border-t border-border-primary/20">
                            <td className="py-2">{toDateLabel(row.predictionDate, true)}</td>
                            <td className="py-2">{toPercentLabel(row.riskScore)}</td>
                            <td className="py-2">{enumLabel(row.riskLevel, RISK_LEVEL_LABELS)}</td>
                            <td className="py-2">{row.modelVersion || EMPTY_VALUE}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <PaginationControls pagination={churnHistoryPagination} />
                </>
              ) : (
                <EmptyState
                  message="No prediction history found yet. Churn scoring runs automatically after sync jobs complete."
                  actionLabel="Review data quality"
                  onAction={() => setActiveTab('data-quality')}
                />
              )}
            </SectionCard>
          </div>

          <div className="space-y-4 xl:col-span-2">
            <SectionCard
              title="Priority Actions"
              description="Operational actions generated from current state."
            >
              {recommendations.length > 0 ? (
                <div className="space-y-2">
                  {recommendations.slice(0, 6).map((item) => (
                    <div key={item.id} className="rounded-xl border border-border-primary/25 bg-surface-secondary/35 p-3">
                      <div className="text-sm font-medium text-text-primary">{item.label}</div>
                      <div className="mt-1 text-xs text-text-secondary">
                        {humanizeToken(item.priority ?? 'medium')}
                        {item.category ? ` | ${humanizeToken(item.category)}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  message="No active recommendations yet. Recommendations are generated automatically after sync processing."
                  actionLabel="Open integrations"
                  actionTo="/app/integrations"
                />
              )}
            </SectionCard>

            <SectionCard title="Workflows" description="Run retention workflows directly from this account.">
              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  to="/app/work-queue"
                  className="rounded-lg border border-border-primary/30 bg-surface-secondary/40 px-3 py-2 text-sm text-text-primary hover:border-accent-primary/35"
                >
                  Open Work Queue
                </Link>
                <Link
                  to="/app/playbooks"
                  className="rounded-lg border border-border-primary/30 bg-surface-secondary/40 px-3 py-2 text-sm text-text-primary hover:border-accent-primary/35"
                >
                  Open Playbooks
                </Link>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div
          role="tabpanel"
          id="customer-panel-revenue"
          aria-labelledby="customer-tab-revenue"
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <StatTile label="Subscription" value={overview.subscriptionStatusLabel ?? enumLabel(overview.subscriptionStatus, SUBSCRIPTION_STATUS_LABELS)} />
            <StatTile label="Plan" value={overview.planLabel ?? enumLabel(overview.plan, PLAN_LABELS)} />
            <StatTile label="Payment Status" value={overview.paymentStatusLabel ?? enumLabel(overview.paymentStatus, PAYMENT_STATUS_LABELS)} />
          </div>

          <SectionCard title="Revenue Snapshot" description="Current billing and contract indicators.">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <StatTile label="MRR" value={formatCurrency(overview.monthlyRecurringRevenue, 'USD')} />
              <StatTile label="LTV" value={formatCurrency(overview.lifetimeValue, 'USD')} />
              <StatTile label="Next Billing" value={toDateLabel(overview.nextBillingDate)} />
              <StatTile label="Last Payment" value={toDateLabel(overview.lastPaymentDate)} />
            </div>
          </SectionCard>

          <SectionCard title="Payment Trend" description="Historical MRR and payment failures by period.">
            {paymentHistoryQuery.isLoading ? (
              <div className="text-sm text-text-secondary">Loading payment history...</div>
            ) : paymentTrendRows.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px]">
                    <thead className="text-left text-xs uppercase tracking-wide text-text-muted">
                      <tr>
                        <th className="pb-2">Period</th>
                        <th className="pb-2">MRR</th>
                        <th className="pb-2">Subscription</th>
                        <th className="pb-2">Payment</th>
                        <th className="pb-2">Failures</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-text-primary">
                      {paymentTrendPagination.items.map((row) => (
                        <tr key={`${row.period}-${row.mrr}-${row.paymentFailures}`} className="border-t border-border-primary/20">
                          <td className="py-2">{row.period}</td>
                          <td className="py-2">{formatCurrency(row.mrr, 'USD')}</td>
                          <td className="py-2">{enumLabel(row.subscriptionStatus, SUBSCRIPTION_STATUS_LABELS)}</td>
                          <td className="py-2">{enumLabel(row.paymentStatus, PAYMENT_STATUS_LABELS)}</td>
                          <td className="py-2">{row.paymentFailures}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls pagination={paymentTrendPagination} />
              </>
            ) : (
              <EmptyState
                message="No payment history snapshots are available for this customer."
                actionLabel="Connect billing integration"
                actionTo="/app/integrations"
              />
            )}
          </SectionCard>

          <SectionCard title="Revenue Context" description="Commercial owner and account metadata.">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <StatTile label="Company" value={overview.companyName || EMPTY_VALUE} />
              <StatTile label="Role / Owner" value={overview.jobTitle || EMPTY_VALUE} />
              <StatTile label="Location" value={overview.location || overview.country || EMPTY_VALUE} />
              <StatTile label="CRM Source" value={extractProviders(overview.primaryCrmSource).join(', ') || EMPTY_VALUE} />
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'product' && (
        <div
          role="tabpanel"
          id="customer-panel-product"
          aria-labelledby="customer-tab-product"
          className="space-y-4"
        >
          <SectionCard title="Engagement Snapshot" description="Current product adoption and login cadence.">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <StatTile label="Weekly Logins" value={overview.weeklyLoginFrequency ?? 0} />
              <StatTile label="Feature Usage" value={toPercentLabel(overview.featureUsagePercentage)} />
              <StatTile label="Last Login" value={toDateLabel(overview.lastLoginDate, true)} />
              <StatTile label="Product Source" value={extractProviders(overview.primaryEngagementSource).join(', ') || EMPTY_VALUE} />
            </div>
          </SectionCard>

          <SectionCard title="Engagement Trend" description="Historical engagement snapshots.">
            {engagementHistoryQuery.isLoading ? (
              <div className="text-sm text-text-secondary">Loading engagement history...</div>
            ) : engagementTrendRows.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px]">
                    <thead className="text-left text-xs uppercase tracking-wide text-text-muted">
                      <tr>
                        <th className="pb-2">Period</th>
                        <th className="pb-2">Weekly Logins</th>
                        <th className="pb-2">Feature Usage</th>
                        <th className="pb-2">Last Login</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-text-primary">
                      {engagementTrendPagination.items.map((row) => (
                        <tr key={`${row.period}-${row.weeklyLogins}`} className="border-t border-border-primary/20">
                          <td className="py-2">{row.period}</td>
                          <td className="py-2">{row.weeklyLogins}</td>
                          <td className="py-2">{toPercentLabel(row.featureUsagePercentage)}</td>
                          <td className="py-2">{toDateLabel(row.lastLoginDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls pagination={engagementTrendPagination} />
              </>
            ) : (
              <EmptyState
                message="No engagement history snapshots are available."
                actionLabel="Connect product analytics"
                actionTo="/app/integrations"
              />
            )}
          </SectionCard>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <SectionCard title="Recent Sessions" description="Session-level traces from engagement events.">
              {engagementSessionsQuery.isLoading ? (
                <div className="text-sm text-text-secondary">Loading sessions...</div>
              ) : sessionRows.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {sessionPagination.items.map((session) => (
                      <div key={session.id} className="rounded-xl border border-border-primary/25 bg-surface-secondary/30 p-3">
                        <div className="text-sm font-medium text-text-primary">{session.feature || 'General session'}</div>
                        <div className="mt-1 text-xs text-text-secondary">
                          {toDateLabel(session.startedAt, true)}
                          {session.durationMinutes != null ? ` | ${session.durationMinutes} min` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                  <PaginationControls pagination={sessionPagination} />
                </>
              ) : (
                <EmptyState
                  message="No session-level data found. Map product analytics events to unlock this panel."
                  actionLabel="Configure engagement source"
                  actionTo="/app/integrations"
                />
              )}
            </SectionCard>

            <SectionCard title="Most Used Features" description="Top product feature usage from tracked events.">
              {engagementFeaturesQuery.isLoading ? (
                <div className="text-sm text-text-secondary">Loading feature usage...</div>
              ) : featureRows.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {featurePagination.items.map((feature, index) => {
                      const baseline = featureRows[0]?.usageCount || 1;
                      const width = Math.max(6, Math.round((feature.usageCount / baseline) * 100));
                      return (
                        <div key={`${feature.name}-${featurePagination.startItem + index}`}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-medium text-text-primary">{feature.name}</span>
                            <span className="text-text-secondary">{feature.usageCount}</span>
                          </div>
                          <div className="h-2 rounded-full bg-surface-secondary">
                            <div className="h-2 rounded-full bg-accent-primary" style={{ width: `${width}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <PaginationControls pagination={featurePagination} />
                </>
              ) : (
                <EmptyState
                  message="No feature usage data recorded for this customer yet."
                  actionLabel="Connect analytics events"
                  actionTo="/app/integrations"
                />
              )}
            </SectionCard>
          </div>
        </div>
      )}

      {activeTab === 'operations' && (
        <div
          role="tabpanel"
          id="customer-panel-operations"
          aria-labelledby="customer-tab-operations"
          className="space-y-4"
        >
          <SectionCard title="Support Pressure" description="Support load and ticket trajectory.">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <StatTile label="Open Tickets" value={overview.openTickets ?? 0} />
              <StatTile label="CSAT" value={overview.customerSatisfactionScore ?? EMPTY_VALUE} />
              <StatTile label="Support Source" value={extractProviders(overview.primarySupportSource).join(', ') || EMPTY_VALUE} />
            </div>

            <div className="mt-4">
              {supportHistoryQuery.isLoading ? (
                <div className="text-sm text-text-secondary">Loading support history...</div>
              ) : supportTrendRows.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px]">
                      <thead className="text-left text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                          <th className="pb-2">Period</th>
                          <th className="pb-2">Open</th>
                          <th className="pb-2">Total</th>
                          <th className="pb-2">CSAT</th>
                          <th className="pb-2">Last Ticket</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-text-primary">
                        {supportTrendPagination.items.map((row) => (
                          <tr key={`${row.period}-${row.totalTickets}`} className="border-t border-border-primary/20">
                            <td className="py-2">{row.period}</td>
                            <td className="py-2">{row.openTickets}</td>
                            <td className="py-2">{row.totalTickets}</td>
                            <td className="py-2">{row.csat == null ? EMPTY_VALUE : row.csat.toFixed(1)}</td>
                            <td className="py-2">{toDateLabel(row.lastTicketDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <PaginationControls pagination={supportTrendPagination} />
                </>
              ) : (
                <EmptyState
                  message="No support trend records found."
                  actionLabel="Connect support integration"
                  actionTo="/app/integrations"
                />
              )}
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <SectionCard title="Current Ticket Queue" description="Most recent support tickets for this customer.">
              {supportTicketsQuery.isLoading ? (
                <div className="text-sm text-text-secondary">Loading support tickets...</div>
              ) : openTicketRows.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {openTicketsPagination.items.map((ticket) => (
                      <div key={ticket.id} className="rounded-xl border border-border-primary/25 bg-surface-secondary/35 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-medium text-text-primary">{ticket.subject}</div>
                          <span className={`rounded-full border px-2 py-0.5 text-xs ${toStatusTone(ticket.status)}`}>
                            {humanizeToken(ticket.status)}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-text-secondary">
                          Severity: {humanizeToken(ticket.severity)} | Opened {toDateLabel(ticket.openedAt, true)}
                          {ticket.lastUpdatedAt ? ` | Updated ${toDateLabel(ticket.lastUpdatedAt, true)}` : ''}
                          {ticket.owner ? ` | ${ticket.owner}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                  <PaginationControls pagination={openTicketsPagination} />
                </>
              ) : (
                <EmptyState message="No support tickets found in this period." />
              )}
            </SectionCard>

            <SectionCard title="Playbook Execution" description="Automated retention workflow history and outcomes.">
              {playbooksQuery.isLoading ? (
                <div className="text-sm text-text-secondary">Loading playbook runs...</div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <StatTile label="Total Runs" value={playbookSummary?.totalRuns ?? 0} />
                    <StatTile label="Success Rate" value={playbookSummary?.successRate == null ? EMPTY_VALUE : `${Math.round((playbookSummary.successRate || 0) * 100)}%`} />
                    <StatTile label="Pending Approvals" value={playbookSummary?.pendingApprovals ?? 0} />
                    <StatTile label="Last Run" value={toDateLabel(playbookSummary?.lastRunAt)} />
                  </div>
                  {playbookRuns.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        {playbookRunsPagination.items.map((run) => (
                          <div key={run.runId ?? `${run.playbookName}-${run.startedAt}`} className="rounded-xl border border-border-primary/25 bg-surface-secondary/35 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-medium text-text-primary">{run.playbookName || 'Playbook run'}</div>
                              <span className={`rounded-full border px-2 py-0.5 text-xs ${toStatusTone(run.status)}`}>
                                {humanizeToken(run.status || 'unknown')}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-text-secondary">
                              {run.outcome ? `${humanizeToken(run.outcome)} | ` : ''}
                              Started {toDateLabel(run.startedAt, true)}
                              {run.completedAt ? ` | Completed ${toDateLabel(run.completedAt, true)}` : ''}
                              {run.confidence != null ? ` | Confidence ${enumLabel(run.confidence, CONFIDENCE_LEVEL_LABELS)}` : ''}
                              {run.potentialValue != null ? ` | Value ${formatCurrency(run.potentialValue, 'USD')}` : ''}
                              {run.reasonShort ? ` | ${run.reasonShort}` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                      <PaginationControls pagination={playbookRunsPagination} />
                    </>
                  ) : (
                    <EmptyState
                      message="No playbook runs were found for this customer."
                      actionLabel="Open playbooks"
                      actionTo="/app/playbooks"
                    />
                  )}
                </div>
              )}
            </SectionCard>
          </div>

          <SectionCard title="Unified Event Timeline" description="Cross-domain operational event stream.">
            {timelineQuery.isLoading ? (
              <div className="text-sm text-text-secondary">Loading timeline...</div>
            ) : timelineEvents.length > 0 ? (
              <>
                <div className="space-y-2">
                  {timelinePagination.items.map((event, index) => (
                    <div key={`${event.occurredAt}-${event.type}-${timelinePagination.startItem + index}`} className="rounded-xl border border-border-primary/25 bg-surface-secondary/30 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium text-text-primary">
                          {event.category}: {event.description}
                        </div>
                        <span className={`rounded-full border px-2 py-0.5 text-xs ${toStatusTone(event.severity)}`}>
                          {humanizeToken(event.severity)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-text-secondary">
                        {toDateLabel(event.occurredAt, true)} | {event.type}
                      </div>
                    </div>
                  ))}
                </div>
                <PaginationControls pagination={timelinePagination} />
              </>
            ) : (
              <EmptyState message="No timeline events were found for the selected window." />
            )}
          </SectionCard>
        </div>
      )}

      {activeTab === 'data-quality' && (
        <div
          role="tabpanel"
          id="customer-panel-data-quality"
          aria-labelledby="customer-tab-data-quality"
          className="space-y-4"
        >
          <SectionCard title="Completeness by Domain" description="Data readiness used for churn analysis eligibility.">
            {overview.completeness ? (
              <div className="space-y-3">
                {[
                  { key: 'Core Profile', score: overview.completeness.coreProfile },
                  { key: 'Payment', score: overview.completeness.paymentData },
                  { key: 'Engagement', score: overview.completeness.engagementData },
                  { key: 'Support', score: overview.completeness.supportData },
                  { key: 'CRM', score: overview.completeness.crmData },
                  { key: 'Marketing', score: overview.completeness.marketingData },
                  { key: 'Historical', score: overview.completeness.historicalData },
                ].map((item) => (
                  <div key={item.key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-text-primary">{item.key}</span>
                      <span className="text-text-secondary">{item.score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-secondary">
                      <div className={`h-2 rounded-full ${scoreBarTone(item.score)}`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
                <div className="pt-2 text-sm text-text-secondary">
                  Overall completeness: {overview.completeness.overall}% | Eligible for churn analysis:{' '}
                  {overview.completeness.isEligibleForChurnAnalysis ? 'Yes' : 'No'}
                </div>
              </div>
            ) : (
              <EmptyState
                message="Completeness scoring is unavailable for this customer."
                actionLabel="Connect data sources"
                actionTo="/app/integrations"
              />
            )}
          </SectionCard>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <SectionCard title="Sync Sources" description="Source freshness and status by provider.">
              {dataSourcesQuery.isLoading ? (
                <div className="text-sm text-text-secondary">Loading source inventory...</div>
              ) : dataSources.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {dataSourcesPagination.items.map((source, index) => (
                      <div key={`${source.source ?? source.name ?? 'source'}-${dataSourcesPagination.startItem + index}`} className="rounded-xl border border-border-primary/25 bg-surface-secondary/30 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-medium text-text-primary">
                            {source.source || source.name || EMPTY_VALUE}
                          </div>
                          <span className={`rounded-full border px-2 py-0.5 text-xs ${toStatusTone(source.syncStatus || source.status)}`}>
                            {humanizeToken(source.syncStatus || source.status || 'unknown')}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-text-secondary">
                          Last sync {toDateLabel(source.lastSync, true)}
                          {source.categories && source.categories.length > 0 ? ` | ${source.categories.join(', ')}` : ''}
                          {source.isPrimary ? ' | Primary' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                  <PaginationControls pagination={dataSourcesPagination} />
                </>
              ) : (
                <EmptyState
                  message="No source sync records found."
                  actionLabel="Set up integrations"
                  actionTo="/app/integrations"
                />
              )}
            </SectionCard>

            <SectionCard title="Anomalies" description="Warnings and critical events from the unified timeline.">
              {timelineQuery.isLoading ? (
                <div className="text-sm text-text-secondary">Loading anomaly feed...</div>
              ) : anomalyEvents.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {anomaliesPagination.items.map((event, index) => {
                      const anomalyKey = `${event.occurredAt}-${event.type}-${anomaliesPagination.startItem + index}`;
                      const details = (event.details ?? {}) as Record<string, unknown>;
                      const provider = typeof details.provider === 'string' ? details.provider : null;
                      const isExpanded = !!expandedAnomalies[anomalyKey];

                      return (
                        <div key={anomalyKey} className="rounded-xl border border-warning/30 bg-warning/10 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="text-sm font-medium text-text-primary">
                              {event.category}: {event.description}
                              <div className="mt-1 text-xs font-normal text-text-secondary">
                                {toDateLabel(event.occurredAt, true)} | {humanizeToken(event.severity)}
                                {provider ? ` | Provider ${provider}` : ''}
                              </div>
                            </div>
                            <button
                              onClick={() => toggleAnomaly(anomalyKey, {
                                category: event.category,
                                severity: event.severity,
                                type: event.type,
                              })}
                              className="rounded-lg border border-border-primary/35 bg-surface-primary/70 px-2 py-1 text-xs text-text-primary hover:border-accent-primary/35"
                            >
                              {isExpanded ? 'Hide details' : 'View details'}
                            </button>
                          </div>
                          {isExpanded && Object.keys(details).length > 0 ? (
                            <div className="mt-2 rounded-lg border border-border-primary/25 bg-surface-primary/70 p-2 text-xs text-text-secondary">
                              {Object.entries(details).slice(0, 8).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium text-text-primary">{humanizeToken(key)}:</span>{' '}
                                  {typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
                                    ? String(value)
                                    : JSON.stringify(value)}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                  <PaginationControls pagination={anomaliesPagination} />
                </>
              ) : (
                <EmptyState message="No warnings or critical anomalies captured in the selected timeline window." />
              )}
            </SectionCard>
          </div>

          <SectionCard title="Missing Data Callouts" description="Domains that need source coverage improvements.">
            {missingCategories.length > 0 ? (
              <>
                <div className="space-y-2">
                  {missingCategoriesPagination.items.map((category, index) => (
                    <div key={`${category}-${missingCategoriesPagination.startItem + index}`} className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-text-primary">
                      <div className="font-medium">{humanizeToken(category)}</div>
                      <div className="mt-1 text-xs text-text-secondary">
                        Connect or resync the {humanizeToken(category)} integration to improve churn-model reliability.
                      </div>
                      <Link
                        to={`/app/integrations?focus=${encodeURIComponent(category.toLowerCase())}`}
                        onClick={() => trackUiEvent('customer_detail_remediation_clicked', 'missing_category_callout', { category })}
                        className="mt-2 inline-flex rounded-lg border border-accent-primary/40 bg-accent-primary/10 px-3 py-1.5 text-xs font-semibold text-accent-primary"
                      >
                        Resolve {humanizeToken(category)} data
                      </Link>
                    </div>
                  ))}
                </div>
                <PaginationControls pagination={missingCategoriesPagination} />
              </>
            ) : (
              <EmptyState message="No missing data categories detected." />
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
};
