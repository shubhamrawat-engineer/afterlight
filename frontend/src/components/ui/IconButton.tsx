import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'active' | 'primary';
  children: ReactNode;
}

const sizeMap = {
  sm: 'h-9 w-9 rounded-lg',
  md: 'h-11 w-11 rounded-lg',
  lg: 'h-[50px] w-[50px] rounded-xl',
} as const;

const variantMap = {
  default:
    'border border-[#24344D] bg-[#101A2B] text-[#B5C2D6] hover:border-[#324869] hover:bg-[#17253D] hover:text-[#F4F7FF]',
  ghost:
    'border border-transparent bg-transparent text-[#8293AD] hover:bg-[#131F33] hover:text-[#F4F7FF]',
  active:
    'border border-[#4388FF]/80 bg-[#4388FF] text-[#F4F7FF] shadow-sm hover:bg-[#5A9BFF]',
  primary:
    'border border-[#4388FF]/80 bg-[#4388FF] text-[#F4F7FF] shadow-sm hover:bg-[#5A9BFF]',
} as const;

/**
 * Standardized square IconButton component for AFTERLIGHT.
 * Enforces accessible aria-label, exact square geometry, and clean focus states.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      size = 'sm',
      variant = 'default',
      type = 'button',
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex shrink-0 items-center justify-center transition-all duration-200 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#45D5F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B14]',
          'disabled:pointer-events-none disabled:opacity-45',
          sizeMap[size],
          variantMap[variant],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';
