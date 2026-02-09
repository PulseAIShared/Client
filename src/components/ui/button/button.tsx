// src/components/ui/button/button.tsx
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/utils/cn';
import { Spinner } from '../spinner';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white shadow hover:bg-blue-700 focus-visible:ring-blue-500',
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500',
        outline:
          'border border-gray-300 bg-white shadow-sm hover:bg-gray-50 text-gray-700 hover:text-gray-900 focus-visible:ring-blue-500',
        secondary:
          'bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:ring-gray-500',
        ghost: 'hover:bg-gray-100 hover:text-gray-900 text-gray-700',
        link: 'text-blue-600 underline-offset-4 hover:underline',
        success: 'bg-green-600 text-white shadow hover:bg-green-700 focus-visible:ring-green-500',
        warning: 'bg-amber-500 text-white shadow hover:bg-amber-600 focus-visible:ring-amber-500',
        info: 'bg-blue-500 text-white shadow hover:bg-blue-600 focus-visible:ring-blue-500',
        deleteIcon: 'text-red-500 hover:bg-red-50 hover:text-red-700',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 py-1 text-xs',
        lg: 'h-12 rounded-md px-6 py-3 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
    icon?: React.ReactNode;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      children,
      isLoading,
      icon,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';

    if (asChild) {
      return (
        <Comp
          className={cn(
            'hover:cursor-pointer transform active:scale-95 transition-all duration-150',
            buttonVariants({ variant, size, className })
          )}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(
          'hover:cursor-pointer transform active:scale-95 transition-all duration-150',
          buttonVariants({ variant, size, className })
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <span className="mr-2">
            <Spinner size="sm" className="text-current" />
          </span>
        )}
        {!isLoading && icon && (
          <span className={variant === 'deleteIcon' ? '' : 'mr-2'}>{icon}</span>
        )}
        <span>{children}</span>
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
