// src/components/ui/form/time-of-day-selector.tsx
import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { FieldError } from 'react-hook-form';
import { FieldWrapper } from './field-wrapper';
import { FaSun, FaMoon, FaCloudSun, FaClock } from 'react-icons/fa';
import { cn } from '@/utils/cn';

export enum TimeOfDay {
  Anytime = 1,
  Morning = 2,
  Afternoon = 3,
  Evening = 4
}

type TimeOfDayOption = {
  value: number;
  label: string;
  icon: React.ReactNode;
  color: string;
};

const timeOptions: TimeOfDayOption[] = [
  { 
    value: TimeOfDay.Anytime, 
    label: "Anytime", 
    icon: <FaClock className="h-5 w-5" />, 
    color: "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200" 
  },
  { 
    value: TimeOfDay.Morning, 
    label: "Morning", 
    icon: <FaSun className="h-5 w-5 text-yellow-500" />, 
    color: "bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100" 
  },
  { 
    value: TimeOfDay.Afternoon, 
    label: "Afternoon", 
    icon: <FaCloudSun className="h-5 w-5 text-orange-500" />, 
    color: "bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100" 
  },
  { 
    value: TimeOfDay.Evening, 
    label: "Evening", 
    icon: <FaMoon className="h-5 w-5 text-blue-500" />, 
    color: "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100" 
  }
];

type TimeOfDaySelectorProps = {
  label: string;
  error?: FieldError;
  registration: UseFormRegisterReturn;
  value?: number;
  className?: string;
};

export const TimeOfDaySelector: React.FC<TimeOfDaySelectorProps> = ({
  label,
  error,
  registration,
  value,
  className
}) => {
  const selectedValue = value ? Number(value) : undefined;

  return (
    <FieldWrapper label={label} error={error}>
      <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-2", className)}>
        {timeOptions.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg border transition-colors cursor-pointer",
                isSelected 
                  ? option.color
                  : "bg-white border-gray-200 hover:bg-gray-50"
              )}
            >
              <input
                type="radio"
                className="sr-only"
                value={option.value}
                checked={isSelected}
                {...registration}
              />
              <div className="flex flex-col items-center gap-2">
                {option.icon}
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            </label>
          );
        })}
      </div>
    </FieldWrapper>
  );
};

export default TimeOfDaySelector;