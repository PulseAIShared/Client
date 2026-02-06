import { useFormContext } from 'react-hook-form';
import { FormSection } from '@/components/ui/form-section';
import { Button } from '@/components/ui/button';
import {
  enumLabelMap,
  formatEnumLabel,
} from '@/features/playbooks/utils';
import {
  signalOptions,
} from '@/features/playbooks/schemas/playbook-form-schema';
import type { PlaybookFormValues } from '@/features/playbooks/schemas/playbook-form-schema';
import { Pencil } from 'lucide-react';

type ReviewStepProps = {
  onEditStep: (step: number) => void;
};

const ReviewRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
    <dt className="text-sm font-medium text-text-muted sm:w-48 shrink-0">
      {label}
    </dt>
    <dd className="text-sm text-text-primary">
      {children}
    </dd>
  </div>
);

const EditButton = ({
  onClick,
}: {
  onClick: () => void;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    icon={<Pencil className="h-3.5 w-3.5" />}
  >
    Edit
  </Button>
);

export const ReviewStep = ({
  onEditStep,
}: ReviewStepProps) => {
  const { getValues } =
    useFormContext<PlaybookFormValues>();
  const values = getValues();

  const signal = signalOptions.find(
    (o) => o.value === values.signalType,
  );
  const activeSources = Object.entries(
    values.requiredSources,
  )
    .filter(([, v]) => v)
    .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));

  return (
    <div className="space-y-6">
      <FormSection
        title="Playbook Identity"
        action={<EditButton onClick={() => onEditStep(0)} />}
      >
        <dl className="space-y-3">
          <ReviewRow label="Name">
            {values.name || (
              <span className="text-text-muted italic">
                Not set
              </span>
            )}
          </ReviewRow>
          <ReviewRow label="Category">
            {formatEnumLabel(
              values.category,
              enumLabelMap.category,
            )}
          </ReviewRow>
          <ReviewRow label="Description">
            {values.description || (
              <span className="text-text-muted italic">
                No description
              </span>
            )}
          </ReviewRow>
        </dl>
      </FormSection>

      <FormSection
        title="Trigger Configuration"
        action={<EditButton onClick={() => onEditStep(1)} />}
      >
        <dl className="space-y-3">
          <ReviewRow label="Signal">
            {signal?.label ?? values.signalType}
          </ReviewRow>
          <ReviewRow label="Signal description">
            <span className="text-text-muted">
              {signal?.description}
            </span>
          </ReviewRow>
          <ReviewRow label="Min confidence">
            {formatEnumLabel(
              values.minConfidence,
              enumLabelMap.confidence,
            )}
          </ReviewRow>
          {values.minMrr && (
            <ReviewRow label="Min MRR">
              ${values.minMrr}
            </ReviewRow>
          )}
          {values.minAmount && (
            <ReviewRow label="Min amount">
              ${values.minAmount}
            </ReviewRow>
          )}
          {values.minDaysInactive && (
            <ReviewRow label="Days inactive">
              {values.minDaysInactive}
            </ReviewRow>
          )}
          {values.minDaysOverdue && (
            <ReviewRow label="Days overdue">
              {values.minDaysOverdue}
            </ReviewRow>
          )}
          <ReviewRow label="Required data sources">
            {activeSources.length > 0
              ? activeSources.join(', ')
              : 'None'}
          </ReviewRow>
          <ReviewRow label="Target segments">
            {values.targetSegmentIds.length > 0
              ? `${values.targetSegmentIds.length} segment(s) selected`
              : 'All customers'}
          </ReviewRow>
        </dl>
      </FormSection>

      <FormSection
        title="Execution Settings"
        action={<EditButton onClick={() => onEditStep(2)} />}
      >
        <dl className="space-y-3">
          <ReviewRow label="Execution mode">
            {formatEnumLabel(
              values.executionMode,
              enumLabelMap.executionMode,
            )}
          </ReviewRow>
          <ReviewRow label="Cooldown">
            {values.cooldownHours} hours
          </ReviewRow>
          <ReviewRow label="Max concurrent runs">
            {values.maxConcurrentRuns}
          </ReviewRow>
          <ReviewRow label="Priority">
            {values.priority}
          </ReviewRow>
        </dl>
      </FormSection>

      <FormSection
        title="Actions"
        action={<EditButton onClick={() => onEditStep(3)} />}
      >
        <div className="space-y-3">
          {values.actions.map((action, index) => {
            const typeLabel = formatEnumLabel(
              action.actionType,
              enumLabelMap.actionType,
            );
            let summary = '';
            if (
              action.actionType === 0 /* StripeRetry */
            ) {
              summary =
                'Retry the latest failed Stripe payment';
            } else if (
              action.actionType === 1 /* SlackAlert */
            ) {
              const channel =
                action.config.channel || 'default channel';
              summary = `Send Slack message to ${channel}`;
            } else if (
              action.actionType === 2 /* CrmTask */
            ) {
              const taskSubject =
                action.config.subject || 'CRM task';
              summary = `Create CRM task: ${taskSubject}`;
            } else {
              summary = typeLabel;
            }

            return (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border border-border-primary/30 bg-surface-secondary/30 p-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-primary/10 text-xs font-semibold text-accent-primary">
                  {index + 1}
                </span>
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {typeLabel}
                  </div>
                  <div className="text-xs text-text-muted">
                    {summary}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </FormSection>
    </div>
  );
};
