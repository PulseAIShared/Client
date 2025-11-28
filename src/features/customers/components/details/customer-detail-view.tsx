import React, { lazy, Suspense, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { CompanyAuthorization, useAuthorization } from '@/lib/authorization';
import { useCustomerProfile } from './customer-profile-context';
import { useCustomerAiInsightsStore } from '@/features/customers/state/customer-ai-insights-store';
import { formatDate } from '@/utils/customer-helpers';

type CustomerProfileTab =
  | 'overview'
  | 'account'
  | 'engagement'
  | 'support'
  | 'marketing'
  | 'ai-insights'
  | 'data-health';

const OverviewTab = lazy(() => import('./overview-tab').then((module) => ({ default: module.CustomerOverviewTab })));
const AccountBillingTab = lazy(() => import('./account-billing-tab').then((module) => ({ default: module.CustomerAccountBillingTab })));
const EngagementTab = lazy(() => import('./engagement-tab').then((module) => ({ default: module.CustomerEngagementTab })));
const SupportTab = lazy(() => import('./support-tab').then((module) => ({ default: module.CustomerSupportTab })));
const MarketingTab = lazy(() => import('./marketing-tab').then((module) => ({ default: module.CustomerMarketingTab })));
const AiInsightsTab = lazy(() => import('./ai-insights-tab').then((module) => ({ default: module.CustomerAiInsightsTab })));
const DataHealthTab = lazy(() => import('./data-health-tab').then((module) => ({ default: module.CustomerDataHealthTab })));
const SourcesLogsTab = lazy(() => import('./sources-logs-tab').then((module) => ({ default: module.CustomerSourcesLogsTab })));

const TabFallback = () => (
  <div className="flex items-center justify-center py-20">
    <Spinner size="lg" />
  </div>
);

const tabConfig: Array<{
  id: CustomerProfileTab;
  label: string;
  icon: React.ReactNode;
  lastUpdatedKey: keyof ReturnType<typeof useCustomerProfile>['lastUpdated'];
}> = [
  {
    id: 'overview',
    label: 'Overview',
    lastUpdatedKey: 'overview',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'account',
    label: 'Account & Billing',
    lastUpdatedKey: 'payment',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12l7 7m-7-7l7-7" />
      </svg>
    ),
  },
  {
    id: 'engagement',
    label: 'Engagement',
    lastUpdatedKey: 'engagement',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 15l4-4 4 4 4-6" />
      </svg>
    ),
  },
  {
    id: 'support',
    label: 'Support',
    lastUpdatedKey: 'support',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8a6 6 0 10-12 0v5H5a2 2 0 00-2 2v3h18v-3a2 2 0 00-2-2h-1V8z" />
      </svg>
    ),
  },
  {
    id: 'marketing',
    label: 'Marketing',
    lastUpdatedKey: 'overview',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v6H4zM4 14h16v6H4z" />
      </svg>
    ),
  },
  {
    id: 'ai-insights',
    label: 'AI Insights',
    lastUpdatedKey: 'churn',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
      </svg>
    ),
  },
  {
    id: 'data-health',
    label: 'Data & Sources',
    lastUpdatedKey: 'dataSources',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a10 10 0 11-20 0 10 10 0 0120 0z" />
      </svg>
    ),
  },
];

const aiStatusTone: Record<string, string> = {
  fresh: 'bg-success/10 text-success border-success/40',
  stale: 'bg-warning/15 text-warning border-warning/40 animate-pulse',
  refreshing: 'bg-accent-primary/10 text-accent-primary border-accent-primary/40',
  idle: 'bg-border-primary/20 text-text-secondary border-border-primary/40',
};

