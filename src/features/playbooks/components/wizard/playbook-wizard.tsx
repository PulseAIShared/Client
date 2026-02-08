import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useForm,
  FormProvider,
  useWatch,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { AppPageHeader, ContentLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Stepper } from '@/components/ui/stepper';
import {
  useCreatePlaybook,
  useGetPlaybookActionChannels,
  useGetPlaybookConnectedIntegrations,
  useRecommendPlaybookBlueprintMutation,
  useTrackPlaybookRecommendationOverride,
} from '@/features/playbooks/api/playbooks';
import { useNotifications } from '@/components/ui/notifications/notifications-store';
import {
  playbookFormSchema,
  PLAYBOOK_DEFAULT_VALUES,
  WIZARD_STEPS,
  STEP_FIELDS,
  defaultSourcesForSignal,
  parseActionConfigJson,
  toPlaybookInput,
  TriggerSignalType,
} from '@/features/playbooks/schemas/playbook-form-schema';
import type { PlaybookFormValues } from '@/features/playbooks/schemas/playbook-form-schema';
import {
  ActionType,
  ConfidenceEligibilityDistribution,
  PlaybookFieldRecommendation,
} from '@/types/playbooks';

import { IdentityStep } from './identity-step';
import { TriggerStep } from './trigger-step';
import { ExecutionStep } from './execution-step';
import {
  ActionChannelOption,
  ActionsStep,
} from './actions-step';
import { ReviewStep } from './review-step';
import { WizardFooter } from './wizard-footer';
import { CreationModeSelector } from './creation-mode-selector';
import { DetectedIntegrations } from './detected-integrations';
import {
  getActionTypeIntegrationKey,
  normalizeIntegrationKey,
} from './integration-visuals';

const goalOptions = [
  {
    value: 'auto',
    label: 'Auto-detect from integrations',
  },
  {
    value: 'recover_failed_payments',
    label: 'Recover failed payments',
  },
  {
    value: 'reengage_inactive_customers',
    label: 'Re-engage inactive customers',
  },
  {
    value: 'escalate_lost_deals',
    label: 'Escalate lost deals',
  },
] as const;

const automationLevelOptions = [
  {
    value: 'balanced',
    label: 'Balanced',
  },
  {
    value: 'aggressive',
    label: 'Aggressive automation',
  },
  {
    value: 'cautious',
    label: 'Cautious',
  },
] as const;

const riskToleranceOptions = [
  {
    value: 'medium',
    label: 'Medium',
  },
  {
    value: 'high',
    label: 'High',
  },
  {
    value: 'low',
    label: 'Low',
  },
] as const;

type CreationMode = 'ai-assisted' | 'from-scratch';

type PlaybookActionChannel = Omit<
  ActionChannelOption,
  'isAvailable' | 'unavailableReason'
> & {
  requiredProvider?: string;
};

const defaultActionChannels: PlaybookActionChannel[] = [
  {
    key: 'stripe',
    label: 'Stripe',
    actionType: ActionType.StripeRetry,
    requiredProvider: 'stripe',
  },
  {
    key: 'slack',
    label: 'Slack',
    actionType: ActionType.SlackAlert,
    requiredProvider: 'slack',
  },
  {
    key: 'hubspot',
    label: 'HubSpot',
    actionType: ActionType.CrmTask,
    requiredProvider: 'hubspot',
  },
  {
    key: 'email',
    label: 'Email',
    actionType: ActionType.Email,
  },
  {
    key: 'webhook',
    label: 'Webhook',
    actionType: ActionType.Webhook,
  },
];

