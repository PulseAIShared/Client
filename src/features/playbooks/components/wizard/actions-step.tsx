import {
  useFormContext,
  useFieldArray,
} from 'react-hook-form';
import { FormSection } from '@/components/ui/form-section';
import { Button } from '@/components/ui/button';
import { ActionType } from '@/types/playbooks';
import { enumLabelMap } from '@/features/playbooks/utils';
import {
  defaultActionConfig,
} from '@/features/playbooks/schemas/playbook-form-schema';
import type { PlaybookFormValues } from '@/features/playbooks/schemas/playbook-form-schema';
import { ActionConfigFields } from './action-config-fields';

const selectClass =
  'w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200';

export const ActionsStep = () => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<PlaybookFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'actions',
  });

  const actions = watch('actions');

  const handleAddAction = () => {
    append({
      actionType: ActionType.SlackAlert,
      config: defaultActionConfig(ActionType.SlackAlert),
    });
  };

  const handleChangeActionType = (
    index: number,
    nextType: ActionType,
  ) => {
    setValue(`actions.${index}.actionType`, nextType);
    setValue(
      `actions.${index}.config`,
      defaultActionConfig(nextType),
    );
  };

  return (
    <FormSection
      title="Actions"
      description="Define what this playbook should do when triggered. Actions execute in order."
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddAction}
        >
          Add action
        </Button>
      }
    >
      {errors.actions?.root && (
        <p className="text-xs font-medium text-error">
          {errors.actions.root.message}
        </p>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => {
          const currentType =
            actions?.[index]?.actionType ??
            field.actionType;

          return (
            <div
              key={field.id}
              className="rounded-xl border border-border-primary/30 p-4 bg-surface-secondary/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="text-sm font-medium text-text-secondary">
                  Action {index + 1}
                </div>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-xs text-error hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Action type
                  </label>
                  <select
                    value={currentType}
                    onChange={(e) =>
                      handleChangeActionType(
                        index,
                        Number(
                          e.target.value,
                        ) as ActionType,
                      )
                    }
                    className={selectClass}
                  >
                    {enumLabelMap.actionType.map(
                      (label, idx) => (
                        <option key={label} value={idx}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Action settings
                  </label>
                  <ActionConfigFields
                    index={index}
                    actionType={currentType}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </FormSection>
  );
};
