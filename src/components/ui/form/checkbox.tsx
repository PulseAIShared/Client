import * as React from 'react';
import { useId, useState, useEffect } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { BsCheckLg } from 'react-icons/bs';

export type CheckboxProps = {
  className?: string;
  registration: Partial<UseFormRegisterReturn>;
  label: string;
  error?: any;
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, registration, ...props }, ref) => {
    const id = useId();
    // Use React state instead of checking DOM directly
    const [isChecked, setIsChecked] = useState(false);
    
    // Update state when the actual input value changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsChecked(e.target.checked);
      // Let the registration handle the form state
      if (registration.onChange) {
        registration.onChange(e);
      }
    };
    
    // Handle manual clicks on the visual checkbox
    const handleClick = () => {
      const newValue = !isChecked;
      setIsChecked(newValue);
      
      // Create a synthetic change event for react-hook-form
      const input = document.getElementById(id) as HTMLInputElement;
      if (input) {
        input.checked = newValue;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    
    return (
      <div className="flex items-center space-x-2">
        <div className="relative">
          {/* Hidden real checkbox that handles the form state */}
          <input
            id={id}
            type="checkbox"
            className="sr-only"
            ref={ref}
            checked={isChecked}
            onChange={handleChange}
            {...registration}
            {...props}
          />
          
          {/* Visual checkbox */}
          <div
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded border cursor-pointer",
              isChecked
                ? "bg-blue-600 border-blue-600" 
                : "border-gray-300 hover:bg-gray-50",
              "transition-colors duration-200",
              className
            )}
            onClick={handleClick}
          >
            <BsCheckLg 
              className={cn(
                "h-3 w-3 text-white transition-opacity duration-200",
                isChecked ? "opacity-100" : "opacity-0"
              )} 
            />
          </div>
        </div>
        
        {/* Label */}
        <label 
          htmlFor={id}
          className="text-sm font-medium leading-none cursor-pointer"
          onClick={handleClick}
        >
          {label}
        </label>
        
        {/* Error message */}
        {error && <div className="mt-1 text-sm text-red-600">{error.message}</div>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';