import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppPageHeader, ContentLayout } from '@/components/layouts';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/components/ui/notifications';
import {
  useEvaluateTriggersDryRun,
  useGetTestingLabCustomers,
  useGetTestingLabPlaybooks,
  useGetTestingLabProviderSupport,
  useGetTestingLabOpsSnapshot,
  useGetSandboxVerificationConfig,
  useGetSandboxVerificationRuns,
  useGetTestingIntegrations,
  useCreateTestingIntegration,
  useUpdateSandboxVerificationConfig,
  useRunSandboxVerificationNow,
  useSyncTestingIntegration,
  useRunTestingPipeline,
  useInjectTestEvent,
  useResetTestingLab,
  useSimulateTime,
  useGenerateCustomers,
  useGenerateEvents,
  useBackfillIntegration,
  useSimulateSyncs,
  useGetCustomerProfiles,
  useGetEventProfiles,
  useGetIntegrationSyncRunDetail,
  useTestAction,
  DryRunResult,
  TestEventResult,
  TimeSimulationResult,
  TestingLabSyncResult,
  TestingLabIntegrationDetailResponse,
  TestActionResponse,
  SandboxVerificationTargetMode,
  SandboxVerificationRunNowResponse,
  IntegrationTypeLabels,
  ScenarioOptions,
  supportsDataSync,
  supportsActions,
  getIntegrationPurpose,
  getActionTypesForIntegration,
  getDefaultActionConfig,
} from '@/features/admin/api/testing-lab';
import { PlatformAuthorization, useAuthorization } from '@/lib/authorization';

type ActiveTab = 'integrations' | 'playbook-tools';

const eventTypes = [
  'charge.failed',
  'invoice.payment_failed',
  'customer.subscription.deleted',
];

const signalTypes = [
  'payment_failure',
  'inactivity_7d',
  'deal_lost',
];

const timePresets = [
  { label: '+24h', hours: 24 },
  { label: '+48h', hours: 48 },
  { label: '+72h', hours: 72 },
  { label: '+168h (1 week)', hours: 168 },
];

const fallbackIntegrationTypeOptions = [
  { value: 4, label: 'Stripe' },
  { value: 1, label: 'HubSpot' },
  { value: 5, label: 'PostHog' },
  { value: 2, label: 'Pipedrive' },
  { value: 12, label: 'Chargebee' },
  { value: 9, label: 'Zendesk' },
  { value: 8, label: 'Intercom' },
  { value: 11, label: 'Microsoft Teams' },
];

const sandboxVerificationProviders = [
  { integrationType: 4, label: 'Stripe' },
  { integrationType: 1, label: 'HubSpot' },
  { integrationType: 5, label: 'PostHog' },
];

const sandboxVerificationModeOptions: SandboxVerificationTargetMode[] = [
  'Auto',
  'Sandbox',
  'TestingLab',
  'Live',
];

const defaultSandboxVerificationProviderModes: Record<number, SandboxVerificationTargetMode> = {
  4: 'Auto',
  1: 'Auto',
  5: 'Auto',
};

const formatDate = (value?: string | null) => {
  if (!value) return '\u2014';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
};

