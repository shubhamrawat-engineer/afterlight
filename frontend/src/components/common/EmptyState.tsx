import type { ReactNode } from 'react';
import { Compass, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

/**
 * Reusable EmptyState component for zero-match filters or empty catalogues.
 */
export function EmptyState({
  title = 'No Matching Records Found',
  description,
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center rounded-xl border border-[#24344D] bg-[#101A2B] p-10 text-center ${className ?? ''}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#24344D] bg-[#131F33] text-[#45D5F2]">
        {icon ?? <Compass className="h-6 w-6" />}
      </div>
      <h3 className="mt-4 font-[family-name:var(--font-display)] text-base font-semibold text-[#F4F7FF]">{title}</h3>
      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-[#B5C2D6]">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#24344D] bg-[#131F33] px-4 py-2 text-xs font-medium text-[#F4F7FF] hover:border-[#324869] hover:bg-[#192842] transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