export const CustomerDetailView: React.FC = () => {
  const navigate = useNavigate();
  const { checkCompanyPolicy } = useAuthorization();
  const [activeTab, setActiveTab] = useState<CustomerProfileTab>('overview');

  const { header, rawCustomer, isLoading, refetch, customerId, error, loadingStates, requestSection, lastUpdated } = useCustomerProfile();
  const aiStatus = useCustomerAiInsightsStore((state) => state.status);

  const canEditCustomers = checkCompanyPolicy('customers:write');

  const initials = useMemo(() => {
    if (!header.customerName) return '??';
    return (
      header.customerName
        .split(/\s+/)
        .filter(Boolean)
        .map((name) => name[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 2) || '??'
    );
  }, [header.customerName]);

  const statusPills = useMemo(() => {
    const pills: Array<{ label: string; tone: string }> = [];
    if (header.planName) pills.push({ label: header.planName, tone: 'bg-accent-primary/10 text-accent-primary border-accent-primary/40' });
    if (header.subscriptionStatus) pills.push({ label: header.subscriptionStatus, tone: 'bg-surface-secondary/60 text-text-primary border-border-primary/40' });
    if (header.paymentStatus) pills.push({ label: `Billing: ${header.paymentStatus}`, tone: 'bg-success/10 text-success border-success/30' });
    return pills;
  }, [header.paymentStatus, header.planName, header.subscriptionStatus]);

  const lastSynced = rawCustomer?.lastSyncedAt ? formatDate(rawCustomer.lastSyncedAt) : null;
  const locationLabel = rawCustomer?.location ?? header.location ?? rawCustomer?.country ?? null;
  const timeZoneLabel = rawCustomer?.timeZone;
  const sourceBadges = useMemo(() => {
    const sources = new Set<string>();
    rawCustomer?.dataSources?.categories?.forEach((cat) => sources.add(cat));
    [
      rawCustomer?.primaryPaymentSource,
      rawCustomer?.primaryCrmSource,
      rawCustomer?.primaryMarketingSource,
      rawCustomer?.primarySupportSource,
      rawCustomer?.primaryEngagementSource,
    ]
      .filter(Boolean)
      .forEach((src) => sources.add(src as string));
    return Array.from(sources).slice(0, 5);
  }, [rawCustomer]);

  const activeTabLoading = useMemo(() => {
    switch (activeTab) {
      case 'account':
        return loadingStates.payment;
      case 'engagement':
        return loadingStates.engagement;
      case 'support':
        return loadingStates.support;
      case 'data-health':
        return loadingStates.dataSources;
      default:
        return loadingStates.overview || false;
    }
  }, [activeTab, loadingStates]);

  const activeTabLabel = useMemo(() => tabConfig.find((tab) => tab.id === activeTab)?.label ?? 'Overview', [activeTab]);
  const activeLastUpdatedIso = useMemo(() => {
    const key = tabConfig.find((tab) => tab.id === activeTab)?.lastUpdatedKey;
    return key ? lastUpdated[key] : undefined;
  }, [activeTab, lastUpdated]);
  const activeLastUpdated = activeLastUpdatedIso ? formatDate(activeLastUpdatedIso) : null;

  React.useEffect(() => {
    switch (activeTab) {
      case 'account':
        requestSection('payment');
        break;
      case 'engagement':
        requestSection('engagement');
        break;
      case 'support':
        requestSection('support');
        break;
      case 'ai-insights':
        requestSection('churn');
        break;
      case 'data-health':
        requestSection('dataSources');
        break;
      default:
        break;
    }
  }, [activeTab, requestSection]);

  if (error) {
    return (
      <div className="bg-surface-primary/90 border border-border-primary/30 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4">
        <h2 className="text-2xl font-bold text-text-primary">Unable to load customer</h2>
        <p className="text-sm text-text-secondary">
          We couldn&apos;t retrieve this profile. It may have been removed or you may not have access.
        </p>
        <div className="flex justify-center gap-3">
          <button
            className="px-4 py-2 rounded-lg border border-border-primary/40 text-text-primary hover:border-accent-primary/50 transition"
            onClick={() => navigate('/app/customers')}
          >
            Back to Customers
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && !rawCustomer) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-12">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/25 via-accent-secondary/20 to-surface-secondary/30 rounded-3xl blur-3xl"></div>
        <div className="relative bg-surface-primary/95 backdrop-blur-xl border border-border-primary/40 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8 lg:p-10 space-y-6">
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary text-white flex items-center justify-center text-2xl font-bold shadow-xl">
                    {initials}
                  </div>
                  {header.statusBadge && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-surface-primary/90 border border-border-primary/40 shadow-md">
                      {header.statusBadge}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary tracking-tight">{header.customerName}</h1>
                    <span className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full border ${aiStatusTone[aiStatus] ?? aiStatusTone.idle}`}>
                      {aiStatus === 'stale' && 'AI insights stale'}
                      {aiStatus === 'refreshing' && 'Refreshing AI insights'}
                      {aiStatus === 'fresh' && 'AI insights up to date'}
                      {aiStatus === 'idle' && 'AI insights ready'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-text-secondary">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
                      </svg>
                      {header.customerEmail}
                    </span>
                    {header.companyName && (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s7-5.373 7-12.5S16.418 2 12 2 5 6.373 5 9.5 12 22 12 22z" />
                        </svg>
                        {rawCustomer?.jobTitle ? `${rawCustomer.jobTitle} · ` : ''}
                        {header.companyName}
                      </span>
                    )}
                    {locationLabel && (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s7-5.373 7-12.5S16.418 2 12 2 5 6.373 5 9.5 12 22 12 22z" />
                        </svg>
                        {locationLabel}
                        {timeZoneLabel ? ` · ${timeZoneLabel}` : ''}
                      </span>
                    )}
                    {lastSynced && <span className="text-xs text-text-secondary/70">Last synced {lastSynced}</span>}
                  </div>
                </div>
              </div>

              {statusPills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {statusPills.map((pill, index) => (
                    <span
                      key={`${pill.label}-${index}`}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${pill.tone}`}
                    >
                      {pill.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {sourceBadges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sourceBadges.map((source) => (
                  <span
                    key={source}
                    className="px-3 py-1 rounded-full text-xs font-semibold border border-border-primary/40 bg-surface-secondary/60 text-text-primary"
                  >
                    {source}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface-primary/90 backdrop-blur-xl border border-border-primary/40 rounded-3xl shadow-xl overflow-hidden">
        <div className="flex flex-nowrap overflow-x-auto border-b border-border-primary/30">
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-5 sm:px-6 py-4 text-sm font-semibold transition-all border-b-2 min-w-[140px] ${
                activeTab === tab.id
                  ? 'text-accent-primary border-accent-primary bg-accent-primary/10'
                  : 'text-text-secondary border-transparent hover:bg-surface-secondary/40 hover:text-text-primary'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6 sm:p-8 space-y-3">
          {(activeTabLoading || activeLastUpdated) && (
            <div className="flex items-center gap-3 text-sm text-text-secondary sticky top-0">
              {activeTabLoading && (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Loading latest {activeTabLabel.toLowerCase()} data...
                </span>
              )}
              {activeLastUpdated && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold border border-border-primary/40 bg-surface-secondary/60">
                  Refreshed {activeLastUpdated}
                </span>
              )}
            </div>
          )}
          <Suspense fallback={<TabFallback />}>
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'account' && <AccountBillingTab />}
            {activeTab === 'engagement' && <EngagementTab />}
            {activeTab === 'support' && <SupportTab />}
            {activeTab === 'marketing' && <MarketingTab />}
            {activeTab === 'ai-insights' && <AiInsightsTab />}
            {activeTab === 'data-health' && (
              <div className="space-y-10">
                <DataHealthTab />
                <SourcesLogsTab />
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
};
