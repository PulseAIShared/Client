import { useFormContext } from 'react-hook-form';
import { ActionType } from '@/types/playbooks';
import type { PlaybookFormValues } from '@/features/playbooks/schemas/playbook-form-schema';

const inputClass =
  'w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200';

type ActionConfigFieldsProps = {
  index: number;
  actionType: ActionType;
};

export const ActionConfigFields = ({
  index,
  actionType,
}: ActionConfigFieldsProps) => {
  const { register, formState: { errors } } =
    useFormContext<PlaybookFormValues>();

  const actionErrors =
    errors.actions?.[index]?.config;

  if (actionType === ActionType.StripeRetry) {
    return (
      <div className="text-sm text-text-muted rounded-xl border border-border-primary/30 bg-surface-primary/60 p-4">
        Retries the latest failed payment in Stripe. No
        additional setup required.
      </div>
    );
  }

  if (actionType === ActionType.SlackAlert) {
    return (
      <div className="space-y-3">
        <div>
          <input
            {...register(
              `actions.${index}.config.webhookUrl`,
            )}
            placeholder="Slack webhook URL"
            className={inputClass}
          />
          {actionErrors?.webhookUrl && (
            <p className="mt-1.5 text-xs font-medium text-error">
              {actionErrors.webhookUrl.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            {...register(
              `actions.${index}.config.channel`,
            )}
            placeholder="#support or @owner"
            className={inputClass}
          />
          <input
            {...register(
              `actions.${index}.config.username`,
            )}
            placeholder="Bot name"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            {...register(
              `actions.${index}.config.iconEmoji`,
            )}
            placeholder=":robot_face:"
            className={inputClass}
          />
          <input
            {...register(
              `actions.${index}.config.messageTemplate`,
            )}
            placeholder="Message template"
            className={inputClass}
          />
        </div>
        <p className="text-xs text-text-muted">
          Use placeholders like {'{signal_type}'} and{' '}
          {'{reason}'}
        </p>
      </div>
    );
  }

  if (actionType === ActionType.CrmTask) {
    return (
      <div className="space-y-3">
        <input
          {...register(`actions.${index}.config.subject`)}
          placeholder="Task title"
          className={inputClass}
        />
        <textarea
          {...register(`actions.${index}.config.body`)}
          placeholder="Task description"
          rows={3}
          className={inputClass}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            {...register(
              `actions.${index}.config.dueDays`,
            )}
            placeholder="Due in days"
            type="number"
            min={0}
            className={inputClass}
          />
          <input
            {...register(
              `actions.${index}.config.assignToOwnerId`,
            )}
            placeholder="Owner ID (optional)"
            className={inputClass}
          />
        </div>
      </div>
    );
  }

  // Fallback: raw JSON for other action types
  return (
    <div className="space-y-2">
      <textarea
        {...register(`actions.${index}.config.rawJson`)}
        rows={4}
        placeholder="Advanced JSON configuration"
        className={`${inputClass} font-mono text-xs`}
      />
      <p className="text-xs text-text-muted">
        This action type uses advanced configuration.
      </p>
    </div>
  );
};
