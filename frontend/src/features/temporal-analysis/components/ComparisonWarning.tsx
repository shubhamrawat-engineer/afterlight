import { AlertCircle, AlertTriangle } from 'lucide-react';
import type { PairGrade } from '../types/temporal-analysis.types';

interface ComparisonWarningProps {
  grade: PairGrade | null | undefined;
  warningMessage?: string | null;
  isDifferenceMode?: boolean;
  className?: string;
}

/**
 * Prominent scientific limitation and compatibility warning banner.
 * Alerts users when passband differences prevent physically valid temporal comparisons.
 */
export function ComparisonWarning({
  grade,
  warningMessage,
  isDifferenceMode,
  className,
}: ComparisonWarningProps) {
  if (grade === 'POOR') {
    return (
      <div className={`rounded-2xl border border-rose-500/50 bg-rose-950/40 p-5 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.15)] ${className ?? ''}`}>
        <div className="flex items-start gap-3.5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-rose-300 tracking-wide uppercase">
              These observations are not suitable for a like-for-like temporal comparison.
            </h4>
            <p className="text-xs leading-relaxed text-rose-200/90">
              {warningMessage ?? 'Significant passband disparity (>20% Δλ) between these observation passes renders temporal image subtraction scientifically invalid. Differential residuals reflect spectral continuum slopes rather than real astronomical flux variability.'}
            </p>
            {isDifferenceMode && (
              <p className="rounded-lg bg-rose-950/80 border border-rose-500/40 p-2.5 text-[11px] font-mono text-rose-300">
                SCIENTIFIC CAVEAT: Displayed difference subtraction map is a synthetic verification artifact and must not be used for transient astrophysical discovery.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (grade === 'FAIR') {
    return (
      <div className={`rounded-xl border border-amber-500/30 bg-amber-950/25 p-4 text-amber-200 ${className ?? ''}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
              Scientific Notice: Moderate Passband Delta
            </h5>
            <p className="text-xs leading-relaxed text-amber-200/80">
              {warningMessage ?? 'Observations have a slight spectral disparity. Subtraction maps may display faint continuum background offsets alongside potential candidates.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
