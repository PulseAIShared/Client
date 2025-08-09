// src/features/customers/components/details/data-sources-tab.tsx
import React from 'react';
import { CustomerDetailData } from '@/types/api';
import { formatDateTime, getSyncStatusColor } from '@/utils/customer-helpers';

interface DataSourcesTabProps {
  customer: CustomerDetailData;
  canEditCustomers: boolean;
}

// Helper function to get source icon
export const getSourceIcon = (source: string, isPrimary = false) => {
  const baseClasses = isPrimary ? "w-6 h-6" : "w-5 h-5";
  
  switch (source.toLowerCase()) {
    case 'hubspot':
      return (
        <div className={`${isPrimary ? 'bg-orange-500/20' : 'bg-orange-500/20'} rounded-xl p-2 flex items-center justify-center`}>
          <svg className={`${baseClasses} text-warning`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.164 7.931V4.5a1.5 1.5 0 00-3 0v3.431a6.001 6.001 0 104.5 10.069V19.5a1.5 1.5 0 003 0v-1.5a9 9 0 11-4.5-10.069z"/>
          </svg>
        </div>
      );
    case 'salesforce':
      return (
        <div className={`${isPrimary ? 'bg-accent-primary/20' : 'bg-accent-primary/20'} rounded-xl p-2 flex items-center justify-center`}>
          <svg className={`${baseClasses} text-accent-primary`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 14.831c-.244.977-.908 1.747-1.847 2.137-.469.195-.978.293-1.508.293H8.847c-.53 0-1.04-.098-1.508-.293-.939-.39-1.603-1.16-1.847-2.137-.122-.488-.061-.996.171-1.426.232-.43.624-.765 1.097-.938.236-.087.487-.131.743-.131h.293c.244 0 .487.044.721.131.473.173.865.508 1.097.938.232.43.293.938.171 1.426z"/>
          </svg>
        </div>
      );
    case 'pipedrive':
      return (
        <div className={`${isPrimary ? 'bg-success/20' : 'bg-success/20'} rounded-xl p-2 flex items-center justify-center`}>
          <svg className={`${baseClasses} text-success`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/>
          </svg>
        </div>
      );
    case 'stripe':
      return (
        <div className={`${isPrimary ? 'bg-purple-500/20' : 'bg-purple-500/20'} rounded-xl p-2 flex items-center justify-center`}>
          <svg className={`${baseClasses} text-accent-secondary`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
          </svg>
        </div>
      );
    case 'manual':
    case 'import':
      return (
        <div className={`${isPrimary ? 'bg-slate-500/20' : 'bg-slate-500/20'} rounded-xl p-2 flex items-center justify-center`}>
          <svg className={`${baseClasses} text-text-muted`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
      );
    case 'zapier':
      return (
        <div className={`${isPrimary ? 'bg-orange-600/20' : 'bg-orange-600/20'} rounded-xl p-2 flex items-center justify-center`}>
          <svg className={`${baseClasses} text-warning`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L8.745 8.255H0l7.076 5.132L4.382 21.6 12 16.51l7.618 5.09-2.694-8.213L24 8.255h-8.745z"/>
          </svg>
        </div>
      );
    default:
      return (
        <div className={`${isPrimary ? 'bg-accent-primary/20' : 'bg-accent-primary/20'} rounded-xl p-2 flex items-center justify-center`}>
          <svg className={`${baseClasses} text-accent-primary`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        </div>
      );
  }
};


const getDataCategoryInfo = (category: string) => {
  switch (category.toLowerCase()) {
    case 'crm':
      return {
        name: 'CRM Data',
        description: 'Customer relationship and sales data',
        icon: (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        color: 'blue'
      };
    case 'payment':
      return {
        name: 'Payment Data',
        description: 'Billing and subscription information',
        icon: (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        ),
        color: 'green'
      };
      case 'marketing':
        return {
          name: 'Marketing Data',
          description: 'Campaign and engagement metrics',
          icon: (
            <svg className="w-5 h-5 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          ),
          color: 'purple'
        };
    case 'activity':
      return {
        name: 'Activity Data',
        description: 'User engagement and behavior data',
        icon: (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        color: 'purple'
      };
      case 'support':
        return {
          name: 'Support Data',
          description: 'Help desk and ticket information',
          icon: (
            <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
            </svg>
          ),
          color: 'orange'
        };
      case 'engagement':
        return {
          name: 'Engagement Data',
          description: 'User activity and feature usage',
          icon: (
            <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          color: 'cyan'
        };
    default:
      return {
        name: 'Other Data',
        description: 'Additional customer information',
        icon: (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        ),
        color: 'gray'
      };
  }
};

export const CustomerDataSourcesTab: React.FC<DataSourcesTabProps> = ({ customer, canEditCustomers }) => {
  const dataSourcesRaw = (customer.dataSources?.sources ?? []) as Array<any>;
  const manualSources = dataSourcesRaw.filter((s) => (s.type || '').toLowerCase() === 'manual' || (s.name || '').toLowerCase() === 'manual');
  const nonManualSources = dataSourcesRaw.filter((s) => !manualSources.includes(s));

  const aggregateManual = (sources: Array<any>) => {
    if (sources.length === 0) return null;
    const lastSync = sources
      .map((s) => (s.lastSync ? new Date(s.lastSync).getTime() : 0))
      .reduce((max, t) => Math.max(max, t), 0);
    const recordCount = sources.reduce((sum, s) => sum + (s.recordCount ?? 0), 0);
    const isPrimary = sources.some((s) => !!s.isPrimary);
    const worstStatus = (() => {
      const statuses = sources.map((s) => (s.syncStatus || '').toLowerCase());
      if (statuses.includes('error')) return 'error';
      if (statuses.includes('warning')) return 'warning';
      if (statuses.includes('success')) return 'success';
      return 'unknown';
    })();
    return {
      id: 'manual_aggregated',
      name: 'Manual',
      type: 'manual',
      category: 'manual',
      lastSync: lastSync ? new Date(lastSync).toISOString() : undefined,
      syncStatus: worstStatus,
      recordCount,
      isPrimary,
    };
  };

  // Build list for display: aggregate Manual into one card with its categories
  const aggregatedManual = aggregateManual(manualSources);
  const dataSourcesRawUniqueNamesCount = new Set(dataSourcesRaw.map(s => (s.name || s.type || 'unknown').toLowerCase())).size;
  const manualCategorySet = new Set(manualSources.map(s => (s.category || '').toLowerCase()));
  const dataSources = aggregatedManual
    ? [{ ...aggregatedManual, categories: Array.from(manualCategorySet) }, ...nonManualSources]
    : nonManualSources;

  const recommendedActions = customer.dataQuality?.recommendedActions ?? [];

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      {/* Enhanced Data Sources Overview */}
      <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-6 sm:mb-8">Data Sources Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="group relative bg-surface-secondary/30 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Total Sources</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-accent-primary">{customer.dataSources?.overview?.totalSources ?? dataSourcesRawUniqueNamesCount}</div>
              <div className="text-sm text-text-muted">connected sources</div>
            </div>
          </div>

          <div className="group relative bg-surface-secondary/30 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-success/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Total Records</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-success">{(customer.dataSources?.overview?.totalRecords ?? dataSources.reduce((sum, ds) => sum + (ds.recordCount ?? 0), 0)).toLocaleString()}</div>
              <div className="text-sm text-text-muted">data points</div>
            </div>
          </div>

          <div className="group relative bg-surface-secondary/30 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-warning/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Last Sync</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-warning">{customer.dataSources?.quality?.dataFreshnessDisplay ?? '—'}</div>
              <div className="text-sm text-text-muted">data freshness</div>
            </div>
          </div>
        </div>

        {/* Enhanced Data Sources List */}
        <div className="space-y-4 sm:space-y-6">
          {dataSources.length === 0 ? (
            <div className="p-4 sm:p-6 bg-surface-secondary/30 rounded-2xl border border-border-primary/30 text-text-muted">
              No data sources connected yet. See Recommended Data Actions below to get started.
            </div>
          ) : (
          dataSources.map((source: any) => {
            const isAggregatedManual = source.id === 'manual_aggregated';
            const categoryInfo = !isAggregatedManual ? getDataCategoryInfo(source.category) : null;
            return (
              <div key={source.id} className="group relative bg-surface-secondary/30 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 sm:gap-6">
                    {getSourceIcon(source.type, source.isPrimary)}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg sm:text-xl font-semibold text-text-primary">{source.name}</h4>
                        {source.isPrimary && (
                          <span className="px-2 py-1 bg-accent-primary/20 text-accent-primary rounded-full text-xs font-semibold border border-accent-primary/30">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-text-muted flex-wrap">
                        {!isAggregatedManual ? (
                          <span className="flex items-center gap-1">
                            {categoryInfo!.icon}
                            {categoryInfo!.name}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            {source.categories.map((cat: string) => {
                              const info = getDataCategoryInfo(cat);
                              return (
                                <span key={cat} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-primary/60 border border-border-primary/30">
                                  {info.icon}
                                  {info.name}
                                </span>
                              );
                            })}
                          </span>
                        )}
                        <span>•</span>
                        <span>{(source.recordCount ?? 0).toLocaleString()} records</span>
                        <span>•</span>
                        <span>Last sync: {source.lastSync ? formatDateTime(source.lastSync) : '—'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSyncStatusColor((source.syncStatus || 'unknown').toString())}`}>
                      {source.syncStatus === 'success' ? 'Synced' : source.syncStatus === 'warning' ? 'Warning' : source.syncStatus === 'error' ? 'Error' : 'Unknown'}
                    </span>
                    <button className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-primary/50 rounded-xl transition-all duration-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          }))}
        </div>
      </div>

      {/* Enhanced Data Quality Insights */}
      <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-success to-success-muted mb-6 sm:mb-8">Data Quality Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between p-4 sm:p-6 bg-surface-secondary/30 rounded-2xl hover:bg-surface-secondary/50 transition-all duration-300">
              <span className="text-text-secondary font-medium">Completeness Score</span>
              <span className="text-2xl sm:text-3xl font-bold text-success">{customer.quickMetrics?.dataCompletenessScore != null ? `${Math.round(customer.quickMetrics.dataCompletenessScore)}%` : '—'}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 sm:p-6 bg-surface-secondary/30 rounded-2xl hover:bg-surface-secondary/50 transition-all duration-300">
              <span className="text-text-secondary font-medium">Data Freshness</span>
              <span className="text-2xl sm:text-3xl font-bold text-accent-primary">{customer.dataSources?.quality?.dataFreshnessDisplay ?? '—'}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 sm:p-6 bg-surface-secondary/30 rounded-2xl hover:bg-surface-secondary/50 transition-all duration-300">
              <span className="text-text-secondary font-medium">Accuracy Score</span>
              <span className="text-2xl sm:text-3xl font-bold text-accent-secondary">{customer.dataSources?.quality?.accuracyScorePercent != null ? `${customer.dataSources.quality.accuracyScorePercent}%` : '—'}</span>
            </div>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <h4 className="text-lg font-semibold text-text-primary mb-4">Data Categories</h4>
            {(customer.dataSources?.categories ?? ['crm', 'payment', 'activity']).map((category) => {
              const categoryInfo = getDataCategoryInfo(category);
              return (
                <div key={category} className="flex items-center gap-3 p-4 sm:p-6 bg-surface-secondary/30 rounded-2xl hover:bg-surface-secondary/50 transition-all duration-300">
                  {categoryInfo.icon}
                  <div className="flex-1">
                    <div className="font-semibold text-text-primary">{categoryInfo.name}</div>
                    <div className="text-sm text-text-muted">{categoryInfo.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-text-primary">
                      {dataSourcesRaw.filter(ds => (ds.category || '').toLowerCase() === (category || '').toLowerCase()).reduce((sum, ds) => sum + (ds.recordCount ?? 0), 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-text-muted">records</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommended Data Actions */}
      {recommendedActions.length > 0 && (
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
          <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-warning to-error mb-6 sm:mb-8">Recommended Data Actions</h3>
          <div className="space-y-3 sm:space-y-4">
            {recommendedActions.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-4 sm:p-6 bg-warning/10 rounded-2xl border border-warning/30 hover:bg-warning/20 transition-all duration-300">
                <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-warning-muted text-sm sm:text-base">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};