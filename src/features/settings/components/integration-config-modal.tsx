import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type {
  ConfigurationOptions,
  IntegrationInspection,
  IntegrationStatusResponse,
  SyncConfigRequest,
} from '@/types/api';
import { IntegrationPurpose, SyncFrequency } from '@/types/api';
import type { ActionConfigField } from '../api/integrations';
import { ACTION_CONFIG_FIELDS } from '../api/integrations';

export type ConfigModalMode = 'sync' | 'action';

type IntegrationConfigModalProps = {
  open: boolean;
  mode: ConfigModalMode;
  integration: IntegrationStatusResponse | null;
  options?: ConfigurationOptions;
  inspection?: IntegrationInspection | null;
  isLoading?: boolean;
  isSaving?: boolean;
  isSavingAction?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (config: SyncConfigRequest) => Promise<void>;
  onSaveActionConfig?: (defaults: Record<string, string>) => Promise<void>;
};

type ResolvedDataTypeOption = {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  isDefault: boolean;
  supported: boolean;
  permissionOk: boolean;
  approxCount?: number;
  missingScopes?: string[];
  origin: 'options' | 'inspection';
};

const formatDescription = (value: string | undefined, fallback: string): string => {
  if (!value) {
    return fallback;
  }
  return value;
};

const normalizeDataTypes = (
  options?: ConfigurationOptions,
  inspection?: IntegrationInspection | null
): ResolvedDataTypeOption[] => {
  if (options?.availableDataTypes?.length) {
    return options.availableDataTypes.map<ResolvedDataTypeOption>((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      isRequired: item.isRequired,
      isDefault: item.isDefault,
      supported: true,
      permissionOk: true,
      origin: 'options',
    }));
  }

  if (inspection?.dataTypes?.length) {
    return inspection.dataTypes.map<ResolvedDataTypeOption>((capability) => ({
      id: capability.id,
      name: capability.label,
      description: capability.notes ?? '',
      isRequired: false,
      isDefault: capability.supported && capability.permissionOk,
      supported: capability.supported,
      permissionOk: capability.permissionOk,
      approxCount: capability.approxCount,
      missingScopes: capability.missingScopes,
      origin: 'inspection',
    }));
  }

  return [];
};

const buildDefaultConfig = (
  integration: IntegrationStatusResponse | null,
  options?: ConfigurationOptions,
  inspection?: IntegrationInspection | null
): SyncConfigRequest => {
  const existing = integration?.syncConfiguration;
  const normalizedDataTypes = normalizeDataTypes(options, inspection);
  const recommendedDataTypes = normalizedDataTypes
    .filter((item) => item.isDefault && item.supported && item.permissionOk)
    .map((item) => item.id);

  const requiredIds = options?.availableDataTypes
    ?.filter((item) => item.isRequired)
    .map((item) => item.id) ?? [];

  const initialDataTypes = existing?.dataTypes ?? [...requiredIds, ...recommendedDataTypes];

  const uniqueDataTypes = Array.from(new Set(initialDataTypes));

  const defaultCustomFields: Record<string, string> = {};
  if (options?.availableCustomFields) {
    for (const field of options.availableCustomFields) {
      defaultCustomFields[field.id] = existing?.customFields?.[field.id] ?? '';
    }
  }

  const mergedCustomFields = {
    ...defaultCustomFields,
    ...(existing?.customFields ?? {}),
  };

  return {
    syncEnabled: existing?.syncEnabled ?? true,
    syncFrequency:
      existing?.syncFrequency ??
      options?.syncFrequencyOptions?.[0]?.value ??
      SyncFrequency.Daily,
    dataTypes: uniqueDataTypes,
    customFields: mergedCustomFields,
    historicalSyncDays:
      existing?.historicalSyncDays ??
      options?.defaultHistoricalSyncDays ??
      90,
    batchSize: existing?.batchSize ?? options?.defaultBatchSize ?? 200,
  };
};

