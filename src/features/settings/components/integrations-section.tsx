import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import type { IconType } from 'react-icons';
import { SiHubspot, SiPosthog, SiSlack, SiStripe } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/components/ui/notifications';
import { CompanyAuthorization, useAuthorization } from '@/lib/authorization';
import { signalRConnection } from '@/lib/signalr';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useModal } from '@/app/modal-provider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import {
  useGetIntegrations,
  useStartConnection,
  useReconnectIntegration,
  useTriggerSync,
  useDisconnectIntegration,
  useTestConnection,
  useConfigureIntegration,
  useDeleteIntegrationPermanent,
  useGetAllConfigurationOptions,
  useGetConfigurationOptions,
  useGetSyncJobs,
  useInspectIntegration,
  inspectIntegration,
  parseIntegrationProblem,
} from '../api/integrations';
import { IntegrationPurpose, IntegrationStatus } from '@/types/api';
import type {
  ConfigurationOptions,
  IntegrationStatusResponse,
  IntegrationInspection,
  IntegrationSyncJobSummary,
  SyncConfigRequest,
  ProblemDetails,
} from '@/types/api';
import { IntegrationConfigModal } from './integration-config-modal';
import { cleanupExpiredOAuthSessions, persistOAuthSession } from '../lib/oauth-session';

type IntegrationCategory = 'crm' | 'email' | 'payment' | 'analytics' | 'support' | 'other';

type ProviderMetadata = {
  type: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  features: string[];
  initials: string;
  icon?: IconType;
  accentGradient?: string;
};

type EmailSenderProviderType = 'SMTP' | 'SendGrid' | 'Postmark' | 'SES';

type EmailSenderStatus = 'Connected' | 'NotConnected' | 'Error';

type EmailSenderProfile = {
  id: string;
  name: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  type: EmailSenderProviderType;
  isDefault?: boolean;
  status?: EmailSenderStatus;
};

const PROVIDER_CATALOG: Record<string, ProviderMetadata> = {
  Email: {
    type: 'Email',
    name: 'Email Channel',
    description: 'Connect SMTP or email API providers for playbook delivery actions.',
    category: 'email',
    features: ['Playbook Email', 'Provider Routing', 'Sender Profiles'],
    initials: 'EM',
    accentGradient: 'from-[#fbab7e] to-[#f7ce68]',
  },
  Stripe: {
    type: 'Stripe',
    name: 'Stripe',
    description: 'Stream payment activity, subscriptions, and revenue signals.',
    category: 'payment',
    features: ['Payments', 'Subscriptions', 'Invoices'],
    initials: 'ST',
    icon: SiStripe,
    accentGradient: 'from-[#6772e5] to-[#3a39c5]',
  },
  HubSpot: {
    type: 'HubSpot',
    name: 'HubSpot',
    description: 'Sync contacts, companies, deals, and engagement metrics.',
    category: 'crm',
    features: ['Contacts', 'Companies', 'Deals'],
    initials: 'HS',
    icon: SiHubspot,
    accentGradient: 'from-[#ff7a59] to-[#d62d20]',
  },
  PostHog: {
    type: 'PostHog',
    name: 'PostHog',
    description: 'Activate product analytics, event pipelines, and experiment data.',
    category: 'analytics',
    features: ['Event Pipelines', 'Product Analytics', 'Experiments'],
    initials: 'PH',
    icon: SiPosthog,
    accentGradient: 'from-[#ff6f63] to-[#6d3df6]',
  },
  Slack: {
    type: 'Slack',
    name: 'Slack',
    description: 'Route playbook alerts and operational notifications into your Slack workspace.',
    category: 'support',
    features: ['Playbook Alerts', 'Team Notification Channel'],
    initials: 'SL',
    icon: SiSlack,
    accentGradient: 'from-[#611f69] to-[#36c5f0]',
  },
};

const CATEGORY_GRADIENTS: Record<IntegrationCategory, string> = {
  crm: 'from-[#ff7a59] to-[#d62d20]',
  email: 'from-[#fbab7e] to-[#f7ce68]',
  payment: 'from-[#6772e5] to-[#3a39c5]',
  analytics: 'from-[#ff6f63] to-[#6d3df6]',
  support: 'from-[#00bcd4] to-[#0052d4]',
  other: 'from-accent-primary to-accent-secondary',
};

const STATUS_META: Record<IntegrationStatus, { label: string; badge: string; dot: string }> = {
  [IntegrationStatus.Connected]: {
    label: 'Connected',
    badge: 'bg-success/15 text-success border border-success/30',
    dot: 'bg-success',
  },
  [IntegrationStatus.NotConnected]: {
    label: 'Not connected',
    badge: 'bg-surface-secondary/70 text-text-secondary border border-border-primary/40',
    dot: 'bg-border-primary',
  },
  [IntegrationStatus.Error]: {
    label: 'Error',
    badge: 'bg-error/15 text-error-muted border border-error/30',
    dot: 'bg-error-muted',
  },
  [IntegrationStatus.Syncing]: {
    label: 'Sync in progress',
    badge: 'bg-info/15 text-info border border-info/30',
    dot: 'bg-info',
  },
  [IntegrationStatus.TokenExpired]: {
    label: 'Token expired',
    badge: 'bg-warning/15 text-warning border border-warning/30',
    dot: 'bg-warning',
  },
};

const PURPOSE_DISPLAY_ORDER: IntegrationPurpose[] = [
  IntegrationPurpose.DataSource,
  IntegrationPurpose.ActionChannel,
  IntegrationPurpose.Hybrid,
];

const PURPOSE_META: Record<
  IntegrationPurpose,
  {
    label: string;
    description: string;
    badgeClassName: string;
    emptyState: string;
  }
> = {
  [IntegrationPurpose.DataSource]: {
    label: 'Data Sources',
    description: 'Used for ingestion, sync health, and confidence scoring inputs.',
    badgeClassName: 'bg-info/15 text-info border border-info/25',
    emptyState: 'No data source integrations match the current filters.',
  },
  [IntegrationPurpose.ActionChannel]: {
    label: 'Action Channels',
    description: 'Used to execute playbook actions like alerts, notifications, and outbound workflows.',
    badgeClassName: 'bg-success/15 text-success border border-success/25',
    emptyState: 'No action channel integrations match the current filters.',
  },
  [IntegrationPurpose.Hybrid]: {
    label: 'Hybrid',
    description: 'Used for both customer data sync and playbook action execution.',
    badgeClassName: 'bg-warning/15 text-warning border border-warning/25',
    emptyState: 'No hybrid integrations match the current filters.',
  },
};

type CapabilityFilterOption = 'all' | IntegrationPurpose;

const normalizeIntegrationPurpose = (
  purpose: IntegrationPurpose | string | undefined,
  integrationType?: string
): IntegrationPurpose => {
  const normalizedPurpose = String(purpose ?? '').trim().toLowerCase();
  if (normalizedPurpose === IntegrationPurpose.ActionChannel) {
    return IntegrationPurpose.ActionChannel;
  }

  if (normalizedPurpose === IntegrationPurpose.Hybrid) {
    return IntegrationPurpose.Hybrid;
  }

  if (normalizedPurpose === IntegrationPurpose.DataSource) {
    return IntegrationPurpose.DataSource;
  }

  const normalizedType = String(integrationType ?? '').trim().toLowerCase();
  if (normalizedType === 'hubspot' || normalizedType === 'stripe') {
    return IntegrationPurpose.Hybrid;
  }

  if (normalizedType === 'email' || normalizedType === 'slack') {
    return IntegrationPurpose.ActionChannel;
  }

  return IntegrationPurpose.DataSource;
};

const parseCapabilityFilter = (value: string | null): CapabilityFilterOption => {
  if (!value) {
    return 'all';
  }

  const normalized = value.trim().toLowerCase();
  if (
    normalized === IntegrationPurpose.DataSource ||
    normalized === IntegrationPurpose.ActionChannel ||
    normalized === IntegrationPurpose.Hybrid
  ) {
    return normalized as IntegrationPurpose;
  }

  return 'all';
};

const formatActionTypeLabel = (actionType: string): string =>
  actionType
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .trim();

