// src/features/customers/components/details/data-sources-tab.tsx
import React from 'react';
import { CustomerDetailData } from '@/types/api';
import { formatDateTime, getSyncStatusColor } from '@/utils/customer-helpers';

interface DataSourcesTabProps {
  customer: CustomerDetailData;
}

// Helper function to get source icon
export const getSourceIcon = (source: string, isPrimary = false) => {
  const baseClasses = isPrimary ? "w-6 h-6" : "w-5 h-5";
  
  switch (source.toLowerCase()) {
    case 'hubspot':
      return (
        <div className={`${isPrimary ? 'bg-orange-500/20' : 'bg-orange-500/20'} rounded-lg p-2 flex items-center justify-center`}>
          <svg className={`${baseClasses} text-orange-400`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.164 7.931V4.5a1.5 1.5 0 00-3 0v3.431a6.001 6.001 0 104.5 10.069V19.5a1.5 1.5 0 003 0v-1.5a9 9 0 11-4.5-10.069z"/>
          </svg>
        </div>
      );
    case 'salesforce':
      return (
        <div className={`${isPrimary ? 'bg-blue-500/20' : 'bg-blue-500/20'} rounded-lg p-2 flex items-center justify-center`}>
          <svg className={`${baseClasses} text-blue-400`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 14.831c-.244.977-.908 1.747-1.847 2.137-.469.195-.978.293-1.508.293H8.847c-.53 0-1.04-.098-1.508-.293-.939-.39-1.603-1.16-1.847-2.137-.122-.488-.061-.996.171-1.426.232-.43.624-.765 1.097-.938.236-.087.487-.131.743-.131h.293c.244 0 .487.044.721.131.473.173.865.508 1.097.938.232.43.293.938.171 1.426z"/>
          </svg>
        </div>
      );
    case 'pipedrive':
      return (
        <div className={`${isPrimary ? 'bg-green-500/20' : 'bg-green-500/20'} rounded-lg p-2 flex items-center justify-center`}>
          <svg className={`${baseClasses} text-green-400`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/>
          </svg>
        </div>
      );
    case 'stripe':
      return (
        <div className={`${isPrimary ? 'bg-purple-500/20' : 'bg-purple-500/20'} rounded-lg p-2 flex items-center justify-center`}>
          <svg className={`${baseClasses} text-purple-400`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
          </svg>
        </div>
      );
    case 'manual':
    case 'import':
      return (
        <div className={`${isPrimary ? 'bg-slate-500/20' : 'bg-slate-500/20'} rounded-lg p-2 flex items-center justify-center`}>
          <svg className={`${baseClasses} text-slate-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
      );
    case 'zapier':
      return (
        <div className={`${isPrimary ? 'bg-orange-600/20' : 'bg-orange-600/20'} rounded-lg p-2 flex items-center justify-center`}>
          <svg className={`${baseClasses} text-orange-500`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L8.745 8.255H0l7.076 5.132L4.382 21.6 12 16.51l7.618 5.09-2.694-8.213L24 8.255h-8.745z"/>
          </svg>
        </div>
      );
    default:
      return (
        <div className={`${isPrimary ? 'bg-blue-500/20' : 'bg-blue-500/20'} rounded-lg p-2 flex items-center justify-center`}>
          <svg className={`${baseClasses} text-blue-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        </div>
      );
  }
};

// Helper function to get data category display info
const getDataCategoryInfo = (category: string) => {
  switch (category.toLowerCase()) {
    case 'crm':
      return {
        name: 'CRM Data',
        description: 'Customer relationship and sales data',
        icon: (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        color: 'blue'
      };
    case 'payment':
      return {
        name: 'Payment Data',
        description: 'Billing and subscription information',
        icon: (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        ),
        color: 'purple'
      };
    case 'support':
      return {
        name: 'Support Data',
        description: 'Help desk and ticket information',
        icon: (
          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        color: 'cyan'
      };
    default:
      return {
        name: 'Data',
        description: 'Customer information',
        icon: (
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        ),
        color: 'slate'
      };
  }
};



export const CustomerDataSourcesTab: React.FC<DataSourcesTabProps> = ({ customer }) => {
  const { dataSourceDetails, dataQuality, sourceSummary } = customer;

  // Combine all data sources for overview
  const allDataSources = [
    ...dataSourceDetails.crmSources.map(source => ({ ...source, category: 'crm' })),
    ...dataSourceDetails.paymentSources.map(source => ({ ...source, category: 'payment' })),
    ...dataSourceDetails.marketingSources.map(source => ({ ...source, category: 'marketing' })),
    ...dataSourceDetails.supportSources.map(source => ({ ...source, category: 'support' })),
    ...dataSourceDetails.engagementSources.map(source => ({ ...source, category: 'engagement' })),
  ];

  // Data completeness recommendations
  const getRecommendations = () => {
    const recommendations = [];

    if (!sourceSummary.hasCrmData) {
      recommendations.push({
        type: 'CRM Integration',
        description: 'Connect Salesforce, HubSpot, or Pipedrive to enrich customer profiles',
        priority: 'High',
        benefit: '+25% data completeness',
        actions: ['Connect CRM', 'Sync contact data', 'Import opportunity history']
      });
    }

    if (!sourceSummary.hasMarketingData) {
      recommendations.push({
        type: 'Marketing Data',
        description: 'Integrate marketing automation platforms for campaign insights',
        priority: 'Medium',
        benefit: '+15% data completeness',
        actions: ['Connect Mailchimp/Marketo', 'Sync campaign data', 'Track email engagement']
      });
    }

    if (!sourceSummary.hasSupportData) {
      recommendations.push({
        type: 'Support Integration',
        description: 'Connect help desk for complete customer journey view',
        priority: 'Medium',
        benefit: '+20% data completeness',
        actions: ['Connect Zendesk/Intercom', 'Import ticket history', 'Track satisfaction scores']
      });
    }

    if (dataQuality.missingCriticalData.length > 0) {
      recommendations.push({
        type: 'Data Enrichment',
        description: 'Fill missing critical fields to improve predictions',
        priority: 'High',
        benefit: '+30% prediction accuracy',
        actions: dataQuality.missingCriticalData.map(field => `Update ${field}`)
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="space-y-8">
      {/* Data Quality Overview */}
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Data Quality Overview
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{Math.round(dataQuality.completenessScore)}%</div>
            <div className="text-sm text-slate-400">Completeness</div>
            <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${dataQuality.completenessScore}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{dataSourceDetails.totalActiveSources}</div>
            <div className="text-sm text-slate-400">Active Sources</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">{dataSourceDetails.uniqueSourceNames.length}</div>
            <div className="text-sm text-slate-400">Unique Platforms</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              dataQuality.overallQuality >= 80 ? 'text-green-400' :
              dataQuality.overallQuality >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {customer.quickMetrics.overallHealthScore}
            </div>
            <div className="text-sm text-slate-400">Health Score</div>
          </div>
        </div>

        {dataQuality.missingCriticalData.length > 0 && (
          <div className="p-4 bg-yellow-600/20 rounded-lg border border-yellow-500/30">
            <h4 className="text-yellow-400 font-medium mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Missing Critical Data
            </h4>
            <div className="flex flex-wrap gap-2">
              {dataQuality.missingCriticalData.map((field, index) => (
                <span key={index} className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-sm border border-yellow-500/30">
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Data Sources by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {['crm', 'payment', 'marketing', 'support', 'engagement'].map((category) => {
          const categoryInfo = getDataCategoryInfo(category);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sources = dataSourceDetails[`${category}Sources` as keyof typeof dataSourceDetails] as any[];
          const hasData = sources && sources.length > 0;

          return (
            <div key={category} className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {categoryInfo.icon}
                  <div>
                    <h4 className="text-white font-semibold">{categoryInfo.name}</h4>
                    <p className="text-slate-400 text-sm">{categoryInfo.description}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  hasData 
                    ? 'text-green-400 bg-green-500/20 border-green-500/30'
                    : 'text-red-400 bg-red-500/20 border-red-500/30'
                }`}>
                  {hasData ? 'Connected' : 'Not Connected'}
                </span>
              </div>

              {hasData ? (
                <div className="space-y-3">
                  {sources.map((source, index) => (
                    <div key={index} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getSourceIcon(source.source)}
                          <div>
                            <div className="text-white font-medium capitalize">{source.source}</div>
                            <div className="text-slate-400 text-xs">
                              ID: {source.externalId}
                              {source.isPrimarySource && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs border border-blue-500/30">
                                  Primary
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSyncStatusColor(source.syncStatus)}`}>
                          {source.syncStatus}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400">Last Sync:</span>
                          <div className="text-slate-300">{formatDateTime(source.lastSyncedAt)}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Priority:</span>
                          <div className="text-slate-300">{source.priorityLevel}</div>
                        </div>
                      </div>

                      {source.importedByUserName && (
                        <div className="mt-2 text-xs text-slate-500">
                          Imported by: {source.importedByUserName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    {categoryInfo.icon}
                  </div>
                  <p className="text-slate-400 text-sm mb-3">No {categoryInfo.name.toLowerCase()} connected</p>
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm">
                    Connect {categoryInfo.name}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-lg p-6 rounded-2xl border border-purple-500/30 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Recommendations to Improve Data Quality
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-white font-semibold mb-1">{rec.type}</h4>
                    <p className="text-slate-300 text-sm">{rec.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      rec.priority === 'High' 
                        ? 'text-red-400 bg-red-500/20 border-red-500/30'
                        : 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
                    }`}>
                      {rec.priority} Priority
                    </span>
                    <span className="text-green-400 text-xs font-medium">{rec.benefit}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h5 className="text-slate-400 text-sm font-medium">Recommended Actions:</h5>
                  <div className="space-y-1">
                    {rec.actions.slice(0, 3).map((action, actionIndex) => (
                      <div key={actionIndex} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                        <span className="text-slate-300">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-400 rounded-lg hover:from-purple-600/30 hover:to-blue-600/30 transition-all duration-200 text-sm border border-purple-500/30">
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Sync Status */}
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Sync Status & Health
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300 font-medium">Data Freshness</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{dataQuality.dataFreshness}</div>
            <div className="text-sm text-slate-400">Last sync: {formatDateTime(dataSourceDetails.lastOverallSync)}</div>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-slate-300 font-medium">Active Sources</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{dataSourceDetails.totalActiveSources}</div>
            <div className="text-sm text-slate-400">
              {dataSourceDetails.uniqueSourceNames.join(', ') || 'None'}
            </div>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span className="text-slate-300 font-medium">Sync Health</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {customer.quickMetrics.dataFreshnessStatus}
            </div>
            <div className="text-sm text-slate-400">
              {customer.quickMetrics.daysSinceLastSync === 0 ? 'Just synced' : `${customer.quickMetrics.daysSinceLastSync} days ago`}
            </div>
          </div>
        </div>

        {allDataSources.length > 0 && (
          <div className="mt-6">
            <h4 className="text-white font-medium mb-4">All Connected Sources</h4>
            <div className="space-y-3">
              {allDataSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <div className="flex items-center gap-3">
                    {getSourceIcon(source.source)}
                    <div>
                      <div className="text-white font-medium flex items-center gap-2">
                        <span className="capitalize">{source.source}</span>
                        <span className="text-xs text-slate-400">({source.category.toUpperCase()})</span>
                        {source.isPrimarySource && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs border border-blue-500/30">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-sm">{source.externalId}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSyncStatusColor(source.syncStatus)}`}>
                      {source.syncStatus}
                    </span>
                    <div className="text-xs text-slate-400 mt-1">
                      {source.daysSinceLastSync === 0 ? 'Just synced' : `${source.daysSinceLastSync}d ago`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};