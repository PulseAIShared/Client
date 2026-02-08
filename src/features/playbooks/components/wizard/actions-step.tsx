import {
  useFormContext,
} from 'react-hook-form';
import { Link } from 'react-router-dom';
import { FormSection } from '@/components/ui/form-section';
import { ActionType } from '@/types/playbooks';
import { formatEnumLabel } from '@/features/playbooks/utils';
import {
  defaultActionConfig,
} from '@/features/playbooks/schemas/playbook-form-schema';
import type { PlaybookFormValues } from '@/features/playbooks/schemas/playbook-form-schema';
import { PlaybookFieldRecommendation } from '@/types/playbooks';
import { ActionConfigFields } from './action-config-fields';
import { RecommendationHint } from './recommendation-hint';
import { useMemo } from 'react';
import {
  getActionTypeIntegrationKey,
  IntegrationBadgeIcon,
} from './integration-visuals';

export type ActionChannelOption = {
  key: string;
  label: string;
  actionType: ActionType;
  isAvailable: boolean;
  unavailableReason?: string;
  providerKey?: string;
  status?: string;
  integrationId?: string | null;
};

type ActionsStepProps = {
  channelOptions: ActionChannelOption[];
  recommendationByField?: Record<
    string,
    PlaybookFieldRecommendation
  >;
  overriddenFieldKeys?: ReadonlySet<string>;
};

export const ActionsStep = ({
  channelOptions,
  recommendationByField = {},
  overriddenFieldKeys,
}: ActionsStepProps) => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<PlaybookFormValues>();

  const actions = watch('actions');

  const selectedActionTypeSet = useMemo(
    () =>
      new Set(
        actions.map((action) => Number(action.actionType)),
      ),
    [actions],
  );

  const syncActionsByChannels = (
    nextSelectedActionTypes: number[],
  ) => {
    const previousByType = new Map(
      actions.map((action) => [
        Number(action.actionType),
        action.config,
      ]),
    );

    const nextActions = nextSelectedActionTypes.map(
      (actionType) => ({
        actionType: actionType as ActionType,
        config:
          previousByType.get(actionType) ??
          defaultActionConfig(actionType as ActionType),
      }),
    );

    setValue('actions', nextActions, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const toggleChannel = (
    option: ActionChannelOption,
    checked: boolean,
  ) => {
    const currentSelected = new Set(
      selectedActionTypeSet,
    );

    if (checked) {
      currentSelected.add(option.actionType);
    } else {
      currentSelected.delete(option.actionType);
    }

    const orderedActionTypes = channelOptions
      .map((channel) => channel.actionType)
      .filter((actionType) =>
        currentSelected.has(actionType),
      );

    syncActionsByChannels(orderedActionTypes);
  };

  const selectedChannels = channelOptions.filter((option) =>
    selectedActionTypeSet.has(option.actionType),
  );

  const getActionDescription = (
    actionType: ActionType,
  ) =>
    formatEnumLabel(actionType, [
      'Retry failed Stripe payment',
      'Send Slack alert',
      'Create CRM follow-up task',
      'Trigger HubSpot workflow',
      'Send email',
      'Call outbound webhook',
    ]);

  return (
    <FormSection
      title="Actions"
      description="Choose action channels and configure what should happen when this playbook triggers."
    >
      <div className="space-y-3 rounded-xl border border-border-primary/30 p-4 bg-surface-secondary/30">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Action channels
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Webhook is always available. Integration-backed
            channels (including Email sender channels) are
            available once connected.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {channelOptions.map((option) => {
            const isSelected =
              selectedActionTypeSet.has(option.actionType);
            const canToggleOn =
              option.isAvailable || isSelected;
            const providerKey =
              option.providerKey ??
              getActionTypeIntegrationKey(
                option.actionType,
              );
            const statusLabel = option.isAvailable
              ? 'Connected'
              : 'Connect required';

            return (
              <label
                key={option.key}
                className={`group flex gap-3 rounded-xl border px-3 py-3 text-sm transition-all ${
                  canToggleOn
                    ? 'border-border-primary/30 bg-surface-primary/60 text-text-primary hover:border-accent-primary/40 hover:bg-surface-secondary/40'
                    : 'border-border-primary/20 bg-surface-primary/30 text-text-muted'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={!canToggleOn}
                  onChange={(event) =>
                    toggleChannel(
                      option,
                      event.target.checked,
                    )
                  }
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-primary/40"
                />
                <IntegrationBadgeIcon
                  integration={providerKey}
                  size="sm"
                  className={
                    canToggleOn
                      ? ''
                      : 'opacity-70'
                  }
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">
                      {option.label}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                        option.isAvailable
                          ? 'border-success/40 bg-success/10 text-success'
                          : 'border-border-primary/35 bg-surface-secondary/50 text-text-muted'
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    {getActionDescription(
                      option.actionType,
                    )}
                  </p>
                  {!option.isAvailable &&
                    !isSelected && (
                      <p className="mt-1 text-[11px] text-text-muted">
                        {option.unavailableReason ??
                          'Connect this channel in Integrations before enabling it here.'}
                      </p>
                    )}
                </div>
              </label>
            );
          })}
        </div>

        {channelOptions.some(
          (option) => !option.isAvailable,
        ) && (
          <p className="text-xs text-text-muted">
            Some action channels are unavailable because their
            channel connection is not active.{' '}
            <Link
              to="/app/integrations?capability=action_channel"
              className="text-accent-primary hover:underline"
            >
              Manage action channels
            </Link>
          </p>
        )}
      </div>

      {errors.actions?.root && (
        <p className="text-xs font-medium text-error">
          {errors.actions.root.message}
        </p>
      )}
      <RecommendationHint
        recommendation={
          recommendationByField['actions.sequence']
        }
        overridden={Boolean(
          overriddenFieldKeys?.has('actions.sequence'),
        )}
      />

      <div className="space-y-4">
        {selectedChannels.length === 0 && (
          <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/30 p-4 text-sm text-text-muted">
            Select at least one channel to configure its
            action.
          </div>
        )}

        {selectedChannels.map((channel) => {
          const index = actions.findIndex(
            (action) =>
              Number(action.actionType) ===
              channel.actionType,
          );

          if (index < 0) {
            return null;
          }

          return (
            <div
              key={channel.key}
              className="rounded-xl border border-border-primary/30 p-4 bg-surface-secondary/40"
            >
              <div className="mb-3 flex items-start gap-3">
                <IntegrationBadgeIcon
                  integration={
                    channel.providerKey ??
                    getActionTypeIntegrationKey(
                      channel.actionType,
                    )
                  }
                  size="sm"
                />
                <div>
                  <div className="text-sm font-medium text-text-secondary">
                    {channel.label}
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {getActionDescription(
                      channel.actionType,
                    )}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Action settings
                </label>
                <ActionConfigFields
                  index={index}
                  actionType={channel.actionType}
                />
              </div>
            </div>
          );
        })}
      </div>
    </FormSection>
  );
};