const StatusBadge: React.FC<{ status: IntegrationStatus }> = ({ status }) => {
  const meta = STATUS_META[status] ?? STATUS_META[IntegrationStatus.Error];

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${meta.badge}`}>
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

const getProviderMetadata = (type: string): ProviderMetadata => {
  const fromCatalog = PROVIDER_CATALOG[type];
  if (fromCatalog) {
    return fromCatalog;
  }

  return {
    type,
    name: type,
    description: 'Connect this provider to manage sync schedules and mappings.',
    category: 'other',
    features: [],
    initials: type.slice(0, 2).toUpperCase(),
    accentGradient: CATEGORY_GRADIENTS.other,
  };
};

const formatRelativeTime = (value?: string | null): string => {
  if (!value) {
    return 'Never';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  const diff = date.getTime() - Date.now();
  const isFuture = diff > 0;
  const absMinutes = Math.round(Math.abs(diff) / (60 * 1000));

  if (absMinutes < 1) {
    return isFuture ? 'in <1 minute' : '<1 minute ago';
  }

  if (absMinutes < 60) {
    return isFuture
      ? `in ${absMinutes} minute${absMinutes === 1 ? '' : 's'}`
      : `${absMinutes} minute${absMinutes === 1 ? '' : 's'} ago`;
  }

  const absHours = Math.round(absMinutes / 60);
  if (absHours < 24) {
    return isFuture
      ? `in ${absHours} hour${absHours === 1 ? '' : 's'}`
      : `${absHours} hour${absHours === 1 ? '' : 's'} ago`;
  }

  const absDays = Math.round(absHours / 24);
  if (absDays < 30) {
    return isFuture
      ? `in ${absDays} day${absDays === 1 ? '' : 's'}`
      : `${absDays} day${absDays === 1 ? '' : 's'} ago`;
  }

  return date.toLocaleDateString();
};

const formatAbsolute = (value?: string | null): string => {
  if (!value) {
    return '--';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleString();
};

const ProviderIcon: React.FC<{ provider: ProviderMetadata; size?: 'md' | 'lg' }> = ({ provider, size = 'md' }) => {
  const IconComponent = provider.icon;
  const gradient = provider.accentGradient ?? CATEGORY_GRADIENTS[provider.category] ?? CATEGORY_GRADIENTS.other;
  const wrapperSize = size === 'lg' ? 'h-14 w-14 text-3xl' : 'h-12 w-12 text-2xl';
  const iconSize = size === 'lg' ? 'h-7 w-7' : 'h-6 w-6';

  return (
    <div
      className={`flex ${wrapperSize} items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md ring-1 ring-black/10`}
    >
      {IconComponent ? (
        <IconComponent className={iconSize} aria-hidden="true" />
      ) : (
        <span className="text-sm font-semibold uppercase">{provider.initials}</span>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: React.ReactNode; helper?: React.ReactNode }> = ({
  label,
  value,
  helper,
}) => {
  return (
    <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/70 p-4 shadow-sm">
      <span className="text-xs uppercase tracking-wide text-text-muted">{label}</span>
      <div className="mt-2 text-lg font-semibold text-text-primary">{value}</div>
      {helper ? <div className="mt-1 text-xs text-text-secondary">{helper}</div> : null}
    </div>
  );
};

const logIntegrationProblem = (
  context: string,
  problem: ProblemDetails,
  extra?: Record<string, unknown>
) => {
  const details = {
    traceId: problem.traceId ?? null,
    code: problem.code ?? null,
    metadata: problem.metadata ?? null,
    ...extra,
  };

  // eslint-disable-next-line no-console
  console.error(`[Integrations] ${context}`, details);
};

type InspectModalProps = {
  integration: IntegrationStatusResponse;
  inspection: IntegrationInspection | null;
  isLoading: boolean;
  error?: string | null;
  onClose: () => void;
};

const InspectModal: React.FC<InspectModalProps> = ({
  integration,
  inspection,
  isLoading,
  error,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border-primary/40 bg-surface-primary/95 p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Integration capabilities — {integration.name}
            </h2>
            <p className="text-sm text-text-secondary">
              Review objects, permissions, and mapping recommendations reported by the provider.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-secondary/60 hover:text-text-primary"
            aria-label="Close capabilities dialog"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner size="lg" className="text-accent-primary" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error-muted">{error}</div>
        ) : inspection ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Data types</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {inspection.dataTypes.map((dataType) => (
                  <div
                    key={dataType.id}
                    className="rounded-xl border border-border-primary/40 bg-surface-secondary/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-text-primary">{dataType.label}</span>
                      <span
                        className={`text-xs font-medium ${
                          dataType.supported && dataType.permissionOk ? 'text-success' : 'text-warning-muted'
                        }`}
                      >
                        {dataType.supported && dataType.permissionOk ? 'Available' : 'Action required'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-text-muted">
                      {typeof dataType.approxCount === 'number' && (
                        <p>Approximate records: {dataType.approxCount.toLocaleString()}</p>
                      )}
                      {!dataType.permissionOk && dataType.missingScopes && dataType.missingScopes.length > 0 && (
                        <p>Missing scopes: {dataType.missingScopes.join(', ')}</p>
                      )}
                      {dataType.notes && <p>{dataType.notes}</p>}
                    </div>
                  </div>
                ))}
                {inspection.dataTypes.length === 0 && (
                  <div className="rounded-xl border border-border-primary/40 bg-surface-secondary/70 p-4 text-sm text-text-muted">
                    Provider did not report any capabilities for this integration.
                  </div>
                )}
              </div>
            </div>

            {inspection.recommendedMappings && Object.keys(inspection.recommendedMappings).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
                  Recommended field mappings
                </h3>
                <div className="space-y-3">
                  {Object.entries(inspection.recommendedMappings).map(([dataType, mappings]) => (
                    <div
                      key={dataType}
                      className="rounded-xl border border-border-primary/40 bg-surface-secondary/70 p-4"
                    >
                      <h4 className="text-sm font-semibold text-text-primary">{dataType}</h4>
                      <ul className="mt-2 space-y-1 text-xs text-text-muted">
                        {mappings.map((mapping) => (
                          <li key={`${mapping.sourceField}-${mapping.targetField}`}>
                            <span className="font-medium text-text-primary">{mapping.sourceField}</span> →{' '}
                            {mapping.targetField}
                            {mapping.required ? ' (required)' : ''}
                            {mapping.sampleValue ? ` — e.g. ${String(mapping.sampleValue)}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border-primary/40 bg-surface-secondary/70 p-4 text-sm text-text-muted">
            No inspection data available for this integration.
          </div>
        )}
      </div>
    </div>
  );
};

type InspectModalContainerProps = {
  integration: IntegrationStatusResponse;
  onClose: () => void;
};

const InspectModalContainer: React.FC<InspectModalContainerProps> = ({ integration, onClose }) => {
  const [inspection, setInspection] = useState<IntegrationInspection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);
    setInspection(null);

    inspectIntegration(integration.id)
      .then((result) => {
        if (!isActive) return;
        setInspection(result);
      })
      .catch((err) => {
        if (!isActive) return;
        const problem = parseIntegrationProblem(err);
        logIntegrationProblem('Inspect integration capabilities failed', problem, { integrationId: integration.id });
        setError(problem.detail ?? 'Unable to fetch provider capabilities.');
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [integration.id]);

  return (
    <InspectModal
      integration={integration}
      inspection={inspection}
      isLoading={isLoading}
      error={error}
      onClose={onClose}
    />
  );
};

type SyncJobsSectionProps = {
  jobs: IntegrationSyncJobSummary[];
  isLoading: boolean;
  onRefresh: () => void;
  integrationOptions: Array<{ value: string; label: string }>;
  selectedIntegrationId: string;
  onFilterChange: (value: string) => void;
  integrationLookup: Record<string, string>;
};

