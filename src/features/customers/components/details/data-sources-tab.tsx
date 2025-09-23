import React, { useMemo } from 'react';
import { CustomerDetailData } from '@/types/api';
import { formatDateTime, getSyncStatusColor } from '@/utils/customer-helpers';

interface DataSourcesTabProps {
  customer: CustomerDetailData;
  canEditCustomers: boolean;
}

const getSourceIcon = (source: string) => {
  switch (source.toLowerCase()) {
    case 'hubspot':
      return (
        <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-warning" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.164 7.931V4.5a1.5 1.5 0 00-3 0v3.431a6.001 6.001 0 104.5 10.069V19.5a1.5 1.5 0 003 0v-1.5a9 9 0 11-4.5-10.069z" />
          </svg>
        </div>
      );
    case 'salesforce':
      return (
        <div className="w-9 h-9 rounded-xl bg-accent-primary/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-accent-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 14.831c-.244.977-.908 1.747-1.847 2.137-.469.195-.978.293-1.508.293H8.847c-.53 0-1.04-.098-1.508-.293-.939-.39-1.603-1.16-1.847-2.137-.122-.488-.061-.996.171-1.426.232-.43.624-.765 1.097-.938.236-.087.487-.131.743-.131h.293c.244 0 .487.044.721.131.473.173.865.508 1.097.938.232.43.293.938.171 1.426z" />
          </svg>
        </div>
      );
    case 'stripe':
      return (
        <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-accent-secondary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
          </svg>
        </div>
      );
    case 'zapier':
      return (
        <div className="w-9 h-9 rounded-xl bg-orange-600/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-warning" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L8.745 8.255H0l7.076 5.132L4.382 21.6 12 16.51l7.618 5.09-2.694-8.213L24 8.255h-8.745z" />
          </svg>
        </div>
      );
    case 'manual':
    case 'import':
      return (
        <div className="w-9 h-9 rounded-xl bg-slate-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-9 h-9 rounded-xl bg-accent-primary/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        </div>
      );
  }
};

const getCategoryLabel = (category: string) => {
  switch (category.toLowerCase()) {
    case 'crm':
      return 'CRM';
    case 'payment':
      return 'Billing & Payments';
    case 'marketing':
      return 'Marketing';
    case 'support':
      return 'Support';
    case 'engagement':
      return 'Engagement';
    default:
      return category.toUpperCase();
  }
};

