// src/components/ui/form/error.tsx
import { cn } from '@/utils/cn';
import { FaExclamationCircle } from 'react-icons/fa';

export type ErrorProps = {
  errorMessage?: string | null;
  className?: string;
};

export const Error = ({ errorMessage, className }: ErrorProps) => {
  if (!errorMessage) return null;

  return (
    <div
      role="alert"
      aria-label={errorMessage}
      className={cn(
        "flex items-center text-red-500 space-x-1",
        className
      )}
    >
      <FaExclamationCircle className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{errorMessage}</span>
    </div>
  );
};