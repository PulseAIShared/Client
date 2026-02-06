import * as React from 'react';
import { cn } from '@/utils/cn';
import { Check } from 'lucide-react';

type StepperStep = {
  label: string;
  description?: string;
};

type StepperProps = {
  steps: StepperStep[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
};

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className,
}) => {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isClickable =
            isCompleted && onStepClick !== undefined;

          return (
            <li
              key={step.label}
              className={cn(
                'flex items-center',
                index < steps.length - 1 && 'flex-1',
              )}
            >
              <button
                type="button"
                onClick={
                  isClickable
                    ? () => onStepClick(index)
                    : undefined
                }
                disabled={!isClickable}
                className={cn(
                  'flex items-center gap-2 sm:gap-3',
                  'group transition-colors duration-200',
                  isClickable &&
                    'cursor-pointer hover:opacity-80',
                  !isClickable &&
                    !isActive &&
                    'cursor-default',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center',
                    'justify-center rounded-full text-xs',
                    'font-semibold transition-all duration-200',
                    isCompleted &&
                      'bg-accent-primary text-white',
                    isActive &&
                      'border-2 border-accent-primary bg-accent-primary/10 text-accent-primary',
                    !isCompleted &&
                      !isActive &&
                      'border border-border-primary/50 bg-surface-secondary/50 text-text-muted',
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="hidden sm:flex flex-col text-left">
                  <span
                    className={cn(
                      'text-sm font-medium leading-tight',
                      isActive
                        ? 'text-text-primary'
                        : isCompleted
                          ? 'text-text-secondary'
                          : 'text-text-muted',
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="text-xs text-text-muted leading-tight">
                      {step.description}
                    </span>
                  )}
                </span>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 sm:mx-4 h-px flex-1',
                    'transition-colors duration-200',
                    index < currentStep
                      ? 'bg-accent-primary'
                      : 'bg-border-primary/30',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
