import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'icon'
  | 'destructive';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Optional internal route path; renders as React Router Link when provided */
  to?: string;
  /** Optional external URL; renders as anchor tag when provided */
  href?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#4388FF] text-[#F4F7FF] border border-[#5A9BFF]/60 shadow-[0_4px_18px_rgba(67,136,255,0.28)] hover:bg-[#5A9BFF] hover:border-[#45D5F2]/60 active:bg-[#2F73EB]',
  secondary:
    'bg-[#131F33] text-[#F4F7FF] border border-[#24344D] hover:bg-[#192842] hover:border-[#324869] hover:text-white',
  outline:
    'bg-transparent text-[#B5C2D6] border border-[#24344D] hover:bg-[#131F33]/80 hover:border-[#4388FF]/55 hover:text-[#F4F7FF]',
  ghost:
    'bg-transparent text-[#B5C2D6] border border-transparent hover:bg-[#131F33]/70 hover:text-[#F4F7FF]',
  icon:
    'bg-[#101A2B] text-[#B5C2D6] border border-[#24344D] hover:bg-[#17253D] hover:border-[#324869] hover:text-[#F4F7FF] p-0',
  destructive:
    'bg-rose-950/70 text-rose-200 border border-rose-700/60 hover:bg-rose-900/80 hover:border-rose-600 hover:text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-xs gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-sm gap-2 rounded-lg',
  lg: 'h-[50px] px-6 text-[15px] gap-2.5 rounded-xl',
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 w-9 rounded-lg',
  md: 'h-11 w-11 rounded-lg',
  lg: 'h-[50px] w-[50px] rounded-xl',
};

/**
 * Standardized AFTERLIGHT Button component.
 * Guarantees consistent height, horizontal padding, icon spacing,
 * medium font weight, and accessible focus rings across the platform.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      to,
      href,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center font-medium whitespace-nowrap select-none transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#45D5F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B14]',
      'disabled:pointer-events-none disabled:opacity-45 cursor-pointer',
      variantClasses[variant],
      variant === 'icon' ? iconSizeClasses[size] : sizeClasses[size],
      fullWidth && 'w-full',
      className,
    );

    const content = (
      <>
        {leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {rightIcon && <span className="inline-flex shrink-0 items-center">{rightIcon}</span>}
      </>
    );

    if (to && !disabled) {
      return (
        <Link to={to} className={baseClasses} aria-label={props['aria-label']}>
          {content}
        </Link>
      );
    }

    if (href && !disabled) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClasses}
          aria-label={props['aria-label']}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={baseClasses}
        {...props}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = 'Button';