export const CustomerDataSourcesTab: React.FC<DataSourcesTabProps> = ({ customer }) => {
  const dataSources = customer.dataSources;
  const sources = dataSources?.sources ?? [];
  const categories = useMemo(() => {
    if (dataSources?.categories && dataSources.categories.length > 0) {
      return dataSources.categories;
    }
    return Array.from(new Set(sources.map((source) => source.category ?? 'unknown')));
  }, [dataSources?.categories, sources]);

  const groupedSources = useMemo(() => {
    return categories.reduce<Record<string, typeof sources>>((acc, category) => {
      acc[category] = sources.filter((source) => (source.category ?? 'unknown').toLowerCase() === category.toLowerCase());
      return acc;
    }, {});
  }, [categories, sources]);

  const summaryCards = [
    {
      id: 'total-sources',
      label: 'Total Data Sources',
      value: dataSources?.totalSources ?? sources.length,
    },
    {
      id: 'active-sources',
      label: 'Active Sources',
      value: dataSources?.activeSources ?? sources.length,
    },
    {
      id: 'primary-source',
      label: 'Primary CRM Source',
      value: customer.primaryCrmSource ?? customer.primaryPaymentSource ?? 'N/A',
    },
    {
      id: 'last-sync',
      label: 'Last Overall Sync',
      value: dataSources?.lastOverallSync ? formatDateTime(dataSources.lastOverallSync) : customer.lastSyncedAt ? formatDateTime(customer.lastSyncedAt) : 'N/A',
    },
  ];

  const recommendedActions = [
    ...(customer.qualityMetrics?.recommendedActions ?? []),
    ...(customer.dataQuality?.recommendedActions ?? []),
    ...(customer.completeness?.recommendedActions ?? []),
  ];

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {summaryCards.map((card) => (
          <div key={card.id} className="p-4 sm:p-6 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">{card.label}</span>
            <div className="text-2xl sm:text-3xl font-bold text-text-primary mt-3">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface-primary/90 backdrop-blur-xl border border-border-primary/30 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8">
        <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-6 sm:mb-8">Source Inventory</h3>
        {categories.length === 0 ? (
          <div className="p-4 sm:p-6 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl text-text-muted">
            No connected data sources yet. Connect CRM, billing, marketing, engagement, and support systems to unlock analytics.
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {categories.map((category) => {
              const categorySources = groupedSources[category] ?? [];
              const totalRecords = categorySources.reduce((total, source) => total + (source.recordCount ?? 0), 0);
              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-text-primary">{getCategoryLabel(category)}</h4>
                      <p className="text-sm text-text-muted">{categorySources.length} connected {categorySources.length === 1 ? 'source' : 'sources'}</p>
                    </div>
                    <div className="text-sm text-text-secondary">{totalRecords.toLocaleString()} records synced</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categorySources.map((source) => (
                      <div key={`${category}-${source.id}`} className="p-4 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl flex items-start gap-4">
                        {getSourceIcon(source.type ?? source.name ?? 'unknown')}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-text-primary">{source.name ?? source.type ?? 'Unnamed Source'}</span>
                            {source.syncStatus && (
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getSyncStatusColor(source.syncStatus)}`}>
                                {source.syncStatus}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-text-secondary space-y-1">
                            <div>ID: {source.id}</div>
                            {source.lastSync && <div>Last sync: {formatDateTime(source.lastSync)}</div>}
                            <div>Records: {source.recordCount != null ? source.recordCount.toLocaleString() : 'N/A'}</div>
                            {source.isPrimary && <div className="text-accent-primary font-semibold">Primary source</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-surface-primary/90 backdrop-blur-xl border border-border-primary/30 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">Data Quality Snapshot</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Completeness</span>
              <div className="text-2xl font-bold text-text-primary mt-2">{customer.qualityMetrics?.completenessScore != null ? `${customer.qualityMetrics.completenessScore}%` : customer.quickMetrics?.dataCompletenessScore != null ? `${Math.round(customer.quickMetrics.dataCompletenessScore)}%` : 'N/A'}</div>
            </div>
            <div className="p-4 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Freshness</span>
              <div className="text-2xl font-bold text-text-primary mt-2">{customer.qualityMetrics?.dataFreshness ?? customer.dataSources?.quality?.dataFreshnessDisplay ?? 'N/A'}</div>
            </div>
            <div className="p-4 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Multiple Sources</span>
              <div className="text-2xl font-bold text-text-primary mt-2">{customer.quickMetrics?.hasMultipleSources ? 'Yes' : 'No'}</div>
            </div>
            <div className="p-4 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Data Sources Connected</span>
              <div className="text-2xl font-bold text-text-primary mt-2">{customer.quickMetrics?.totalDataSources ?? sources.length}</div>
            </div>
          </div>
        </div>

        <div className="bg-surface-primary/90 backdrop-blur-xl border border-border-primary/30 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">Recommended Actions</h3>
          {recommendedActions.length === 0 ? (
            <div className="p-6 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl text-text-muted text-sm">
              Data quality actions will appear here once the system identifies gaps or opportunities for improvement.
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedActions.map((action, index) => (
                <div key={`${action}-${index}`} className="flex items-start gap-3 p-4 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl">
                  <div className="mt-1 w-2 h-2 bg-warning rounded-full"></div>
                  <div className="text-sm text-text-secondary">{action}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
