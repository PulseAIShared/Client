import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { FieldWrapper } from './field-wrapper';
import { useMediaQuery } from '@mantine/hooks';

type DayOption = {
  value: string;
  label: string;
  day: number;
};

type DaySelectorProps = {
  label: string;
  options: DayOption[];
  error?: FieldError;
  registration: UseFormRegisterReturn;
  value?: string;
};

export const DaySelector = ({
  label,
  options,
  error,
  registration,
  value
}: DaySelectorProps) => {
  const isMobile = useMediaQuery('(max-width: 480px)');
  
  return (
    <FieldWrapper label={label} error={error}>
      <div className="grid grid-cols-7 gap-1 mt-1">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              className={`
                flex flex-col items-center justify-center p-1 sm:p-2 rounded-md border
                transition-colors cursor-pointer text-center
                ${isSelected 
                  ? 'bg-blue-100 border-blue-500 text-blue-700' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'}
              `}
            >
              <input
                type="radio"
                className="sr-only"
                value={option.value}
                checked={isSelected}
                {...registration}
              />
              <span className="text-xs font-medium uppercase">
                {isMobile 
                  ? option.label.substring(0, 1) // Just the first letter on very small screens
                  : option.label.substring(0, 3) // First three letters otherwise
                }
              </span>
            </label>
          );
        })}
      </div>
    </FieldWrapper>
  );
};