import { useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { FormSection } from '@/components/ui/form-section';
import {
  confidenceLevelDetails,
  getConfidenceLevelDetail,
} from '@/features/playbooks/utils';
import { useRecommendPlaybookConfidence } from '@/features/playbooks/api/playbooks';
import { useGetSegments } from '@/features/segments/api/segments';
import {
  defaultSourcesForSignal,
  signalOptions,
} from '@/features/playbooks/schemas/playbook-form-schema';
import { PlaybookFieldRecommendation } from '@/types/playbooks';
import { ConfidenceEligibilityDistribution } from '@/types/playbooks';
import type {
  PlaybookFormValues,
  TriggerSignalType,
} from '@/features/playbooks/schemas/playbook-form-schema';
import { RecommendationHint } from './recommendation-hint';
import { ImpactPreview } from './impact-preview';

const inputClass =
  'w-full px-4 py-3 bg-surface-primary/60 border border-border-primary/30 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200';

const selectClass =
  'w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200';

const dataSources = [
  { key: 'stripe' as const, label: 'Stripe' },
  { key: 'posthog' as const, label: 'PostHog' },
  { key: 'hubspot' as const, label: 'HubSpot' },
];

const formatReasonCode = (reasonCode: string) =>
  reasonCode
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

type TriggerStepProps = {
  recommendationByField?: Record<
    string,
    PlaybookFieldRecommendation
  >;
  overriddenFieldKeys?: ReadonlySet<string>;
  impactSummary?: {
    estimatedEligibleCustomers: number;
    estimatedRunsPerDay: number;
    estimatedConfidenceDistribution: ConfidenceEligibilityDistribution;
    warnings: string[];
    explanations: string[];
  } | null;
};

export const TriggerStep = ({
  recommendationByField = {},
  overriddenFieldKeys,
  impactSummary,
}: TriggerStepProps) => {
  const {
    register,
    control,
    watch,
    setValue,
  } = useFormContext<PlaybookFormValues>();
  const { data: segments, isLoading: segmentsLoading } =
    useGetSegments();

  const confidenceMode = watch('confidenceMode');
  const minConfidence = watch('minConfidence');
  const signalType = watch('signalType');
  const targetSegmentIds = watch('targetSegmentIds');
  const actions = watch('actions');
  const executionMode = watch('executionMode');

  const selectedSignal = signalOptions.find(
    (option) => option.value === signalType,
  );

  const actionTypes = useMemo(
    () =>
      actions.map((action) => Number(action.actionType)),
    [actions],
  );

  const recommendationPayload = useMemo(
    () => ({
      signalType,
      actionTypes,
      executionMode: Number(executionMode),
      hasTargetSegments: targetSegmentIds.length > 0,
    }),
    [
      actionTypes,
      executionMode,
      signalType,
      targetSegmentIds.length,
    ],
  );

  const {
    data: confidenceRecommendation,
    isLoading: recommendationLoading,
  } = useRecommendPlaybookConfidence(
    recommendationPayload,
    {
      enabled: Boolean(signalType),
    },
  );

  const showAmountField = signalType !== 'inactivity_7d';
  const showDaysInactive = signalType === 'inactivity_7d';
  const showDaysOverdue = signalType === 'payment_failure';
  const amountLabel =
    signalType === 'deal_lost'
      ? 'Minimum deal amount ($)'
      : 'Minimum failed amount ($)';

  const parseConfidenceValue = (
    confidence: number | string,
  ) => {
    if (typeof confidence === 'number') {
      return confidence;
    }

    const normalized = confidence.trim().toLowerCase();
    const matched = confidenceLevelDetails.find(
      (detail) => detail.label.toLowerCase() === normalized,
    );

    return matched?.value;
  };

  useEffect(() => {
    if (
      confidenceMode !== 'auto' ||
      !confidenceRecommendation
    ) {
      return;
    }

    const parsedRecommended = parseConfidenceValue(
      confidenceRecommendation.recommendedMinConfidence,
    );

    if (parsedRecommended === undefined) {
      return;
    }

    setValue('minConfidence', parsedRecommended, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [
    confidenceMode,
    confidenceRecommendation,
    setValue,
  ]);

  const recommendedConfidenceDetail =
    confidenceRecommendation
      ? getConfidenceLevelDetail(
          parseConfidenceValue(
            confidenceRecommendation.recommendedMinConfidence,
          ),
        )
      : undefined;

  const effectiveConfidenceLevel =
    confidenceMode === 'auto' &&
    recommendedConfidenceDetail
      ? recommendedConfidenceDetail.value
      : minConfidence;

  const liveDistribution =
    confidenceRecommendation?.eligibleCustomersByConfidence ??
    impactSummary?.estimatedConfidenceDistribution;

  const estimatedEligibleCustomers = liveDistribution
    ? effectiveConfidenceLevel === 0
      ? liveDistribution.minimal
      : effectiveConfidenceLevel === 1
        ? liveDistribution.good
        : effectiveConfidenceLevel === 2
          ? liveDistribution.high
          : liveDistribution.excellent
    : impactSummary?.estimatedEligibleCustomers;

  const missingIntegrationWarnings =
    confidenceRecommendation?.missingCompanyIntegrations
      ?.map(
        (provider) =>
          `Missing company integration: ${provider}`,
      ) ?? [];

  const impactWarnings = [
    ...(impactSummary?.warnings ?? []),
    ...missingIntegrationWarnings,
  ];

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
        <input type="hidden" {...register('confidenceMode')} />
        <input
          type="hidden"
          {...register('minConfidence', {
            valueAsNumber: true,
          })}
        />

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
              Confidence mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 rounded-lg border border-border-primary/30 bg-surface-primary/60 px-3 py-2 text-sm text-text-primary">
                <input
                  type="radio"
                  checked={confidenceMode === 'auto'}
                  onChange={() =>
                    setValue('confidenceMode', 'auto')
                  }
                  className="h-4 w-4 rounded border-border-primary/40"
                />
                Auto (recommended)
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-border-primary/30 bg-surface-primary/60 px-3 py-2 text-sm text-text-primary">
                <input
                  type="radio"
                  checked={confidenceMode === 'manual'}
                  onChange={() =>
                    setValue('confidenceMode', 'manual')
                  }
                  className="h-4 w-4 rounded border-border-primary/40"
                />
                Manual override
              </label>
            </div>
            <RecommendationHint
              recommendation={
                recommendationByField['confidence.mode']
              }
              overridden={Boolean(
                overriddenFieldKeys?.has(
                  'confidence.mode',
                ),
              )}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/30 p-4">
          <p className="text-sm font-medium text-text-primary">
            Confidence reflects data coverage, not
            prediction certainty.
          </p>
          <p className="text-xs text-text-muted mt-1">
            Formula: distinct active customer integrations.
            Thresholds are fixed system-wide today.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-text-muted">
            {confidenceLevelDetails.map((detail) => (
              <li key={detail.value}>
                <span className="text-text-secondary">
                  {detail.label}
                </span>{' '}
                - {detail.threshold}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Min confidence
          </label>
          {confidenceMode === 'manual' && (
            <select
              value={minConfidence}
              onChange={(event) =>
                setValue(
                  'minConfidence',
                  Number(event.target.value),
                  {
                    shouldDirty: true,
                    shouldTouch: true,
                  },
                )
              }
              className={selectClass}
            >
              {confidenceLevelDetails.map((detail) => (
                <option
                  key={detail.label}
                  value={detail.value}
                >
                  {detail.label} ({detail.threshold})
                </option>
              ))}
            </select>
          )}
          {confidenceMode === 'auto' && (
            <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/50 px-4 py-3">
              <div className="text-text-primary font-medium">
                {recommendedConfidenceDetail
                  ? `${recommendedConfidenceDetail.label} (${recommendedConfidenceDetail.threshold})`
                  : recommendationLoading
                    ? 'Calculating recommendation...'
                    : 'Recommendation unavailable'}
              </div>
              <p className="text-xs text-text-muted mt-1">
                Auto mode updates this threshold as
                trigger/actions change.
              </p>
            </div>
          )}
          <RecommendationHint
            recommendation={
              recommendationByField['confidence.minLevel']
            }
            overridden={Boolean(
              overriddenFieldKeys?.has(
                'confidence.minLevel',
              ),
            )}
          />
        </div>

        <div className="rounded-2xl border border-border-primary/30 p-5 bg-surface-secondary/30 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">
            Auto recommendation preview
          </h3>
          {recommendationLoading && (
            <div className="text-sm text-text-muted">
              Calculating recommendation...
            </div>
          )}
          {!recommendationLoading &&
            confidenceRecommendation && (
              <div className="space-y-3 text-sm">
                <div className="text-text-primary">
                  Recommended threshold:{' '}
                  <span className="font-semibold">
                    {recommendedConfidenceDetail
                      ? `${recommendedConfidenceDetail.label} (${recommendedConfidenceDetail.threshold})`
                      : String(
                          confidenceRecommendation.recommendedMinConfidence,
                        )}
                  </span>
                </div>
                <div className="text-text-muted text-xs">
                  Reasons:{' '}
                  {confidenceRecommendation.reasonCodes
                    .map(formatReasonCode)
                    .join(', ')}
                </div>
                <div className="text-text-muted text-xs">
                  Required integrations:{' '}
                  {confidenceRecommendation.requiredIntegrations
                    .length > 0
                    ? confidenceRecommendation.requiredIntegrations.join(
                        ', ',
                      )
                    : 'None'}
                </div>
                {confidenceRecommendation
                  .missingCompanyIntegrations.length > 0 && (
                  <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-warning text-xs">
                    Missing integrations for this company:{' '}
                    {confidenceRecommendation.missingCompanyIntegrations.join(
                      ', ',
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="rounded-md bg-surface-primary/60 border border-border-primary/30 px-2 py-1">
                    Minimal:{' '}
                    {
                      confidenceRecommendation
                        .eligibleCustomersByConfidence
                        .minimal
                    }
                  </div>
                  <div className="rounded-md bg-surface-primary/60 border border-border-primary/30 px-2 py-1">
                    Good:{' '}
                    {
                      confidenceRecommendation
                        .eligibleCustomersByConfidence.good
                    }
                  </div>
                  <div className="rounded-md bg-surface-primary/60 border border-border-primary/30 px-2 py-1">
                    High:{' '}
                    {
                      confidenceRecommendation
                        .eligibleCustomersByConfidence.high
                    }
                  </div>
                  <div className="rounded-md bg-surface-primary/60 border border-border-primary/30 px-2 py-1">
                    Excellent:{' '}
                    {
                      confidenceRecommendation
                        .eligibleCustomersByConfidence
                        .excellent
                    }
                  </div>
                </div>
              </div>
            )}
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
                onChange={(event) =>
                  handleSignalChange(
                    event.target.value as TriggerSignalType,
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
              <RecommendationHint
                recommendation={
                  recommendationByField[
                    'trigger.signalType'
                  ]
                }
                overridden={Boolean(
                  overriddenFieldKeys?.has(
                    'trigger.signalType',
                  ),
                )}
              />
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
              <RecommendationHint
                recommendation={
                  recommendationByField[
                    'trigger.minMrr'
                  ]
                }
                overridden={Boolean(
                  overriddenFieldKeys?.has(
                    'trigger.minMrr',
                  ),
                )}
              />
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
                <RecommendationHint
                  recommendation={
                    recommendationByField[
                      'trigger.minAmount'
                    ]
                  }
                  overridden={Boolean(
                    overriddenFieldKeys?.has(
                      'trigger.minAmount',
                    ),
                  )}
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
                <RecommendationHint
                  recommendation={
                    recommendationByField[
                      'trigger.minDaysInactive'
                    ]
                  }
                  overridden={Boolean(
                    overriddenFieldKeys?.has(
                      'trigger.minDaysInactive',
                    ),
                  )}
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
                <RecommendationHint
                  recommendation={
                    recommendationByField[
                      'trigger.minDaysOverdue'
                    ]
                  }
                  overridden={Boolean(
                    overriddenFieldKeys?.has(
                      'trigger.minDaysOverdue',
                    ),
                  )}
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
            <RecommendationHint
              recommendation={
                recommendationByField[
                  'trigger.requiredIntegrations'
                ]
              }
              overridden={Boolean(
                overriddenFieldKeys?.has(
                  'trigger.requiredIntegrations',
                ),
              )}
            />
          </div>
        </div>
      </FormSection>

      <ImpactPreview
        estimatedEligibleCustomers={estimatedEligibleCustomers}
        estimatedRunsPerDay={
          impactSummary?.estimatedRunsPerDay
        }
        confidenceDistribution={liveDistribution}
        warnings={impactWarnings}
        explanation={
          impactSummary?.explanations?.[0] ??
          (confidenceMode === 'auto'
            ? 'Eligible customers update as signal, actions, and segments change.'
            : null)
        }
      />

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
