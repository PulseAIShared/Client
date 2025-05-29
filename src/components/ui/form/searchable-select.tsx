import React, { useState, useRef, useEffect } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { FieldError } from 'react-hook-form';
import { IoIosSearch, IoIosArrowDown } from 'react-icons/io';
import { FieldWrapper } from './field-wrapper';
import { cn } from '@/utils/cn';

type SelectOption = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  type?: number;
  [key: string]: any;
};

type SearchableSelectProps = {
  label: string;
  options: SelectOption[];
  error?: FieldError;
  registration: UseFormRegisterReturn;
  className?: string;
  placeholder?: string;
  onChange?: (value: string, type?: number) => void;
  value?: string;
};

export const SearchableSelect = ({
  label,
  options,
  error,
  registration,
  className = '',
  placeholder = 'Search...',
  onChange,
  value
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find the selected option when value changes
  useEffect(() => {
    if (value) {
      const option = options.find(opt => opt.value === value);
      if (option) {
        setSelectedOption(option);
      }
    }
  }, [value, options]);

  // Filter options based on search
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  // Handle option selection
  const handleSelect = (option: SelectOption) => {
    setSelectedOption(option);
    setIsOpen(false); // Close dropdown when selecting an option
    setSearch('');
    
    // Call the custom onChange handler if provided
    if (onChange) {
      onChange(option.value, option.type);
    }
    
    // Manually trigger the registration onChange
    const event = {
      target: {
        name: registration.name,
        value: option.value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    registration.onChange(event);
  };

  // Toggle dropdown
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    
    // If opening, clear the search
    if (!isOpen) {
      setSearch('');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <FieldWrapper label={label} error={error}>
      <div ref={containerRef} className="relative">
        <div className="relative flex items-center w-full rounded-md border border-input bg-transparent focus-within:ring-1 focus-within:ring-ring">
          <div className="absolute left-3 text-gray-400">
            <IoIosSearch className="h-4 w-4" />
          </div>
          
          <input
            ref={inputRef}
            className={cn(
              "flex h-9 w-full rounded-md bg-transparent pl-9 pr-9 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none border-0",
              className
            )}
            placeholder={selectedOption ? selectedOption.label : placeholder}
            value={isOpen ? search : selectedOption?.label || ''}
            onChange={(e) => setSearch(e.target.value)}
            onClick={() => setIsOpen(true)}
            readOnly={!isOpen}
          />
          
          <div 
            className="absolute right-3 cursor-pointer p-1"
            onClick={toggleDropdown}
          >
            <IoIosArrowDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              <div className="py-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSelect(option)}
                  >
                    {option.type && (
                      <span className="flex-shrink-0 mr-2">
                        {renderTemplateIcon(option.type)}
                      </span>
                    )}
                    <span>{option.label}</span>
                    {option.type && (
                      <span className="ml-auto text-xs text-gray-500">
                        ({getTypeName(option.type)})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
            )}
          </div>
        )}
      </div>
      
      {/* Hidden input for the registration */}
      <input
        type="hidden"
        {...registration}
        value={selectedOption?.value || ''}
      />
    </FieldWrapper>
  );
};

// Helper to render the correct icon based on type
const renderTemplateIcon = (type?: number) => {
  switch (type) {
    case 1:
      return <FaDumbbell className="h-4 w-4 text-blue-600" />;
    case 2:
      return <FaRunning className="h-4 w-4 text-red-600" />;
    case 3:
      return <FaPills className="h-4 w-4 text-green-600" />;
    default:
      return <FaCalendarAlt className="h-4 w-4 text-gray-600" />;
  }
};

// Helper to get type name
const getTypeName = (type: number): string => {
  switch (type) {
    case 1:
      return "Workout";
    case 2:
      return "Cardio";
    case 3:
      return "Supplement";
    default:
      return "Other";
  }
};

// Import these at the top of the file
import { FaDumbbell, FaRunning, FaPills, FaCalendarAlt } from "react-icons/fa";