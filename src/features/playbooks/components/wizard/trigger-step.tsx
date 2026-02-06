import { useFormContext, Controller } from 'react-hook-form';
import { FormSection } from '@/components/ui/form-section';
import { enumLabelMap } from '@/features/playbooks/utils';
import { useGetSegments } from '@/features/segments/api/segments';
import {
  signalOptions,
  defaultSourcesForSignal,
} from '@/features/playbooks/schemas/playbook-form-schema';
import type {
  PlaybookFormValues,
  TriggerSignalType,
} from '@/features/playbooks/schemas/playbook-form-schema';

const inputClass =
  'w-full px-4 py-3 bg-surface-primary/60 border border-border-primary/30 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200';

const selectClass =
  'w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200';

const dataSources = [
  { key: 'stripe' as const, label: 'Stripe' },
  { key: 'posthog' as const, label: 'PostHog' },
  { key: 'hubspot' as const, label: 'HubSpot' },
];

export const TriggerStep = () => {
  const {
    register,
    control,
    watch,
    setValue,
  } = useFormContext<PlaybookFormValues>();
  const { data: segments, isLoading: segmentsLoading } =
    useGetSegments();

  const signalType = watch('signalType');
  const targetSegmentIds = watch('targetSegmentIds');
  const selectedSignal = signalOptions.find(
    (o) => o.value === signalType,
  );

  const showAmountField = signalType !== 'inactivity_7d';
  const showDaysInactive = signalType === 'inactivity_7d';
  const showDaysOverdue = signalType === 'payment_failure';
  const amountLabel =
    signalType === 'deal_lost'
      ? 'Minimum deal amount ($)'
      : 'Minimum failed amount ($)';

  const handleSignalChange = (
    nextSignal: TriggerSignalType,
  ) => {
    setValue('signalType', nextSignal);
    setValue(
      'requiredSources',
      defaultSourcesForSignal(nextSignal),
    );
  };

  const toggleSegment = (segmentId: string) => {
    const current = targetSegmentIds;
    const next = current.includes(segmentId)
      ? current.filter((id) => id !== segmentId)
      : [...current, segmentId];
    setValue('targetSegmentIds', next);
  };

  return (
    <div className="space-y-6">
      <FormSection
        title="Signal & Conditions"
        description="Choose a signal and add optional guardrails to reduce noise."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Trigger mode
            </label>
            <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/40 px-4 py-3">
              <div className="text-text-primary font-medium">
                Signal-based (recommended)
              </div>
              <p className="text-xs text-text-muted mt-1">
                Manual and segment-only triggers are coming
                soon.
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Min confidence
            </label>
            <select
              {...register('minConfidence', {
                valueAsNumber: true,
              })}
              className={selectClass}
            >
              {enumLabelMap.confidence.map(
                (label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-border-primary/30 p-5 bg-surface-secondary/30 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">
            Trigger conditions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Signal
              </label>
              <select
                value={signalType}
                onChange={(e) =>
                  handleSignalChange(
                    e.target.value as TriggerSignalType,
                  )
                }
                className={inputClass}
              >
                {signalOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-text-muted mt-2">
                {selectedSignal?.description}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Minimum MRR ($)
              </label>
              <input
                type="number"
                min={0}
                {...register('minMrr')}
                placeholder="Optional"
                className={inputClass}
              />
              <p className="text-xs text-text-muted mt-2">
                Only trigger for customers above this
                monthly revenue.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showAmountField && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {amountLabel}
                </label>
                <input
                  type="number"
                  min={0}
                  {...register('minAmount')}
                  placeholder="Optional"
                  className={inputClass}
                />
              </div>
            )}
            {showDaysInactive && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Days inactive
                </label>
                <input
                  type="number"
                  min={1}
                  {...register('minDaysInactive')}
                  placeholder="7"
                  className={inputClass}
                />
              </div>
            )}
            {showDaysOverdue && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Days overdue
                </label>
                <input
                  type="number"
                  min={0}
                  {...register('minDaysOverdue')}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Required data sources
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {dataSources.map((source) => (
                <Controller
                  key={source.key}
                  name={`requiredSources.${source.key}`}
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2 rounded-lg border border-border-primary/30 bg-surface-primary/60 px-3 py-2 text-sm text-text-primary">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-border-primary/40"
                      />
                      {source.label}
                    </label>
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-text-muted mt-2">
              Only trigger when these integrations are
              connected for the customer.
            </p>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Target Segments"
        description="Optionally restrict this playbook to specific customer segments."
      >
        <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/40 p-4 space-y-3">
          {segmentsLoading && (
            <div className="text-sm text-text-muted">
              Loading segments...
            </div>
          )}
          {!segmentsLoading &&
            (!segments || segments.length === 0) && (
              <div className="text-sm text-text-muted">
                No segments yet. Leave blank to target all
                customers.
              </div>
            )}
          {segments && segments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {segments.map((segment) => (
                <label
                  key={segment.id}
                  className="flex items-center gap-2 rounded-lg border border-border-primary/30 bg-surface-primary/60 px-3 py-2 text-sm text-text-primary"
                >
                  <input
                    type="checkbox"
                    checked={targetSegmentIds.includes(
                      segment.id,
                    )}
                    onChange={() =>
                      toggleSegment(segment.id)
                    }
                    className="h-4 w-4 rounded border-border-primary/40"
                  />
                  <span className="truncate">
                    {segment.name}
                  </span>
                </label>
              ))}
            </div>
          )}
          <p className="text-xs text-text-muted">
            If no segments are selected, the playbook applies
            to all customers.
          </p>
        </div>
      </FormSection>
    </div>
  );
};
