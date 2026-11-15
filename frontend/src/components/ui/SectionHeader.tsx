import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  eyebrow?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  level?: 'page' | 'section';
  bordered?: boolean;
  className?: string;
}

/**
 * Standardized AFTERLIGHT SectionHeader component.
 * Enforces refined typographic hierarchy (medium weight headings rather than
 * heavy bold shouting), consistent vertical rhythm, and aligned action slots.
 */
export function SectionHeader({
  title,
  description,
  eyebrow,
  badges,
  actions,
  level = 'page',
  bordered = true,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
        bordered && 'border-b border-[#1A2940] pb-6',
        className,
      )}
    >
      <div className="space-y-2.5">
        {eyebrow && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#8293AD]">
            {eyebrow}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {level === 'page' ? (
            <h1 className="text-page-heading text-[#F4F7FF]">{title}</h1>
          ) : (
            <h2 className="text-section-heading text-[#F4F7FF]">{title}</h2>
          )}
          {badges && <div className="flex flex-wrap items-center gap-2">{badges}</div>}
        </div>

        {description && (
          <p className="max-w-2xl text-[14px] leading-relaxed text-[#B5C2D6]">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap shrink-0 items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
