
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { useGetImportJobDetail } from '@/features/customers/api/import';
import { getStageRank, ImportJobResponse, ImportProcessingStage } from '@/types/api';

export const ImportDetailRoute = () => {
  const { importJobId } = useParams<{ importJobId: string }>();
  const navigate = useNavigate();
  const { data: importJob, isLoading, error } = useGetImportJobDetail(importJobId!);
  const [highestStageLocal, setHighestStageLocal] = useState<ImportProcessingStage | undefined>(undefined);

  useEffect(() => {
    if (!importJob) return;
    const candidate = pickHighestStage([
      importJob.stage as ImportProcessingStage | undefined,
      importJob.highestStageReached as ImportProcessingStage | undefined,
      statusToStage(importJob.status),
    ]);
    setHighestStageLocal((prev) => {
      if (!candidate) return prev;
      if (!prev) return candidate;
      return getStageRank(candidate) > getStageRank(prev) ? candidate : prev;
    });
  }, [importJob]);

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
          {/* Enhanced Error Header */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-error/10 to-warning/10 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
            
            <div className="relative bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/app/customers')}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary/50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-error-muted">Import Job Not Found</h1>
                  <p className="text-text-secondary">The import job you're looking for doesn't exist or has been removed.</p>
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
        return 'bg-success/20 text-success-muted border-success/30';
      case 'Failed':
        return 'bg-error/20 text-error-muted border-error/30';
      case 'Processing':
        return 'bg-accent-primary/20 text-accent-primary border-accent-primary/30';
      case 'Validating':
        return 'bg-warning/20 text-warning-muted border-warning/30';
      case 'Cancelled':
        return 'bg-text-muted/20 text-text-muted border-text-muted/30';
      default:
        return 'bg-surface-secondary/20 text-text-muted border-border-primary/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <svg className="w-6 h-6 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'Failed':
        return (
          <svg className="w-6 h-6 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'Processing':
        return (
          <svg className="w-6 h-6 text-accent-primary animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'Validating':
        return (
          <svg className="w-6 h-6 text-warning-muted animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Cancelled':
        return (
          <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  const statusToStage = (status: ImportJobResponse['status']): ImportProcessingStage | undefined => {
    switch (status) {
      case 'Pending':
        return 'Queued';
      case 'Validating':
        return 'Validating';
      case 'Processing':
        return 'Started';
      case 'Completed':
        return 'Completed';
      case 'Failed':
        return 'Failed';
      case 'Cancelled':
        return 'Cancelled';
      default:
        return undefined;
    }
  };

  const pickHighestStage = (stages: (ImportProcessingStage | undefined)[]) => {
    return stages.reduce<ImportProcessingStage | undefined>((highest, candidate) => {
      if (!candidate) return highest;
      if (!highest) return candidate;
      return getStageRank(candidate) > getStageRank(highest) ? candidate : highest;
    }, undefined);
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

  const stageDisplayOrder: ImportProcessingStage[] = [
    'Queued',
    'Started',
    'Validating',
    'Ingesting',
    'Aggregating',
    'Summary',
    'Completed',
    'Failed',
    'Cancelled',
  ];

  const currentStage = pickHighestStage([
    importJob.stage as ImportProcessingStage | undefined,
    importJob.highestStageReached as ImportProcessingStage | undefined,
    highestStageLocal,
    statusToStage(importJob.status),
  ]);

  const highestStageForSteps = pickHighestStage([
    currentStage,
    importJob.highestStageReached as ImportProcessingStage | undefined,
    highestStageLocal,
    statusToStage(importJob.status),
  ]);

  const progressValue = Math.max(0, Math.min(100, Math.round(importJob.progressPercentage ?? 0)));
  const isTerminal = ['Completed', 'Failed', 'Cancelled'].includes(importJob.status);

  const getBatchInfo = (stage?: ImportProcessingStage) => {
    if (stage !== 'Aggregating' && stage !== 'Ingesting') return undefined;
    const batchNumber = importJob.currentBatch;
    const totalBatches = importJob.totalBatches;
    const processed = importJob.batchProcessed;
    const batchSize = importJob.batchSize;

    if (batchNumber && totalBatches) {
      const counts =
        typeof processed === 'number' && typeof batchSize === 'number'
          ? ` (${processed}/${batchSize})`
          : '';
      return `Batch ${batchNumber}/${totalBatches}${counts}`;
    }
    return undefined;
  };

  const getStageDetail = (stage?: ImportProcessingStage) => {
    const baseDetail = importJob.stageDetail || importJob.message;
    const processedText =
      importJob.totalRecords > 0
        ? `${importJob.processedRecords.toLocaleString()}/${importJob.totalRecords.toLocaleString()}`
        : `${importJob.processedRecords.toLocaleString()}`;
    const batchInfo = getBatchInfo(stage);

    switch (stage) {
      case 'Queued':
        return baseDetail || 'Waiting to start...';
      case 'Started':
        return baseDetail || 'Preparing import and reading file...';
      case 'Validating':
        return baseDetail || 'Validating file and mapping columns...';
      case 'Ingesting': {
        const detail = baseDetail || 'Ingesting rows from the uploaded file...';
        return batchInfo ? `${detail} - ${batchInfo}` : detail;
      }
      case 'Aggregating': {
        const detail = baseDetail || 'Aggregating customers';
        const aggregateText = `${detail} (${processedText})`;
        return batchInfo ? `${aggregateText} - ${batchInfo}` : aggregateText;
      }
      case 'Summary':
        return baseDetail || 'Generating import summary...';
      case 'Completed':
        return baseDetail || 'Import completed';
      case 'Failed':
        return (
          baseDetail ||
          (importJob.errorMessage ? `Import failed: ${importJob.errorMessage}` : 'Import failed')
        );
      case 'Cancelled':
        return baseDetail || 'Import was cancelled';
      default:
        return baseDetail || 'Processing import...';
    }
  };

  const stageDetailText = getStageDetail(currentStage);
  const stageLabel = currentStage ?? statusToStage(importJob.status) ?? 'Processing';

  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Enhanced Header */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 via-accent-secondary/10 to-accent-primary/10 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
          
          <div className="relative bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/app/customers')}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary/50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-2">
          
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(importJob.status)}`}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(importJob.status)}
                          {importJob.status}
                        </div>
                      </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary">
                      {importJob.fileName}
                    </h1>
                    <p className="text-text-secondary text-base sm:text-lg">Import ID: {importJob.id}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Link 
                  to="/app/customers"
                  className="px-4 py-2 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/70 transition-colors font-medium text-sm border border-border-primary/50 hover:border-accent-primary/50 hover:text-accent-primary"
                >
                  View Customers
                </Link>
                <Button 
                  variant="outline"
                  className="border-border-primary/50 hover:border-accent-primary/50 hover:text-accent-primary bg-surface-primary/50 backdrop-blur-sm"
                >
                  Download Report
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          <div className="bg-surface-primary/80 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-text-muted">Total Records</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-text-primary">{importJob.totalRecords.toLocaleString()}</div>
          </div>

          <div className="bg-surface-primary/80 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium text-text-muted">Successful</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-success-muted">{importJob.successfulRecords.toLocaleString()}</div>
          </div>

          <div className="bg-surface-primary/80 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium text-text-muted">New Records</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-accent-secondary">{importJob.newRecords.toLocaleString()}</div>
          </div>

          <div className="bg-surface-primary/80 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-warning-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm font-medium text-text-muted">Updated</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-warning-muted">{importJob.updatedRecords.toLocaleString()}</div>
          </div>

          <div className="bg-surface-primary/80 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm font-medium text-text-muted">Failed</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-error-muted">{importJob.failedRecords.toLocaleString()}</div>
          </div>

          <div className="bg-surface-primary/80 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-warning-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-text-muted">Skipped</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-warning-muted">{importJob.skippedRecords.toLocaleString()}</div>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="bg-surface-primary/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-text-primary">Progress</h3>
              <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                <span className="inline-flex items-center rounded-full bg-accent-primary/10 text-accent-primary px-3 py-1 border border-accent-primary/20">
                  {!isTerminal ? (
                    <svg className="w-4 h-4 mr-1 animate-spin text-accent-primary" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  ) : null}
                  {stageLabel}
                </span>
                <span className="text-text-secondary">{stageDetailText}</span>
              </div>
              {(currentStage === 'Aggregating' || currentStage === 'Ingesting') && getBatchInfo(currentStage) && (
                <div className="text-xs text-text-muted">{getBatchInfo(currentStage)}</div>
              )}
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-accent-primary">{progressValue}%</span>
          </div>
          <div className="w-full bg-surface-secondary/50 rounded-full h-4 sm:h-6 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-accent-primary to-accent-secondary h-4 sm:h-6 rounded-full transition-all duration-1000 ease-out shadow-lg"
              style={{ width: `${progressValue}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-sm text-text-muted">
            <span>
              {importJob.processedRecords.toLocaleString()} of {importJob.totalRecords.toLocaleString()} processed
            </span>
            <span>
              {isTerminal ? 'Complete' : 'In Progress...'}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {stageDisplayOrder.map((stageKey, idx) => {
              const currentRank = getStageRank(currentStage);
              const highestRank = getStageRank(highestStageForSteps);
              const thisRank = getStageRank(stageKey);
              const isDone =
                (highestRank > thisRank &&
                  !((highestStageForSteps === 'Failed' || highestStageForSteps === 'Cancelled') && stageKey === 'Completed')) ||
                currentRank > thisRank;
              const isActive = currentStage === stageKey;

              const labelMap: Record<ImportProcessingStage, string> = {
                Queued: 'Queued',
                Started: 'Started',
                Validating: 'Validating',
                Ingesting: 'Ingesting',
                Aggregating: 'Aggregating',
                Summary: 'Summary',
                Completed: 'Completed',
                Failed: 'Failed',
                Cancelled: 'Cancelled',
              };

              return (
                <div
                  key={stageKey}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                    isActive
                      ? 'border-accent-primary/40 bg-accent-primary/10 text-accent-primary'
                      : isDone
                        ? 'border-success/30 bg-success/10 text-success-muted'
                        : 'border-border-primary/40 bg-surface-secondary/40 text-text-secondary'
                  }`}
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                      isActive
                        ? 'bg-accent-primary text-white'
                        : isDone
                          ? 'bg-success text-white'
                          : 'bg-surface-secondary text-text-muted'
                    }`}
                  >
                    {isDone ? '\u2713' : idx + 1}
                  </span>
                  <span>{labelMap[stageKey]}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Import Details */}
          <div className="bg-surface-primary/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl sm:text-2xl font-semibold text-text-primary mb-6">Import Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-lg hover:bg-surface-secondary/50 transition-colors">
                <span className="text-text-secondary">Import Source</span>
                <span className="text-text-primary font-medium">{importJob.importSource || 'Manual Upload'}</span>
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-lg hover:bg-surface-secondary/50 transition-colors">
                <span className="text-text-secondary">Import Type</span>
                <span className="text-text-primary font-medium">{importJob.type}</span>
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-lg hover:bg-surface-secondary/50 transition-colors">
                <span className="text-text-secondary">Created At</span>
                <span className="text-text-primary font-medium">{formatDateTime(importJob.createdAt)}</span>
              </div>
              {importJob.queuedAt && (
                <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-lg hover:bg-surface-secondary/50 transition-colors">
                  <span className="text-text-secondary">Queued At</span>
                  <span className="text-text-primary font-medium">{formatDateTime(importJob.queuedAt)}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-lg hover:bg-surface-secondary/50 transition-colors">
                <span className="text-text-secondary">Skip duplicates</span>
                <span className="text-text-primary font-medium">
                  {importJob.skipDuplicates === undefined
                    ? 'Not specified'
                    : importJob.skipDuplicates
                      ? 'Yes'
                      : 'No'}
                </span>
              </div>
              {importJob.startedAt && (
                <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-lg hover:bg-surface-secondary/50 transition-colors">
                  <span className="text-text-secondary">Started At</span>
                  <span className="text-text-primary font-medium">{formatDateTime(importJob.startedAt)}</span>
                </div>
              )}
              {importJob.completedAt && (
                <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-lg hover:bg-surface-secondary/50 transition-colors">
                  <span className="text-text-secondary">Completed At</span>
                  <span className="text-text-primary font-medium">{formatDateTime(importJob.completedAt)}</span>
                </div>
              )}
              {importJob.startedAt && importJob.completedAt && (
                <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-lg hover:bg-surface-secondary/50 transition-colors">
                  <span className="text-text-secondary">Duration</span>
                  <span className="text-text-primary font-medium">{formatDuration(importJob.startedAt, importJob.completedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Summary or Status Information */}
          <div className="bg-surface-primary/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
            {importJob.summary ? (
              <>
                <h3 className="text-xl sm:text-2xl font-semibold text-success-muted mb-6">Import Summary</h3>
                <div className="space-y-4">
                  <div className="p-4 sm:p-6 bg-success/10 rounded-lg border border-success/30">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-6 h-6 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-success-muted font-medium text-lg">Import Analysis Complete</span>
                    </div>
                    
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-surface-secondary/30 p-3 rounded-lg">
                        <div className="text-text-muted text-xs uppercase tracking-wider mb-1">Average Revenue</div>
                        <div className="text-text-primary font-bold text-lg">
                          ${Math.round(Number(importJob.summary.averageRevenue) || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-surface-secondary/30 p-3 rounded-lg">
                        <div className="text-text-muted text-xs uppercase tracking-wider mb-1">Avg Tenure</div>
                        <div className="text-text-primary font-bold text-lg">
                          {Math.round(Number(importJob.summary.averageTenureMonths) || 0)} months
                        </div>
                      </div>
                      <div className="bg-surface-secondary/30 p-3 rounded-lg">
                        <div className="text-text-muted text-xs uppercase tracking-wider mb-1">New Customers</div>
                        <div className="text-accent-secondary font-bold text-lg">
                          {importJob.newRecords}
                        </div>
                      </div>
                      <div className="bg-surface-secondary/30 p-3 rounded-lg">
                        <div className="text-text-muted text-xs uppercase tracking-wider mb-1">Updated Customers</div>
                        <div className="text-warning-muted font-bold text-lg">
                          {importJob.updatedRecords}
                        </div>
                      </div>
                    </div>

                    {/* Import Results Breakdown */}
                    <div className="border-t border-border-primary/50 pt-4 mb-4">
                      <h4 className="text-text-secondary font-medium mb-3">Import Results</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Success Rate:</span>
                          <span className="text-success-muted font-medium">
                            {Math.round((importJob.successfulRecords / importJob.totalRecords) * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Processing Time:</span>
                          <span className="text-text-primary font-medium">
                            {formatDuration(importJob.startedAt, importJob.completedAt)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">New vs Updated:</span>
                          <span className="text-text-primary font-medium">
                            {importJob.newRecords}:{importJob.updatedRecords}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">High Risk Customers:</span>
                          <span className="text-error-muted font-medium">
                            {importJob.summary.highRiskCustomers}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Plan Distribution */}
                    {(importJob.summary.additionalMetrics as { customersByPlan?: Record<string, number> })?.customersByPlan && (
                      <div className="border-t border-border-primary/50 pt-4">
                        <h4 className="text-text-secondary font-medium mb-3">Customer Distribution by Plan</h4>
                        <div className="space-y-2">
                          {importJob.summary.additionalMetrics && typeof importJob.summary.additionalMetrics === 'object' && 'customersByPlan' in importJob.summary.additionalMetrics &&
                            Object.entries(importJob.summary.additionalMetrics.customersByPlan as Record<string, number>).map(([plan, count]) => (
                            <div key={plan} className="flex items-center justify-between">
                              <span className="text-text-muted">{plan}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-surface-secondary/50 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ 
                                      width: `${(count / importJob.successfulRecords) * 100}%` 
                                    }}
                                  />
                                </div>
                                <span className="text-text-primary font-medium min-w-[2rem]">{count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Metrics */}
                    {importJob.summary.additionalMetrics && (
                      <div className="border-t border-border-primary/50 pt-4 mt-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-text-muted">Active Subscriptions:</span>
                            <span className="text-text-primary font-medium">
                              {(importJob.summary.additionalMetrics as unknown as { activeSubscriptions: number }).activeSubscriptions}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Trial Customers:</span>
                            <span className="text-text-primary font-medium">
                              {(importJob.summary.additionalMetrics as unknown as { trialCustomers: number }).trialCustomers}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Avg LTV:</span>
                            <span className="text-text-primary font-medium">
                              ${Math.round(((importJob.summary.additionalMetrics as unknown) as { averageLifetimeValue: number }).averageLifetimeValue).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Feature Usage:</span>
                            <span className="text-text-primary font-medium">
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
                <h3 className="text-xl sm:text-2xl font-semibold text-text-primary mb-6">Status Information</h3>
                <div className="p-4 sm:p-6 bg-surface-secondary/30 rounded-lg">
                  <p className="text-text-secondary">
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

        {/* Enhanced Customer Updates Section */}
        {importJob.updates && importJob.updates.length > 0 && (
          <div className="bg-surface-primary/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-warning-muted">Customer Updates</h3>
              <span className="px-3 py-1 bg-warning/20 text-warning-muted rounded-full text-sm font-medium border border-warning/30">
                {importJob.updates.length} {importJob.updates.length === 1 ? 'customer' : 'customers'} updated
              </span>
            </div>
            
            <div className="mb-4 p-4 sm:p-6 bg-accent-primary/10 rounded-lg border border-accent-primary/30">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-accent-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-accent-primary font-medium mb-1">Customer Records Updated</h4>
                  <p className="text-accent-primary text-sm">
                    Existing customers were found and their information was updated with new data from the import file. 
                    See below for details on what changed for each customer.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto">
              {importJob.updates.map((update, index) => (
                <div key={index} className="p-4 sm:p-6 bg-warning/10 rounded-lg border border-warning/30 hover:bg-warning/20 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <svg className="w-5 h-5 text-warning-muted mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="text-warning-muted font-medium">{update.customerName}</h5>
                        <span className="text-warning text-sm">- Row {update.rowNumber}</span>
                        <span className="text-warning text-sm">- {update.email}</span>
                      </div>
                      
                      <div className="space-y-2">
                        {update.updatedFields.map((field, fieldIndex) => (
                          <div key={fieldIndex} className="bg-surface-secondary/30 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-warning-muted font-medium text-sm">{field.fieldName}</span>
                              <span className="text-xs text-slate-500">
                                {new Date(update.updateTime).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex-1">
                                <div className="text-text-muted text-xs mb-1">Previous Value:</div>
                                <div className="text-error bg-error/20 px-2 py-1 rounded font-mono">
                                  {field.oldValue || '(empty)'}
                                </div>
                              </div>
                              <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <div className="flex-1">
                                <div className="text-text-muted text-xs mb-1">New Value:</div>
                                <div className="text-success bg-success/20 px-2 py-1 rounded font-mono">
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

        {/* Enhanced Validation Errors Section */}
        {importJob.validationErrors && importJob.validationErrors.length > 0 && (
          <div className="bg-surface-primary/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-warning-muted">
                {importJob.status === 'Completed' ? 'Import Warnings' : 'Validation Errors'}
              </h3>
              <span className="px-3 py-1 bg-warning/20 text-warning-muted rounded-full text-sm font-medium border border-warning/30">
                {importJob.validationErrors.length} {importJob.validationErrors.length === 1 ? 'issue' : 'issues'}
              </span>
            </div>
            
            {importJob.status === 'Completed' && (
              <div className="mb-4 p-4 sm:p-6 bg-accent-primary/10 rounded-lg border border-accent-primary/30">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-accent-primary font-medium mb-1">Import Successful with Warnings</h4>
                    <p className="text-accent-primary text-sm">
                      The import completed successfully, but some records had issues. These are typically duplicate entries or validation warnings that didn't prevent the import.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {importJob.validationErrors.map((error, index) => (
                <div key={index} className={`p-4 sm:p-6 rounded-lg border ${
                  importJob.status === 'Completed' 
                    ? 'bg-warning/10 border-warning/30' 
                    : 'bg-error/10 border-error/30'
                } hover:bg-opacity-20 transition-colors`}>
                  <div className="flex items-start gap-3">
                    <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      importJob.status === 'Completed' ? 'text-warning-muted' : 'text-error-muted'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${
                          importJob.status === 'Completed' ? 'text-warning-muted' : 'text-error-muted'
                        }`}>
                          Row {error.rowNumber}
                        </span>
                        {error.fieldName && (
                          <span className={`text-sm ${
                            importJob.status === 'Completed' ? 'text-warning' : 'text-error'
                          }`}>
                            - {error.fieldName}
                          </span>
                        )}
                        {error.email && (
                          <span className={`text-sm ${
                            importJob.status === 'Completed' ? 'text-warning' : 'text-error'
                          }`}>
                            - {error.email}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${
                        importJob.status === 'Completed' ? 'text-warning' : 'text-error'
                      }`}>
                        {error.errorMessage}
                      </p>
                      {error.rawData && (
                        <p className={`text-xs mt-1 px-2 py-1 rounded ${
                          importJob.status === 'Completed' 
                            ? 'text-warning bg-warning/20' 
                            : 'text-error bg-error/20'
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

        {/* Enhanced Error Message */}
        {importJob.errorMessage && (
          <div className="bg-error/20 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-error/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-error-muted mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-error-muted font-semibold text-lg sm:text-xl mb-2">Error Details</h3>
                <p className="text-error">{importJob.errorMessage}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};











