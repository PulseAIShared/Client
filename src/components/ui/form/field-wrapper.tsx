// src/components/ui/form/field-wrapper.tsx
import * as React from 'react';
import { type FieldError } from 'react-hook-form';

import { Error } from './error';
import { Label } from './label';
import { cn } from '@/utils/cn';

type FieldWrapperProps = {
  label?: string;
  className?: string;
  children: React.ReactNode;
  error?: FieldError | undefined;
  description?: string;
  required?: boolean;
};

export type FieldWrapperPassThroughProps = Omit<
  FieldWrapperProps,
  'className' | 'children'
>;

export const FieldWrapper = (props: FieldWrapperProps) => {
  const { label, error, children, className, description, required } = props;
  return (
    <div className={cn("mb-4", className)}>
      {label && (
        <Label className="mb-1.5 inline-block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
      )}
      <div className="mt-1">{children}</div>
      {description && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}
      {error && (
        <Error 
          errorMessage={error?.message} 
          className="mt-1.5 text-xs font-medium" 
        />
      )}
    </div>
  );
};