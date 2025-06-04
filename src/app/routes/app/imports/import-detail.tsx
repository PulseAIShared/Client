
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';

import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { useGetImportJobDetail } from '@/features/customers/api/import';

export const ImportDetailRoute = () => {
  const { importJobId } = useParams<{ importJobId: string }>();
  const navigate = useNavigate();
  const { data: importJob, isLoading, error } = useGetImportJobDetail(importJobId!);

  if (isLoading) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center py-12">
          <Spinner size="xl" />
        </div>
      </ContentLayout>
    );
  }

  if (error || !importJob) {
    return (
      <ContentLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-600/10 rounded-2xl blur-3xl"></div>
            
            <div className="relative bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/app/customers')}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-red-400">Import Job Not Found</h1>
                  <p className="text-slate-300">The import job you're looking for doesn't exist or has been removed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Validating':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Cancelled':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'Failed':
        return (
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'Processing':
        return (
          <svg className="w-6 h-6 text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'Validating':
        return (
          <svg className="w-6 h-6 text-yellow-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Cancelled':
        return (
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return 'N/A';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <ContentLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-3xl"></div>
          
          <div className="relative bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/app/customers')}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-purple-200">Import Job Details</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(importJob.status)}`}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(importJob.status)}
                          {importJob.status}
                        </div>
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                      {importJob.fileName}
                    </h1>
                    <p className="text-slate-300">Import ID: {importJob.id}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Link 
                  to="/app/customers"
                  className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors font-medium text-sm border border-slate-600/50"
                >
                  View Customers
                </Link>
                <Button 
                  variant="outline"
                  className="border-slate-600/50 hover:border-blue-500/50 hover:text-blue-400"
                >
                  Download Report
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-lg p-4 rounded-2xl border border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-slate-400">Total Records</span>
            </div>
            <div className="text-2xl font-bold text-white">{importJob.totalRecords.toLocaleString()}</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg p-4 rounded-2xl border border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium text-slate-400">Successful</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{importJob.successfulRecords.toLocaleString()}</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg p-4 rounded-2xl border border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium text-slate-400">New Records</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">{importJob.newRecords.toLocaleString()}</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg p-4 rounded-2xl border border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm font-medium text-slate-400">Updated</span>
            </div>
            <div className="text-2xl font-bold text-orange-400">{importJob.updatedRecords.toLocaleString()}</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg p-4 rounded-2xl border border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm font-medium text-slate-400">Failed</span>
            </div>
            <div className="text-2xl font-bold text-red-400">{importJob.failedRecords.toLocaleString()}</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg p-4 rounded-2xl border border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-slate-400">Skipped</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">{importJob.skippedRecords.toLocaleString()}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Progress</h3>
            <span className="text-2xl font-bold text-blue-400">{Math.round(importJob.progressPercentage)}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${importJob.progressPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-sm text-slate-400">
            <span>
              {importJob.processedRecords.toLocaleString()} of {importJob.totalRecords.toLocaleString()} processed
            </span>
            <span>
              {importJob.status === 'Processing' ? 'In Progress...' : 'Complete'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Import Details */}
          <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-6">Import Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Import Source</span>
                <span className="text-white font-medium">{importJob.importSource || 'Manual Upload'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Import Type</span>
                <span className="text-white font-medium">{importJob.type}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Created At</span>
                <span className="text-white font-medium">{formatDateTime(importJob.createdAt)}</span>
              </div>
              {importJob.startedAt && (
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300">Started At</span>
                  <span className="text-white font-medium">{formatDateTime(importJob.startedAt)}</span>
                </div>
              )}
              {importJob.completedAt && (
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300">Completed At</span>
                  <span className="text-white font-medium">{formatDateTime(importJob.completedAt)}</span>
                </div>
              )}
              {importJob.startedAt && importJob.completedAt && (
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300">Duration</span>
                  <span className="text-white font-medium">{formatDuration(importJob.startedAt, importJob.completedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary or Status Information */}
          <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
            {importJob.summary ? (
              <>
                <h3 className="text-xl font-semibold text-green-400 mb-6">Import Summary</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-600/10 rounded-lg border border-green-500/30">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-400 font-medium text-lg">Import Analysis Complete</span>
                    </div>
                    
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-700/30 p-3 rounded-lg">
                        <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Average Revenue</div>
                        <div className="text-white font-bold text-lg">
                          ${Math.round(Number(importJob.summary.averageRevenue) || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-slate-700/30 p-3 rounded-lg">
                        <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Avg Tenure</div>
                        <div className="text-white font-bold text-lg">
                          {Math.round(Number(importJob.summary.averageTenureMonths) || 0)} months
                        </div>
                      </div>
                      <div className="bg-slate-700/30 p-3 rounded-lg">
                        <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">New Customers</div>
                        <div className="text-purple-400 font-bold text-lg">
                          {importJob.newRecords}
                        </div>
                      </div>
                      <div className="bg-slate-700/30 p-3 rounded-lg">
                        <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Updated Customers</div>
                        <div className="text-orange-400 font-bold text-lg">
                          {importJob.updatedRecords}
                        </div>
                      </div>
                    </div>

                    {/* Import Results Breakdown */}
                    <div className="border-t border-slate-600/50 pt-4 mb-4">
                      <h4 className="text-slate-300 font-medium mb-3">Import Results</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Success Rate:</span>
                          <span className="text-green-400 font-medium">
                            {Math.round((importJob.successfulRecords / importJob.totalRecords) * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Processing Time:</span>
                          <span className="text-white font-medium">
                            {formatDuration(importJob.startedAt, importJob.completedAt)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">New vs Updated:</span>
                          <span className="text-white font-medium">
                            {importJob.newRecords}:{importJob.updatedRecords}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">High Risk Customers:</span>
                          <span className="text-red-400 font-medium">
                            {importJob.summary.highRiskCustomers}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Plan Distribution */}
                    {(importJob.summary.additionalMetrics as { customersByPlan?: Record<string, number> })?.customersByPlan && (
                      <div className="border-t border-slate-600/50 pt-4">
                        <h4 className="text-slate-300 font-medium mb-3">Customer Distribution by Plan</h4>
                        <div className="space-y-2">
                          {importJob.summary.additionalMetrics && typeof importJob.summary.additionalMetrics === 'object' && 'customersByPlan' in importJob.summary.additionalMetrics &&
                            Object.entries(importJob.summary.additionalMetrics.customersByPlan as Record<string, number>).map(([plan, count]) => (
                            <div key={plan} className="flex items-center justify-between">
                              <span className="text-slate-400">{plan}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-slate-700/50 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ 
                                      width: `${(count / importJob.successfulRecords) * 100}%` 
                                    }}
                                  />
                                </div>
                                <span className="text-white font-medium min-w-[2rem]">{count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Metrics */}
                    {importJob.summary.additionalMetrics && (
                      <div className="border-t border-slate-600/50 pt-4 mt-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Active Subscriptions:</span>
                            <span className="text-white font-medium">
                              {(importJob.summary.additionalMetrics as unknown as { activeSubscriptions: number }).activeSubscriptions}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Trial Customers:</span>
                            <span className="text-white font-medium">
                              {(importJob.summary.additionalMetrics as unknown as { trialCustomers: number }).trialCustomers}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Avg LTV:</span>
                            <span className="text-white font-medium">
                              ${Math.round(((importJob.summary.additionalMetrics as unknown) as { averageLifetimeValue: number }).averageLifetimeValue).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Feature Usage:</span>
                            <span className="text-white font-medium">
                              {Math.round((importJob.summary.additionalMetrics as unknown as { averageFeatureUsage: number }).averageFeatureUsage)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-white mb-6">Status Information</h3>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-300">
                    {importJob.status === 'Processing' && 'Import is currently being processed...'}
                    {importJob.status === 'Validating' && 'File is being validated...'}
                    {importJob.status === 'Cancelled' && 'Import was cancelled.'}
                    {importJob.errorMessage && `Error: ${importJob.errorMessage}`}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Customer Updates Section */}
        {importJob.updates && importJob.updates.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-orange-400">Customer Updates</h3>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium border border-orange-500/30">
                {importJob.updates.length} {importJob.updates.length === 1 ? 'customer' : 'customers'} updated
              </span>
            </div>
            
            <div className="mb-4 p-4 bg-blue-600/10 rounded-lg border border-blue-500/30">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-blue-400 font-medium mb-1">Customer Records Updated</h4>
                  <p className="text-blue-300 text-sm">
                    Existing customers were found and their information was updated with new data from the import file. 
                    See below for details on what changed for each customer.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto">
              {importJob.updates.map((update, index) => (
                <div key={index} className="p-4 bg-orange-600/10 rounded-lg border border-orange-500/30">
                  <div className="flex items-start gap-3 mb-3">
                    <svg className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="text-orange-400 font-medium">{update.customerName}</h5>
                        <span className="text-orange-300 text-sm">• Row {update.rowNumber}</span>
                        <span className="text-orange-300 text-sm">• {update.email}</span>
                      </div>
                      
                      <div className="space-y-2">
                        {update.updatedFields.map((field, fieldIndex) => (
                          <div key={fieldIndex} className="bg-slate-700/30 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-orange-400 font-medium text-sm">{field.fieldName}</span>
                              <span className="text-xs text-slate-500">
                                {new Date(update.updateTime).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex-1">
                                <div className="text-slate-400 text-xs mb-1">Previous Value:</div>
                                <div className="text-red-300 bg-red-900/20 px-2 py-1 rounded font-mono">
                                  {field.oldValue || '(empty)'}
                                </div>
                              </div>
                              <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <div className="flex-1">
                                <div className="text-slate-400 text-xs mb-1">New Value:</div>
                                <div className="text-green-300 bg-green-900/20 px-2 py-1 rounded font-mono">
                                  {field.newValue || '(empty)'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation Errors Section - Show for both successful and failed imports */}
        {importJob.validationErrors && importJob.validationErrors.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-orange-400">
                {importJob.status === 'Completed' ? 'Import Warnings' : 'Validation Errors'}
              </h3>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium border border-orange-500/30">
                {importJob.validationErrors.length} {importJob.validationErrors.length === 1 ? 'issue' : 'issues'}
              </span>
            </div>
            
            {importJob.status === 'Completed' && (
              <div className="mb-4 p-4 bg-blue-600/10 rounded-lg border border-blue-500/30">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-blue-400 font-medium mb-1">Import Successful with Warnings</h4>
                    <p className="text-blue-300 text-sm">
                      The import completed successfully, but some records had issues. These are typically duplicate entries or validation warnings that didn't prevent the import.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {importJob.validationErrors.map((error, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  importJob.status === 'Completed' 
                    ? 'bg-orange-600/10 border-orange-500/30' 
                    : 'bg-red-600/10 border-red-500/30'
                }`}>
                  <div className="flex items-start gap-3">
                    <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      importJob.status === 'Completed' ? 'text-orange-400' : 'text-red-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${
                          importJob.status === 'Completed' ? 'text-orange-400' : 'text-red-400'
                        }`}>
                          Row {error.rowNumber}
                        </span>
                        {error.fieldName && (
                          <span className={`text-sm ${
                            importJob.status === 'Completed' ? 'text-orange-300' : 'text-red-300'
                          }`}>
                            • {error.fieldName}
                          </span>
                        )}
                        {error.email && (
                          <span className={`text-sm ${
                            importJob.status === 'Completed' ? 'text-orange-300' : 'text-red-300'
                          }`}>
                            • {error.email}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${
                        importJob.status === 'Completed' ? 'text-orange-300' : 'text-red-300'
                      }`}>
                        {error.errorMessage}
                      </p>
                      {error.rawData && (
                        <p className={`text-xs mt-1 px-2 py-1 rounded ${
                          importJob.status === 'Completed' 
                            ? 'text-orange-200 bg-orange-900/20' 
                            : 'text-red-200 bg-red-900/20'
                        }`}>
                          Value: "{error.rawData}"
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(error.errorTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {importJob.errorMessage && (
          <div className="bg-red-600/20 backdrop-blur-lg p-6 rounded-2xl border border-red-500/30 shadow-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-red-400 font-semibold text-lg mb-2">Error Details</h3>
                <p className="text-red-300">{importJob.errorMessage}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};