const formatDuration = (startedAt: string, completedAt?: string | null) => {
  if (!completedAt) return 'Running';

  const startedAtMs = new Date(startedAt).getTime();
  const completedAtMs = new Date(completedAt).getTime();
  if (Number.isNaN(startedAtMs) || Number.isNaN(completedAtMs)) {
    return '\u2014';
  }

  const durationSeconds = Math.max(0, Math.floor((completedAtMs - startedAtMs) / 1000));
  if (durationSeconds < 60) {
    return `${durationSeconds}s`;
  }

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  if (minutes < 60) {
    return `${minutes}m ${seconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

const normalizeQualityStatus = (status?: string | null) => {
  const normalized = (status ?? '').trim().toLowerCase();
  if (normalized === 'healthy') return 'healthy';
  if (normalized === 'critical') return 'critical';
  return 'warning';
};

const getQualityStatusPillClass = (status?: string | null) => {
  const normalized = normalizeQualityStatus(status);
  if (normalized === 'healthy') {
    return 'bg-success-muted/20 text-success-muted border-success-muted/40';
  }

  if (normalized === 'critical') {
    return 'bg-error-muted/20 text-error-muted border-error-muted/40';
  }

  return 'bg-warning-muted/20 text-warning-muted border-warning-muted/40';
};

const getQualityGradeBadgeClass = (grade?: string | null) => {
  const normalizedGrade = (grade ?? '').trim().toUpperCase();
  if (normalizedGrade === 'A' || normalizedGrade === 'B') {
    return 'bg-success-muted/20 text-success-muted border-success-muted/40';
  }

  if (normalizedGrade === 'C') {
    return 'bg-warning-muted/20 text-warning-muted border-warning-muted/40';
  }

  return 'bg-error-muted/20 text-error-muted border-error-muted/40';
};

const ConfirmationModal = ({
  title,
  message,
  confirmText,
  onClose,
  onConfirm,
  loading = false,
}: {
  title: string;
  message: string;
  confirmText: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-surface-secondary/90 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-xl max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
      <p className="text-text-secondary mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 bg-surface-primary/50 text-text-primary rounded-lg hover:bg-surface-primary transition-colors font-medium text-sm border border-border-primary/50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2 bg-red-500/80 text-white hover:bg-red-500 disabled:opacity-50"
        >
          {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

// ─── Integration Management Section ───

const IntegrationManagementSection = () => {
  const { addNotification } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();

  const [createType, setCreateType] = useState(4);
  const [createScenario, setCreateScenario] = useState('stable_growth');
  const [createSeed, setCreateSeed] = useState('42');
  const [expandedIntegrationId, setExpandedIntegrationId] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<TestingLabSyncResult | null>(null);
  const [latestSandboxRunResult, setLatestSandboxRunResult] =
    useState<SandboxVerificationRunNowResponse | null>(null);
  const [sandboxVerificationEnabled, setSandboxVerificationEnabled] = useState(false);
  const [sandboxVerificationAllowFallback, setSandboxVerificationAllowFallback] = useState(true);
  const [sandboxVerificationAlertOnRegression, setSandboxVerificationAlertOnRegression] = useState(true);
  const [sandboxVerificationScoreDropThreshold, setSandboxVerificationScoreDropThreshold] = useState(10);
  const [sandboxVerificationProviderModes, setSandboxVerificationProviderModes] = useState<
    Record<number, SandboxVerificationTargetMode>
  >(defaultSandboxVerificationProviderModes);

  const { data: integrations, isLoading: integrationsLoading } = useGetTestingIntegrations();
  const { data: providerSupport } = useGetTestingLabProviderSupport();
  const { data: opsSnapshot, isLoading: opsSnapshotLoading } = useGetTestingLabOpsSnapshot({
    refetchInterval: 30000,
  });
  const { data: sandboxVerificationConfig, isLoading: sandboxVerificationConfigLoading } =
    useGetSandboxVerificationConfig();
  const { data: sandboxVerificationRuns, isLoading: sandboxVerificationRunsLoading } =
    useGetSandboxVerificationRuns(15, { refetchInterval: 30000 });
  const providerSupportByType = useMemo(
    () => new Map((providerSupport ?? []).map((support) => [support.integrationType, support])),
    [providerSupport]
  );
  const createProviderOptions = useMemo(() => {
    if (!providerSupport || providerSupport.length === 0) {
      return fallbackIntegrationTypeOptions;
    }

    return providerSupport
      .filter((support) => support.canCreateIntegration)
      .map((support) => ({
        value: support.integrationType,
        label: `${IntegrationTypeLabels[support.integrationType] ?? support.provider}${support.parityLevel === 'PartialParity' ? ' (Partial)' : ''}`,
      }));
  }, [providerSupport]);
  const selectedProviderSupport = providerSupportByType.get(createType);

  useEffect(() => {
    if (createProviderOptions.length === 0) {
      return;
    }

    if (!createProviderOptions.some((option) => option.value === createType)) {
      setCreateType(createProviderOptions[0].value);
    }
  }, [createProviderOptions, createType]);

  useEffect(() => {
    if (!sandboxVerificationConfig) {
      return;
    }

    setSandboxVerificationEnabled(sandboxVerificationConfig.enabled);
    setSandboxVerificationAllowFallback(sandboxVerificationConfig.allowModeFallback);
    setSandboxVerificationAlertOnRegression(sandboxVerificationConfig.alertOnRegression);
    setSandboxVerificationScoreDropThreshold(sandboxVerificationConfig.regressionScoreDropThreshold);

    const nextModes: Record<number, SandboxVerificationTargetMode> = {
      ...defaultSandboxVerificationProviderModes,
    };

    for (const providerMode of sandboxVerificationConfig.providerModes ?? []) {
      const mode = providerMode.targetMode as SandboxVerificationTargetMode;
      if (sandboxVerificationModeOptions.includes(mode)) {
        nextModes[providerMode.integrationType] = mode;
      }
    }

    setSandboxVerificationProviderModes(nextModes);
  }, [sandboxVerificationConfig]);

  const selectedRunIntegrationId = searchParams.get('integrationId') ?? '';
  const selectedSyncRunId = searchParams.get('syncRunId') ?? '';
  const {
    data: selectedSyncRunDetail,
    isLoading: selectedSyncRunDetailLoading,
    isError: selectedSyncRunDetailError,
  } = useGetIntegrationSyncRunDetail(
    {
      integrationId: selectedRunIntegrationId,
      syncRunId: selectedSyncRunId,
      logLimit: 150,
    },
    {
      enabled: Boolean(selectedRunIntegrationId && selectedSyncRunId),
    }
  );

  const createMutation = useCreateTestingIntegration({
    mutationConfig: {
      onSuccess: (data) => {
        const parityWarning = data.parityWarning ? ` ${data.parityWarning}` : '';
        addNotification({
          type: 'success',
          title: 'Integration Created',
          message: `${IntegrationTypeLabels[data.integrationType]} testing integration created.${parityWarning}`,
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: error instanceof Error ? error.message : 'Failed to create integration',
        });
      },
    },
  });

  const syncMutation = useSyncTestingIntegration({
    mutationConfig: {
      onSuccess: (data) => {
        setSyncResult(data);
        const parityWarning = data.parityWarning ? ` ${data.parityWarning}` : '';
        const syncMessage = data.queued
          ? `Sync queued. Run ${data.syncRunId} (${data.customersCreated} customers, ${data.eventsCreated} events prepared).${parityWarning}`
          : `Sync completed. Run ${data.syncRunId} processed ${data.customersCreated} customers and ${data.eventsCreated} events.${parityWarning}`;
        addNotification({
          type: 'success',
          title: data.queued ? 'Sync Queued' : 'Sync Complete',
          message: syncMessage,
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Sync Failed',
          message: error instanceof Error ? error.message : 'Failed to sync integration',
        });
      },
    },
  });

  const pipelineMutation = useRunTestingPipeline({
    mutationConfig: {
      onSuccess: (data) => {
        setSyncResult(data);
        addNotification({
          type: 'success',
          title: 'Pipeline Complete',
          message: `Pipeline run ${data.syncRunId} completed: ${data.customersCreated} customers and ${data.eventsCreated} events.`,
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Pipeline Failed',
          message: error instanceof Error ? error.message : 'Failed to run pipeline',
        });
      },
    },
  });

  const updateSandboxVerificationConfigMutation = useUpdateSandboxVerificationConfig({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Sandbox Verification Saved',
          message: 'Nightly sandbox verification settings were updated.',
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Sandbox Verification Save Failed',
          message: error instanceof Error ? error.message : 'Failed to save sandbox verification settings',
        });
      },
    },
  });

  const runSandboxVerificationNowMutation = useRunSandboxVerificationNow({
    mutationConfig: {
      onSuccess: (data) => {
        setLatestSandboxRunResult(data);
        addNotification({
          type: 'success',
          title: 'Sandbox Verification Complete',
          message: `Completed ${data.completedProviders}/${data.attemptedProviders} provider checks.`,
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Sandbox Verification Failed',
          message: error instanceof Error ? error.message : 'Failed to run sandbox verification',
        });
      },
    },
  });

  const handleCreate = () => {
    const seed = createSeed.trim() === '' ? null : Number(createSeed);
    createMutation.mutate({
      integrationType: createType,
      scenario: createScenario,
      seed: Number.isNaN(seed) ? null : seed,
      autoSyncEnabled: false,
    });
  };

  const handleSync = (integrationId: string) => {
    syncMutation.mutate({
      integrationId,
      request: {
        customerCount: 10,
        eventsPerCustomerPerMonth: 2,
        generateCustomers: true,
        waitForCompletion: false,
      },
    });
  };

  const handleRunPipeline = (integrationId: string) => {
    pipelineMutation.mutate({
      integrationId,
      customerCount: 10,
      eventsPerCustomerPerMonth: 2,
    });
  };

  const updateSandboxProviderMode = (
    integrationType: number,
    mode: SandboxVerificationTargetMode
  ) => {
    setSandboxVerificationProviderModes((previous) => ({
      ...previous,
      [integrationType]: mode,
    }));
  };

  const handleSaveSandboxVerificationConfig = () => {
    updateSandboxVerificationConfigMutation.mutate({
      enabled: sandboxVerificationEnabled,
      allowModeFallback: sandboxVerificationAllowFallback,
      alertOnRegression: sandboxVerificationAlertOnRegression,
      regressionScoreDropThreshold: sandboxVerificationScoreDropThreshold,
      providerModes: sandboxVerificationProviders.map((provider) => ({
        integrationType: provider.integrationType,
        targetMode:
          sandboxVerificationProviderModes[provider.integrationType] ?? 'Auto',
      })),
    });
  };

  const handleRunSandboxVerificationNow = () => {
    runSandboxVerificationNowMutation.mutate(undefined);
  };

  const toggleExpand = (id: string) => {
    setExpandedIntegrationId((prev) => (prev === id ? null : id));
  };

  const openSyncRunDetail = (result: TestingLabSyncResult) => {
    setSearchParams({
      integrationId: result.integrationId,
      syncRunId: result.syncRunId,
    });
  };

  const clearSyncRunDetail = () => {
    setSearchParams({});
  };

  const selectedRunMetrics = selectedSyncRunDetail?.metrics ?? null;
  const selectedRunQuality = selectedSyncRunDetail?.qualityGrade ?? null;
  const selectedRunIssues = selectedSyncRunDetail?.issues ?? null;
  const selectedRunDownstream = selectedSyncRunDetail?.downstreamOutcomes ?? null;
  const selectedRunAffectedCustomers = selectedSyncRunDetail?.affectedCustomers ?? [];
  const selectedRunWarningAndErrorLogs = useMemo(
    () =>
      (selectedSyncRunDetail?.logs ?? [])
        .filter((log) => log.level === 'Warn' || log.level === 'Error')
        .slice(-8),
    [selectedSyncRunDetail]
  );

  return (
    <div className="space-y-6">
      {/* Create Integration */}
      <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Create Mock Integration</h2>
        <p className="text-sm text-text-secondary">
          Set up a mock integration that simulates real provider data through the standard sync pipeline.
          Use <span className="text-text-primary font-medium">Scenario</span> to shape behavior (growth, risk, seasonality),
          and <span className="text-text-primary font-medium">Seed</span> to make data reproducible. Re‑use the same seed across providers to enrich the same customers by email.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-text-secondary">Provider</label>
            <select
              className="w-full mt-1 bg-surface-secondary border border-border-primary rounded-lg px-3 py-2 text-text-primary"
              value={createType}
              onChange={(e) => setCreateType(Number(e.target.value))}
            >
              {createProviderOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-text-secondary">Scenario</label>
            <select
              className="w-full mt-1 bg-surface-secondary border border-border-primary rounded-lg px-3 py-2 text-text-primary"
              value={createScenario}
              onChange={(e) => setCreateScenario(e.target.value)}
            >
              {ScenarioOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-text-secondary mt-1">Controls generated behavior (e.g., steady growth, high risk, seasonality, plan changes).</p>
          </div>
          <div>
            <label className="text-sm text-text-secondary">Seed</label>
            <input
              type="number"
              value={createSeed}
              onChange={(e) => setCreateSeed(e.target.value)}
              placeholder="e.g. 42"
              className="w-full mt-1 bg-surface-secondary border border-border-primary rounded-lg px-3 py-2 text-text-primary"
            />
            <p className="text-xs text-text-secondary mt-1">Same scenario + same seed = same dataset. Use the same seed across providers to enrich the same customers.</p>
          </div>
        </div>
        {selectedProviderSupport?.parityLevel === 'PartialParity' && (
          <div className="text-xs text-warning bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
            Partial parity for this provider. {selectedProviderSupport.warning}
          </div>
        )}
        <button
          onClick={handleCreate}
          disabled={createMutation.isPending}
          className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {createMutation.isPending ? (
            <>
              <Spinner size="sm" /> Creating...
            </>
          ) : (
            'Create Integration'
          )}
        </button>
      </div>

      {/* Sandbox Verification */}
      <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Sandbox Verification</h2>
          {(sandboxVerificationConfigLoading || sandboxVerificationRunsLoading) && <Spinner size="sm" />}
        </div>

        <p className="text-sm text-text-secondary">
          Nightly verification reuses the same sync pipeline and can run each core provider in
          <span className="text-text-primary font-medium"> Sandbox</span>,
          <span className="text-text-primary font-medium"> TestingLab</span>, or
          <span className="text-text-primary font-medium"> Live</span> mode.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={sandboxVerificationEnabled}
              onChange={(event) => setSandboxVerificationEnabled(event.target.checked)}
            />
            Enable nightly run
          </label>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={sandboxVerificationAllowFallback}
              onChange={(event) => setSandboxVerificationAllowFallback(event.target.checked)}
            />
            Allow fallback mode
          </label>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={sandboxVerificationAlertOnRegression}
              onChange={(event) => setSandboxVerificationAlertOnRegression(event.target.checked)}
            />
            Alert on regression
          </label>
          <label className="text-sm text-text-secondary">
            Score drop threshold
            <input
              type="number"
              min={1}
              max={100}
              value={sandboxVerificationScoreDropThreshold}
              onChange={(event) =>
                setSandboxVerificationScoreDropThreshold(
                  Math.max(1, Math.min(100, Number(event.target.value || 10)))
                )
              }
              className="w-full mt-1 bg-surface-secondary border border-border-primary rounded-lg px-3 py-2 text-text-primary"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sandboxVerificationProviders.map((provider) => (
            <div
              key={provider.integrationType}
              className="bg-surface-secondary/40 border border-border-primary/40 rounded-lg p-3"
            >
              <div className="text-xs text-text-secondary">{provider.label}</div>
              <select
                className="w-full mt-1 bg-surface-secondary border border-border-primary rounded-lg px-3 py-2 text-text-primary"
                value={sandboxVerificationProviderModes[provider.integrationType] ?? 'Auto'}
                onChange={(event) =>
                  updateSandboxProviderMode(
                    provider.integrationType,
                    event.target.value as SandboxVerificationTargetMode
                  )
                }
              >
                {sandboxVerificationModeOptions.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSaveSandboxVerificationConfig}
            disabled={updateSandboxVerificationConfigMutation.isPending}
            className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {updateSandboxVerificationConfigMutation.isPending ? (
              <>
                <Spinner size="sm" /> Saving...
              </>
            ) : (
              'Save Verification Settings'
            )}
          </button>

          <button
            onClick={handleRunSandboxVerificationNow}
            disabled={runSandboxVerificationNowMutation.isPending}
            className="px-4 py-2 bg-surface-secondary text-text-primary border border-border-primary rounded-lg hover:bg-surface-secondary/70 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {runSandboxVerificationNowMutation.isPending ? (
              <>
                <Spinner size="sm" /> Running...
              </>
            ) : (
              'Run Verification Now'
            )}
          </button>
        </div>

        <div className="text-xs text-text-secondary">
          Nightly cron: <span className="text-text-primary">{sandboxVerificationConfig?.nightlyCron ?? '0 3 * * *'}</span>
          {' | '}
          Last run: <span className="text-text-primary">{formatDate(sandboxVerificationConfig?.lastRunAt)}</span>
          {' | '}
          Last error: <span className="text-text-primary">{sandboxVerificationConfig?.lastRunError ?? '\u2014'}</span>
        </div>

        {latestSandboxRunResult && (
          <div className="text-xs text-text-secondary">
            Latest manual run: completed {latestSandboxRunResult.completedProviders}/
            {latestSandboxRunResult.attemptedProviders}, failed {latestSandboxRunResult.failedProviders},
            skipped {latestSandboxRunResult.skippedProviders}, regressions {latestSandboxRunResult.regressionsDetected}.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-text-secondary border-b border-border-primary/40">
              <tr>
                <th className="text-left py-2 px-2">Started</th>
                <th className="text-left py-2 px-2">Provider</th>
                <th className="text-left py-2 px-2">Requested</th>
                <th className="text-left py-2 px-2">Effective</th>
                <th className="text-left py-2 px-2">Status</th>
                <th className="text-left py-2 px-2">Quality</th>
                <th className="text-left py-2 px-2">Regression</th>
              </tr>
            </thead>
            <tbody>
              {(sandboxVerificationRuns ?? []).map((run) => (
                <tr key={run.id} className="border-b border-border-primary/20 text-text-secondary">
                  <td className="py-2 px-2">{formatDate(run.startedAt)}</td>
                  <td className="py-2 px-2">{IntegrationTypeLabels[run.integrationType] ?? run.integrationType}</td>
                  <td className="py-2 px-2">{run.requestedMode}</td>
                  <td className="py-2 px-2">
                    {run.effectiveMode ?? '\u2014'}
                    {run.usedFallbackMode ? ' (fallback)' : ''}
                  </td>
                  <td className="py-2 px-2">{run.status}</td>
                  <td className="py-2 px-2">
                    {run.qualityGrade ? `${run.qualityGrade} (${run.qualityScore ?? '\u2014'})` : '\u2014'}
                  </td>
                  <td className="py-2 px-2">
                    {run.regressionDetected ? run.regressionReason ?? 'Detected' : 'No'}
                  </td>
                </tr>
              ))}
              {!sandboxVerificationRunsLoading && (sandboxVerificationRuns?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-text-muted">
                    No sandbox verification history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operations Snapshot */}
      <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Operations Snapshot</h2>
          {opsSnapshotLoading && <Spinner size="sm" />}
        </div>
        <p className="text-sm text-text-secondary">
          Live parity-health view for Testing Lab integrations: failed sync runs, outbox backlog tied to testing sync correlations,
          and mock route mismatch failures detected from sync logs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="bg-surface-secondary/50 border border-border-primary/40 rounded-lg p-3">
            <div className="text-xs text-text-secondary">Testing Integrations</div>
            <div className="text-xl font-semibold text-text-primary">{opsSnapshot?.testingIntegrationCount ?? 0}</div>
          </div>
          <div className="bg-surface-secondary/50 border border-border-primary/40 rounded-lg p-3">
            <div className="text-xs text-text-secondary">Outbox Pending</div>
            <div className="text-xl font-semibold text-text-primary">{opsSnapshot?.outboxBacklog.pendingCount ?? 0}</div>
          </div>
          <div className="bg-surface-secondary/50 border border-border-primary/40 rounded-lg p-3">
            <div className="text-xs text-text-secondary">Outbox Failed</div>
            <div className="text-xl font-semibold text-text-primary">{opsSnapshot?.outboxBacklog.failedCount ?? 0}</div>
          </div>
          <div className="bg-surface-secondary/50 border border-border-primary/40 rounded-lg p-3">
            <div className="text-xs text-text-secondary">Route Mismatch Failures</div>
            <div className="text-xl font-semibold text-text-primary">{opsSnapshot?.routeMismatchFailures.length ?? 0}</div>
          </div>
          <div className="bg-surface-secondary/50 border border-border-primary/40 rounded-lg p-3">
            <div className="text-xs text-text-secondary">Healthy Sync Runs</div>
            <div className="text-xl font-semibold text-success-muted">{opsSnapshot?.syncQuality.healthyRunCount ?? 0}</div>
          </div>
          <div className="bg-surface-secondary/50 border border-border-primary/40 rounded-lg p-3">
            <div className="text-xs text-text-secondary">Critical Sync Runs</div>
            <div className="text-xl font-semibold text-error-muted">{opsSnapshot?.syncQuality.criticalRunCount ?? 0}</div>
          </div>
        </div>

        {opsSnapshot && (
          <div className="text-xs text-text-secondary">
            Generated: <span className="text-text-primary">{formatDate(opsSnapshot.generatedAt)}</span>
            {' | '}
            Correlations tracked: <span className="text-text-primary">{opsSnapshot.syncRunCorrelationCount}</span>
            {' | '}
            Graded runs: <span className="text-text-primary">{opsSnapshot.syncQuality.evaluatedRunCount}</span>
            {' | '}
            Oldest pending outbox event:{' '}
            <span className="text-text-primary">{formatDate(opsSnapshot.outboxBacklog.oldestPendingOccurredAt)}</span>
          </div>
        )}

        {opsSnapshot && (
          <div className="text-xs text-text-secondary">
            Grade distribution:{' '}
            <span className="text-text-primary">
              {Object.keys(opsSnapshot.syncQuality.gradeDistribution).length > 0
                ? Object.entries(opsSnapshot.syncQuality.gradeDistribution)
                    .map(([grade, count]) => `${grade}:${count}`)
                    .join(' | ')
                : 'No graded runs yet'}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-surface-secondary/40 border border-border-primary/40 rounded-xl p-4 space-y-2">
            <div className="text-sm font-medium text-text-primary">Failed Sync Runs</div>
            {opsSnapshot && opsSnapshot.failedSyncRuns.length > 0 ? (
              <div className="space-y-2 text-xs">
                {opsSnapshot.failedSyncRuns.map((failedRun) => (
                  <div key={failedRun.syncRunId} className="border border-border-primary/30 rounded-lg p-2 bg-surface-primary/30">
                    <div className="text-text-primary font-mono">{failedRun.syncRunId}</div>
                    <div className="text-text-secondary">
                      {IntegrationTypeLabels[failedRun.integrationType] ?? failedRun.integrationType}
                      {' | '}
                      {failedRun.status}
                      {' | '}
                      {formatDate(failedRun.startedAt)}
                    </div>
                    {failedRun.errorSummary && (
                      <div className="text-error-muted mt-1">{failedRun.errorSummary}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-text-secondary">No failed sync runs in the current snapshot.</div>
            )}
          </div>

          <div className="bg-surface-secondary/40 border border-border-primary/40 rounded-xl p-4 space-y-2">
            <div className="text-sm font-medium text-text-primary">Non-Healthy Quality Runs</div>
            {opsSnapshot && opsSnapshot.syncQuality.latestNonHealthyRuns.length > 0 ? (
              <div className="space-y-2 text-xs">
                {opsSnapshot.syncQuality.latestNonHealthyRuns.map((qualityRun) => (
                  <div key={qualityRun.syncRunId} className="border border-border-primary/30 rounded-lg p-2 bg-surface-primary/30">
                    <div className="text-text-primary font-mono">{qualityRun.syncRunId}</div>
                    <div className="text-text-secondary">
                      {IntegrationTypeLabels[qualityRun.integrationType] ?? qualityRun.integrationType}
                      {' | '}
                      {formatDate(qualityRun.startedAt)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getQualityGradeBadgeClass(qualityRun.grade)}`}
                      >
                        Grade {qualityRun.grade}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getQualityStatusPillClass(qualityRun.status)}`}
                      >
                        {qualityRun.status}
                      </span>
                      <span className="text-text-primary">Score {qualityRun.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-text-secondary">No warning or critical sync quality runs detected.</div>
            )}
          </div>

          <div className="bg-surface-secondary/40 border border-border-primary/40 rounded-xl p-4 space-y-2">
            <div className="text-sm font-medium text-text-primary">Route Mismatch Failures</div>
            {opsSnapshot && opsSnapshot.routeMismatchFailures.length > 0 ? (
              <div className="space-y-2 text-xs">
                {opsSnapshot.routeMismatchFailures.map((mismatch) => (
                  <div key={`${mismatch.syncRunId}-${mismatch.logId ?? mismatch.timestamp}`} className="border border-border-primary/30 rounded-lg p-2 bg-surface-primary/30">
                    <div className="text-text-primary">{mismatch.scope}</div>
                    <div className="text-text-secondary">{formatDate(mismatch.timestamp)}</div>
                    <div className="text-warning mt-1">{mismatch.message}</div>
                    <div className="text-text-secondary mt-1 font-mono">{mismatch.correlationId}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-text-secondary">No route mismatch failures detected.</div>
            )}
          </div>
        </div>
      </div>

      {/* Existing Integrations */}
      <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Testing Lab Integrations</h2>
          {integrationsLoading && <Spinner size="sm" />}
        </div>
        <p className="text-sm text-text-secondary">
          Tip: <span className="text-text-primary font-medium">Run Pipeline</span> is the simplest option (create ~10 customers + ~2 events/customer over the last 30 days, sync, and trigger churn).
          For full control, use <span className="text-text-primary font-medium">Generate Customers</span> → <span className="text-text-primary font-medium">Generate Events</span> → <span className="text-text-primary font-medium">Sync</span>.
          For history/trends, try <span className="text-text-primary font-medium">Backfill 12mo</span> or <span className="text-text-primary font-medium">Simulate 6 Syncs</span>.
        </p>

        {!integrationsLoading && (!integrations || integrations.length === 0) && (
          <p className="text-sm text-text-muted py-4 text-center">
            No testing integrations yet. Create one above to get started.
          </p>
        )}

        <div className="space-y-3">
          {integrations?.map((integration) => (
            <IntegrationCard
              key={integration.integrationId}
              integration={integration}
              isExpanded={expandedIntegrationId === integration.integrationId}
              onToggleExpand={() => toggleExpand(integration.integrationId)}
              onSync={() => handleSync(integration.integrationId)}
              onRunPipeline={() => handleRunPipeline(integration.integrationId)}
              isSyncing={syncMutation.isPending}
              isPipelineRunning={pipelineMutation.isPending}
            />
          ))}
        </div>

        {syncResult && (
          <div className="bg-surface-secondary/50 border border-border-primary/40 rounded-xl p-4 text-sm space-y-2">
            <div className="text-text-primary font-medium">Last Operation Result</div>
            <div className="text-text-secondary">
              Sync run: <span className="text-text-primary font-mono">{syncResult.syncRunId}</span>
            </div>
            <div className="text-text-secondary">
              Queue state:{' '}
              <span className="text-text-primary">
                {syncResult.queued ? 'Queued' : 'Executed inline'}
              </span>
            </div>
            <div className="text-text-secondary">
              Parity level: <span className="text-text-primary">{syncResult.parityLevel}</span>
            </div>
            {syncResult.parityWarning && (
              <div className="text-warning">
                Warning: {syncResult.parityWarning}
              </div>
            )}
            {syncResult.syncJobId && (
              <div className="text-text-secondary">
                Job ID: <span className="text-text-primary font-mono">{syncResult.syncJobId}</span>
              </div>
            )}
            <div className="text-text-secondary">
              Queued at: <span className="text-text-primary">{formatDate(syncResult.queuedAt)}</span>
            </div>
            <div className="text-text-secondary">
              Customers created: <span className="text-text-primary">{syncResult.customersCreated}</span>
            </div>
            <div className="text-text-secondary">
              Events created: <span className="text-text-primary">{syncResult.eventsCreated}</span>
            </div>
            <div className="text-text-secondary">
              Period: <span className="text-text-primary">{formatDate(syncResult.startDate)}</span>
              {' \u2192 '}
              <span className="text-text-primary">{formatDate(syncResult.endDate)}</span>
            </div>
            <div className="pt-2">
              <button
                onClick={() => openSyncRunDetail(syncResult)}
                className="px-3 py-1.5 bg-surface-primary/60 border border-border-primary/50 rounded-lg text-text-primary hover:bg-surface-primary transition-colors"
              >
                View Sync Run Details
              </button>
            </div>
          </div>
        )}

        {selectedSyncRunId && (
          <div className="bg-surface-secondary/40 border border-border-primary/40 rounded-xl p-4 text-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-text-primary font-medium">Selected Sync Run Detail</div>
              <button
                onClick={clearSyncRunDetail}
                className="text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="text-text-secondary">
              Integration: <span className="text-text-primary font-mono">{selectedRunIntegrationId}</span>
            </div>
            <div className="text-text-secondary">
              Sync run: <span className="text-text-primary font-mono">{selectedSyncRunId}</span>
            </div>

            {selectedSyncRunDetailLoading && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Spinner size="sm" /> Loading sync run detail...
              </div>
            )}

            {selectedSyncRunDetailError && !selectedSyncRunDetailLoading && (
              <div className="text-error-muted">
                Unable to load sync run detail for this run.
              </div>
            )}

            {selectedSyncRunDetail && !selectedSyncRunDetailLoading && (
              <div className="space-y-4 text-text-secondary">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                  <div className="bg-surface-primary/35 border border-border-primary/30 rounded-lg p-3">
                    <div className="text-xs text-text-secondary">Status</div>
                    <div className="text-sm font-semibold text-text-primary">{selectedSyncRunDetail.status}</div>
                  </div>
                  <div className="bg-surface-primary/35 border border-border-primary/30 rounded-lg p-3">
                    <div className="text-xs text-text-secondary">Mode</div>
                    <div className="text-sm font-semibold text-text-primary">{selectedSyncRunDetail.mode}</div>
                  </div>
                  <div className="bg-surface-primary/35 border border-border-primary/30 rounded-lg p-3">
                    <div className="text-xs text-text-secondary">Started</div>
                    <div className="text-sm font-semibold text-text-primary">{formatDate(selectedSyncRunDetail.startedAt)}</div>
                  </div>
                  <div className="bg-surface-primary/35 border border-border-primary/30 rounded-lg p-3">
                    <div className="text-xs text-text-secondary">Completed</div>
                    <div className="text-sm font-semibold text-text-primary">{formatDate(selectedSyncRunDetail.completedAt)}</div>
                  </div>
                  <div className="bg-surface-primary/35 border border-border-primary/30 rounded-lg p-3">
                    <div className="text-xs text-text-secondary">Quality Grade</div>
                    {selectedRunQuality ? (
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getQualityGradeBadgeClass(selectedRunQuality.grade)}`}
                        >
                          {selectedRunQuality.grade}
                        </span>
                        <span className="text-sm font-semibold text-text-primary">{selectedRunQuality.score}</span>
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-text-secondary">Unavailable</div>
                    )}
                  </div>
                </div>

                <div className="text-text-secondary text-xs">
                  Correlation:{' '}
                  <span className="text-text-primary font-mono break-all">{selectedSyncRunDetail.correlationId}</span>
                  {' | '}Logs: <span className="text-text-primary">{selectedSyncRunDetail.returnedLogCount}</span>
                  {selectedSyncRunDetail.logsTruncated ? ' (truncated)' : ''}
                </div>

                {selectedSyncRunDetail.errorSummary && (
                  <div className="text-xs text-error-muted bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                    {selectedSyncRunDetail.errorSummary}
                  </div>
                )}

                {selectedRunQuality && (
                  <div className="bg-surface-primary/35 border border-border-primary/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-text-secondary">Sync Quality Grade</div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getQualityStatusPillClass(selectedRunQuality.status)}`}
                      >
                        {selectedRunQuality.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                      <div>
                        Overall: <span className="text-text-primary">{selectedRunQuality.score}</span>
                      </div>
                      <div>
                        Ingestion: <span className="text-text-primary">{selectedRunQuality.ingestionScore}</span>
                      </div>
                      <div>
                        Extraction: <span className="text-text-primary">{selectedRunQuality.extractionScore}</span>
                      </div>
                      <div>
                        Projection: <span className="text-text-primary">{selectedRunQuality.projectionScore}</span>
                      </div>
                      <div>
                        Downstream: <span className="text-text-primary">{selectedRunQuality.downstreamScore}</span>
                      </div>
                    </div>
                    {selectedRunQuality.criticalIssues.length > 0 && (
                      <div className="text-xs text-text-secondary">
                        Critical issues:{' '}
                        <span className="text-text-primary">{selectedRunQuality.criticalIssues.join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-xs text-text-secondary">Run Metrics</div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-surface-primary/35 border border-border-primary/30 rounded-lg p-3">
                      <div className="text-xs text-text-secondary">Pulled</div>
                      <div className="text-lg font-semibold text-text-primary">{selectedRunMetrics?.pulled ?? 0}</div>
                    </div>
                    <div className="bg-surface-primary/35 border border-border-primary/30 rounded-lg p-3">
                      <div className="text-xs text-text-secondary">Mapped</div>
                      <div className="text-lg font-semibold text-text-primary">{selectedRunMetrics?.mapped ?? 0}</div>
                    </div>
                    <div className="bg-surface-primary/35 border border-border-primary/30 rounded-lg p-3">
                      <div className="text-xs text-text-secondary">Updated</div>
                      <div className="text-lg font-semibold text-text-primary">{selectedRunMetrics?.updated ?? 0}</div>
                    </div>
                    <div className="bg-surface-primary/35 border border-border-primary/30 rounded-lg p-3">
                      <div className="text-xs text-text-secondary">Failed</div>
                      <div className="text-lg font-semibold text-text-primary">{selectedRunMetrics?.failed ?? 0}</div>
                    </div>
                    <div className="bg-surface-primary/35 border border-border-primary/30 rounded-lg p-3">
                      <div className="text-xs text-text-secondary">Affected Customers</div>
                      <div className="text-lg font-semibold text-text-primary">{selectedRunMetrics?.affectedCustomers ?? 0}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-surface-primary/35 border border-border-primary/30 rounded-lg p-3 space-y-2">
                    <div className="text-xs text-text-secondary">Warnings / Errors</div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        Warning logs: <span className="text-text-primary">{selectedRunIssues?.warningLogCount ?? 0}</span>
                      </div>
                      <div>
                        Error logs: <span className="text-text-primary">{selectedRunIssues?.errorLogCount ?? 0}</span>
                      </div>
                      <div>
                        Failed steps: <span className="text-text-primary">{selectedRunIssues?.failedStepCount ?? 0}</span>
                      </div>
                      <div>
                        Skipped steps: <span className="text-text-primary">{selectedRunIssues?.skippedStepCount ?? 0}</span>
                      </div>
                    </div>
                    <div className="text-xs">
                      Persistence:{' '}
                      <span className="text-text-primary">
                        {selectedRunMetrics?.persistenceAttempted ? 'Attempted' : 'Not attempted'}
                      </span>
                      {' | '}Inserted:{' '}
                      <span className="text-text-primary">{selectedRunMetrics?.persistenceInserted ?? 0}</span>
                      {' | '}Duplicates:{' '}
                      <span className="text-text-primary">{selectedRunMetrics?.persistenceDuplicates ?? 0}</span>
                      {' | '}Errors:{' '}
                      <span className="text-text-primary">{selectedRunMetrics?.persistenceErrors ?? 0}</span>
                    </div>
                  </div>

                  <div className="bg-surface-primary/35 border border-border-primary/30 rounded-lg p-3 space-y-2">
                    <div className="text-xs text-text-secondary">Downstream Outcomes</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        Outbox emitted:{' '}
                        <span className="text-text-primary">{selectedRunDownstream?.outboxEmitted ?? 0}</span>
                      </div>
                      <div>
                        Outbox processed:{' '}
                        <span className="text-text-primary">{selectedRunDownstream?.outboxProcessed ?? 0}</span>
                      </div>
                      <div>
                        Outbox failed:{' '}
                        <span className="text-text-primary">{selectedRunDownstream?.outboxFailed ?? 0}</span>
                      </div>
                      <div>
                        Recompute queued:{' '}
                        <span className="text-text-primary">{selectedRunDownstream?.recomputeQueued ?? 0}</span>
                      </div>
                      <div>
                        Recompute processed:{' '}
                        <span className="text-text-primary">{selectedRunDownstream?.recomputeProcessed ?? 0}</span>
                      </div>
                      <div>
                        Recompute failed:{' '}
                        <span className="text-text-primary">{selectedRunDownstream?.recomputeFailed ?? 0}</span>
                      </div>
                      <div>
                        Churn risk changed:{' '}
                        <span className="text-text-primary">{selectedRunDownstream?.churnRiskChanged ?? 0}</span>
                      </div>
                      <div>
                        Segment deltas:{' '}
                        <span className="text-text-primary">{selectedRunDownstream?.segmentMembershipChanged ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-primary/35 border border-border-primary/30 rounded-lg p-3 space-y-2">
                  <div className="text-xs text-text-secondary">Step Metrics</div>
                  <div className="space-y-2">
                    {selectedSyncRunDetail.steps.map((step) => (
                      <div key={step.id} className="border border-border-primary/25 rounded-lg px-3 py-2 bg-surface-secondary/30">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-text-primary font-medium">{step.stepKey}</div>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                              step.status === 'Completed'
                                ? 'bg-success-muted/20 text-success-muted border-success-muted/40'
                                : step.status === 'Failed'
                                  ? 'bg-error-muted/20 text-error-muted border-error-muted/40'
                                  : step.status === 'Skipped'
                                    ? 'bg-warning-muted/20 text-warning-muted border-warning-muted/40'
                                    : 'bg-surface-secondary/60 text-text-secondary border-border-primary/40'
                            }`}
                          >
                            {step.status}
                          </span>
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          Started: <span className="text-text-primary">{formatDate(step.startedAt)}</span>
                          {' | '}Duration:{' '}
                          <span className="text-text-primary">
                            {formatDuration(step.startedAt, step.completedAt)}
                          </span>
                        </div>
                        {step.summary && (
                          <div className="text-xs text-text-secondary mt-1">{step.summary}</div>
                        )}
                      </div>
                    ))}
                    {selectedSyncRunDetail.steps.length === 0 && (
                      <div className="text-xs text-text-secondary">No step records for this run.</div>
                    )}
                  </div>
                </div>

                <div className="bg-surface-primary/35 border border-border-primary/30 rounded-lg p-3 space-y-2">
                  <div className="text-xs text-text-secondary">Latest Warning/Error Logs</div>
                  {selectedRunWarningAndErrorLogs.length === 0 && (
                    <div className="text-xs text-text-secondary">No warning or error logs in the selected log window.</div>
                  )}
                  {selectedRunWarningAndErrorLogs.length > 0 && (
                    <div className="space-y-2">
                      {selectedRunWarningAndErrorLogs.map((log) => (
                        <div key={log.id} className="text-xs border border-border-primary/25 rounded-lg px-3 py-2 bg-surface-secondary/30">
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-semibold ${
                                log.level === 'Error' ? 'text-error-muted' : 'text-warning-muted'
                              }`}
                            >
                              {log.level}
                            </span>
                            <span className="text-text-secondary">{formatDate(log.timestamp)}</span>
                          </div>
                          <div className="text-text-primary mt-1">{log.message}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-surface-primary/35 border border-border-primary/30 rounded-lg p-3 space-y-2">
                  <div className="text-xs text-text-secondary">Affected Customers</div>
                  {selectedRunAffectedCustomers.length === 0 && (
                    <div className="text-xs text-text-secondary">No affected-customer summary available for this run.</div>
                  )}
                  {selectedRunAffectedCustomers.length > 0 && (
                    <div className="space-y-2">
                      {selectedRunAffectedCustomers.map((customer) => (
                        <div key={customer.customerId} className="text-xs border border-border-primary/25 rounded-lg px-3 py-2 bg-surface-secondary/30">
                          <div className="text-text-primary font-mono">{customer.customerId}</div>
                          <div className="text-text-secondary mt-1">
                            Changed domains:{' '}
                            <span className="text-text-primary">
                              {customer.changedDomains.length > 0
                                ? customer.changedDomains.join(', ')
                                : '\u2014'}
                            </span>
                          </div>
                          <div className="text-text-secondary">
                            Risk delta:{' '}
                            <span className="text-text-primary">
                              {typeof customer.riskDelta === 'number'
                                ? customer.riskDelta.toFixed(2)
                                : '\u2014'}
                            </span>
                            {' | '}Segment deltas:{' '}
                            <span className="text-text-primary">{customer.segmentDeltaCount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Integration Card with expand/collapse ───

const IntegrationCard = ({
  integration,
  isExpanded,
  onToggleExpand,
  onSync,
  onRunPipeline,
  isSyncing,
  isPipelineRunning,
}: {
  integration: TestingLabIntegrationDetailResponse;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSync: () => void;
  onRunPipeline: () => void;
  isSyncing: boolean;
  isPipelineRunning: boolean;
}) => {
  const { addNotification } = useNotifications();
  const hasDataSync = integration.supportsDataSync ?? supportsDataSync(integration.integrationType);
  const hasActions = integration.supportsActions ?? supportsActions(integration.integrationType);
  const purpose = getIntegrationPurpose(integration.integrationType);
  const actionTypes = getActionTypesForIntegration(integration.integrationType);

  const [selectedActionType, setSelectedActionType] = useState(
    actionTypes[0]?.value ?? ''
  );
  const [actionConfigJson, setActionConfigJson] = useState(() =>
    getDefaultActionConfig(actionTypes[0]?.value ?? '')
  );
  const [actionResult, setActionResult] = useState<TestActionResponse | null>(
    null
  );

  const generateCustomersMutation = useGenerateCustomers({
    mutationConfig: {
      onSuccess: (data) => {
        addNotification({
          type: 'success',
          title: 'Customers Generated',
          message: `${data.customersCreated} customer profiles created.`,
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Generation Failed',
          message: error instanceof Error ? error.message : 'Failed to generate customers',
        });
      },
    },
  });

  const generateEventsMutation = useGenerateEvents({
    mutationConfig: {
      onSuccess: (data) => {
        addNotification({
          type: 'success',
          title: 'Events Generated',
          message: `${data.eventsCreated} event profiles created.`,
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Generation Failed',
          message: error instanceof Error ? error.message : 'Failed to generate events',
        });
      },
    },
  });

  const backfillMutation = useBackfillIntegration({
    mutationConfig: {
      onSuccess: (data) => {
        addNotification({
          type: 'success',
          title: 'Backfill Complete',
          message: `${data.customersCreated} customers, ${data.eventsCreated} events backfilled.`,
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Backfill Failed',
          message: error instanceof Error ? error.message : 'Failed to backfill',
        });
      },
    },
  });

  const simulateSyncsMutation = useSimulateSyncs({
    mutationConfig: {
      onSuccess: (data) => {
        addNotification({
          type: 'success',
          title: 'Simulation Complete',
          message: `${data.cyclesCompleted} cycles completed, ${data.totalEventsCreated} events created.`,
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Simulation Failed',
          message: error instanceof Error ? error.message : 'Failed to simulate syncs',
        });
      },
    },
  });

  const testActionMutation = useTestAction({
    mutationConfig: {
      onSuccess: (data) => {
        setActionResult(data);
        addNotification({
          type: data.success ? 'success' : 'error',
          title: data.success ? 'Action Sent' : 'Action Failed',
          message: data.success
            ? `External ID: ${data.externalId ?? 'N/A'}`
            : data.error ?? 'Unknown error',
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Test Action Failed',
          message:
            error instanceof Error ? error.message : 'Failed to test action',
        });
      },
    },
  });

  const isAnyActionPending =
    isSyncing ||
    isPipelineRunning ||
    generateCustomersMutation.isPending ||
    generateEventsMutation.isPending ||
    backfillMutation.isPending ||
    simulateSyncsMutation.isPending ||
    testActionMutation.isPending;

  const purposeLabel =
    purpose === 'hybrid'
      ? 'Hybrid'
      : purpose === 'action_channel'
        ? 'Action'
        : 'Data';

  const purposeColor =
    purpose === 'hybrid'
      ? 'bg-info/20 text-info'
      : purpose === 'action_channel'
        ? 'bg-warning/20 text-warning'
        : 'bg-success/20 text-success';

  const parityLabel =
    integration.parityLevel === 'FullParity'
      ? 'Full Parity'
      : integration.parityLevel === 'PartialParity'
        ? 'Partial Parity'
        : 'Not Supported';

  const parityColor =
    integration.parityLevel === 'FullParity'
      ? 'bg-success/20 text-success'
      : integration.parityLevel === 'PartialParity'
        ? 'bg-warning/20 text-warning'
        : 'bg-error/20 text-error';

  return (
    <div className="bg-surface-secondary/40 border border-border-primary/40 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-secondary/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${integration.status === 'Connected' ? 'bg-success-muted' : 'bg-warning-muted'}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-primary">
                {IntegrationTypeLabels[integration.integrationType] ?? 'Unknown'}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${purposeColor}`}>
                {purposeLabel}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${parityColor}`}>
                {parityLabel}
              </span>
            </div>
            <div className="text-xs text-text-secondary">
              {integration.scenario ?? 'No scenario'} &middot; Seed {integration.seed ?? '\u2014'}
            </div>
            {integration.parityWarning && (
              <div className="text-xs text-warning mt-1">
                {integration.parityWarning}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-text-secondary">
          {hasDataSync ? (
            <>
              <span>{integration.customerProfileCount} customers</span>
              <span>{integration.eventProfileCount} events</span>
              <span>{integration.totalSyncCycles} syncs</span>
            </>
          ) : null}
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border-primary/30 p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-text-secondary">Status</span>
              <div className="text-text-primary font-medium">{integration.status}</div>
            </div>
            <div>
              <span className="text-text-secondary">Created</span>
              <div className="text-text-primary font-medium">{formatDate(integration.createdAt)}</div>
            </div>
            {hasDataSync ? (
              <>
                <div>
                  <span className="text-text-secondary">Last Synced</span>
                  <div className="text-text-primary font-medium">{formatDate(integration.lastSyncedAt)}</div>
                </div>
                <div>
                  <span className="text-text-secondary">Sync Cycles</span>
                  <div className="text-text-primary font-medium">{integration.totalSyncCycles}</div>
                </div>
              </>
            ) : (
              <div>
                <span className="text-text-secondary">Purpose</span>
                <div className="text-text-primary font-medium">Action Channel</div>
              </div>
            )}
          </div>

          {/* Sync Actions */}
          {hasDataSync ? (
            <div className="space-y-2">
              <div className="text-xs text-text-secondary">
                Suggested: <span className="text-text-primary font-medium">Run Pipeline</span>.
                For custom datasets: <span className="text-text-primary font-medium">Generate Customers</span> → <span className="text-text-primary font-medium">Generate Events</span> → <span className="text-text-primary font-medium">Sync</span>.
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onSync}
                  disabled={isAnyActionPending}
                  title="Create ~10 customers + ~2 events/customer (last 30 days) if needed, then sync the pipeline."
                  className="px-3 py-1.5 bg-accent-primary/80 text-white rounded-lg hover:bg-accent-primary transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSyncing ? <Spinner size="sm" /> : null}
                  Sync
                </button>
                <button
                  onClick={onRunPipeline}
                  disabled={isAnyActionPending}
                  title="Create ~10 customers + ~2 events/customer (last 30 days), sync, and trigger churn."
                  className="px-3 py-1.5 bg-accent-secondary/80 text-white rounded-lg hover:bg-accent-secondary transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isPipelineRunning ? <Spinner size="sm" /> : null}
                  Run Pipeline
                </button>
                <button
                  onClick={() =>
                    generateCustomersMutation.mutate({
                      integrationId: integration.integrationId,
                      request: { customerCount: 10 },
                    })
                  }
                  disabled={isAnyActionPending}
                  title="Create only synthetic customers (no events). Preview under Customer Profiles."
                  className="px-3 py-1.5 bg-surface-primary text-text-primary border border-border-primary rounded-lg hover:bg-surface-primary/80 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
                >
                  {generateCustomersMutation.isPending ? <Spinner size="sm" /> : null}
                  Generate Customers
                </button>
                <button
                  onClick={() =>
                    generateEventsMutation.mutate({
                      integrationId: integration.integrationId,
                      request: { eventsPerCustomerPerMonth: 2 },
                    })
                  }
                  disabled={isAnyActionPending}
                  title="Create provider events for the current integration; click Sync afterward to persist/extract/aggregate."
                  className="px-3 py-1.5 bg-surface-primary text-text-primary border border-border-primary rounded-lg hover:bg-surface-primary/80 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
                >
                  {generateEventsMutation.isPending ? <Spinner size="sm" /> : null}
                  Generate Events
                </button>
                <button
                  onClick={() => {
                    const now = new Date();
                    const start = new Date(now);
                    start.setMonth(start.getMonth() - 12);
                    backfillMutation.mutate({
                      integrationId: integration.integrationId,
                      request: {
                        startDate: start.toISOString(),
                        endDate: now.toISOString(),
                        customerCount: 10,
                        eventsPerCustomerPerMonth: 2,
                      },
                    });
                  }}
                  disabled={isAnyActionPending}
                  title="Create ~12 months of events, run sync, and build a snapshot at the end date."
                  className="px-3 py-1.5 bg-surface-primary text-text-primary border border-border-primary rounded-lg hover:bg-surface-primary/80 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
                >
                  {backfillMutation.isPending ? <Spinner size="sm" /> : null}
                  Backfill 12mo
                </button>
                <button
                  onClick={() =>
                    simulateSyncsMutation.mutate({
                      integrationId: integration.integrationId,
                      request: { cycles: 6, daysPerCycle: 30 },
                    })
                  }
                  disabled={isAnyActionPending}
                  title="Run 6 monthly cycles; each cycle runs sync and creates a snapshot."
                  className="px-3 py-1.5 bg-surface-primary text-text-primary border border-border-primary rounded-lg hover:bg-surface-primary/80 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
                >
                  {simulateSyncsMutation.isPending ? <Spinner size="sm" /> : null}
                  Simulate 6 Syncs
                </button>
              </div>
            </div>
          ) : null}

          {/* Action Testing */}
          {hasActions && actionTypes.length > 0 ? (
            <div className="space-y-3">
              {hasDataSync ? (
                <div className="border-t border-border-primary/30 pt-3" />
              ) : null}
              <h4 className="text-sm font-semibold text-text-primary">
                Action Testing
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary">
                    Action Type
                  </label>
                  <select
                    className="w-full mt-1 bg-surface-secondary border border-border-primary rounded-lg px-3 py-2 text-text-primary text-sm"
                    value={selectedActionType}
                    onChange={(e) => {
                      setSelectedActionType(e.target.value);
                      setActionConfigJson(
                        getDefaultActionConfig(e.target.value)
                      );
                      setActionResult(null);
                    }}
                  >
                    {actionTypes.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() =>
                      testActionMutation.mutate({
                        integrationId: integration.integrationId,
                        request: {
                          actionType: selectedActionType,
                          configJson: actionConfigJson,
                        },
                      })
                    }
                    disabled={isAnyActionPending || !selectedActionType}
                    className="w-full px-3 py-2 bg-accent-primary/80 text-white rounded-lg hover:bg-accent-primary transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {testActionMutation.isPending ? (
                      <Spinner size="sm" />
                    ) : null}
                    Send Test
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-text-secondary">
                  Config JSON
                </label>
                <textarea
                  className="w-full mt-1 bg-surface-secondary border border-border-primary rounded-lg px-3 py-2 text-text-primary text-sm font-mono h-24 resize-y"
                  value={actionConfigJson}
                  onChange={(e) => setActionConfigJson(e.target.value)}
                />
              </div>
              {actionResult ? (
                <div
                  className={`rounded-lg border p-3 text-xs space-y-1 ${
                    actionResult.success
                      ? 'border-success-muted/40 bg-success-muted/10'
                      : 'border-error-muted/40 bg-error-muted/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        actionResult.success
                          ? 'text-success-muted'
                          : 'text-error-muted'
                      }`}
                    >
                      {actionResult.success ? 'Success' : 'Failed'}
                    </span>
                    {actionResult.externalId ? (
                      <span className="text-text-secondary">
                        ID: {actionResult.externalId}
                      </span>
                    ) : null}
                  </div>
                  {actionResult.error ? (
                    <div className="text-error-muted">
                      {actionResult.error}
                    </div>
                  ) : null}
                  {actionResult.responseJson ? (
                    <pre className="text-text-muted whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                      {actionResult.responseJson}
                    </pre>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Profiles preview */}
          {hasDataSync ? (
            <IntegrationProfiles integrationId={integration.integrationId} />
          ) : null}
        </div>
      )}
    </div>
  );
};

// ─── Customer + Event Profile Preview ───

const IntegrationProfiles = ({ integrationId }: { integrationId: string }) => {
  const [showTab, setShowTab] = useState<'customers' | 'events'>('customers');

  const { data: customerProfiles, isLoading: customersLoading } = useGetCustomerProfiles(integrationId);
  const { data: eventProfiles, isLoading: eventsLoading } = useGetEventProfiles(integrationId);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 border-b border-border-primary/30 pb-2">
        <button
          onClick={() => setShowTab('customers')}
          className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
            showTab === 'customers'
              ? 'bg-accent-primary/20 text-accent-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Customer Profiles ({customerProfiles?.length ?? 0})
        </button>
        <button
          onClick={() => setShowTab('events')}
          className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
            showTab === 'events'
              ? 'bg-accent-primary/20 text-accent-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Event Profiles ({eventProfiles?.length ?? 0})
        </button>
      </div>

      {showTab === 'customers' && (
        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          {customersLoading ? (
            <div className="flex items-center gap-2 text-xs text-text-muted py-2">
              <Spinner size="sm" /> Loading profiles...
            </div>
          ) : !customerProfiles || customerProfiles.length === 0 ? (
            <p className="text-xs text-text-muted py-2">No customer profiles generated yet.</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="text-text-secondary border-b border-border-primary/30 sticky top-0 bg-surface-secondary/60">
                <tr>
                  <th className="text-left py-2 px-2">Name</th>
                  <th className="text-left py-2 px-2">Email</th>
                  <th className="text-right py-2 px-2">MRR</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Plan</th>
                </tr>
              </thead>
              <tbody>
                {customerProfiles.map((profile) => (
                  <tr key={profile.id} className="border-b border-border-primary/20 text-text-secondary">
                    <td className="py-1.5 px-2 text-text-primary">
                      {profile.firstName} {profile.lastName}
                    </td>
                    <td className="py-1.5 px-2">{profile.email}</td>
                    <td className="py-1.5 px-2 text-right">${profile.mrr.toFixed(2)}</td>
                    <td className="py-1.5 px-2">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                          profile.status === 'active'
                            ? 'bg-success-muted/20 text-success-muted'
                            : profile.status === 'cancelled'
                              ? 'bg-error-muted/20 text-error-muted'
                              : 'bg-warning-muted/20 text-warning-muted'
                        }`}
                      >
                        {profile.status}
                      </span>
                    </td>
                    <td className="py-1.5 px-2">{profile.plan ?? '\u2014'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showTab === 'events' && (
        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          {eventsLoading ? (
            <div className="flex items-center gap-2 text-xs text-text-muted py-2">
              <Spinner size="sm" /> Loading events...
            </div>
          ) : !eventProfiles || eventProfiles.length === 0 ? (
            <p className="text-xs text-text-muted py-2">No event profiles generated yet.</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="text-text-secondary border-b border-border-primary/30 sticky top-0 bg-surface-secondary/60">
                <tr>
                  <th className="text-left py-2 px-2">Event Type</th>
                  <th className="text-left py-2 px-2">Occurred At</th>
                  <th className="text-right py-2 px-2">Amount</th>
                  <th className="text-left py-2 px-2">Customer</th>
                </tr>
              </thead>
              <tbody>
                {eventProfiles.slice(0, 50).map((evt) => (
                  <tr key={evt.id} className="border-b border-border-primary/20 text-text-secondary">
                    <td className="py-1.5 px-2 text-text-primary font-mono">{evt.eventType}</td>
                    <td className="py-1.5 px-2">{formatDate(evt.occurredAt)}</td>
                    <td className="py-1.5 px-2 text-right">
                      {evt.amount != null ? `$${evt.amount.toFixed(2)}` : '\u2014'}
                    </td>
                    <td className="py-1.5 px-2">{evt.customerEmail ?? '\u2014'}</td>
                  </tr>
                ))}
                {eventProfiles.length > 50 && (
                  <tr>
                    <td colSpan={4} className="py-2 text-center text-text-muted">
                      Showing 50 of {eventProfiles.length} events
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Playbook Testing Tools Section ───

const PlaybookToolsSection = () => {
  const { addNotification } = useNotifications();

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [eventType, setEventType] = useState(eventTypes[0]);
  const [amountInput, setAmountInput] = useState('99');
  const [signalType, setSignalType] = useState(signalTypes[0]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [testEventResult, setTestEventResult] = useState<TestEventResult | null>(null);
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null);
  const [simulationResult, setSimulationResult] = useState<TimeSimulationResult | null>(null);

  const {
    data: customers,
    isLoading: customersLoading,
  } = useGetTestingLabCustomers();
  const {
    data: playbooks,
    isLoading: playbooksLoading,
  } = useGetTestingLabPlaybooks();

  const injectMutation = useInjectTestEvent({
    mutationConfig: {
      onSuccess: (data) => {
        setTestEventResult(data);
        addNotification({
          type: data.signalDetected ? 'success' : 'warning',
          title: 'Event Injected',
          message: data.signalDetected
            ? `Signal detected: ${data.signalType}`
            : 'Event injected without a matching signal',
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Injection Failed',
          message: error instanceof Error ? error.message : 'Failed to inject test event',
        });
      },
    },
  });

  const dryRunMutation = useEvaluateTriggersDryRun({
    mutationConfig: {
      onSuccess: (data) => {
        setDryRunResult(data);
        addNotification({
          type: 'success',
          title: 'Dry Run Complete',
          message: `Evaluated ${data.evaluations.length} playbooks`,
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Dry Run Failed',
          message: error instanceof Error ? error.message : 'Failed to evaluate triggers',
        });
      },
    },
  });

  const simulateMutation = useSimulateTime({
    mutationConfig: {
      onSuccess: (data) => {
        setSimulationResult(data);
        addNotification({
          type: 'success',
          title: 'Time Simulated',
          message: `Adjusted ${data.runsAffected} runs`,
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Simulation Failed',
          message: error instanceof Error ? error.message : 'Failed to simulate time',
        });
      },
    },
  });

  const resetMutation = useResetTestingLab({
    mutationConfig: {
      onSuccess: () => {
        setShowResetModal(false);
        setTestEventResult(null);
        setDryRunResult(null);
        setSimulationResult(null);
        addNotification({
          type: 'success',
          title: 'Test Data Cleared',
          message: 'All testing lab artifacts were removed.',
        });
      },
      onError: (error) => {
        setShowResetModal(false);
        addNotification({
          type: 'error',
          title: 'Reset Failed',
          message: error instanceof Error ? error.message : 'Failed to reset test data',
        });
      },
    },
  });

  useEffect(() => {
    if (!customers || customers.length === 0) {
      setSelectedCustomerId('');
      return;
    }

    if (!selectedCustomerId || !customers.some((customer) => customer.customerId === selectedCustomerId)) {
      setSelectedCustomerId(customers[0].customerId);
    }
  }, [customers, selectedCustomerId]);

  const selectedCustomer = useMemo(
    () => customers?.find((customer) => customer.customerId === selectedCustomerId),
    [customers, selectedCustomerId],
  );

  const handleInjectEvent = () => {
    if (!selectedCustomerId) {
      addNotification({
        type: 'warning',
        title: 'Select Customer',
        message: 'Choose a customer before injecting a test event.',
      });
      return;
    }

    const parsedAmount = amountInput.trim() === '' ? null : Number(amountInput);
    const amount = Number.isNaN(parsedAmount) ? null : parsedAmount;
    const hasAmount = amount !== null && amount !== undefined;

    injectMutation.mutate({
      customerId: selectedCustomerId,
      eventType,
      amount,
      currency: hasAmount ? 'usd' : null,
      metadata: null,
    });
  };

  const handleDryRun = () => {
    if (!selectedCustomerId) {
      addNotification({
        type: 'warning',
        title: 'Select Customer',
        message: 'Choose a customer before running the dry run.',
      });
      return;
    }

    dryRunMutation.mutate({
      customerId: selectedCustomerId,
      signalType,
    });
  };

  const renderDryRunResults = (result: DryRunResult) => (
    <div className="space-y-4">
      <div className="text-sm text-text-secondary">
        Evaluated <span className="text-text-primary font-semibold">{result.evaluations.length}</span> playbooks for
        <span className="text-text-primary font-semibold"> {result.customerEmail}</span>
      </div>
      <div className="space-y-3">
        {result.evaluations.map((evaluation) => (
          <div
            key={evaluation.playbookId}
            className="bg-surface-primary/50 border border-border-primary/40 rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium text-text-primary">{evaluation.playbookName}</div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                  evaluation.wouldTrigger
                    ? 'bg-success-muted/20 text-success-muted border-success-muted/40'
                    : 'bg-warning-muted/20 text-warning-muted border-warning-muted/40'
                }`}
              >
                {evaluation.wouldTrigger ? 'Would Trigger' : 'Would Not Trigger'}
              </span>
            </div>
            {evaluation.suppressionReason && (
              <div className="text-xs text-text-secondary">
                Suppression: <span className="text-text-primary">{evaluation.suppressionReason}</span>
              </div>
            )}
            {evaluation.missingConditions.length > 0 && (
              <div className="text-xs text-text-secondary">
                Missing: <span className="text-text-primary">{evaluation.missingConditions.join(', ')}</span>
              </div>
            )}
            {evaluation.decisionSummary && (
              <div className="bg-surface-secondary/50 border border-border-primary/30 rounded-lg p-3 text-xs text-text-secondary space-y-1">
                <div>
                  <span className="text-text-primary font-medium">Trigger:</span> {evaluation.decisionSummary.trigger}
                </div>
                <div>
                  <span className="text-text-primary font-medium">Why now:</span> {evaluation.decisionSummary.whyNow}
                </div>
                <div>
                  <span className="text-text-primary font-medium">Confidence:</span>{' '}
                  {String(evaluation.decisionSummary.confidence)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {result.conflicts.length > 0 && (
        <div className="bg-surface-secondary/40 border border-border-primary/40 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-2">Conflicts</h4>
          <div className="space-y-2 text-xs text-text-secondary">
            {result.conflicts.map((conflict) => (
              <div key={conflict.suppressedPlaybookId} className="flex flex-col gap-1">
                <div>
                  <span className="text-text-primary font-medium">{conflict.suppressedPlaybookName}</span> suppressed by{' '}
                  <span className="text-text-primary font-medium">
                    {conflict.winningPlaybookName ?? 'cooldown'}
                  </span>
                </div>
                <div>Reason: {conflict.reason}</div>
                <div>Cooldown ends: {formatDate(conflict.cooldownEndsAt)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Inject Test Event</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-text-secondary">Customer</label>
              <select
                className="w-full mt-1 bg-surface-secondary border border-border-primary rounded-lg px-3 py-2 text-text-primary"
                value={selectedCustomerId}
                onChange={(event) => setSelectedCustomerId(event.target.value)}
                disabled={customersLoading}
              >
                <option value="">Select customer</option>
                {customers?.map((customer) => (
                  <option key={customer.customerId} value={customer.customerId}>
                    {customer.customerName} ({customer.customerEmail})
                  </option>
                ))}
              </select>
              {customersLoading && (
                <div className="text-xs text-text-muted mt-2 flex items-center gap-2">
                  <Spinner size="sm" /> Loading customers...
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-text-secondary">Event Type</label>
                <select
                  className="w-full mt-1 bg-surface-secondary border border-border-primary rounded-lg px-3 py-2 text-text-primary"
                  value={eventType}
                  onChange={(event) => setEventType(event.target.value)}
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-text-secondary">Amount (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountInput}
                  onChange={(event) => setAmountInput(event.target.value)}
                  className="w-full mt-1 bg-surface-secondary border border-border-primary rounded-lg px-3 py-2 text-text-primary"
                />
              </div>
            </div>
            <button
              onClick={handleInjectEvent}
              disabled={injectMutation.isPending}
              className="w-full px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {injectMutation.isPending ? (
                <>
                  <Spinner size="sm" /> Injecting...
                </>
              ) : (
                'Inject Event'
              )}
            </button>
          </div>

          {testEventResult && (
            <div className="bg-surface-secondary/50 border border-border-primary/40 rounded-xl p-4 space-y-2 text-sm">
              <div className="text-text-secondary">
                Event ID: <span className="text-text-primary">{testEventResult.eventId}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">Signal detected:</span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                    testEventResult.signalDetected
                      ? 'bg-success-muted/20 text-success-muted border-success-muted/40'
                      : 'bg-warning-muted/20 text-warning-muted border-warning-muted/40'
                  }`}
                >
                  {testEventResult.signalDetected ? 'Yes' : 'No'}
                </span>
                {testEventResult.signalType && (
                  <span className="text-text-primary">({testEventResult.signalType})</span>
                )}
              </div>
              <div className="text-text-secondary">
                Matching playbooks:
                <span className="text-text-primary ml-2">
                  {testEventResult.matchingPlaybooks.length > 0
                    ? testEventResult.matchingPlaybooks.join(', ')
                    : 'None'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Dry-Run Trigger Evaluation</h2>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <label className="text-sm text-text-secondary">Signal Type</label>
                <select
                  className="w-full mt-1 bg-surface-secondary border border-border-primary rounded-lg px-3 py-2 text-text-primary"
                  value={signalType}
                  onChange={(event) => setSignalType(event.target.value)}
                >
                  {signalTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 flex items-end">
                <button
                  onClick={handleDryRun}
                  disabled={dryRunMutation.isPending}
                  className="w-full px-4 py-2 bg-surface-secondary text-text-primary border border-border-primary rounded-lg hover:bg-surface-secondary/70 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {dryRunMutation.isPending ? (
                    <>
                      <Spinner size="sm" /> Evaluating...
                    </>
                  ) : (
                    'Evaluate Triggers (Dry-Run)'
                  )}
                </button>
              </div>
            </div>
            {selectedCustomer && (
              <div className="text-xs text-text-secondary">
                Using customer: <span className="text-text-primary">{selectedCustomer.customerName}</span>
              </div>
            )}
          </div>
          {dryRunResult && renderDryRunResults(dryRunResult)}
        </div>

        <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Time Simulation</h2>
          <div className="flex flex-wrap gap-2">
            {timePresets.map((preset) => (
              <button
                key={preset.hours}
                onClick={() => simulateMutation.mutate(preset.hours)}
                disabled={simulateMutation.isPending}
                className="px-3 py-2 bg-surface-secondary text-text-primary border border-border-primary rounded-lg hover:bg-surface-secondary/70 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {preset.label}
              </button>
            ))}
          </div>
          {simulateMutation.isPending && (
            <div className="text-sm text-text-secondary flex items-center gap-2">
              <Spinner size="sm" /> Simulating time...
            </div>
          )}
          {simulationResult && (
            <div className="text-sm text-text-secondary space-y-1">
              <div>
                Runs affected: <span className="text-text-primary">{simulationResult.runsAffected}</span>
              </div>
              <div>
                Cooldowns expired: <span className="text-text-primary">{simulationResult.cooldownsExpired}</span>
              </div>
              <div>
                Simulated time: <span className="text-text-primary">{formatDate(simulationResult.simulatedTime)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Reset Test Data</h2>
          <p className="text-sm text-text-secondary">
            Remove all testing lab events, runs, actions, conflicts, integrations, and customers. This cannot be undone.
          </p>
          <button
            onClick={() => setShowResetModal(true)}
            className="w-full px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-colors font-medium"
          >
            Reset Test Data
          </button>
        </div>
      </div>

      {/* Playbooks Reference */}
      <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-primary">Playbooks Reference</h2>
          {playbooksLoading && <Spinner size="sm" />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-text-secondary border-b border-border-primary/40">
              <tr>
                <th className="text-left py-3 px-2">Name</th>
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Trigger</th>
                <th className="text-left py-3 px-2">Signal</th>
                <th className="text-left py-3 px-2">Priority</th>
                <th className="text-left py-3 px-2">Cooldown (hrs)</th>
              </tr>
            </thead>
            <tbody>
              {playbooks?.map((playbook) => (
                <tr key={playbook.playbookId} className="border-b border-border-primary/20 text-text-secondary">
                  <td className="py-3 px-2 text-text-primary">{playbook.name}</td>
                  <td className="py-3 px-2">{String(playbook.status)}</td>
                  <td className="py-3 px-2">{String(playbook.triggerType)}</td>
                  <td className="py-3 px-2">{playbook.signalType ?? '\u2014'}</td>
                  <td className="py-3 px-2">{playbook.priority}</td>
                  <td className="py-3 px-2">{playbook.cooldownHours}</td>
                </tr>
              ))}
              {!playbooksLoading && (!playbooks || playbooks.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-text-muted">
                    No playbooks available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showResetModal && (
        <ConfirmationModal
          title="Reset Testing Lab Data"
          message="This will permanently delete all testing-lab events, playbook runs, conflict logs, testing integrations, and generated customers. Proceed?"
          confirmText="Reset"
          onClose={() => setShowResetModal(false)}
          onConfirm={() => resetMutation.mutate(undefined)}
          loading={resetMutation.isPending}
        />
      )}
    </>
  );
};

// ─── Main Route Component ───

export const TestingLabRoute = () => {
  const { checkPlatformPolicy } = useAuthorization();
  const [activeTab, setActiveTab] = useState<ActiveTab>('integrations');

  return (
    <ContentLayout>
      <PlatformAuthorization
        policyCheck={checkPlatformPolicy('admin:testing-lab')}
        forbiddenFallback={
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center bg-surface-secondary/50 backdrop-blur-lg p-8 rounded-2xl border border-border-primary/50">
              <div className="text-error-muted text-6xl mb-4">&#128683;</div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">Access Denied</h2>
              <p className="text-text-muted">
                You need Admin platform role to access the testing lab.
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-8">
          <AppPageHeader
            title="Testing Lab"
            description="Admin tool. Simulate integrations end-to-end, inject events, validate signals, and test playbook behavior."
          />

          {/* Tab Navigation */}
          <div className="flex gap-1 bg-surface-primary/50 backdrop-blur-lg p-1 rounded-xl border border-border-primary/50 w-fit">
            <button
              onClick={() => setActiveTab('integrations')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'integrations'
                  ? 'bg-accent-primary text-white shadow-md'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'
              }`}
            >
              Integration Setup
            </button>
            <button
              onClick={() => setActiveTab('playbook-tools')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'playbook-tools'
                  ? 'bg-accent-primary text-white shadow-md'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'
              }`}
            >
              Playbook Tools
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'integrations' && <IntegrationManagementSection />}
          {activeTab === 'playbook-tools' && <PlaybookToolsSection />}
        </div>
      </PlatformAuthorization>
    </ContentLayout>
  );
};
