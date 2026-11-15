import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Standardized AFTERLIGHT PageContainer.
 * Enforces consistent max-width (1280px), horizontal grid alignment,
 * and vertical spacing across all routes.
 */
export function PageContainer({
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className="relative min-h-[calc(100vh-var(--navbar-height))] bg-[#070B14] py-8 sm:py-10 lg:py-12"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 80% 45% at 50% -10%, rgba(67, 136, 255, 0.08), transparent 70%)',
      }}
      {...props}
    >
      <div
        className={cn(
          'mx-auto flex flex-col gap-8 px-4 sm:px-6 lg:px-8',
          className,
        )}
        style={{ maxWidth: 'var(--content-max-width)' }}
      >
        {children}
      </div>
    </div>
  );
}
