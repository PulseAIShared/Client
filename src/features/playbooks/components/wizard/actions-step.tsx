import {
  useFormContext,
} from 'react-hook-form';
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

export type ActionChannelOption = {
  key: string;
  label: string;
  actionType: ActionType;
  isAvailable: boolean;
  unavailableReason?: string;
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

  return (
    <FormSection
      title="Actions"
      description="Choose channels and configure what should happen when this playbook triggers."
    >
      <div className="space-y-3 rounded-xl border border-border-primary/30 p-4 bg-surface-secondary/30">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Channels
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Integration-backed channels are available once
            connected.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {channelOptions.map((option) => {
            const isSelected =
              selectedActionTypeSet.has(option.actionType);
            const canToggleOn =
              option.isAvailable || isSelected;

            return (
              <label
                key={option.key}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  canToggleOn
                    ? 'border-border-primary/30 bg-surface-primary/60 text-text-primary'
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
                  className="h-4 w-4 rounded border-border-primary/40"
                />
                <span>{option.label}</span>
                {!option.isAvailable && !isSelected && (
                  <span className="ml-auto text-[11px] text-text-muted">
                    Connect first
                  </span>
                )}
              </label>
            );
          })}
        </div>

        {channelOptions.some(
          (option) => !option.isAvailable,
        ) && (
          <p className="text-xs text-text-muted">
            Some channels are unavailable because required
            integrations are not connected.
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
              <div className="mb-3">
                <div className="text-sm font-medium text-text-secondary">
                  {channel.label}
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {formatEnumLabel(channel.actionType, [
                    'Stripe Retry',
                    'Slack Alert',
                    'CRM Task',
                    'HubSpot Workflow',
                    'Email',
                    'Webhook',
                  ])}
                </p>
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
