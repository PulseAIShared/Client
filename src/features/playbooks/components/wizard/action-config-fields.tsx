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
              `actions.${index}.config.channel`,
            )}
            placeholder="#support-alerts or @owner"
            className={inputClass}
          />
          {actionErrors?.channel && (
            <p className="mt-1.5 text-xs font-medium text-error">
              {actionErrors.channel.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            {...register(
              `actions.${index}.config.messageTemplate`,
            )}
            placeholder="Message template (optional)"
            className={inputClass}
          />
          <input
            {...register(
              `actions.${index}.config.username`,
            )}
            placeholder="Display name (optional)"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            {...register(
              `actions.${index}.config.iconEmoji`,
            )}
            placeholder="Icon emoji (optional)"
            className={inputClass}
          />
          <input
            {...register(
              `actions.${index}.config.webhookUrl`,
            )}
            placeholder="Webhook override URL (optional)"
            className={inputClass}
          />
        </div>
        <p className="text-xs text-text-muted">
          Uses your connected Slack integration token by
          default. Add a webhook URL only if you need a
          specific override. Message template placeholders:{' '}
          {'{signal_type}'}, {'{reason}'}, {'{customer_id}'}.
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

  if (actionType === ActionType.Email) {
    return (
      <div className="space-y-3">
        <div>
          <input
            {...register(`actions.${index}.config.subject`)}
            placeholder="Email subject"
            className={inputClass}
          />
          {actionErrors?.subject && (
            <p className="mt-1.5 text-xs font-medium text-error">
              {actionErrors.subject.message}
            </p>
          )}
        </div>
        <div>
          <textarea
            {...register(`actions.${index}.config.body`)}
            placeholder="Email body (HTML or plain text)"
            rows={4}
            className={inputClass}
          />
          {actionErrors?.body && (
            <p className="mt-1.5 text-xs font-medium text-error">
              {actionErrors.body.message}
            </p>
          )}
        </div>
        <input
          {...register(
            `actions.${index}.config.senderProfileId`,
          )}
          placeholder="Sender profile ID (optional)"
          className={inputClass}
        />
        <p className="text-xs text-text-muted">
          Optional sender profile ID to force a specific
          connected sender. Leave blank to use the default
          connected sender profile.
        </p>
      </div>
    );
  }

  if (actionType === ActionType.Webhook) {
    return (
      <div className="space-y-3">
        <div>
          <input
            {...register(`actions.${index}.config.webhookUrl`)}
            placeholder="Webhook URL"
            className={inputClass}
          />
          {actionErrors?.webhookUrl && (
            <p className="mt-1.5 text-xs font-medium text-error">
              {actionErrors.webhookUrl.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            {...register(
              `actions.${index}.config.webhookMethod`,
            )}
            className={inputClass}
            defaultValue="POST"
          >
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="GET">GET</option>
            <option value="DELETE">DELETE</option>
          </select>
          <div className="text-xs text-text-muted flex items-center">
            Use placeholders like {'{run_id}'} and{' '}
            {'{reason}'}.
          </div>
        </div>
        <textarea
          {...register(`actions.${index}.config.webhookBody`)}
          placeholder="Optional JSON payload template"
          rows={4}
          className={`${inputClass} font-mono text-xs`}
        />
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