const SyncJobsSection: React.FC<SyncJobsSectionProps> = ({
  jobs,
  isLoading,
  onRefresh,
  integrationOptions,
  selectedIntegrationId,
  onFilterChange,
  integrationLookup,
}) => {
  return (
    <div className="rounded-2xl border border-border-primary/40 bg-surface-primary/80 p-6 shadow-xl">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Sync job dashboard</h2>
          <p className="text-sm text-text-secondary">
            Review Hangfire job cadence, last execution, and upcoming schedules.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedIntegrationId}
            onChange={(event) => onFilterChange(event.target.value)}
            className="rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          >
            {integrationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={onRefresh} isLoading={isLoading}>
            Refresh jobs
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="lg" className="text-accent-primary" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border border-border-primary/40 bg-surface-secondary/70 p-6 text-center text-sm text-text-muted">
          No recurring sync jobs detected. Enable scheduled sync or run a manual sync to create new jobs.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-primary/40 text-left text-sm">
            <thead className="bg-surface-secondary/70">
              <tr className="text-xs uppercase tracking-wide text-text-secondary">
                <th className="px-4 py-3 font-semibold">Integration</th>
                <th className="px-4 py-3 font-semibold">Job ID</th>
                <th className="px-4 py-3 font-semibold">Last execution</th>
                <th className="px-4 py-3 font-semibold">Next execution</th>
                <th className="px-4 py-3 font-semibold">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary/20">
              {jobs.map((job) => (
                <tr key={job.jobId} className="text-sm text-text-secondary">
                  <td className="px-4 py-3 text-text-primary">
                    {integrationLookup[job.integrationId] ?? job.integrationId}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{job.jobId}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-text-primary">{formatAbsolute(job.lastExecution)}</span>
                      <span className="text-xs text-text-muted">{formatRelativeTime(job.lastExecution)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-text-primary">{formatAbsolute(job.nextExecution)}</span>
                      <span className="text-xs text-text-muted">{formatRelativeTime(job.nextExecution)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        job.isProcessing
                          ? 'bg-info/20 text-info'
                          : job.lastJobState === 'Succeeded'
                          ? 'bg-success/20 text-success'
                          : job.lastJobState === 'Failed'
                          ? 'bg-error/20 text-error-muted'
                          : 'bg-surface-secondary/70 text-text-secondary'
                      }`}
                    >
                      {job.isProcessing ? 'Running' : job.lastJobState ?? 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

type IntegrationConfigModalContainerProps = {
  integration: IntegrationStatusResponse;
  onClose: () => void;
  onConfigured: () => void;
};

const IntegrationConfigModalContainer: React.FC<IntegrationConfigModalContainerProps> = ({
  integration,
  onClose,
  onConfigured,
}) => {
  const { addNotification } = useNotifications();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: configOptions,
    isLoading: isConfigOptionsLoading,
  } = useGetConfigurationOptions(integration.type, {
    enabled: Boolean(integration.type),
  });

  const {
    data: inspection,
    isLoading: isInspectionLoading,
  } = useInspectIntegration(integration.id, {
    enabled: Boolean(integration.id),
  });

  const configureMutation = useConfigureIntegration({
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Configuration saved',
        message: 'Sync preferences updated successfully.',
      });
      setErrorMessage(null);
      onConfigured();
      onClose();
    },
    onError: (error) => {
      const problem = parseIntegrationProblem(error);
      logIntegrationProblem('Save integration configuration failed', problem, { integrationId: integration.id });
      const metadata = problem.metadata as Record<string, unknown> | undefined;
      const missing = Array.isArray(metadata?.requiredKeys) ? metadata?.requiredKeys : undefined;
      if (missing && missing.length > 0) {
        setErrorMessage(
          `${problem.detail ?? 'Missing required configuration keys.'} (${missing.join(', ')})`
        );
      } else {
        setErrorMessage(problem.detail ?? 'Unable to save configuration settings.');
      }
    },
  });

  const handleSubmit = async (config: SyncConfigRequest) => {
    await configureMutation.mutateAsync({ integrationId: integration.id, config });
  };

  return (
    <IntegrationConfigModal
      open
      integration={integration}
      options={configOptions}
      inspection={inspection}
      isLoading={isConfigOptionsLoading || isInspectionLoading}
      isSaving={configureMutation.isPending}
      errorMessage={errorMessage}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
};

type ManualSyncModalContainerProps = {
  integration: IntegrationStatusResponse;
  onClose: () => void;
  onSyncStart: (integrationId: string) => void;
  onSyncSettled: () => void;
  onSyncSuccess: () => void;
  onRequireConfiguration: (integrationId: string, metadata?: Record<string, unknown>) => void;
};

const ManualSyncModalContainer: React.FC<ManualSyncModalContainerProps> = ({
  integration,
  onClose,
  onSyncStart,
  onSyncSettled,
  onSyncSuccess,
  onRequireConfiguration,
}) => {
  const { addNotification } = useNotifications();
  const [incrementalSync, setIncrementalSync] = useState(true);
  const [syncFromDate, setSyncFromDate] = useState('');

  useEffect(() => {
    setIncrementalSync(true);
    setSyncFromDate('');
  }, [integration.id]);

  const triggerSyncMutation = useTriggerSync({
    onMutate: ({ integrationId }) => {
      onSyncStart(integrationId);
    },
    onSuccess: (result) => {
      addNotification({
        type: 'success',
        title: 'Sync started',
        message: result.syncJobId
          ? `Job ${result.syncJobId} queued successfully.`
          : 'Manual sync started successfully.',
      });
      onSyncSuccess();
      onClose();
    },
    onError: (error) => {
      const problem = parseIntegrationProblem(error);
      logIntegrationProblem('Trigger manual sync failed', problem, { integrationId: integration.id });
      const metadata = problem.metadata as Record<string, unknown> | undefined;
      const recommended =
        metadata && typeof metadata.recommendedAction === 'string'
          ? metadata.recommendedAction
          : undefined;
      const baseDetail =
        problem.detail ??
        (problem.code === 'Integration.SyncInProgress'
          ? 'A sync is already running for this integration.'
          : 'Sync request could not be queued. Check the integration status and try again.');
      addNotification({
        type: problem.code === 'Integration.SyncInProgress' ? 'warning' : 'error',
        title: problem.code === 'Integration.SyncInProgress' ? 'Sync already in progress' : 'Manual sync failed',
        message: recommended ? `${baseDetail} ${recommended}` : baseDetail,
      });
      if (problem.code === 'Integration.NotConfigured') {
        onClose();
        onRequireConfiguration(integration.id, metadata);
        return;
      }
    },
    onSettled: () => {
      onSyncSettled();
    },
  });

  const handleSubmit = async () => {
    let parsedDate: Date | null = null;
    if (syncFromDate) {
      const candidate = new Date(syncFromDate);
      parsedDate = Number.isNaN(candidate.getTime()) ? null : candidate;
    }

    await triggerSyncMutation.mutateAsync({
      integrationId: integration.id,
      options: {
        incrementalSync,
        syncFromDate: parsedDate ?? undefined,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border-primary/40 bg-surface-primary/95 p-6 shadow-2xl">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Trigger manual sync</h2>
          <p className="text-sm text-text-secondary">
            Configure a one-off sync for <span className="font-medium text-text-primary">{integration.name}</span>.
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 text-sm font-medium text-text-secondary">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border-primary/60"
              checked={incrementalSync}
              onChange={(event) => setIncrementalSync(event.target.checked)}
            />
            Incremental sync (only new or updated records)
          </label>

          <div className="space-y-1 text-sm">
            <label className="font-medium text-text-secondary" htmlFor="manual-sync-date">
              Historical sync starting from
            </label>
            <input
              id="manual-sync-date"
              type="datetime-local"
              value={syncFromDate}
              onChange={(event) => setSyncFromDate(event.target.value)}
              className="w-full rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
            />
            <p className="text-xs text-text-muted">Leave blank to use the last successful sync checkpoint.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={triggerSyncMutation.isPending}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:from-accent-primary hover:to-accent-secondary"
            onClick={handleSubmit}
            disabled={triggerSyncMutation.isPending}
            isLoading={triggerSyncMutation.isPending}
          >
            Run Sync
          </Button>
        </div>
      </div>
    </div>
  );
};

type PermanentDeleteModalContainerProps = {
  integration: IntegrationStatusResponse;
  onClose: () => void;
  onDeleted: () => void;
};

const PermanentDeleteModalContainer: React.FC<PermanentDeleteModalContainerProps> = ({
  integration,
  onClose,
  onDeleted,
}) => {
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const [confirmation, setConfirmation] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const normalizeText = useCallback((value: string) => value.replace(/\s+/g, ' ').trim().toLowerCase(), []);

  const deleteMutation = useDeleteIntegrationPermanent({
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Integration permanently deleted',
        message:
          'The integration and its historical data were removed. Run the connect flow again if you need to ingest data in the future.',
      });

      void queryClient.invalidateQueries({ queryKey: ['integrations'] });
      void queryClient.removeQueries({ queryKey: ['integrations', integration.id] });
      void queryClient.removeQueries({ queryKey: ['integrations', integration.id, 'inspect'] });
      void queryClient.invalidateQueries({ queryKey: ['integrations', 'sync-jobs'] });
      void queryClient.invalidateQueries({ queryKey: ['integrations', 'stats'] });

      onDeleted();
      onClose();
      setConfirmation('');
    },
    onError: (error) => {
      const problem = parseIntegrationProblem(error);
      logIntegrationProblem('Permanent integration delete failed', problem, { integrationId: integration.id });

      const traceSuffix = problem.traceId ? ` (trace ID: ${problem.traceId})` : '';
      const blockingMessage =
        problem.detail ??
        (problem.code === 'Integration.NotFound'
          ? 'Integration not found. It may have already been removed.'
          : 'Unable to permanently delete the integration. Please try again or contact support with the trace ID.');

      setLocalError(`${blockingMessage}${traceSuffix}`);
      addNotification({
        type: 'error',
        title: 'Unable to delete integration',
        message: `${blockingMessage}${traceSuffix}`,
      });
    },
  });

  const handleSubmit = async () => {
    setLocalError(null);
    await deleteMutation.mutateAsync(integration.id);
  };

  const pending = deleteMutation.isPending;
  const confirmationMatches =
    confirmation.trim().length > 0 &&
    normalizeText(confirmation) === normalizeText(integration.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border-primary/40 bg-surface-primary/95 p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error/15 text-error">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.1 19h13.8c1.1 0 1.8-1.2 1.3-2.2L13.3 5.8a1.5 1.5 0 00-2.6 0L3.8 16.8c-.5 1 .2 2.2 1.3 2.2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Delete integration permanently</h2>
            <p className="text-sm text-text-secondary">
              This removes {integration.name} and all historical sync data. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border-primary/40 bg-surface-secondary/70 p-4 text-sm text-text-secondary">
            <p>
              All sync history, job state, and cached analytics will be removed immediately. To ingest data from{' '}
              <span className="font-medium text-text-primary">{integration.name}</span> again, you must reconnect and run a fresh configuration.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">
              Type <span className="text-text-primary">{integration.name}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="w-full rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-text-primary focus:border-error focus:outline-none"
              placeholder={integration.name}
            />
            {confirmation && !confirmationMatches ? (
              <p className="text-xs text-error-muted">
                Enter <span className="font-medium text-text-primary">{integration.name}</span> exactly to enable deletion.
              </p>
            ) : (
              <p className="text-xs text-text-muted">Confirmation is case-insensitive.</p>
            )}
          </div>

          {localError ? (
            <div className="rounded-lg border border-error/40 bg-error/15 p-3 text-sm text-error-muted">
              {localError}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-error to-error-muted text-white hover:from-error hover:to-error-muted"
            onClick={handleSubmit}
            disabled={!confirmationMatches || pending}
            isLoading={pending}
          >
            Permanently delete
          </Button>
        </div>
      </div>
    </div>
  );
};

type EmailActionChannelModalProps = {
  onClose: () => void;
  onUpdated: () => void;
};

type EmailSenderFormState = {
  providerType: EmailSenderProviderType;
  profileName: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  isDefault: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpUseTls: boolean;
  apiKey: string;
  sesAccessKeyId: string;
  sesSecretAccessKey: string;
  sesRegion: string;
};

const EMAIL_FORM_DEFAULTS: EmailSenderFormState = {
  providerType: 'SMTP',
  profileName: '',
  fromName: '',
  fromEmail: '',
  replyTo: '',
  isDefault: false,
  smtpHost: '',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: '',
  smtpUseTls: true,
  apiKey: '',
  sesAccessKeyId: '',
  sesSecretAccessKey: '',
  sesRegion: '',
};

const EmailActionChannelModal: React.FC<EmailActionChannelModalProps> = ({
  onClose,
  onUpdated,
}) => {
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profiles' | 'connect'>('profiles');
  const [form, setForm] = useState<EmailSenderFormState>(EMAIL_FORM_DEFAULTS);

  const {
    data: senderProfiles = [],
    isLoading,
  } = useQuery({
    queryKey: ['email', 'senders'],
    queryFn: async () => {
      try {
        const result = await api.get('/email/senders');
        return Array.isArray(result) ? (result as EmailSenderProfile[]) : [];
      } catch {
        return [] as EmailSenderProfile[];
      }
    },
    staleTime: 30_000,
    retry: false,
  });

  const createSenderMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) =>
      api.post('/email/senders', payload),
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Email provider connected',
        message: 'The sender profile is now available for playbook email actions.',
      });
      void queryClient.invalidateQueries({ queryKey: ['email', 'senders'] });
      setForm(EMAIL_FORM_DEFAULTS);
      setActiveTab('profiles');
      onUpdated();
    },
    onError: (error) => {
      const problem = parseIntegrationProblem(error);
      addNotification({
        type: 'error',
        title: 'Failed to connect email provider',
        message: problem.detail ?? 'Please verify your credentials and try again.',
      });
    },
  });

  const deleteSenderMutation = useMutation({
    mutationFn: async (senderId: string) => api.delete(`/email/senders/${senderId}`),
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Sender profile removed',
        message: 'The profile was removed from the email action channel.',
      });
      void queryClient.invalidateQueries({ queryKey: ['email', 'senders'] });
      onUpdated();
    },
    onError: (error) => {
      const problem = parseIntegrationProblem(error);
      addNotification({
        type: 'error',
        title: 'Failed to remove sender profile',
        message: problem.detail ?? 'Please try again.',
      });
    },
  });

  const canSubmit = useMemo(() => {
    if (
      !form.profileName.trim() ||
      !form.fromName.trim() ||
      !form.fromEmail.trim()
    ) {
      return false;
    }

    if (form.providerType === 'SMTP') {
      return (
        !!form.smtpHost.trim() &&
        form.smtpPort > 0 &&
        !!form.smtpUsername.trim() &&
        !!form.smtpPassword
      );
    }

    if (form.providerType === 'SES') {
      return (
        !!form.sesAccessKeyId.trim() &&
        !!form.sesSecretAccessKey &&
        !!form.sesRegion.trim()
      );
    }

    return !!form.apiKey.trim();
  }, [form]);

  const statusLabel = (profile: EmailSenderProfile) => profile.status ?? 'NotConnected';
  const statusClassName = (profile: EmailSenderProfile) => {
    if (profile.status === 'Connected') {
      return 'bg-success/15 text-success border border-success/30';
    }

    if (profile.status === 'Error') {
      return 'bg-error/15 text-error-muted border border-error/30';
    }

    return 'bg-warning/15 text-warning border border-warning/30';
  };

  const handleConnect = () => {
    const payload: Record<string, unknown> = {
      type: form.providerType,
      name: form.profileName.trim(),
      fromName: form.fromName.trim(),
      fromEmail: form.fromEmail.trim(),
      replyTo: form.replyTo.trim() || null,
      isDefault: form.isDefault,
    };

    if (form.providerType === 'SMTP') {
      payload.smtp = {
        host: form.smtpHost.trim(),
        port: form.smtpPort,
        username: form.smtpUsername.trim(),
        password: form.smtpPassword,
        useTls: form.smtpUseTls,
      };
    } else if (form.providerType === 'SendGrid') {
      payload.sendGrid = { apiKey: form.apiKey.trim() };
    } else if (form.providerType === 'Postmark') {
      payload.postmark = { apiKey: form.apiKey.trim() };
    } else if (form.providerType === 'SES') {
      payload.ses = {
        accessKeyId: form.sesAccessKeyId.trim(),
        secretAccessKey: form.sesSecretAccessKey,
        region: form.sesRegion.trim(),
      };
    }

    createSenderMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl border border-border-primary/40 bg-surface-primary/95 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Email Action Channel</h2>
            <p className="text-sm text-text-secondary">
              Connect provider credentials used to execute playbook email actions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-secondary/60 hover:text-text-primary"
            aria-label="Close email provider modal"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-5 inline-flex overflow-hidden rounded-xl border border-border-primary/40">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'profiles'
                ? 'bg-accent-primary/10 text-accent-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Connected Profiles
          </button>
          <button
            onClick={() => setActiveTab('connect')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'connect'
                ? 'bg-accent-primary/10 text-accent-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Connect Provider
          </button>
        </div>

        {activeTab === 'profiles' ? (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" className="text-accent-primary" />
              </div>
            ) : senderProfiles.length === 0 ? (
              <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/60 p-5 text-sm text-text-muted">
                No sender profiles connected yet.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {senderProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="rounded-xl border border-border-primary/30 bg-surface-secondary/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-text-primary">
                          {profile.name}
                          {profile.isDefault ? ' (Default)' : ''}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {profile.type} · {profile.fromEmail}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClassName(profile)}`}>
                        {statusLabel(profile)}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        className="border-error/40 text-error-muted hover:bg-error/10"
                        onClick={() => deleteSenderMutation.mutate(profile.id)}
                        isLoading={
                          deleteSenderMutation.isPending &&
                          deleteSenderMutation.variables === profile.id
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">
                  Provider
                </label>
                <select
                  value={form.providerType}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      providerType: event.target.value as EmailSenderProviderType,
                    }))
                  }
                  className="w-full rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="SMTP">SMTP</option>
                  <option value="SendGrid">SendGrid API</option>
                  <option value="Postmark">Postmark API</option>
                  <option value="SES">Amazon SES</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">
                  Profile name
                </label>
                <input
                  value={form.profileName}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      profileName: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Primary Support Sender"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">
                  From name
                </label>
                <input
                  value={form.fromName}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      fromName: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">
                  From email
                </label>
                <input
                  type="email"
                  value={form.fromEmail}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      fromEmail: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">
                  Reply-to (optional)
                </label>
                <input
                  type="email"
                  value={form.replyTo}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      replyTo: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <label className="mt-7 flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      isDefault: event.target.checked,
                    }))
                  }
                />
                Set as default sender
              </label>
            </div>

            {form.providerType === 'SMTP' && (
              <div className="grid gap-4 rounded-xl border border-border-primary/30 bg-surface-secondary/50 p-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                    SMTP host
                  </label>
                  <input
                    value={form.smtpHost}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        smtpHost: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border-primary/50 bg-surface-primary/70 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                    placeholder="smtp.provider.com"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Port
                  </label>
                  <input
                    type="number"
                    value={form.smtpPort}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        smtpPort: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-border-primary/50 bg-surface-primary/70 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
                <label className="mt-7 flex items-center gap-2 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={form.smtpUseTls}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        smtpUseTls: event.target.checked,
                      }))
                    }
                  />
                  Use TLS
                </label>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Username
                  </label>
                  <input
                    value={form.smtpUsername}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        smtpUsername: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border-primary/50 bg-surface-primary/70 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Password
                  </label>
                  <input
                    type="password"
                    value={form.smtpPassword}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        smtpPassword: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border-primary/50 bg-surface-primary/70 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
              </div>
            )}

            {(form.providerType === 'SendGrid' || form.providerType === 'Postmark') && (
              <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/50 p-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                  API key
                </label>
                <input
                  type="password"
                  value={form.apiKey}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      apiKey: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border-primary/50 bg-surface-primary/70 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
            )}

            {form.providerType === 'SES' && (
              <div className="grid gap-4 rounded-xl border border-border-primary/30 bg-surface-secondary/50 p-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Access key ID
                  </label>
                  <input
                    value={form.sesAccessKeyId}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        sesAccessKeyId: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border-primary/50 bg-surface-primary/70 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Secret access key
                  </label>
                  <input
                    type="password"
                    value={form.sesSecretAccessKey}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        sesSecretAccessKey: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border-primary/50 bg-surface-primary/70 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Region
                  </label>
                  <input
                    value={form.sesRegion}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        sesRegion: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border-primary/50 bg-surface-primary/70 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                    placeholder="eu-west-1"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={createSenderMutation.isPending}>
            Close
          </Button>
          {activeTab === 'connect' && (
            <Button
              className="bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:from-accent-primary hover:to-accent-secondary"
              onClick={handleConnect}
              disabled={!canSubmit || createSenderMutation.isPending}
              isLoading={createSenderMutation.isPending}
            >
              Connect provider
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const IntegrationsSection: React.FC = () => {
  const { addNotification } = useNotifications();
  const { checkCompanyPolicy } = useAuthorization();
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();
  const canManageIntegrations = checkCompanyPolicy('integrations:write');
  const [searchParams, setSearchParams] = useSearchParams();
  const handledDeepLinkRef = useRef<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | IntegrationStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [syncingIntegrationId, setSyncingIntegrationId] = useState<string | null>(null);
  const [testingIntegrationId, setTestingIntegrationId] = useState<string | null>(null);
  const [disconnectingIntegrationId, setDisconnectingIntegrationId] = useState<string | null>(null);
  const [reconnectingIntegrationId, setReconnectingIntegrationId] = useState<string | null>(null);
  const [connectingType, setConnectingType] = useState<string | null>(null);
  const [jobFilterIntegrationId, setJobFilterIntegrationId] = useState<string>('all');

  useEffect(() => {
    cleanupExpiredOAuthSessions();
  }, []);

  const integrationQueryParams = useMemo(
    () => ({
      type: typeFilter === 'all' ? undefined : typeFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
    }),
    [typeFilter, statusFilter]
  );

  const {
    data: integrations = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetIntegrations(integrationQueryParams);

  const { data: configurationOptionsMap } = useGetAllConfigurationOptions();

  const {
    data: syncJobs = [],
    isFetching: isSyncJobsFetching,
    refetch: refetchJobs,
  } = useGetSyncJobs(jobFilterIntegrationId === 'all' ? undefined : jobFilterIntegrationId);

  const {
    data: emailSenderProfiles = [],
    refetch: refetchEmailSenderProfiles,
  } = useQuery({
    queryKey: ['email', 'senders'],
    queryFn: async () => {
      try {
        const result = await api.get('/email/senders');
        return Array.isArray(result) ? (result as EmailSenderProfile[]) : [];
      } catch {
        return [] as EmailSenderProfile[];
      }
    },
    staleTime: 30_000,
    retry: false,
  });

  const startConnectionMutation = useStartConnection({
    onMutate: (type) => {
      setConnectingType(type);
    },
    onSuccess: (result, integrationType) => {
      const meta = getProviderMetadata(integrationType);
      addNotification({
        type: 'info',
        title: `Connecting ${meta.name}`,
        message: 'Redirecting to the provider to authorise access.',
      });
      persistOAuthSession({
        type: integrationType,
        state: result.state,
        existingIntegrationId: result.existingIntegrationId ?? null,
      });
      window.location.assign(result.authorizationUrl);
    },
    onError: (error, integrationType) => {
      const problem = parseIntegrationProblem(error);
      const meta = getProviderMetadata(integrationType);
      logIntegrationProblem('Start integration connection failed', problem, { integrationType });

      if (problem.code === 'Integration.AlreadyExists' && problem.metadata && typeof problem.metadata === 'object') {
        const metadata = problem.metadata as Record<string, unknown>;
        const existingId = metadata.existingIntegrationId ? String(metadata.existingIntegrationId) : undefined;
        const nextAction = metadata.nextAction ? String(metadata.nextAction) : undefined;
        addNotification({
          type: 'warning',
          title: `${meta.name} already connected`,
          message:
            problem.detail ??
            (nextAction
              ? `Use the reconnect action (${nextAction}) to refresh credentials.`
              : 'Try reconnecting from the integrations list.'),
        });

        if (existingId) {
          const target = integrations.find((item) => item.id === existingId);
          if (target) {
            handleOpenConfig(target);
          }
        }
      } else {
        addNotification({
          type: 'error',
          title: `Unable to connect ${meta.name}`,
          message: problem.detail ?? 'Unexpected error while starting OAuth flow.',
        });
      }
    },
    onSettled: () => {
      setConnectingType(null);
    },
  });

  const reconnectMutation = useReconnectIntegration({
    onMutate: (integrationId) => {
      setReconnectingIntegrationId(integrationId);
    },
    onSuccess: (result) => {
      addNotification({
        type: 'info',
        title: 'Reconnect required',
        message: 'Redirecting you to refresh the integration credentials.',
      });

      if (result.authorizationUrl) {
        window.location.assign(result.authorizationUrl);
      } else {
        addNotification({
          type: 'warning',
          title: 'Reconnect pending',
          message: result.message ?? 'Follow the instructions returned by the API to reconnect.',
        });
      }
    },
    onError: (error, integrationId) => {
      const problem = parseIntegrationProblem(error);
      logIntegrationProblem('Reconnect integration failed', problem, { integrationId });
      addNotification({
        type: 'error',
        title: 'Reconnect failed',
        message: problem.detail ?? 'Unable to start reconnect flow. Try again shortly.',
      });
    },
    onSettled: () => {
      setReconnectingIntegrationId(null);
    },
  });

  const testConnectionMutation = useTestConnection({
    onMutate: (integrationId) => {
      setTestingIntegrationId(integrationId);
    },
    onSuccess: (result) => {
      addNotification({
        type: result.isConnected ? 'success' : 'warning',
        title: 'Connection test complete',
        message: result.message ?? `Status: ${result.status}`,
      });
    },
    onError: (error, integrationId) => {
      const problem = parseIntegrationProblem(error);
      logIntegrationProblem('Test integration connection failed', problem, { integrationId });
      const metadata = problem.metadata as Record<string, unknown> | undefined;

      if (problem.code === 'Integration.NotConfigured' && integrationId) {
        addNotification({
          type: 'warning',
          title: 'Configuration required',
          message: problem.detail ?? 'Complete the integration configuration before testing the connection.',
        });
        handleRequireConfiguration(integrationId, metadata);
        return;
      }

      addNotification({
        type: 'error',
        title: 'Connection test failed',
        message: problem.detail ?? 'Integration test endpoint returned an error.',
      });
    },
    onSettled: () => {
      setTestingIntegrationId(null);
    },
  });

  const disconnectMutation = useDisconnectIntegration({
    onMutate: (integrationId) => {
      setDisconnectingIntegrationId(integrationId);
    },
    onSuccess: (result) => {
      addNotification({
        type: 'success',
        title: 'Integration disconnected',
        message: result.message,
      });
      refetch();
      refetchJobs();
    },
    onError: (error, integrationId) => {
      const problem = parseIntegrationProblem(error);
      logIntegrationProblem('Disconnect integration failed', problem, { integrationId });
      const metadata = problem.metadata as Record<string, unknown> | undefined;
      const recommended =
        metadata && typeof metadata.recommendedAction === 'string'
          ? metadata.recommendedAction
          : undefined;
      addNotification({
        type: 'error',
        title: 'Failed to disconnect integration',
        message: recommended
          ? `${problem.detail ?? 'Please try again after resolving any outstanding sync jobs.'} ${recommended}`
          : problem.detail ?? 'Please try again after resolving any outstanding sync jobs.',
      });
    },
    onSettled: () => {
      setDisconnectingIntegrationId(null);
    },
  });

  const capabilityFilter = useMemo(
    () => parseCapabilityFilter(searchParams.get('capability')),
    [searchParams]
  );

  const resolveIntegrationPurpose = (integration: IntegrationStatusResponse): IntegrationPurpose =>
    normalizeIntegrationPurpose(integration.purpose, integration.type);

  const hasReconnectRequirement = (integration: IntegrationStatusResponse): boolean =>
    integration.status === IntegrationStatus.TokenExpired ||
    integration.needsTokenRefresh ||
    integration.status === IntegrationStatus.Error;

  const integrationNeedsAttention = (
    integration: IntegrationStatusResponse,
    explicitPurpose?: IntegrationPurpose
  ): boolean => {
    const purpose = explicitPurpose ?? resolveIntegrationPurpose(integration);
    if (purpose === IntegrationPurpose.ActionChannel) {
      return hasReconnectRequirement(integration) || Boolean(integration.needsConfiguration);
    }

    return (
      hasReconnectRequirement(integration) ||
      Boolean(integration.needsConfiguration) ||
      !integration.syncConfiguration
    );
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredIntegrations = useMemo(() => {
    return integrations.filter((integration) => {
      const purpose = resolveIntegrationPurpose(integration);
      const matchesCapability = capabilityFilter === 'all' || capabilityFilter === purpose;
      if (!matchesCapability) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const nameMatch = integration.name.toLowerCase().includes(normalizedSearch);
      const typeMatch = integration.type.toLowerCase().includes(normalizedSearch);
      const actionTypeMatch = integration.supportedActionTypes.some((actionType) =>
        actionType.toLowerCase().includes(normalizedSearch)
      );

      return nameMatch || typeMatch || actionTypeMatch;
    });
  }, [capabilityFilter, integrations, normalizedSearch]);

  const emailChannelSearchIndex = useMemo(() => {
    const baseTerms = [
      'email',
      'smtp',
      'sendgrid',
      'postmark',
      'ses',
      'action channel',
      'sender profile',
    ];
    const profileTerms = emailSenderProfiles.flatMap((profile) => [
      profile.name,
      profile.type,
      profile.fromEmail,
    ]);
    return [...baseTerms, ...profileTerms].join(' ').toLowerCase();
  }, [emailSenderProfiles]);

  const emailChannelMatchesSearch =
    !normalizedSearch || emailChannelSearchIndex.includes(normalizedSearch);
  const emailTypeFilterMatch =
    typeFilter === 'all' || typeFilter.toLowerCase() === 'email';
  const emailCapabilityFilterMatch =
    capabilityFilter === 'all' || capabilityFilter === IntegrationPurpose.ActionChannel;
  const hasEmailActionChannelProfiles = emailSenderProfiles.length > 0;
  const shouldShowEmailActionChannelCard =
    hasEmailActionChannelProfiles &&
    emailTypeFilterMatch &&
    emailCapabilityFilterMatch &&
    emailChannelMatchesSearch;

  const hasConnectedEmailActionChannel = emailSenderProfiles.some(
    (profile) => profile.status === 'Connected'
  );
  const emailChannelNeedsAttention =
    hasEmailActionChannelProfiles && !hasConnectedEmailActionChannel;
  const defaultEmailSenderProfile =
    emailSenderProfiles.find((profile) => profile.isDefault) ?? emailSenderProfiles[0];

  const integrationsByPurpose = useMemo(() => {
    const grouped: Record<IntegrationPurpose, IntegrationStatusResponse[]> = {
      [IntegrationPurpose.DataSource]: [],
      [IntegrationPurpose.ActionChannel]: [],
      [IntegrationPurpose.Hybrid]: [],
    };

    for (const integration of filteredIntegrations) {
      const purpose = resolveIntegrationPurpose(integration);
      grouped[purpose].push(integration);
    }

    return grouped;
  }, [filteredIntegrations]);

  const integrationTypes = useMemo(() => {
    const set = new Set<string>();
    Object.keys(PROVIDER_CATALOG).forEach((type) => set.add(type));
    integrations.forEach((integration) => set.add(integration.type));
    if (configurationOptionsMap) {
      Object.keys(configurationOptionsMap).forEach((type) => set.add(type));
    }
    Object.keys(PROVIDER_CATALOG).forEach((type) => set.add(type));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [integrations, configurationOptionsMap]);

  const typeFilterOptions = useMemo(() => ['all', ...integrationTypes], [integrationTypes]);

  const availableProviders = useMemo(() => {
    const connectedTypes = new Set(integrations.map((integration) => integration.type));
    return integrationTypes
      .filter((type) => {
        if (type.toLowerCase() === 'email') {
          return !hasEmailActionChannelProfiles;
        }

        return !connectedTypes.has(type);
      })
      .map(getProviderMetadata)
      .filter((provider) => {
        if (capabilityFilter !== 'all') {
          const providerPurpose = normalizeIntegrationPurpose(undefined, provider.type);
          if (providerPurpose !== capabilityFilter) {
            return false;
          }
        }

        if (!normalizedSearch) {
          return true;
        }
        return provider.name.toLowerCase().includes(normalizedSearch);
      });
  }, [
    capabilityFilter,
    hasEmailActionChannelProfiles,
    integrationTypes,
    integrations,
    normalizedSearch,
  ]);

  const availableProvidersByPurpose = useMemo(() => {
    const grouped: Record<IntegrationPurpose, ProviderMetadata[]> = {
      [IntegrationPurpose.DataSource]: [],
      [IntegrationPurpose.ActionChannel]: [],
      [IntegrationPurpose.Hybrid]: [],
    };

    for (const provider of availableProviders) {
      const purpose = normalizeIntegrationPurpose(undefined, provider.type);
      grouped[purpose].push(provider);
    }

    return grouped;
  }, [availableProviders]);

  const purposeSectionSummaries = useMemo(
    () =>
      PURPOSE_DISPLAY_ORDER.map((purpose) => {
        const sectionIntegrations = integrationsByPurpose[purpose];
        let connected = sectionIntegrations.filter(
          (integration) => integration.status === IntegrationStatus.Connected
        ).length;
        let warnings = sectionIntegrations.filter((integration) =>
          integrationNeedsAttention(integration, purpose)
        ).length;

        if (
          purpose === IntegrationPurpose.ActionChannel &&
          shouldShowEmailActionChannelCard
        ) {
          connected += hasConnectedEmailActionChannel ? 1 : 0;
          warnings += emailChannelNeedsAttention ? 1 : 0;
        }

        return {
          purpose,
          items: sectionIntegrations,
          connected,
          warnings,
        };
      }),
    [
      integrationsByPurpose,
      shouldShowEmailActionChannelCard,
      hasConnectedEmailActionChannel,
      emailChannelNeedsAttention,
    ]
  );

  const connectedCount =
    integrations.filter((integration) => integration.status === IntegrationStatus.Connected)
      .length + (hasConnectedEmailActionChannel ? 1 : 0);
  const needsAttentionCount = integrations.filter(
    (integration) => integrationNeedsAttention(integration)
  ).length + (emailChannelNeedsAttention ? 1 : 0);
  const syncingCount = integrations.filter((integration) => integration.status === IntegrationStatus.Syncing).length;
  const totalSyncedRecords = integrations.reduce(
    (total, integration) => total + (integration.syncedRecordCount ?? 0),
    0
  );

  const handleCapabilityFilterChange = useCallback(
    (nextValue: CapabilityFilterOption) => {
      const next = new URLSearchParams(searchParams);
      if (nextValue === 'all') {
        next.delete('capability');
      } else {
        next.set('capability', nextValue);
      }
      setSearchParams(next, { replace: false });
    },
    [searchParams, setSearchParams]
  );

  const handleOpenConfig = useCallback(
    (integration: IntegrationStatusResponse) => {
      openModal(
        <IntegrationConfigModalContainer
          key={`config-${integration.id}`}
          integration={integration}
          onClose={closeModal}
          onConfigured={() => {
            refetch();
            refetchJobs();
          }}
        />,
      );
    },
    [openModal, closeModal, refetch, refetchJobs],
  );

  const handleRequireConfiguration = useCallback(
    (integrationId: string, metadata?: Record<string, unknown>) => {
      const endpointValue =
        metadata && typeof (metadata as Record<string, unknown>).configurationEndpoint === 'string'
          ? String((metadata as Record<string, unknown>).configurationEndpoint)
          : undefined;

      if (endpointValue) {
        if (/^https?:\/\//i.test(endpointValue)) {
          window.location.assign(endpointValue);
          return;
        }

        const normalizedEndpoint = endpointValue.startsWith('/')
          ? endpointValue
          : `/${endpointValue}`;
        navigate(normalizedEndpoint, { replace: false });
        return;
      }

      const targetIntegration = integrations.find((item) => item.id === integrationId);
      if (targetIntegration) {
        handleOpenConfig(targetIntegration);
        return;
      }

      const params = new URLSearchParams();
      params.set('integrationId', integrationId);
      params.set('action', 'configure');
      setSearchParams(params, { replace: false });
    },
    [integrations, navigate, handleOpenConfig, setSearchParams],
  );

  const handleOpenManualSync = useCallback(
    (integration: IntegrationStatusResponse) => {
      openModal(
        <ManualSyncModalContainer
          key={`manual-sync-${integration.id}`}
          integration={integration}
          onClose={closeModal}
          onSyncStart={(integrationId) => setSyncingIntegrationId(integrationId)}
          onSyncSettled={() => setSyncingIntegrationId(null)}
          onSyncSuccess={() => {
            refetch();
            refetchJobs();
          }}
          onRequireConfiguration={handleRequireConfiguration}
        />,
      );
    },
    [openModal, closeModal, refetch, refetchJobs],
  );

  const handleOpenPermanentDelete = useCallback(
    (integration: IntegrationStatusResponse) => {
      openModal(
        <PermanentDeleteModalContainer
          key={`delete-${integration.id}`}
          integration={integration}
          onClose={closeModal}
          onDeleted={() => {
            refetch();
            refetchJobs();
            navigate('/app/integrations', { replace: true });
          }}
        />,
      );
    },
    [openModal, closeModal, refetch, refetchJobs],
  );

  const handleOpenInspect = useCallback(
    (integration: IntegrationStatusResponse) => {
      openModal(
        <InspectModalContainer
          key={`inspect-${integration.id}`}
          integration={integration}
          onClose={closeModal}
        />,
      );
    },
    [openModal, closeModal],
  );

  const handleOpenEmailActionChannelModal = useCallback(() => {
    openModal(
      <EmailActionChannelModal
        onClose={closeModal}
        onUpdated={() => {
          void refetchEmailSenderProfiles();
        }}
      />,
    );
  }, [openModal, closeModal, refetchEmailSenderProfiles]);

  const handleDisconnect = (integration: IntegrationStatusResponse) => {
    const confirmed = window.confirm(
      'Disconnecting will stop all scheduled syncs and remove stored credentials. Continue?'
    );
    if (!confirmed) {
      return;
    }

    disconnectMutation.mutate(integration.id);
  };

  const jobFilterOptions = useMemo(() => {
    const base = [
      { value: 'all', label: 'All integrations' },
      ...integrations.map((integration) => ({
        value: integration.id,
        label: integration.name,
      })),
    ];
    return base;
  }, [integrations]);

  const integrationLookup = useMemo(() => {
    const result: Record<string, string> = {};
    for (const integration of integrations) {
      result[integration.id] = integration.name;
    }
    return result;
  }, [integrations]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const targetId = searchParams.get('integrationId');
    const action = searchParams.get('action');
    if (!targetId) {
      handledDeepLinkRef.current = null;
      return;
    }

    const handleKey = `${targetId}:${action ?? ''}`;
    if (handledDeepLinkRef.current === handleKey) {
      return;
    }

    const targetIntegration = integrations.find((integration) => integration.id === targetId);
    if (!targetIntegration) {
      return;
    }

    handledDeepLinkRef.current = handleKey;

    if (action === 'manual-sync') {
      handleOpenManualSync(targetIntegration);
    } else if (action === 'inspect') {
      handleOpenInspect(targetIntegration);
    } else {
      // Default action: open configuration, especially when needsConfiguration is flagged
      handleOpenConfig(targetIntegration);
    }

    const next = new URLSearchParams(searchParams);
    next.delete('integrationId');
    next.delete('action');
    setSearchParams(next, { replace: true });
  }, [
    integrations,
    isLoading,
    searchParams,
    setSearchParams,
    handleOpenConfig,
    handleOpenManualSync,
    handleOpenInspect,
  ]);

  useEffect(() => {
    const handleSyncStarted = (payload: { integrationId?: string; message?: string }) => {
      if (payload?.message) {
        addNotification({
          type: 'info',
          title: 'Sync started',
          message: payload.message,
        });
      }

      if (payload?.integrationId) {
        setSyncingIntegrationId(payload.integrationId);
      }

      refetch();
      refetchJobs();
    };

    const handleSyncCompleted = (payload: { integrationId?: string; message?: string }) => {
      if (payload?.message) {
        addNotification({
          type: 'success',
          title: 'Sync completed',
          message: payload.message,
        });
      }

      if (payload?.integrationId) {
        setSyncingIntegrationId((current) => (current === payload.integrationId ? null : current));
      }

      refetch();
      refetchJobs();
    };

    const handleSyncFailed = (payload: { integrationId?: string; message?: string }) => {
      addNotification({
        type: 'error',
        title: 'Sync failed',
        message: payload?.message ?? 'Sync job reported a failure.',
      });

      if (payload?.integrationId) {
        setSyncingIntegrationId((current) => (current === payload.integrationId ? null : current));
      }

      refetch();
      refetchJobs();
    };

    signalRConnection.on('integrations/sync-started', handleSyncStarted);
    signalRConnection.on('integrations/sync-completed', handleSyncCompleted);
    signalRConnection.on('integrations/sync-failed', handleSyncFailed);

    return () => {
      signalRConnection.off('integrations/sync-started', handleSyncStarted);
      signalRConnection.off('integrations/sync-completed', handleSyncCompleted);
      signalRConnection.off('integrations/sync-failed', handleSyncFailed);
    };
  }, [addNotification, refetch, refetchJobs]);

  const renderEmailActionChannelCard = () => {
    const provider = getProviderMetadata('Email');
    const accentGradient =
      provider.accentGradient ?? CATEGORY_GRADIENTS.email;
    const emailStatus: IntegrationStatus =
      hasConnectedEmailActionChannel
        ? IntegrationStatus.Connected
        : emailSenderProfiles.length > 0
        ? IntegrationStatus.Error
        : IntegrationStatus.NotConnected;
    const providerTypes = Array.from(
      new Set(emailSenderProfiles.map((profile) => profile.type))
    );

    const helperText =
      emailSenderProfiles.length === 0
        ? 'Connect an email provider before enabling Email playbook actions.'
        : hasConnectedEmailActionChannel
        ? 'Email action channel is ready for playbook delivery.'
        : 'Profiles exist but are not connected. Update credentials to restore delivery.';

    return (
      <div
        key="email-action-channel"
        className="relative overflow-hidden rounded-2xl border border-border-primary/40 bg-surface-primary/95 p-6 shadow-lg transition hover:border-border-primary/60 hover:shadow-xl"
      >
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${accentGradient}`}
          aria-hidden="true"
        />
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <ProviderIcon provider={provider} size="lg" />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-text-primary">Email Channel</h3>
                  <StatusBadge status={emailStatus} />
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PURPOSE_META[IntegrationPurpose.ActionChannel].badgeClassName}`}>
                    {PURPOSE_META[IntegrationPurpose.ActionChannel].label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  Configure SMTP/API providers used to send playbook email actions.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Action readiness"
              value={
                hasConnectedEmailActionChannel
                  ? 'Ready'
                  : emailSenderProfiles.length > 0
                  ? 'Attention required'
                  : 'Not connected'
              }
            />
            <StatCard
              label="Sender profiles"
              value={emailSenderProfiles.length.toString()}
              helper={
                defaultEmailSenderProfile
                  ? `Default: ${defaultEmailSenderProfile.name}`
                  : 'No default profile'
              }
            />
            <StatCard
              label="Supported actions"
              value="Email"
              helper="Playbook Email"
            />
          </div>

          <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/70 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-text-primary">Connected providers</p>
                <p className="text-xs text-text-muted">
                  Add multiple providers for routing and failover readiness.
                </p>
              </div>
              {emailChannelNeedsAttention && (
                <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                  Action required
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {providerTypes.length > 0 ? (
                providerTypes.map((providerType) => (
                  <span
                    key={providerType}
                    className="rounded-full bg-surface-secondary/60 px-2.5 py-1 text-xs text-text-secondary"
                  >
                    {providerType}
                  </span>
                ))
              ) : (
                <span className="text-sm text-text-muted">
                  No providers connected yet.
                </span>
              )}
            </div>
          </div>

          <CompanyAuthorization policyCheck={canManageIntegrations}>
            <div className="flex flex-col gap-3 border-t border-border-primary/30 pt-4 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-text-muted">{helperText}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  className={`bg-gradient-to-r ${accentGradient} text-white shadow-md hover:shadow-xl`}
                  onClick={handleOpenEmailActionChannelModal}
                >
                  {emailSenderProfiles.length > 0 ? 'Manage channel' : 'Connect email provider'}
                </Button>
              </div>
            </div>
          </CompanyAuthorization>
        </div>
      </div>
    );
  };

  const renderIntegrationCard = (integration: IntegrationStatusResponse) => {
    const purpose = resolveIntegrationPurpose(integration);
    const purposeMeta = PURPOSE_META[purpose];
    const meta = getProviderMetadata(integration.type);
    const accentGradient =
      meta.accentGradient ?? CATEGORY_GRADIENTS[meta.category] ?? CATEGORY_GRADIENTS.other;
    const primaryActionClass = `bg-gradient-to-r ${accentGradient} text-white shadow-md hover:shadow-xl`;
    const showReconnect = hasReconnectRequirement(integration);
    const isSyncing =
      syncingIntegrationId === integration.id || integration.status === IntegrationStatus.Syncing;
    const connectedAt = integration.connectionDetails?.connectedAt;
    const syncConfig = integration.syncConfiguration;
    const requiresConfiguration = integration.needsConfiguration || !syncConfig;
    const configOptions = configurationOptionsMap?.[integration.type] as ConfigurationOptions | undefined;
    const actionTypes = integration.supportedActionTypes ?? [];
    const actionReadiness = !integration.isConnected
      ? 'Disconnected'
      : showReconnect
      ? 'Re-authentication required'
      : integration.needsConfiguration
      ? 'Configuration required'
      : 'Ready';
    const dataStatus = !integration.isConnected
      ? 'Disconnected'
      : showReconnect
      ? 'Attention required'
      : isSyncing
      ? 'Syncing'
      : requiresConfiguration
      ? 'Configuration required'
      : 'Healthy';

    const actionButtonLabel =
      purpose === IntegrationPurpose.ActionChannel
        ? requiresConfiguration
          ? 'Complete channel setup'
          : 'Configure channel'
        : purpose === IntegrationPurpose.Hybrid
        ? requiresConfiguration
          ? 'Complete setup'
          : 'Configure sync + channel'
        : requiresConfiguration
        ? 'Complete sync configuration'
        : 'Configure sync';

    const helperText = integration.isConnected
      ? requiresConfiguration
        ? purpose === IntegrationPurpose.ActionChannel
          ? 'Complete channel setup to unlock playbook actions.'
          : purpose === IntegrationPurpose.Hybrid
          ? 'Complete setup to unlock both sync workflows and playbook actions.'
          : 'Complete sync configuration to unlock manual sync and connection tests.'
        : purpose === IntegrationPurpose.ActionChannel
        ? 'Action channel is ready to deliver playbook actions.'
        : purpose === IntegrationPurpose.Hybrid
        ? isSyncing
          ? 'Sync in progress. Action delivery checks remain available.'
          : 'Hybrid integration supports both sync workflows and playbook actions.'
        : isSyncing
        ? 'Sync in progress. Manual controls are temporarily disabled.'
        : 'Manual sync and connection checks are available.'
      : purpose === IntegrationPurpose.ActionChannel
      ? 'Start the OAuth flow to connect this action channel.'
      : 'Start the OAuth flow to connect this data integration.';

    return (
      <div
        key={integration.id}
        className="relative overflow-hidden rounded-2xl border border-border-primary/40 bg-surface-primary/95 p-6 shadow-lg transition hover:border-border-primary/60 hover:shadow-xl"
      >
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${accentGradient}`}
          aria-hidden="true"
        />
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <ProviderIcon provider={meta} size="lg" />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-text-primary">{integration.name}</h3>
                  <StatusBadge status={integration.status} />
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${purposeMeta.badgeClassName}`}
                  >
                    {purposeMeta.label}
                  </span>
                  {requiresConfiguration && (
                    <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning">
                      Configuration required
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-text-secondary">{meta.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                  <span className="rounded-full bg-surface-secondary/70 px-2 py-1 font-medium text-text-secondary">
                    {integration.type}
                  </span>
                  {connectedAt && (
                    <span>
                      Connected {formatRelativeTime(connectedAt)} ({formatAbsolute(connectedAt)})
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              {integration.tokenExpiresAt && (
                <span className="rounded-full bg-warning/15 px-3 py-1 font-medium text-warning">
                  Token expires {formatRelativeTime(integration.tokenExpiresAt)} (
                  {formatAbsolute(integration.tokenExpiresAt)})
                </span>
              )}
              {integration.needsTokenRefresh && (
                <span className="rounded-full bg-warning/10 px-3 py-1 text-warning-muted">
                  Refresh recommended
                </span>
              )}
            </div>
          </div>

          {purpose === IntegrationPurpose.DataSource && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="Records synced"
                  value={integration.syncedRecordCount.toLocaleString()}
                  helper={isSyncing ? 'Sync currently running' : 'Cumulative total'}
                />
                <StatCard
                  label="Last sync"
                  value={formatRelativeTime(integration.lastSyncedAt)}
                  helper={formatAbsolute(integration.lastSyncedAt)}
                />
                <StatCard
                  label="Next sync"
                  value={formatRelativeTime(integration.nextSyncAt)}
                  helper={formatAbsolute(integration.nextSyncAt)}
                />
              </div>

              <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/70 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Sync configuration</p>
                    <p className="text-xs text-text-muted">
                      Preferences persisted from the configure endpoint.
                    </p>
                  </div>
                  {showReconnect && (
                    <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                      Action required
                    </span>
                  )}
                </div>
                {syncConfig ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-3 text-sm text-text-secondary">
                      <div>
                        <span className="text-xs uppercase tracking-wide text-text-muted">Frequency</span>
                        <p className="mt-1 font-medium text-text-primary">{syncConfig.syncFrequency}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wide text-text-muted">Data sets</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(syncConfig.dataTypes ?? []).map((dataType) => (
                            <span
                              key={dataType}
                              className="rounded-full bg-surface-secondary/60 px-2 py-1 text-xs text-text-secondary"
                            >
                              {dataType}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                        <span>Historical range: {syncConfig.historicalSyncDays} days</span>
                        <span>Batch size: {syncConfig.batchSize}</span>
                      </div>
                    </div>
                    <div className="space-y-3 text-xs text-text-secondary">
                      {syncConfig.lastSuccessfulSync && (
                        <div>
                          <span className="font-medium text-text-primary">Last successful sync</span>
                          <p>{formatAbsolute(syncConfig.lastSuccessfulSync)}</p>
                        </div>
                      )}
                      {syncConfig.nextScheduledSync && (
                        <div>
                          <span className="font-medium text-text-primary">Next scheduled sync</span>
                          <p>{formatAbsolute(syncConfig.nextScheduledSync)}</p>
                        </div>
                      )}
                      {syncConfig.customFields && Object.keys(syncConfig.customFields).length > 0 && (
                        <div>
                          <span className="font-medium text-text-primary">Custom fields</span>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {Object.keys(syncConfig.customFields).map((key) => (
                              <span
                                key={key}
                                className="rounded-md bg-surface-secondary/80 px-2 py-1 text-[11px] uppercase tracking-wide text-text-muted"
                              >
                                {key}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning-muted">
                    Sync configuration not supplied yet.
                  </div>
                )}
                {configOptions && (
                  <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-text-muted">
                    <span>Default cadence: {configOptions.syncFrequencyOptions[0]?.label ?? 'Manual'}</span>
                    <span>Max range: {configOptions.maxHistoricalSyncDays} days</span>
                    <span>Max batch size: {configOptions.maxBatchSize}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {purpose === IntegrationPurpose.ActionChannel && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="Action readiness" value={actionReadiness} />
                <StatCard
                  label="Supported actions"
                  value={actionTypes.length.toString()}
                  helper={
                    actionTypes.length > 0
                      ? actionTypes.map((actionType) => formatActionTypeLabel(actionType)).join(', ')
                      : 'No action types reported'
                  }
                />
                <StatCard
                  label="Connection state"
                  value={integration.isConnected ? 'Connected' : 'Not connected'}
                  helper={connectedAt ? formatAbsolute(connectedAt) : '--'}
                />
              </div>

              <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/70 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Action channel capabilities</p>
                    <p className="text-xs text-text-muted">
                      This integration is used for playbook execution, not data sync metrics.
                    </p>
                  </div>
                  {showReconnect && (
                    <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                      Action required
                    </span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {actionTypes.length > 0 ? (
                    actionTypes.map((actionType) => (
                      <span
                        key={actionType}
                        className="rounded-full bg-surface-secondary/60 px-2.5 py-1 text-xs text-text-secondary"
                      >
                        {formatActionTypeLabel(actionType)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-text-muted">
                      No action types reported for this channel.
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          {purpose === IntegrationPurpose.Hybrid && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-primary">Data panel</p>
                  <span className="rounded-full bg-surface-primary/80 px-2.5 py-1 text-xs font-medium text-text-secondary">
                    Data Status: {dataStatus}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-text-secondary">
                  <p>
                    <span className="font-medium text-text-primary">Records synced:</span>{' '}
                    {integration.syncedRecordCount.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium text-text-primary">Last sync:</span>{' '}
                    {formatRelativeTime(integration.lastSyncedAt)}
                  </p>
                  <p>
                    <span className="font-medium text-text-primary">Next sync:</span>{' '}
                    {formatRelativeTime(integration.nextSyncAt)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-primary">Action panel</p>
                  <span className="rounded-full bg-surface-primary/80 px-2.5 py-1 text-xs font-medium text-text-secondary">
                    Action Status: {actionReadiness}
                  </span>
                </div>
                <div className="mt-4">
                  {actionTypes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {actionTypes.map((actionType) => (
                        <span
                          key={actionType}
                          className="rounded-full bg-surface-secondary/60 px-2.5 py-1 text-xs text-text-secondary"
                        >
                          {formatActionTypeLabel(actionType)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted">
                      No playbook action types reported for this integration.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {integration.errorMessage && (
            <div className="rounded-xl border border-error/40 bg-error/15 p-4 text-sm text-error-muted">
              {integration.errorMessage}
            </div>
          )}

          <CompanyAuthorization policyCheck={canManageIntegrations}>
            <div className="flex flex-col gap-3 border-t border-border-primary/30 pt-4 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-text-muted">{helperText}</p>
              <div className="flex flex-wrap items-center gap-3">
                {integration.isConnected ? (
                  <>
                    <Button onClick={() => handleOpenConfig(integration)} className={primaryActionClass}>
                      {actionButtonLabel}
                    </Button>
                    {purpose !== IntegrationPurpose.ActionChannel && (
                      <Button
                        variant="outline"
                        onClick={() => handleOpenManualSync(integration)}
                        isLoading={syncingIntegrationId === integration.id}
                        disabled={requiresConfiguration || isSyncing}
                        title={
                          requiresConfiguration
                            ? 'Complete configuration before starting a manual sync.'
                            : undefined
                        }
                      >
                        {isSyncing ? 'Syncing...' : 'Run sync'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => testConnectionMutation.mutate(integration.id)}
                      isLoading={testingIntegrationId === integration.id}
                      disabled={requiresConfiguration}
                      title={
                        requiresConfiguration
                          ? 'Configure the integration before running a test.'
                          : undefined
                      }
                    >
                      {purpose === IntegrationPurpose.ActionChannel
                        ? 'Send test action'
                        : purpose === IntegrationPurpose.Hybrid
                        ? 'Test action channel'
                        : 'Test connection'}
                    </Button>
                    <Button variant="outline" onClick={() => handleOpenInspect(integration)}>
                      Inspect capabilities
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDisconnect(integration)}
                      className="text-error-muted"
                      isLoading={disconnectingIntegrationId === integration.id}
                    >
                      Disconnect
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleOpenPermanentDelete(integration)}
                      className="border border-error/50 text-error hover:bg-error/10"
                    >
                      Delete permanently
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => startConnectionMutation.mutate(integration.type)}
                      isLoading={connectingType === integration.type && startConnectionMutation.isPending}
                      className={primaryActionClass}
                    >
                      Connect
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleOpenPermanentDelete(integration)}
                      className="border border-error/50 text-error hover:bg-error/10"
                    >
                      Delete permanently
                    </Button>
                  </>
                )}
                {showReconnect && (
                  <Button
                    variant="outline"
                    onClick={() => reconnectMutation.mutate(integration.id)}
                    isLoading={reconnectingIntegrationId === integration.id}
                  >
                    Refresh authorisation
                  </Button>
                )}
              </div>
            </div>
          </CompanyAuthorization>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border-primary/40 bg-surface-primary/80 p-6 shadow-xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/60 p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">Connected integrations</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{connectedCount}</p>
          </div>
          <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/60 p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">Needs attention</p>
            <p className="mt-2 text-2xl font-semibold text-warning-muted">{needsAttentionCount}</p>
          </div>
          <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/60 p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">Active syncs</p>
            <p className="mt-2 text-2xl font-semibold text-info">{syncingCount}</p>
          </div>
          <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/60 p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">Total records synced</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{totalSyncedRecords.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border-primary/40 bg-surface-primary/80 p-6 shadow-xl">
        <div className="mb-6 rounded-xl border border-border-primary/30 bg-surface-secondary/50 p-4">
          <p className="text-sm text-text-secondary">
            Data Sources feed customer data and confidence scoring. Action Channels are used by playbooks to execute
            alerts and downstream actions.
          </p>
          {capabilityFilter !== 'all' && (
            <p className="mt-2 text-xs font-medium text-accent-primary">
              Filter context applied: {PURPOSE_META[capabilityFilter].label}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
            >
              {typeFilterOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All providers' : getProviderMetadata(option).name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | IntegrationStatus)}
              className="rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
            >
              <option value="all">Any status</option>
              <option value={IntegrationStatus.Connected}>Connected</option>
              <option value={IntegrationStatus.NotConnected}>Not connected</option>
              <option value={IntegrationStatus.TokenExpired}>Token expired</option>
              <option value={IntegrationStatus.Error}>Error</option>
              <option value={IntegrationStatus.Syncing}>Syncing</option>
            </select>

            <select
              value={capabilityFilter}
              onChange={(event) =>
                handleCapabilityFilterChange(event.target.value as CapabilityFilterOption)
              }
              className="rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
            >
              <option value="all">All capabilities</option>
              <option value={IntegrationPurpose.DataSource}>Data Sources</option>
              <option value={IntegrationPurpose.ActionChannel}>Action Channels</option>
              <option value={IntegrationPurpose.Hybrid}>Hybrid</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search integrations..."
              className="w-full rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none sm:min-w-[240px]"
            />
            <Button
              variant="outline"
              onClick={() => {
                void refetch();
                void refetchEmailSenderProfiles();
              }}
              isLoading={isFetching}
            >
              Refresh list
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" className="text-accent-primary" />
          </div>
        ) : filteredIntegrations.length === 0 && !shouldShowEmailActionChannelCard ? (
          <div className="mt-8 rounded-xl border border-border-primary/40 bg-surface-secondary/70 p-8 text-center text-sm text-text-muted">
            No integrations match the current filters. Connect a provider below or adjust the filters.
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {purposeSectionSummaries
              .filter(
                (section) =>
                  capabilityFilter === 'all' || capabilityFilter === section.purpose
              )
              .map((section) => {
                const meta = PURPOSE_META[section.purpose];
                return (
                  <section
                    key={section.purpose}
                    className="rounded-2xl border border-border-primary/30 bg-surface-primary/60 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-text-primary">{meta.label}</h3>
                        <p className="text-sm text-text-secondary">{meta.description}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-surface-secondary/70 px-2.5 py-1 text-text-secondary">
                          Connected: {section.connected}
                        </span>
                        <span className="rounded-full bg-warning/10 px-2.5 py-1 text-warning-muted">
                          Needs attention: {section.warnings}
                        </span>
                      </div>
                    </div>

                    {section.items.length === 0 &&
                    !(
                      section.purpose === IntegrationPurpose.ActionChannel &&
                      shouldShowEmailActionChannelCard
                    ) ? (
                      <div className="mt-4 rounded-xl border border-border-primary/30 bg-surface-secondary/60 p-4 text-sm text-text-muted">
                        {meta.emptyState}
                      </div>
                    ) : (
                      <div className="mt-6 space-y-6">
                        {section.items.map((integration) => renderIntegrationCard(integration))}
                        {section.purpose === IntegrationPurpose.ActionChannel &&
                          shouldShowEmailActionChannelCard &&
                          renderEmailActionChannelCard()}
                      </div>
                    )}
                  </section>
                );
              })}
          </div>
        )}
      </div>

      {availableProviders.length > 0 && (
        <div className="rounded-2xl border border-border-primary/40 bg-surface-primary/80 p-6 shadow-xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text-primary">Available integrations</h2>
            <p className="text-sm text-text-secondary">
              Connect additional providers by capability so your data ingestion and playbook actions stay explicit.
            </p>
          </div>
          <div className="space-y-6">
            {PURPOSE_DISPLAY_ORDER.map((purpose) => {
              const providers = availableProvidersByPurpose[purpose];
              if (providers.length === 0) {
                return null;
              }

              const purposeMeta = PURPOSE_META[purpose];
              return (
                <section key={purpose} className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
                      {purposeMeta.label}
                    </h3>
                    <span className="rounded-full bg-surface-secondary/70 px-2.5 py-1 text-xs text-text-muted">
                      {providers.length} available
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {providers.map((provider) => {
                      const providerAccent =
                        provider.accentGradient ??
                        CATEGORY_GRADIENTS[provider.category] ??
                        CATEGORY_GRADIENTS.other;
                      const providerActionClass = `bg-gradient-to-r ${providerAccent} text-white shadow-md hover:shadow-xl`;

                      return (
                        <div
                          key={provider.type}
                          className="group relative overflow-hidden rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-5 shadow-lg transition hover:border-border-primary/50 hover:shadow-2xl"
                        >
                          <div
                            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${providerAccent}`}
                            aria-hidden="true"
                          />
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <ProviderIcon provider={provider} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-base font-semibold text-text-primary">{provider.name}</h3>
                                  <span className="rounded-full bg-surface-secondary/75 px-2 py-0.5 text-[11px] uppercase tracking-wide text-text-muted">
                                    {provider.category.toUpperCase()}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-text-secondary">{provider.description}</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {provider.features.map((feature) => (
                              <span
                                key={feature}
                                className="rounded-full bg-surface-secondary/70 px-2.5 py-1 text-xs text-text-secondary"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                          <CompanyAuthorization policyCheck={canManageIntegrations}>
                            <Button
                              className={`mt-6 w-full justify-center ${providerActionClass}`}
                              onClick={() => {
                                if (provider.type.toLowerCase() === 'email') {
                                  handleOpenEmailActionChannelModal();
                                  return;
                                }

                                startConnectionMutation.mutate(provider.type);
                              }}
                              isLoading={
                                connectingType === provider.type && startConnectionMutation.isPending
                              }
                            >
                              Connect {provider.name}
                            </Button>
                          </CompanyAuthorization>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      <SyncJobsSection
        jobs={syncJobs}
        isLoading={isSyncJobsFetching}
        onRefresh={refetchJobs}
        integrationOptions={jobFilterOptions}
        selectedIntegrationId={jobFilterIntegrationId}
        onFilterChange={setJobFilterIntegrationId}
        integrationLookup={integrationLookup}
      />

    </div>
  );
};

