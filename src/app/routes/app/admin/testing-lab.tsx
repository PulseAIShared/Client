import React, { useEffect, useMemo, useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/components/ui/notifications';
import {
  useEvaluateTriggersDryRun,
  useGetTestingLabCustomers,
  useGetTestingLabPlaybooks,
  useGetTestingIntegrations,
  useCreateTestingIntegration,
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
  DryRunResult,
  TestEventResult,
  TimeSimulationResult,
  TestingLabSyncResult,
  TestingLabIntegrationDetailResponse,
  IntegrationTypeLabels,
  ScenarioOptions,
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

const integrationTypeOptions = [
  { value: 4, label: 'Stripe' },
  { value: 1, label: 'HubSpot' },
  { value: 5, label: 'PostHog' },
];

const formatDate = (value?: string | null) => {
  if (!value) return '\u2014';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
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

  const [createType, setCreateType] = useState(4);
  const [createScenario, setCreateScenario] = useState('stable_growth');
  const [createSeed, setCreateSeed] = useState('42');
  const [expandedIntegrationId, setExpandedIntegrationId] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<TestingLabSyncResult | null>(null);

  const { data: integrations, isLoading: integrationsLoading } = useGetTestingIntegrations();

  const createMutation = useCreateTestingIntegration({
    mutationConfig: {
      onSuccess: (data) => {
        addNotification({
          type: 'success',
          title: 'Integration Created',
          message: `${IntegrationTypeLabels[data.integrationType]} testing integration created.`,
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
        addNotification({
          type: 'success',
          title: 'Sync Complete',
          message: `Created ${data.customersCreated} customers and ${data.eventsCreated} events.`,
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
          message: `Pipeline ran: ${data.customersCreated} customers, ${data.eventsCreated} events created.`,
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

  const toggleExpand = (id: string) => {
    setExpandedIntegrationId((prev) => (prev === id ? null : id));
  };

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
              {integrationTypeOptions.map((opt) => (
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
          <div className="bg-surface-secondary/50 border border-border-primary/40 rounded-xl p-4 text-sm space-y-1">
            <div className="text-text-primary font-medium">Last Operation Result</div>
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

  const isAnyActionPending =
    isSyncing ||
    isPipelineRunning ||
    generateCustomersMutation.isPending ||
    generateEventsMutation.isPending ||
    backfillMutation.isPending ||
    simulateSyncsMutation.isPending;

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
            <div className="font-medium text-text-primary">
              {IntegrationTypeLabels[integration.integrationType] ?? 'Unknown'}
            </div>
            <div className="text-xs text-text-secondary">
              {integration.scenario ?? 'No scenario'} &middot; Seed {integration.seed ?? '\u2014'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-text-secondary">
          <span>{integration.customerProfileCount} customers</span>
          <span>{integration.eventProfileCount} events</span>
          <span>{integration.totalSyncCycles} syncs</span>
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
            <div>
              <span className="text-text-secondary">Last Synced</span>
              <div className="text-text-primary font-medium">{formatDate(integration.lastSyncedAt)}</div>
            </div>
            <div>
              <span className="text-text-secondary">Sync Cycles</span>
              <div className="text-text-primary font-medium">{integration.totalSyncCycles}</div>
            </div>
          </div>

          {/* Actions */}
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

          {/* Profiles preview */}
          <IntegrationProfiles integrationId={integration.integrationId} />
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
          {/* Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl blur-3xl"></div>
            <div className="relative bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 bg-accent-primary/20 backdrop-blur-sm px-4 py-2 rounded-full border border-accent-primary/30 mb-4">
                    <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-accent-primary">Admin Tool</span>
                  </div>
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-2">
                    Testing Lab
                  </h1>
                  <p className="text-text-secondary">
                    Simulate real integrations end-to-end, inject events, validate signals, and test playbook behavior.
                  </p>
                </div>
              </div>
            </div>
          </div>

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