export const IntegrationConfigModal: React.FC<IntegrationConfigModalProps> = ({
  open,
  mode,
  integration,
  options,
  inspection,
  isLoading = false,
  isSaving = false,
  isSavingAction = false,
  errorMessage,
  onClose,
  onSubmit,
  onSaveActionConfig,
}) => {
  const showSyncSection = mode === 'sync';
  const showActionSection = mode === 'action' && !!onSaveActionConfig;

  const integrationTypeKey = String(integration?.type ?? '');
  const actionFields: ActionConfigField[] =
    ACTION_CONFIG_FIELDS[integrationTypeKey] ?? [];

  const [formState, setFormState] = useState<SyncConfigRequest>(() =>
    buildDefaultConfig(integration, options, inspection)
  );
  const [actionFormState, setActionFormState] = useState<
    Record<string, string>
  >(() => integration?.actionDefaults ?? {});
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormState(buildDefaultConfig(integration, options, inspection));
    setActionFormState(integration?.actionDefaults ?? {});
    setLocalError(null);
  }, [open, integration, options, inspection]);

  const resolvedDataTypes = useMemo(
    () => normalizeDataTypes(options, inspection),
    [options, inspection]
  );

  const requiredDataTypes = useMemo(() => {
    if (!options?.availableDataTypes?.length) {
      return new Set<string>();
    }

    return new Set(
      options.availableDataTypes
        .filter((item) => item.isRequired)
        .map((item) => item.id)
    );
  }, [options]);

  const frequencyOptions = useMemo(() => {
    if (options?.syncFrequencyOptions?.length) {
      return options.syncFrequencyOptions;
    }

    return Object.values(SyncFrequency).map((value) => ({
      value,
      label: value,
      description: '',
    }));
  }, [options]);

  const maxHistoricalDays = options?.maxHistoricalSyncDays ?? 365;
  const defaultHistoricalDays = options?.defaultHistoricalSyncDays ?? 90;
  const maxBatchSize = options?.maxBatchSize ?? 5000;
  const defaultBatchSize = options?.defaultBatchSize ?? 500;

  const toggleDataType = (dataTypeId: string, checked: boolean) => {
    setFormState((prev) => {
      const next = new Set(prev.dataTypes);

      if (checked) {
        next.add(dataTypeId);
      } else if (!requiredDataTypes.has(dataTypeId)) {
        next.delete(dataTypeId);
      }

      return {
        ...prev,
        dataTypes: Array.from(next),
      };
    });
  };

  const handleCustomFieldChange = (fieldId: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldId]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    setLocalError(null);

    if (!integration) {
      setLocalError('Integration is not available right now. Close the dialog and try again.');
      return;
    }

    if (showSyncSection) {
      const boundedHistorical = Math.min(
        Math.max(formState.historicalSyncDays || defaultHistoricalDays, 1),
        maxHistoricalDays
      );
      const boundedBatchSize = Math.min(
        Math.max(formState.batchSize || defaultBatchSize, 1),
        maxBatchSize
      );

      const payload: SyncConfigRequest = {
        ...formState,
        historicalSyncDays: boundedHistorical,
        batchSize: boundedBatchSize,
      };

      // Ensure required data types are always included.
      const dataTypeSet = new Set(payload.dataTypes);
      for (const required of requiredDataTypes) {
        dataTypeSet.add(required);
      }
      payload.dataTypes = Array.from(dataTypeSet);

      if (options?.availableCustomFields?.length) {
        const allowed = new Set(options.availableCustomFields.map((field) => field.id));
        const filtered: Record<string, string> = {};
        for (const [key, value] of Object.entries(payload.customFields ?? {})) {
          if (allowed.has(key)) {
            filtered[key] = value;
          }
        }
        payload.customFields = filtered;
      }

      await onSubmit(payload);
    }

    if (showActionSection && onSaveActionConfig) {
      await onSaveActionConfig(actionFormState);
    }
  };

  const handleActionFieldChange = (key: string, value: string) => {
    setActionFormState((prev) => ({ ...prev, [key]: value }));
  };

  if (!open || !integration) {
    return null;
  }

  const frequencyDescription = formatDescription(
    frequencyOptions.find((item) => item.value === formState.syncFrequency)?.description,
    'Determines how often PulseServer runs automatic syncs.'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/60 backdrop-blur-sm p-4">
      <div className="flex w-full max-w-3xl max-h-[90vh] flex-col rounded-2xl border border-border-primary/40 bg-surface-primary/95 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Configure {integration.name}
            </h2>
            <p className="text-sm text-text-secondary">
              {mode === 'action'
                ? 'Configure action channel settings for playbook delivery.'
                : 'Control sync cadence, data coverage, and historical imports before running your first sync.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-secondary/60 hover:text-text-primary"
            aria-label="Close configuration dialog"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1 pb-4">
          {isLoading ? (
            <div className="flex items-center gap-3 rounded-xl border border-border-primary/30 bg-surface-secondary/70 p-4 text-sm text-text-secondary">
              <Spinner size="sm" className="text-accent-primary" />
              Loading configuration metadata...
            </div>
          ) : null}

          {showSyncSection ? (
          <>
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-text-primary">Sync Settings</h3>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border-primary/60"
                  checked={formState.syncEnabled}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      syncEnabled: event.target.checked,
                    }))
                  }
                />
                Enable scheduled sync
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-text-secondary">Sync frequency</span>
                <select
                  className="rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                  value={formState.syncFrequency}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      syncFrequency: event.target.value as SyncConfigRequest['syncFrequency'],
                    }))
                  }
                >
                  {frequencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-text-muted">{frequencyDescription}</span>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-text-secondary">Historical sync window (days)</span>
                <input
                  type="number"
                  min={1}
                  max={maxHistoricalDays}
                  step={1}
                  className="rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                  value={formState.historicalSyncDays}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      historicalSyncDays: Number(event.target.value),
                    }))
                  }
                />
                <span className="text-xs text-text-muted">
                  Import historical records during initial sync. Default {defaultHistoricalDays} days. Max {maxHistoricalDays} days.
                </span>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-text-secondary">Batch size</span>
                <input
                  type="number"
                  min={50}
                  max={maxBatchSize}
                  step={50}
                  className="rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                  value={formState.batchSize}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      batchSize: Number(event.target.value),
                    }))
                  }
                />
                <span className="text-xs text-text-muted">
                  Controls records processed per job. Default {defaultBatchSize}. Max {maxBatchSize}.
                </span>
              </label>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-base font-semibold text-text-primary">Data sets</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {resolvedDataTypes.map((item) => {
                const checked = formState.dataTypes.includes(item.id);
                const isRequired = item.isRequired || requiredDataTypes.has(item.id);
                const blocked = (!item.supported || !item.permissionOk) && !isRequired;
                const badgeLabel = isRequired
                  ? 'Required'
                  : item.origin === 'inspection' && item.isDefault
                    ? 'Recommended'
                    : undefined;

                return (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-border-primary/40 bg-surface-secondary/70 p-4 transition hover:border-accent-primary/60"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-border-primary/60"
                      checked={checked}
                      disabled={isRequired || blocked}
                      onChange={(event) => toggleDataType(item.id, event.target.checked)}
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">{item.name}</span>
                        {badgeLabel ? (
                          <span className="rounded-full bg-accent-primary/15 px-2 py-0.5 text-xs text-accent-primary">
                            {badgeLabel}
                          </span>
                        ) : null}
                        {item.approxCount != null ? (
                          <span className="rounded-full bg-surface-secondary/80 px-2 py-0.5 text-[11px] text-text-muted">
                            ~{item.approxCount.toLocaleString()} records
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-text-muted">
                        {formatDescription(
                          item.description,
                          'Include this data set whenever Pulse runs a sync.'
                        )}
                      </p>
                      {blocked ? (
                        <p className="text-xs text-warning">
                          {item.supported
                            ? 'Missing provider permissions. Update OAuth scopes to enable this dataset.'
                            : 'Provider does not expose this dataset via the API.'}
                        </p>
                      ) : null}
                      {item.missingScopes && item.missingScopes.length > 0 ? (
                        <p className="text-xs text-warning">
                          Missing scopes: {item.missingScopes.join(', ')}
                        </p>
                      ) : null}
                    </div>
                  </label>
                );
              })}
              {resolvedDataTypes.length === 0 ? (
                <div className="rounded-lg border border-border-primary/40 bg-surface-secondary/70 p-4 text-sm text-text-muted">
                  No configurable datasets were returned. Save the base settings to continue.
                </div>
              ) : null}
            </div>
          </section>

          {options?.availableCustomFields?.length ? (
            <section>
              <h3 className="mb-3 text-base font-semibold text-text-primary">Custom field mapping</h3>
              <div className="grid gap-4">
                {options.availableCustomFields.map((field) => (
                  <label key={field.id} className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-text-secondary">{field.name}</span>
                    <input
                      type="text"
                      value={formState.customFields?.[field.id] ?? ''}
                      onChange={(event) => handleCustomFieldChange(field.id, event.target.value)}
                      placeholder={formatDescription(
                        field.description,
                        'Provide the target field mapping (optional).'
                      )}
                      className="rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                    />
                    {field.options?.length ? (
                      <span className="text-xs text-text-muted">
                        Suggested values: {field.options.join(', ')}
                      </span>
                    ) : null}
                  </label>
                ))}
              </div>
            </section>
          ) : null}

          {inspection?.recommendedMappings && Object.keys(inspection.recommendedMappings).length > 0 ? (
            <section>
              <h3 className="mb-3 text-base font-semibold text-text-primary">Recommended field mappings</h3>
              <div className="space-y-3 rounded-xl border border-border-primary/40 bg-surface-secondary/70 p-4 text-sm">
                {Object.entries(inspection.recommendedMappings).map(([key, suggestions]) => (
                  <div key={key} className="space-y-2">
                    <p className="font-medium text-text-primary">{key}</p>
                    <ul className="space-y-1 text-text-secondary">
                      {suggestions.map((suggestion) => (
                        <li key={`${suggestion.sourceField}-${suggestion.targetField}`}>
                          <span className="text-text-primary">{suggestion.sourceField}</span> {' '}
                          <span className="text-text-primary">{suggestion.targetField}</span>
                          {suggestion.required ? (
                            <span className="ml-2 rounded-full bg-accent-primary/15 px-2 py-0.5 text-[11px] text-accent-primary">
                              Required
                            </span>
                          ) : null}
                          {suggestion.sampleValue != null ? (
                            <span className="ml-2 text-xs text-text-muted">
                              e.g. {String(suggestion.sampleValue)}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          </>
          ) : null}

          {showActionSection && actionFields.length > 0 ? (
            <section>
              {showSyncSection ? (
                <div className="border-t border-border-primary/30 pt-4 mb-4" />
              ) : null}
              <h3 className="mb-3 text-base font-semibold text-text-primary">
                Action Channel Settings
              </h3>
              <div className="grid gap-4">
                {actionFields.map((field) => (
                  <label key={field.key} className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-text-secondary">
                      {field.label}
                      {field.required ? (
                        <span className="ml-1 text-error-muted">*</span>
                      ) : null}
                    </span>
                    {field.type === 'select' && field.options ? (
                      <select
                        className="rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                        value={actionFormState[field.key] ?? ''}
                        onChange={(e) =>
                          handleActionFieldChange(field.key, e.target.value)
                        }
                      >
                        <option value="">Select...</option>
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === 'url' ? 'url' : 'text'}
                        value={actionFormState[field.key] ?? ''}
                        onChange={(e) =>
                          handleActionFieldChange(field.key, e.target.value)
                        }
                        placeholder={field.description ?? ''}
                        className="rounded-lg border border-border-primary/50 bg-surface-secondary/80 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                      />
                    )}
                    {field.description ? (
                      <span className="text-xs text-text-muted">
                        {field.description}
                      </span>
                    ) : null}
                  </label>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <div className="mt-6 flex flex-shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 text-sm">
            {localError ? (
              <p className="text-error-muted">{localError}</p>
            ) : errorMessage ? (
              <p className="text-error-muted">{errorMessage}</p>
            ) : (
              <p className="text-text-muted">
                {mode === 'action'
                  ? 'Changes apply immediately and affect future playbook actions.'
                  : 'Changes apply immediately after saving and affect the next scheduled sync run.'}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:from-accent-primary hover:to-accent-secondary"
              onClick={handleSubmit}
              disabled={isSaving || isSavingAction || isLoading}
              isLoading={isSaving || isSavingAction}
            >
              {mode === 'action'
                ? 'Save channel settings'
                : 'Save sync configuration'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationConfigModal;
