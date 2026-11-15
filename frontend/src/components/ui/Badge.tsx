import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'outline';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  mono?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-[#24344D] bg-[#131F33] text-[#B5C2D6]',
  primary: 'border-[#4388FF]/35 bg-[#4388FF]/12 text-[#8BB6FF]',
  success: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/35 bg-amber-500/10 text-amber-300',
  danger: 'border-rose-500/35 bg-rose-500/10 text-rose-300',
  outline: 'border-[#24344D] bg-transparent text-[#8293AD]',
};

/**
 * Standardized AFTERLIGHT Badge component for scientific statuses,
 * passbands, and metadata classifications.
 */
export function Badge({
  variant = 'default',
  mono = false,
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px] font-medium tracking-wide whitespace-nowrap',
        variantClasses[variant],
        mono && 'font-mono',
        className,
      )}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0 items-center">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