const parseActionTypeValue = (
  value: unknown,
): ActionType | null => {
  if (
    typeof value === 'number' &&
    ActionType[value] !== undefined
  ) {
    return value as ActionType;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const numericValue = Number(value);
  if (
    Number.isFinite(numericValue) &&
    ActionType[numericValue] !== undefined
  ) {
    return numericValue as ActionType;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[_\-\s]+/g, '');

  switch (normalized) {
    case 'striperetry':
      return ActionType.StripeRetry;
    case 'slackalert':
      return ActionType.SlackAlert;
    case 'crmtask':
      return ActionType.CrmTask;
    case 'hubspotworkflow':
      return ActionType.HubspotWorkflow;
    case 'email':
      return ActionType.Email;
    case 'webhook':
      return ActionType.Webhook;
    default:
      return null;
  }
};

const assistantInputClass =
  'w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200';

const isTriggerSignalType = (
  value: string,
): value is TriggerSignalType =>
  value === 'payment_failure' ||
  value === 'inactivity_7d' ||
  value === 'deal_lost';

const parseEnumNumber = (
  value: number | string | null | undefined,
  fallback: number,
) => {
  if (typeof value === 'number') {
    return value;
  }
  if (
    value !== null &&
    value !== undefined &&
    Number.isFinite(Number(value))
  ) {
    return Number(value);
  }
  return fallback;
};

const toNumericString = (
  value: number | null | undefined,
) => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

const mapRequiredSources = (
  signalType: TriggerSignalType,
  requiredIntegrations: string[],
) => {
  const mapped = {
    stripe: false,
    posthog: false,
    hubspot: false,
  };

  requiredIntegrations.forEach((integration) => {
    const key = integration.trim().toLowerCase();
    if (key === 'stripe') {
      mapped.stripe = true;
    }
    if (key === 'posthog') {
      mapped.posthog = true;
    }
    if (key === 'hubspot') {
      mapped.hubspot = true;
    }
  });

  if (
    !mapped.stripe &&
    !mapped.posthog &&
    !mapped.hubspot
  ) {
    return defaultSourcesForSignal(signalType);
  }

  return mapped;
};

const mapActionTypeToChannelKey = (
  actionType: number,
): string | null => {
  switch (actionType) {
    case ActionType.StripeRetry:
      return 'stripe';
    case ActionType.SlackAlert:
      return 'slack';
    case ActionType.CrmTask:
    case ActionType.HubspotWorkflow:
      return 'hubspot';
    case ActionType.Email:
      return 'email';
    case ActionType.Webhook:
      return 'webhook';
    default:
      return null;
  }
};

const safeSerialize = (value: unknown) =>
  JSON.stringify(value ?? null);

const getFieldValueForComparison = (
  fieldKey: string,
  values: PlaybookFormValues,
) => {
  switch (fieldKey) {
    case 'identity.category':
      return values.category;
    case 'identity.name':
      return values.name.trim();
    case 'identity.description':
      return values.description?.trim() || '';
    case 'trigger.signalType':
      return values.signalType;
    case 'trigger.minAmount': {
      if (!values.minAmount?.trim()) {
        return null;
      }
      const parsed = Number(values.minAmount);
      return Number.isFinite(parsed) ? parsed : null;
    }
    case 'trigger.minMrr': {
      if (!values.minMrr?.trim()) {
        return null;
      }
      const parsed = Number(values.minMrr);
      return Number.isFinite(parsed) ? parsed : null;
    }
    case 'trigger.minDaysOverdue': {
      if (!values.minDaysOverdue?.trim()) {
        return null;
      }
      const parsed = Number(values.minDaysOverdue);
      return Number.isFinite(parsed) ? parsed : null;
    }
    case 'trigger.minDaysInactive': {
      if (!values.minDaysInactive?.trim()) {
        return null;
      }
      const parsed = Number(values.minDaysInactive);
      return Number.isFinite(parsed) ? parsed : null;
    }
    case 'trigger.requiredIntegrations':
      return Object.entries(values.requiredSources)
        .filter(([, enabled]) => enabled)
        .map(([provider]) => provider)
        .sort();
    case 'execution.executionMode':
      return values.executionMode;
    case 'execution.cooldownHours':
      return values.cooldownHours;
    case 'execution.maxConcurrentRuns':
      return values.maxConcurrentRuns;
    case 'execution.priority':
      return values.priority;
    case 'actions.sequence':
      return values.actions.map((action) =>
        Number(action.actionType),
      );
    case 'confidence.mode':
      return values.confidenceMode;
    case 'confidence.minLevel':
      return Number(values.minConfidence);
    default:
      return null;
  }
};

const areSetsEqual = (
  left: ReadonlySet<string>,
  right: ReadonlySet<string>,
) => {
  if (left.size !== right.size) {
    return false;
  }
  for (const value of left) {
    if (!right.has(value)) {
      return false;
    }
  }
  return true;
};

export const PlaybookWizard = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const createMutation = useCreatePlaybook();
  const recommendBlueprintMutation =
    useRecommendPlaybookBlueprintMutation();
  const trackOverrideMutation =
    useTrackPlaybookRecommendationOverride();
  const {
    data: actionChannelsData,
    isSuccess: isActionChannelsSuccess,
  } = useGetPlaybookActionChannels();
  const { data: connectedIntegrationsData } =
    useGetPlaybookConnectedIntegrations();

  const [currentStep, setCurrentStep] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [creationMode, setCreationMode] =
    useState<CreationMode | null>(null);
  const [hasGeneratedDraft, setHasGeneratedDraft] =
    useState(false);
  const [goal, setGoal] = useState<string>('auto');
  const [automationLevel, setAutomationLevel] =
    useState<string>('balanced');
  const [riskTolerance, setRiskTolerance] =
    useState<string>('medium');
  const [recommendationByField, setRecommendationByField] =
    useState<Record<string, PlaybookFieldRecommendation>>(
      {},
    );
  const [overriddenFieldKeys, setOverriddenFieldKeys] =
    useState<Set<string>>(new Set());
  const [lastRecommendationSummary, setLastRecommendationSummary] =
    useState<{
      estimatedEligibleCustomers: number;
      estimatedRunsPerDay: number;
      estimatedConfidenceDistribution: ConfidenceEligibilityDistribution;
      warnings: string[];
      explanations: string[];
    } | null>(null);

  const recommendationSessionIdRef = useRef(
    globalThis.crypto?.randomUUID?.() ??
      `playbook-rec-${Date.now()}`,
  );
  const trackedOverrideKeysRef = useRef(new Set<string>());

  const form = useForm<PlaybookFormValues>({
    resolver: zodResolver(playbookFormSchema),
    defaultValues: PLAYBOOK_DEFAULT_VALUES,
    mode: 'onTouched',
  });

  const watchedValues = useWatch({
    control: form.control,
  });

  const stepRecommendationProps = useMemo(
    () => ({
      recommendationByField,
      overriddenFieldKeys,
    }),
    [recommendationByField, overriddenFieldKeys],
  );

  const connectedProviders = useMemo(
    () =>
      connectedIntegrationsData?.providers ?? [],
    [connectedIntegrationsData],
  );

  const apiActionChannels = useMemo(
    () => actionChannelsData?.channels ?? [],
    [actionChannelsData],
  );

  const hasApiActionChannels =
    isActionChannelsSuccess &&
    apiActionChannels.length > 0;

  const actionChannelOptions = useMemo<
    ActionChannelOption[]
  >(() => {
    const baseChannelsByKey = new Map(
      defaultActionChannels.map((channel) => [
        channel.key.toLowerCase(),
        channel,
      ]),
    );

    const apiChannelsByKey = new Map(
      apiActionChannels.map((channel) => [
        String(channel.key).toLowerCase(),
        channel,
      ]),
    );

    const orderedKeys = [
      ...defaultActionChannels.map((channel) =>
        channel.key.toLowerCase(),
      ),
      ...apiActionChannels
        .map((channel) =>
          String(channel.key).toLowerCase(),
        )
        .filter(
          (key) => !baseChannelsByKey.has(key),
        ),
    ];

    return orderedKeys.flatMap((key) => {
      const baseChannel = baseChannelsByKey.get(key);
      const apiChannel = apiChannelsByKey.get(key);
      const resolvedActionType =
        parseActionTypeValue(apiChannel?.actionType) ??
        baseChannel?.actionType ??
        null;

      if (resolvedActionType === null) {
        return [];
      }

      const isAvailable =
        hasApiActionChannels && apiChannel
          ? Boolean(apiChannel.isConnected)
          : baseChannel?.requiredProvider
            ? connectedProviders.includes(
                baseChannel.requiredProvider,
              )
            : true;

      const label =
        apiChannel?.label ??
        baseChannel?.label ??
        key.toUpperCase();
      const providerKey =
        normalizeIntegrationKey(
          String(
            apiChannel?.key ??
              baseChannel?.key ??
              '',
          ),
        ) ||
        getActionTypeIntegrationKey(
          resolvedActionType,
        );

      const unavailableReason = isAvailable
        ? undefined
        : apiChannel?.status
          ? `${label} channel status is ${apiChannel.status}.`
          : `${label} action channel is not connected.`;

      return [
        {
          key: apiChannel?.key ?? baseChannel?.key ?? key,
          label,
          actionType: resolvedActionType,
          isAvailable,
          unavailableReason,
          providerKey,
          status:
            apiChannel?.status ??
            (isAvailable
              ? 'Connected'
              : 'Not connected'),
          integrationId:
            apiChannel?.integrationId ?? null,
        },
      ];
    });
  }, [
    apiActionChannels,
    connectedProviders,
    hasApiActionChannels,
  ]);

  useEffect(() => {
    if (
      !watchedValues ||
      Object.keys(recommendationByField).length === 0
    ) {
      return;
    }

    const nextOverrides = new Set<string>();

    Object.entries(recommendationByField).forEach(
      ([fieldKey, recommendation]) => {
        const currentValue =
          getFieldValueForComparison(
            fieldKey,
            watchedValues as PlaybookFormValues,
          );
        const serializedCurrent =
          safeSerialize(currentValue);
        const serializedRecommended =
          recommendation.recommendedValue ?? 'null';
        const isOverridden =
          serializedCurrent !== serializedRecommended;

        if (isOverridden) {
          nextOverrides.add(fieldKey);

          if (
            !trackedOverrideKeysRef.current.has(fieldKey)
          ) {
            trackedOverrideKeysRef.current.add(fieldKey);
            trackOverrideMutation.mutate({
              fieldKey,
              recommendedValue:
                serializedRecommended,
              selectedValue: serializedCurrent,
              goal,
              sessionId:
                recommendationSessionIdRef.current,
            });
          }
        }
      },
    );

    setOverriddenFieldKeys((previous) =>
      areSetsEqual(previous, nextOverrides)
        ? previous
        : nextOverrides,
    );
  }, [
    watchedValues,
    recommendationByField,
    trackOverrideMutation,
    goal,
  ]);

  const handleGenerateDraft = async () => {
    const currentValues = form.getValues();
    const channelsFromActions = Array.from(
      new Set(
        currentValues.actions
          .map((action) =>
            mapActionTypeToChannelKey(
              Number(action.actionType),
            ),
          )
          .filter(
            (channel): channel is string =>
              channel !== null,
          ),
      ),
    );
    const channelsFromAvailability = actionChannelOptions
      .filter((channel) => channel.isAvailable)
      .map((channel) => channel.key);
    const preferredChannelsForHint =
      channelsFromActions.length > 0
        ? channelsFromActions
        : channelsFromAvailability;

    try {
      const response =
        await recommendBlueprintMutation.mutateAsync({
          goal,
          hints: {
            automationLevel,
            preferredChannels:
              preferredChannelsForHint,
            riskTolerance,
          },
          currentDraft: {
            name: currentValues.name || null,
            category: currentValues.category,
            signalType: currentValues.signalType,
            actionTypes: currentValues.actions.map(
              (action) => action.actionType,
            ),
          },
        });

      const signalTypeRaw =
        response.trigger.signalType?.toString() ??
        currentValues.signalType;
      const signalType = isTriggerSignalType(
        signalTypeRaw,
      )
        ? signalTypeRaw
        : currentValues.signalType;

      const mappedActions =
        response.actions.length > 0
          ? response.actions
              .slice()
              .sort(
                (left, right) =>
                  left.orderIndex - right.orderIndex,
              )
              .map((action) => {
                const actionType = parseEnumNumber(
                  action.actionType,
                  ActionType.SlackAlert,
                ) as ActionType;

                return {
                  actionType,
                  config: parseActionConfigJson(
                    actionType,
                    action.configJson,
                  ),
                };
              })
          : currentValues.actions;

      const nextValues: PlaybookFormValues = {
        ...currentValues,
        name:
          response.identity.name?.trim() ||
          currentValues.name,
        description:
          response.identity.description ?? '',
        category: parseEnumNumber(
          response.identity.category,
          currentValues.category,
        ) as PlaybookFormValues['category'],
        signalType,
        minAmount: toNumericString(
          response.trigger.conditions.minAmount,
        ),
        minMrr: toNumericString(
          response.trigger.conditions.minMrr,
        ),
        minDaysOverdue: toNumericString(
          response.trigger.conditions.minDaysOverdue,
        ),
        minDaysInactive: toNumericString(
          response.trigger.conditions.minDaysInactive,
        ),
        requiredSources: mapRequiredSources(
          signalType,
          response.trigger.requiredIntegrations ?? [],
        ),
        executionMode: parseEnumNumber(
          response.execution.executionMode,
          currentValues.executionMode,
        ) as PlaybookFormValues['executionMode'],
        cooldownHours: response.execution.cooldownHours,
        maxConcurrentRuns:
          response.execution.maxConcurrentRuns,
        priority: response.execution.priority,
        actions: mappedActions,
        confidenceMode: 'auto',
        minConfidence: parseEnumNumber(
          response.confidence.recommendedMinConfidence,
          currentValues.minConfidence,
        ) as PlaybookFormValues['minConfidence'],
      };

      form.reset(nextValues);

      const recommendationMap = Object.fromEntries(
        (response.fieldRecommendations ?? []).map(
          (recommendation) => [
            recommendation.fieldKey,
            recommendation,
          ],
        ),
      );

      trackedOverrideKeysRef.current.clear();
      setOverriddenFieldKeys(new Set());
      setRecommendationByField(recommendationMap);
      setLastRecommendationSummary({
        estimatedEligibleCustomers:
          response.impact.estimatedEligibleCustomers,
        estimatedRunsPerDay:
          response.impact.estimatedRunsPerDay,
        estimatedConfidenceDistribution:
          response.impact
            .estimatedConfidenceDistribution,
        warnings: response.warnings,
        explanations: response.explanations,
      });
      setHasGeneratedDraft(true);

      addNotification({
        type: 'success',
        title: 'Draft generated',
      });
    } catch {
      addNotification({
        type: 'error',
        title: 'Could not generate draft',
      });
    }
  };

  const handleCreationModeSelect = (
    mode: CreationMode,
  ) => {
    setCreationMode(mode);
    if (mode === 'from-scratch') {
      setHasGeneratedDraft(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!creationMode) {
        addNotification({
          type: 'warning',
          title: 'Choose a creation mode to continue.',
        });
        return;
      }

      if (
        creationMode === 'ai-assisted' &&
        !hasGeneratedDraft
      ) {
        addNotification({
          type: 'warning',
          title:
            'Generate a draft first, or switch to from-scratch mode.',
        });
        return;
      }
    }

    const fieldsToValidate = STEP_FIELDS[currentStep];
    if (!fieldsToValidate) {
      setCurrentStep((step) => step + 1);
      return;
    }

    setIsValidating(true);
    const isValid = await form.trigger(fieldsToValidate);
    setIsValidating(false);

    if (isValid) {
      setCurrentStep((step) => step + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(0, step - 1));
  };

  const handleStepClick = (index: number) => {
    if (index < currentStep) {
      setCurrentStep(index);
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      const errors = form.formState.errors;
      for (const [stepStr, fields] of Object.entries(
        STEP_FIELDS,
      )) {
        const stepIndex = Number(stepStr);
        const hasError = fields.some(
          (field) => errors[field],
        );
        if (hasError) {
          setCurrentStep(stepIndex);
          addNotification({
            type: 'warning',
            title:
              'Please fix the errors before submitting.',
          });
          return;
        }
      }
      return;
    }

    const values = form.getValues();
    const payload = toPlaybookInput(values);

    createMutation.mutate(payload, {
      onSuccess: (created) => {
        addNotification({
          type: 'success',
          title: 'Playbook created',
        });
        navigate(`/app/playbooks/${created.id}`);
      },
    });
  };

  const handleCancel = () => {
    navigate('/app/playbooks');
  };

  const lastStep = WIZARD_STEPS.length - 1;
  const isReviewStep = currentStep === lastStep;

  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8">
        <AppPageHeader
          title="Create Playbook"
          description="Define triggers, actions, and execution rules."
          compact
        />

        <Stepper
          steps={[...WIZARD_STEPS]}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl border border-border-primary/30 shadow-xl p-4 sm:p-6"
        />

        <FormProvider {...form}>
          <form
            onSubmit={(event) => event.preventDefault()}
            className="space-y-6"
          >
            {currentStep === 0 && (
              <div className="space-y-6">
                {!creationMode && (
                  <CreationModeSelector
                    onSelect={handleCreationModeSelect}
                  />
                )}

                {creationMode === 'ai-assisted' && (
                  <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-5 sm:p-6 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-text-primary">
                          AI-assisted generation
                        </h2>
                        <p className="text-sm text-text-muted mt-1">
                          Generate a draft and continue refining
                          every field manually.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setCreationMode(null)
                        }
                      >
                        Change mode
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Goal template
                        </label>
                        <select
                          value={goal}
                          onChange={(event) =>
                            setGoal(
                              event.target.value,
                            )
                          }
                          className={assistantInputClass}
                        >
                          {goalOptions.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Automation level
                        </label>
                        <select
                          value={automationLevel}
                          onChange={(event) =>
                            setAutomationLevel(
                              event.target.value,
                            )
                          }
                          className={assistantInputClass}
                        >
                          {automationLevelOptions.map(
                            (option) => (
                              <option
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Risk tolerance
                        </label>
                        <select
                          value={riskTolerance}
                          onChange={(event) =>
                            setRiskTolerance(
                              event.target.value,
                            )
                          }
                          className={assistantInputClass}
                        >
                          {riskToleranceOptions.map(
                            (option) => (
                              <option
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    </div>

                    <DetectedIntegrations
                      connectedProviders={
                        connectedProviders
                      }
                    />

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        onClick={handleGenerateDraft}
                        isLoading={
                          recommendBlueprintMutation.isPending
                        }
                      >
                        Generate & Continue
                      </Button>
                      {!hasGeneratedDraft && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            handleCreationModeSelect(
                              'from-scratch',
                            )
                          }
                        >
                          Continue from scratch
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {(creationMode === 'from-scratch' ||
                  (creationMode === 'ai-assisted' &&
                    hasGeneratedDraft)) && (
                  <IdentityStep
                    {...stepRecommendationProps}
                  />
                )}
              </div>
            )}
            {currentStep === 1 && (
              <TriggerStep
                {...stepRecommendationProps}
                impactSummary={
                  lastRecommendationSummary
                }
              />
            )}
            {currentStep === 2 && (
              <ExecutionStep
                {...stepRecommendationProps}
              />
            )}
            {currentStep === 3 && (
              <ActionsStep
                channelOptions={actionChannelOptions}
                {...stepRecommendationProps}
              />
            )}
            {isReviewStep && (
              <ReviewStep onEditStep={setCurrentStep} />
            )}

            <WizardFooter
              currentStep={currentStep}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={createMutation.isPending}
              isValidating={isValidating}
            />
          </form>
        </FormProvider>
      </div>
    </ContentLayout>
  );
};
