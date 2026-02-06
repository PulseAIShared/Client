import { Button } from '@/components/ui/button';
import { WIZARD_STEPS } from '@/features/playbooks/schemas/playbook-form-schema';

type WizardFooterProps = {
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isValidating: boolean;
};

const totalSteps = WIZARD_STEPS.length;
const lastStep = totalSteps - 1;

export const WizardFooter = ({
  currentStep,
  onBack,
  onNext,
  onSubmit,
  onCancel,
  isSubmitting,
  isValidating,
}: WizardFooterProps) => {
  const isReviewStep = currentStep === lastStep;

  return (
    <div className="sticky bottom-0 z-10 bg-surface-primary/95 backdrop-blur-md border-t border-border-primary/30 py-4 px-6 -mx-6 sm:-mx-8 mt-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled
            title="Coming in a future update"
          >
            Save as draft
          </Button>

          {isReviewStep ? (
            <Button
              type="button"
              onClick={onSubmit}
              isLoading={isSubmitting}
            >
              Create playbook
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onNext}
              isLoading={isValidating}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
