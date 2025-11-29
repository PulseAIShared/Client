import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { signalRConnection } from '@/lib/signalr';
import { useUser } from '@/lib/auth';
import { getToken } from '@/lib/api-client';
import { useChatbotStore } from '@/features/chatbot/store';
import type { SupportSession, SupportMessage } from '@/features/chatbot/api/chatbot';
import {
  getStageRank,
  ImportJobDetailResponse,
  ImportJobResponse,
  ImportJobStatus,
  ImportJobSummaryResponse,
  ImportProcessingStage,
  PlatformRole,
} from '@/types/api';
import { useNotifications } from '@/components/ui/notifications/notifications-store';
import { getImportStatus } from '@/features/customers/api/import';

export const useRealTimeNotifications = () => {
  const queryClient = useQueryClient();
  const user = useUser();
  const {
    setSupportSession,
    updateSupportSession,
    addSupportMessage,
    supportSession,
    openChat,
    setActiveMode,
  } = useChatbotStore();
  const { addNotification } = useNotifications();
  const startedNotifiedJobs = useRef<Set<string>>(new Set());
  const completedNotifiedJobs = useRef<Set<string>>(new Set());
  const inflightJobsRef = useRef<Map<string, ImportJobResponse>>(new Map());

  const isAuthenticated = !!user.data && !user.isLoading;

  const isTerminalStatus = useCallback((status?: ImportJobResponse['status']) => {
    return status === 'Completed' || status === 'Failed' || status === 'Cancelled';
  }, []);

  const statusToStage = useCallback(
    (status?: ImportJobResponse['status']): ImportProcessingStage | undefined => {
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
    },
    [],
  );

  const mapStatusToEnum = useCallback((status?: ImportJobResponse['status']): ImportJobStatus => {
    switch (status) {
      case 'Validating':
        return ImportJobStatus.Validating;
      case 'Processing':
        return ImportJobStatus.Processing;
      case 'Completed':
        return ImportJobStatus.Completed;
      case 'Failed':
        return ImportJobStatus.Failed;
      case 'Cancelled':
        return ImportJobStatus.Cancelled;
      case 'Pending':
      default:
        return ImportJobStatus.Pending;
    }
  }, []);

  const mapEnumToStatus = useCallback((status?: ImportJobStatus | number) => {
    switch (status) {
      case ImportJobStatus.Pending:
        return 'Pending' as const;
      case ImportJobStatus.Validating:
        return 'Validating' as const;
      case ImportJobStatus.Processing:
        return 'Processing' as const;
      case ImportJobStatus.Completed:
        return 'Completed' as const;
      case ImportJobStatus.Failed:
        return 'Failed' as const;
      case ImportJobStatus.Cancelled:
        return 'Cancelled' as const;
      default:
        return undefined;
    }
  }, []);

  const stageOrderList: ImportProcessingStage[] = [
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

  const inferStageFromDetail = useCallback((detail?: string): ImportProcessingStage | undefined => {
    if (!detail) return undefined;
    const normalized = detail.toLowerCase();
    if (normalized.includes('cancel')) return 'Cancelled';
    if (normalized.includes('fail')) return 'Failed';
    if (normalized.includes('complete')) return 'Completed';
    if (normalized.includes('summary')) return 'Summary';
    if (normalized.includes('churn') || normalized.includes('analysis') || normalized.includes('insight'))
      return 'Summary';
    if (normalized.includes('aggregat') || /\bbatch\s*\d+\s*\/\s*\d+/i.test(normalized)) return 'Aggregating';
    if (normalized.includes('ingest')) return 'Ingesting';
    if (normalized.includes('validat')) return 'Validating';
    if (normalized.includes('start')) return 'Started';
    if (normalized.includes('queue') || normalized.includes('pending')) return 'Queued';
    return undefined;
  }, []);

  const normalizeStageValue = useCallback(
    (
      stage: ImportJobResponse['stage'] | number | undefined,
      status?: ImportJobResponse['status'],
      detail?: string,
    ): ImportProcessingStage | undefined => {
      if (typeof stage === 'number' && stageOrderList[stage]) {
        return stageOrderList[stage];
      }
      if (typeof stage === 'string') {
        const numeric = Number(stage);
        if (!Number.isNaN(numeric) && stageOrderList[numeric]) {
          return stageOrderList[numeric];
        }
        if (stageOrderList.includes(stage as ImportProcessingStage)) {
          return stage as ImportProcessingStage;
        }
      }
      return inferStageFromDetail(detail) ?? statusToStage(status);
    },
    [inferStageFromDetail, stageOrderList, statusToStage],
  );

  const mergeImportJob = useCallback(
    (prev: ImportJobResponse | undefined, incoming: Partial<ImportJobResponse>): ImportJobResponse => {
      const status = incoming.status ?? prev?.status ?? 'Processing';
      const incomingDetail = incoming.stageDetail ?? incoming.message ?? prev?.stageDetail ?? prev?.message;
      const prevDetail = prev?.stageDetail ?? prev?.message;
      const incomingStage = normalizeStageValue(incoming.stage as ImportProcessingStage | undefined, status, incomingDetail);
      const prevStage = normalizeStageValue(prev?.stage as ImportProcessingStage | undefined, prev?.status, prevDetail);

      const stageRankIncoming = getStageRank(incomingStage as ImportProcessingStage | undefined);
      const stageRankPrev = getStageRank(prevStage as ImportProcessingStage | undefined);
      const chosenStage = stageRankIncoming >= stageRankPrev ? incomingStage : prevStage;

      const rawProgress =
        typeof incoming.progressPercentage === 'number'
          ? incoming.progressPercentage
          : prev?.progressPercentage ?? 0;

      const highestPrev = prev?.highestStageReached ?? prevStage;
      const highestCandidate =
        getStageRank(chosenStage as ImportProcessingStage | undefined) >
        getStageRank(highestPrev as ImportProcessingStage | undefined)
          ? chosenStage
          : highestPrev;

      const normalizedStage: ImportProcessingStage | undefined =
        status === 'Completed'
          ? 'Completed'
          : status === 'Failed'
            ? 'Failed'
            : status === 'Cancelled'
              ? 'Cancelled'
              : (chosenStage as ImportProcessingStage | undefined);

      return {
        id: incoming.id ?? prev?.id ?? '',
        fileName: incoming.fileName ?? prev?.fileName ?? 'Customer import',
        status,
        type: incoming.type ?? prev?.type ?? 'Customers',
        importSource: incoming.importSource ?? prev?.importSource,
        totalRecords:
          typeof incoming.totalRecords === 'number' ? incoming.totalRecords : prev?.totalRecords ?? 0,
        processedRecords:
          typeof incoming.processedRecords === 'number'
            ? incoming.processedRecords
            : prev?.processedRecords ?? 0,
        successfulRecords:
          typeof incoming.successfulRecords === 'number'
            ? incoming.successfulRecords
            : prev?.successfulRecords ?? 0,
        failedRecords:
          typeof incoming.failedRecords === 'number' ? incoming.failedRecords : prev?.failedRecords ?? 0,
        skippedRecords:
          typeof incoming.skippedRecords === 'number' ? incoming.skippedRecords : prev?.skippedRecords ?? 0,
        updatedRecords:
          typeof incoming.updatedRecords === 'number' ? incoming.updatedRecords : prev?.updatedRecords ?? 0,
        newRecords:
          typeof incoming.newRecords === 'number' ? incoming.newRecords : prev?.newRecords ?? 0,
        errorMessage: incoming.errorMessage ?? prev?.errorMessage,
        createdAt: incoming.createdAt ?? prev?.createdAt ?? new Date().toISOString(),
        startedAt: incoming.startedAt ?? prev?.startedAt,
        completedAt: incoming.completedAt ?? prev?.completedAt,
        progressPercentage:
          status === 'Completed'
            ? Math.max(rawProgress, 100)
            : rawProgress,
        stage: normalizedStage,
        stageDetail: incoming.stageDetail ?? incoming.message ?? prev?.stageDetail ?? prev?.message,
        highestStageReached:
          (highestCandidate as ImportProcessingStage | undefined) ?? normalizedStage ?? prev?.highestStageReached,
        currentBatch: incoming.currentBatch ?? prev?.currentBatch,
        totalBatches: incoming.totalBatches ?? prev?.totalBatches,
        batchProcessed: incoming.batchProcessed ?? prev?.batchProcessed,
        batchSize: incoming.batchSize ?? prev?.batchSize,
        validationErrors: incoming.validationErrors ?? prev?.validationErrors ?? [],
        updates: incoming.updates ?? prev?.updates ?? [],
        summary: incoming.summary ?? prev?.summary,
        message: incoming.message ?? prev?.message,
        queuedAt: incoming.queuedAt ?? prev?.queuedAt,
        skipDuplicates: incoming.skipDuplicates ?? prev?.skipDuplicates,
        actionUrl: incoming.actionUrl ?? prev?.actionUrl ?? `/app/imports/${incoming.id ?? prev?.id ?? ''}`,
      };
    },
    [inferStageFromDetail, statusToStage],
  );

  const updateHistoryCaches = useCallback(
    (job: ImportJobResponse) => {
      const historyQueries = queryClient.getQueriesData<{
        items: ImportJobSummaryResponse[];
        total: number;
        page: number;
        totalPages: number;
        pageSize: number;
      }>({ queryKey: ['imports', 'history'] });

      historyQueries.forEach(([key, value]) => {
        if (!value) return;

        const summaryStatus = mapStatusToEnum(job.status);
        const summary: ImportJobSummaryResponse = {
          id: job.id,
          fileName: job.fileName,
          status: summaryStatus,
          totalRecords: job.totalRecords,
          successfulRecords: job.successfulRecords,
          errorCount: job.failedRecords,
          createdAt: job.createdAt,
          completedAt: job.completedAt,
        };

        const existingIndex = value.items.findIndex((item) => item.id === job.id);
        let items = value.items;
        let total = value.total;

        if (existingIndex >= 0) {
          items = [...items];
          items[existingIndex] = { ...items[existingIndex], ...summary };
        } else if (value.page === 1) {
          items = [summary, ...items];
          total = total + 1;
        }

        queryClient.setQueryData(key, { ...value, items, total });
      });
    },
    [mapStatusToEnum, queryClient],
  );

  const upsertImportJob = useCallback(
    (jobId: string, incoming: Partial<ImportJobResponse>) => {
      const prev =
        inflightJobsRef.current.get(jobId) ||
        queryClient.getQueryData<ImportJobResponse>(['imports', 'detail', jobId]) ||
        queryClient.getQueryData<ImportJobResponse>(['imports', 'status', jobId]);

      const merged = mergeImportJob(prev, { ...incoming, id: jobId });

      if (!isTerminalStatus(merged.status)) {
        inflightJobsRef.current.set(jobId, merged);
      } else {
        inflightJobsRef.current.delete(jobId);
      }

      queryClient.setQueryData(['imports', 'status', jobId], merged);
      queryClient.setQueryData(['imports', 'detail', jobId], merged);
      updateHistoryCaches(merged);

      return merged;
    },
    [isTerminalStatus, mergeImportJob, queryClient, updateHistoryCaches],
  );

  const seedInflightFromCache = useCallback(() => {
    const cachedJobs = queryClient.getQueriesData<
      ImportJobResponse | ImportJobDetailResponse | { items?: ImportJobSummaryResponse[] }
    >({
      queryKey: ['imports'],
    });

    cachedJobs.forEach(([, data]) => {
      if (!data) return;

      const maybeJob = data as ImportJobResponse;
      if (maybeJob && typeof maybeJob.id === 'string' && typeof maybeJob.status === 'string') {
        upsertImportJob(maybeJob.id, maybeJob);
        return;
      }

      const maybeHistoryItems = (data as { items?: ImportJobSummaryResponse[] }).items;
      if (Array.isArray(maybeHistoryItems)) {
        maybeHistoryItems.forEach((item) => {
          const statusString = mapEnumToStatus(item.status);
          if (item.id && statusString && !isTerminalStatus(statusString)) {
            upsertImportJob(item.id, {
              fileName: item.fileName,
              status: statusString,
              totalRecords: item.totalRecords ?? 0,
              successfulRecords: item.successfulRecords ?? 0,
              failedRecords: item.errorCount ?? 0,
              createdAt: item.createdAt,
              completedAt: item.completedAt,
              progressPercentage: 0,
            });
          }
        });
      }
    });
  }, [isTerminalStatus, mapEnumToStatus, queryClient, upsertImportJob]);

  const refreshActiveJobs = useCallback(async () => {
    if (inflightJobsRef.current.size === 0) return;

    const ids = Array.from(inflightJobsRef.current.keys());
    await Promise.all(
      ids.map(async (jobId) => {
        try {
          const latest = await getImportStatus(jobId);
          upsertImportJob(jobId, latest);
        } catch (error) {
          console.error(`Failed to backfill import job ${jobId}`, error);
        }
      }),
    );
  }, [upsertImportJob]);

  // Handler for analysis completion - invalidate analysis and notifications
  const handleAnalysisCompleted = useCallback(() => {
    console.log('Analysis completed - refreshing relevant queries');

    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  }, [queryClient]);

  // Handler for import completion - invalidate customers, dashboard and notifications
  const handleImportCompleted = useCallback(
    (payload?: any) => {
      const jobId =
        payload?.jobId ?? payload?.importJobId ?? payload?.ImportJobId ?? payload?.importJobID;
      if (!jobId) return;

      const status = (payload?.status ?? payload?.Status ?? 'Completed') as ImportJobResponse['status'];
      const stageDetail =
        status === 'Failed'
          ? payload?.errorMessage ??
            payload?.ErrorMessage ??
            payload?.stageDetail ??
            payload?.StageDetail
          : payload?.stageDetail ?? payload?.StageDetail ?? 'Import completed';

      upsertImportJob(jobId, {
        status,
        stage: statusToStage(status) ?? 'Completed',
        stageDetail,
        progressPercentage: status === 'Completed' ? 100 : undefined,
        completedAt: payload?.completedAt ?? payload?.CompletedAt ?? new Date().toISOString(),
        successfulRecords:
          payload?.successfulRecords ?? payload?.SuccessfulRecords ?? payload?.importedCount,
        failedRecords: payload?.failedRecords ?? payload?.FailedRecords ?? payload?.errorCount,
        skippedRecords: payload?.skippedRecords ?? payload?.SkippedRecords ?? payload?.duplicatesSkipped,
        processedRecords: payload?.processedRecords ?? payload?.ProcessedRecords ?? payload?.total,
        totalRecords: payload?.totalRecords ?? payload?.TotalRecords ?? payload?.total,
        summary: payload?.summary ?? payload?.Summary,
        validationErrors: payload?.validationErrors ?? payload?.ValidationErrors,
        errorMessage: payload?.errorMessage ?? payload?.ErrorMessage,
      });

      if (!completedNotifiedJobs.current.has(jobId)) {
        completedNotifiedJobs.current.add(jobId);
        addNotification(
          {
            type: status === 'Completed' ? 'success' : status === 'Failed' ? 'error' : 'warning',
            title:
              status === 'Completed'
                ? 'Import completed'
                : status === 'Failed'
                  ? 'Import failed'
                  : 'Import cancelled',
            message:
              status === 'Failed'
                ? stageDetail || 'The import failed.'
                : 'View the full import report for details.',
            actionHref: `/app/imports/${jobId}`,
            actionLabel: 'View report',
          },
          true,
          7000,
        );
      }

      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    [addNotification, queryClient, statusToStage, upsertImportJob],
  );

  const handleImportCreated = useCallback(
    (payload: any) => {
      const jobId =
        payload?.jobId ?? payload?.importJobId ?? payload?.ImportJobId ?? payload?.importJobID;
      if (!jobId) return;

      const fileName = payload?.fileName ?? payload?.FileName ?? 'Customer import';
      const queuedAt =
        payload?.queuedAt ?? payload?.createdAt ?? payload?.CreatedAt ?? new Date().toISOString();
      const status = (payload?.status ?? payload?.Status ?? 'Pending') as ImportJobResponse['status'];

      upsertImportJob(jobId, {
        fileName,
        status,
        stage: 'Queued',
        stageDetail: payload?.stageDetail ?? 'Waiting to start...',
        progressPercentage: 0,
        createdAt: queuedAt,
        queuedAt,
        skipDuplicates: payload?.skipDuplicates ?? payload?.SkipDuplicates ?? false,
        totalRecords: payload?.totalRecords ?? payload?.TotalRecords ?? 0,
        actionUrl: payload?.actionUrl ?? payload?.ActionUrl ?? `/app/imports/${jobId}`,
      });
    },
    [upsertImportJob],
  );

  const handleImportStarted = useCallback(
    (payload: any) => {
      const jobId =
        payload?.jobId ?? payload?.importJobId ?? payload?.ImportJobId ?? payload?.importJobID;
      if (!jobId) return;

      const fileName = payload?.fileName ?? payload?.FileName ?? 'Customer import';
      const startedAt = payload?.startedAt ?? payload?.StartedAt ?? new Date().toISOString();

      upsertImportJob(jobId, {
        fileName,
        status: 'Processing',
        stage: (payload?.stage ?? payload?.Stage ?? 'Started') as ImportProcessingStage,
        stageDetail:
          payload?.stageDetail ?? payload?.StageDetail ?? 'Preparing import and reading file...',
        startedAt,
        progressPercentage:
          payload?.progressPercentage ??
          payload?.ProgressPercentage ??
          (payload?.totalRecords && payload?.processedRecords
            ? (payload.processedRecords / payload.totalRecords) * 100
            : 1),
      });

      if (!startedNotifiedJobs.current.has(jobId)) {
        startedNotifiedJobs.current.add(jobId);
        addNotification(
          {
            type: 'info',
            title: 'Import started',
            message: `${fileName} is now processing.`,
            actionHref: `/app/imports/${jobId}`,
            actionLabel: 'View progress',
          },
          true,
          6000,
        );
      }
    },
    [addNotification, upsertImportJob],
  );

  const handleImportProgress = useCallback(
    (payload: any) => {
      const jobId =
        payload?.jobId ?? payload?.importJobId ?? payload?.ImportJobId ?? payload?.importJobID;
      if (!jobId) return;

      const processed =
        payload?.processed ??
        payload?.processedRecords ??
        payload?.ProcessedRecords ??
        payload?.processed_records ??
        0;
      const total =
        payload?.total ??
        payload?.totalRecords ??
        payload?.TotalRecords ??
        payload?.total_records ??
        0;
      const percent =
        payload?.percent ??
        payload?.progressPercentage ??
        payload?.ProgressPercentage ??
        (total > 0 ? (processed / total) * 100 : 0);
      const stage = (payload?.stage ?? payload?.Stage) as ImportProcessingStage | undefined;
      const stageDetail =
        payload?.stageDetail ?? payload?.StageDetail ?? payload?.detail ?? payload?.Detail ?? '';
      const status = (payload?.status ?? payload?.Status ?? 'Processing') as
        | ImportJobResponse['status']
        | undefined;
      const fileName = payload?.fileName ?? payload?.FileName ?? 'Customer import';
      const createdAt = payload?.createdAt ?? payload?.CreatedAt;
      const startedAt = payload?.startedAt ?? payload?.StartedAt;

      const currentBatch =
        payload?.currentBatch ?? payload?.CurrentBatch ?? payload?.batchNumber ?? undefined;
      const totalBatches =
        payload?.totalBatches ??
        payload?.TotalBatches ??
        (total > 0 && payload?.batchSize ? Math.ceil(total / payload.batchSize) : undefined);
      const batchProcessed = payload?.batchProcessed ?? payload?.BatchProcessed ?? undefined;
      const batchSize = payload?.batchSize ?? payload?.BatchSize ?? undefined;

      upsertImportJob(jobId, {
        fileName,
        status: (status as ImportJobResponse['status']) ?? 'Processing',
        type: payload?.type ?? 'Customers',
        importSource: payload?.importSource,
        totalRecords: typeof total === 'number' ? total : undefined,
        processedRecords: typeof processed === 'number' ? processed : undefined,
        progressPercentage: typeof percent === 'number' ? percent : undefined,
        stage: stage ?? undefined,
        stageDetail: stageDetail || payload?.message,
        currentBatch: currentBatch ?? undefined,
        totalBatches: totalBatches ?? undefined,
        batchProcessed: batchProcessed ?? undefined,
        batchSize: batchSize ?? undefined,
        createdAt: createdAt ?? undefined,
        startedAt: startedAt ?? undefined,
      });
    },
    [upsertImportJob],
  );

  // Support session event handlers
  const handleSupportSessionCreated = useCallback(
    (session: SupportSession) => {
      console.log('Support session created:', session);
      setSupportSession(session);
      setActiveMode('support_session');

      // Invalidate support queries
      queryClient.invalidateQueries({ queryKey: ['support'] });
    },
    [setSupportSession, setActiveMode, queryClient],
  );

  const handleSupportSessionClaimed = useCallback(
    (session: SupportSession) => {
      console.log('Support session claimed by admin:', session);
      updateSupportSession(session);

      // Open chat and switch to support mode if not already open
      if (!supportSession) {
        openChat();
        setActiveMode('support_session');
      }
    },
    [updateSupportSession, supportSession, openChat, setActiveMode],
  );

  const handleSupportSessionEscalated = useCallback(
    (data: { sessionId: string; escalationLevel: number; reason?: string }) => {
      console.log('Support session escalated:', data);

      if (supportSession?.id === data.sessionId) {
        updateSupportSession({
          escalationLevel: data.escalationLevel as 0 | 1 | 2 | 3,
          aiEscalationReason: data.reason,
        });
      }
    },
    [supportSession, updateSupportSession],
  );

  const handleSupportSessionClosed = useCallback(
    (data: { sessionId: string }) => {
      console.log('Support session closed:', data);

      if (supportSession?.id === data.sessionId) {
        setSupportSession(null);
        setActiveMode('page_help');
      }

      // Invalidate support queries
      queryClient.invalidateQueries({ queryKey: ['support'] });
    },
    [supportSession, setSupportSession, setActiveMode, queryClient],
  );

  const handleSupportMessageReceived = useCallback(
    (message: SupportMessage) => {
      console.log('Support message received:', message);

      if (supportSession?.id === message.sessionId) {
        addSupportMessage(message);

        // Open chat if message is from admin/AI and chat is closed
        if (!message.isFromUser && !supportSession) {
          openChat();
          setActiveMode('support_session');
        }
      }
    },
    [supportSession, addSupportMessage, openChat, setActiveMode],
  );

  const handleNewSupportRequest = useCallback(
    (session: SupportSession) => {
      console.log('New support request for admin:', session);

      // Only handle if user is admin
      if (user.data?.platformRole === PlatformRole.Admin) {
        // Invalidate admin support queries
        queryClient.invalidateQueries({ queryKey: ['support', 'admin'] });

        // Show notification (could add toast notification here)
        console.log('Admin notification: New support request from', session.userEmail);
      }
    },
    [user.data?.platformRole, queryClient],
  );

  useEffect(() => {
    let isSubscribed = true;
    let unsubscribeReconnect: (() => void) | undefined;

    const setupSignalRConnection = async () => {
      if (!isAuthenticated) {
        console.log('User not authenticated, skipping SignalR connection');
        return;
      }

      const token = getToken();
      if (!token) {
        console.log('No authentication token available, skipping SignalR connection');
        return;
      }

      try {
        console.log('Setting up SignalR connection...');
        await signalRConnection.connect();

        if (!isSubscribed) return;

        seedInflightFromCache();
        await refreshActiveJobs();

        unsubscribeReconnect = signalRConnection.onReconnected(() => {
          refreshActiveJobs();
        });

        if (!isSubscribed) return;

        // Register specific event handlers AFTER connection is established
        signalRConnection.on('analysis_completed', handleAnalysisCompleted);
        signalRConnection.on('import_created', handleImportCreated);
        signalRConnection.on('import_started', handleImportStarted);
        signalRConnection.on('import_completed', handleImportCompleted);
        signalRConnection.on('import_progress', handleImportProgress);

        console.log('Notification event handlers registered');

        // Register support session event handlers with type-safe wrappers
        signalRConnection.on('SupportSessionCreated', (session: unknown) =>
          handleSupportSessionCreated(session as SupportSession),
        );
        signalRConnection.on('SupportSessionClaimed', (session: unknown) =>
          handleSupportSessionClaimed(session as SupportSession),
        );
        signalRConnection.on('SupportSessionEscalated', (data: unknown) =>
          handleSupportSessionEscalated(data as { sessionId: string; escalationLevel: number; reason?: string }),
        );
        signalRConnection.on('SupportSessionClosed', (data: unknown) =>
          handleSupportSessionClosed(data as { sessionId: string }),
        );
        signalRConnection.on('SupportMessageReceived', (message: unknown) =>
          handleSupportMessageReceived(message as SupportMessage),
        );
        signalRConnection.on('NewSupportRequest', (session: unknown) =>
          handleNewSupportRequest(session as SupportSession),
        );

        // Note: Admin support group joining is handled automatically by the server
        // based on user permissions when they connect

        console.log('SignalR event handlers registered');
      } catch (error) {
        console.error('Failed to setup SignalR connection:', error);
      }
    };

    setupSignalRConnection();

    return () => {
      isSubscribed = false;

      // Clean up event handlers
      signalRConnection.off('analysis_completed', handleAnalysisCompleted);
      signalRConnection.off('import_created', handleImportCreated);
      signalRConnection.off('import_started', handleImportStarted);
      signalRConnection.off('import_completed', handleImportCompleted);
      signalRConnection.off('import_progress', handleImportProgress);
      if (unsubscribeReconnect) {
        unsubscribeReconnect();
      }

      // Note: SignalR automatically cleans up handlers on disconnect
      // We don't need to manually remove them since they're wrapped
    };
  }, [
    isAuthenticated,
    handleAnalysisCompleted,
    handleImportCreated,
    handleImportStarted,
    handleImportCompleted,
    handleImportProgress,
    handleSupportSessionCreated,
    handleSupportSessionClaimed,
    handleSupportSessionEscalated,
    handleSupportSessionClosed,
    handleSupportMessageReceived,
    handleNewSupportRequest,
    seedInflightFromCache,
    refreshActiveJobs,
    user.data?.platformRole,
  ]);

  return {
    connectionState: signalRConnection.connectionState,
    isAuthenticated,
  };
};
