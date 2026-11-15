import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const paddingMap = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
} as const;

/**
 * Standardized AFTERLIGHT Card surface.
 * Provides a restrained dark observatory surface, subtle border,
 * consistent 12px border radius, and balanced internal padding.
 */
export function Card({
  interactive = false,
  padding = 'lg',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#24344D] bg-[#101A2B] shadow-[0_4px_18px_rgba(3,6,14,0.38)]',
        paddingMap[padding],
        interactive &&
          'transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4388FF]/45 hover:bg-[#131F33] hover:shadow-[0_12px_28px_rgba(3,6,14,0.55)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 border-b border-[#1A2940] pb-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'font-[family-name:var(--font-display)] text-[18px] font-semibold tracking-[-0.01em] text-[#F4F7FF] leading-snug',
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-[13px] leading-relaxed text-[#B5C2D6]', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('pt-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-5 flex items-center justify-between border-t border-[rgba(148,163,184,0.1)] pt-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
