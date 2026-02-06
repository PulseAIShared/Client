import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { Stepper } from '@/components/ui/stepper';
import { useCreatePlaybook } from '@/features/playbooks/api/playbooks';
import { useNotifications } from '@/components/ui/notifications/notifications-store';
import {
  playbookFormSchema,
  PLAYBOOK_DEFAULT_VALUES,
  WIZARD_STEPS,
  STEP_FIELDS,
  toPlaybookInput,
} from '@/features/playbooks/schemas/playbook-form-schema';
import type { PlaybookFormValues } from '@/features/playbooks/schemas/playbook-form-schema';

import { IdentityStep } from './identity-step';
import { TriggerStep } from './trigger-step';
import { ExecutionStep } from './execution-step';
import { ActionsStep } from './actions-step';
import { ReviewStep } from './review-step';
import { WizardFooter } from './wizard-footer';

const STEP_COMPONENTS = [
  IdentityStep,
  TriggerStep,
  ExecutionStep,
  ActionsStep,
] as const;

export const PlaybookWizard = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const createMutation = useCreatePlaybook();

  const [currentStep, setCurrentStep] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  const form = useForm<PlaybookFormValues>({
    resolver: zodResolver(playbookFormSchema),
    defaultValues: PLAYBOOK_DEFAULT_VALUES,
    mode: 'onTouched',
  });

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep];
    if (!fieldsToValidate) {
      setCurrentStep((s) => s + 1);
      return;
    }

    setIsValidating(true);
    const isValid = await form.trigger(fieldsToValidate);
    setIsValidating(false);

    if (isValid) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(0, s - 1));
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
      // Find the first step with errors and navigate there
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
            title: 'Please fix the errors before submitting.',
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

  const StepComponent = isReviewStep
    ? null
    : STEP_COMPONENTS[currentStep];

  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Create Playbook
          </h1>
          <p className="text-text-muted mt-1">
            Define triggers, actions, and execution rules.
          </p>
        </div>

        <Stepper
          steps={[...WIZARD_STEPS]}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl border border-border-primary/30 shadow-xl p-4 sm:p-6"
        />

        <FormProvider {...form}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-6"
          >
            {StepComponent && <StepComponent />}
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
