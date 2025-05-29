// src/components/ui/form/input.tsx
import * as React from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { FieldWrapper, FieldWrapperPassThroughProps } from './field-wrapper';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  FieldWrapperPassThroughProps & {
    className?: string;
    registration: Partial<UseFormRegisterReturn>;
    icon?: React.ReactNode;
    unit?: string;
  };

  const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, registration, icon, unit, ...props }, ref) => {
      return (
        <FieldWrapper label={label} error={error}>
          <div className="relative">
            {icon && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                {icon}
              </div>
            )}
            <input
              type={type}
              className={cn(
                'block w-full rounded-md shadow-sm transition-colors',
                'border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50',
                'placeholder-gray-400 text-gray-900',
                'py-2 px-3 text-sm',
                icon && 'pl-10',
                unit && 'pr-12',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                className
              )}
              ref={ref}
              {...registration}
              {...props}
            />
            {unit && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">{unit}</span>
              </div>
            )}
          </div>
        </FieldWrapper>
      );
    },
  );
  Input.displayName = 'Input';

export { Input };