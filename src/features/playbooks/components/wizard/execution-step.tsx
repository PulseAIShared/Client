import { useFormContext } from 'react-hook-form';
import { FormSection } from '@/components/ui/form-section';
import { enumLabelMap } from '@/features/playbooks/utils';
import type { PlaybookFormValues } from '@/features/playbooks/schemas/playbook-form-schema';
import { PlaybookFieldRecommendation } from '@/types/playbooks';
import { RecommendationHint } from './recommendation-hint';

const inputClass =
  'w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200';

type ExecutionStepProps = {
  recommendationByField?: Record<
    string,
    PlaybookFieldRecommendation
  >;
  overriddenFieldKeys?: ReadonlySet<string>;
};

export const ExecutionStep = ({
  recommendationByField = {},
  overriddenFieldKeys,
}: ExecutionStepProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<PlaybookFormValues>();

  return (
    <FormSection
      title="Execution Settings"
      description="Control how and when this playbook runs."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Execution mode
          </label>
          <select
            {...register('executionMode', {
              valueAsNumber: true,
            })}
            className={inputClass}
          >
            {enumLabelMap.executionMode.map(
              (label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ),
            )}
          </select>
          <p className="text-xs text-text-muted mt-2">
            Approval mode sends runs to the work queue for
            review before executing.
          </p>
          <RecommendationHint
            recommendation={
              recommendationByField[
                'execution.executionMode'
              ]
            }
            overridden={Boolean(
              overriddenFieldKeys?.has(
                'execution.executionMode',
              ),
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Cooldown (hours)
          </label>
          <input
            type="number"
            min={0}
            {...register('cooldownHours', {
              valueAsNumber: true,
            })}
            className={inputClass}
          />
          {errors.cooldownHours && (
            <p className="mt-1.5 text-xs font-medium text-error">
              {errors.cooldownHours.message}
            </p>
          )}
          <p className="text-xs text-text-muted mt-2">
            Minimum hours between runs for the same
            customer.
          </p>
          <RecommendationHint
            recommendation={
              recommendationByField[
                'execution.cooldownHours'
              ]
            }
            overridden={Boolean(
              overriddenFieldKeys?.has(
                'execution.cooldownHours',
              ),
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Max concurrent runs
          </label>
          <input
            type="number"
            min={1}
            {...register('maxConcurrentRuns', {
              valueAsNumber: true,
            })}
            className={inputClass}
          />
          {errors.maxConcurrentRuns && (
            <p className="mt-1.5 text-xs font-medium text-error">
              {errors.maxConcurrentRuns.message}
            </p>
          )}
          <p className="text-xs text-text-muted mt-2">
            Maximum number of active runs at any given time.
          </p>
          <RecommendationHint
            recommendation={
              recommendationByField[
                'execution.maxConcurrentRuns'
              ]
            }
            overridden={Boolean(
              overriddenFieldKeys?.has(
                'execution.maxConcurrentRuns',
              ),
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Priority
          </label>
          <input
            type="number"
            min={1}
            max={100}
            {...register('priority', {
              valueAsNumber: true,
            })}
            className={inputClass}
          />
          {errors.priority && (
            <p className="mt-1.5 text-xs font-medium text-error">
              {errors.priority.message}
            </p>
          )}
          <p className="text-xs text-text-muted mt-2">
            Higher values = higher priority. When multiple
            playbooks match a customer, the highest priority
            runs first. Range: 1-100.
          </p>
          <RecommendationHint
            recommendation={
              recommendationByField['execution.priority']
            }
            overridden={Boolean(
              overriddenFieldKeys?.has(
                'execution.priority',
              ),
            )}
          />
        </div>
      </div>
    </FormSection>
  );
};
