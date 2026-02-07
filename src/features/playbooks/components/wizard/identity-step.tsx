import { useFormContext } from 'react-hook-form';
import { FormSection } from '@/components/ui/form-section';
import { enumLabelMap } from '@/features/playbooks/utils';
import type { PlaybookFormValues } from '@/features/playbooks/schemas/playbook-form-schema';
import { PlaybookFieldRecommendation } from '@/types/playbooks';
import { RecommendationHint } from './recommendation-hint';

const inputClass =
  'w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200';

type IdentityStepProps = {
  recommendationByField?: Record<
    string,
    PlaybookFieldRecommendation
  >;
  overriddenFieldKeys?: ReadonlySet<string>;
};

export const IdentityStep = ({
  recommendationByField = {},
  overriddenFieldKeys,
}: IdentityStepProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<PlaybookFormValues>();

  return (
    <FormSection
      title="Playbook Identity"
      description="Give your playbook a name and categorize it."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Name
          </label>
          <input
            {...register('name')}
            placeholder="Payment Failure Recovery"
            className={inputClass}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs font-medium text-error">
              {errors.name.message}
            </p>
          )}
          <RecommendationHint
            recommendation={
              recommendationByField['identity.name']
            }
            overridden={Boolean(
              overriddenFieldKeys?.has('identity.name'),
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Category
          </label>
          <select
            {...register('category', {
              valueAsNumber: true,
            })}
            className={inputClass}
          >
            {enumLabelMap.category.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
          <RecommendationHint
            recommendation={
              recommendationByField['identity.category']
            }
            overridden={Boolean(
              overriddenFieldKeys?.has(
                'identity.category',
              ),
            )}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Description
        </label>
        <textarea
          {...register('description')}
          placeholder="Describe what this playbook does..."
          rows={3}
          className={inputClass}
        />
        {errors.description && (
          <p className="mt-1.5 text-xs font-medium text-error">
            {errors.description.message}
          </p>
        )}
        <p className="text-xs text-text-muted mt-2">
          Optional. Helps your team understand the purpose of
          this playbook.
        </p>
        <RecommendationHint
          recommendation={
            recommendationByField['identity.description']
          }
          overridden={Boolean(
            overriddenFieldKeys?.has(
              'identity.description',
            ),
          )}
        />
      </div>
    </FormSection>
  );
};
