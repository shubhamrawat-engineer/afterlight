import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  inputSize?: 'md' | 'lg';
  containerClassName?: string;
}

/**
 * Standardized AFTERLIGHT Input component.
 * Guarantees consistent height, internal padding, icon clearance,
 * readable placeholders, and accessible focus/error states.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightElement,
      inputSize = 'md',
      className,
      containerClassName,
      id,
      ...props
    },
    ref,
  ) => {
    const heightClass = inputSize === 'lg' ? 'h-12 text-sm' : 'h-11 text-sm';

    return (
      <div className={cn('w-full space-y-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-medium text-[#B5C2D6]"
          >
            {label}
          </label>
        )}

        <div className="relative flex w-full items-center">
          {leftIcon && (
            <span
              className="pointer-events-none absolute left-3.5 z-10 flex items-center justify-center text-[#8293AD]"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full rounded-xl border bg-[#080E1C] text-[#F4F7FF] placeholder-[#6F829E] transition-all duration-200',
              'border-[#24344D] hover:border-[#324869]',
              'focus:border-[#4388FF] focus:bg-[#0B1222] focus:outline-none focus:ring-2 focus:ring-[#4388FF]/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              heightClass,
              leftIcon ? 'pl-10' : 'pl-4',
              rightElement ? 'pr-12' : 'pr-4',
              error && 'border-rose-500/70 focus:border-rose-400 focus:ring-rose-500/20',
              className,
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-1.5 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-rose-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
