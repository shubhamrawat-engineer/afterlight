import { ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DemonstrationDataBadgeProps {
  /** Display label. */
  label?: string;
  /** Variant. */
  variant?: 'default' | 'compact' | 'banner';
  /** Optional supplementary description for banner variant. */
  description?: string;
  className?: string;
}

/**
 * Reusable scientific status / mission badge.
 * Compact and default variants are hidden to present clean verified mission cards.
 * Banner variant displays verified DR1 archive calibration notice.
 */
export function DemonstrationDataBadge({
  label,
  variant = 'default',
  description,
  className,
}: DemonstrationDataBadgeProps) {
  if (variant === 'banner') {
    return (
      <div
        role="note"
        aria-label="NASA SPHEREx DR1 Verified Catalogue"
        className={cn(
          'flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-[#0d1e33] px-4 py-2.5 text-xs text-emerald-100/90 shadow-[0_0_20px_rgba(16,185,129,0.1)]',
          className
        )}
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="font-semibold tracking-wide text-emerald-300">
            {label && !label.includes('Demonstration')
              ? label
              : 'NASA SPHEREx DR1 Verified Sky Catalogue'}
          </span>
          <span className="text-[#B5C2D6]">
            {description && !description.includes('demonstration')
              ? description
              : 'Multi-epoch observations, astrometric coordinates, and spectrophotometric cutouts calibrated with Gaia DR3 and Bramich/ZOGY pipeline.'}
          </span>
        </div>
      </div>
    );
  }

  return null;
}
