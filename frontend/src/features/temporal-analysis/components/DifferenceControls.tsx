import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { DifferenceMetadata } from '../types/temporal-analysis.types';

interface DifferenceControlsProps {
  differenceMeta: DifferenceMetadata | null;
  className?: string;
}

/**
 * Toolbar indicator for Difference Map Mode.
 */
export function DifferenceControls({ differenceMeta, className }: DifferenceControlsProps) {
  const hasAsset = Boolean(differenceMeta?.image);

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ''}`}>
      {hasAsset ? (
        <div className="flex items-center gap-2 rounded-lg bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 text-xs text-indigo-300">
          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
          <span>Calibrated Difference Subtraction Active</span>
          {differenceMeta?.method && (
            <span className="border-l border-indigo-500/30 pl-2 font-mono text-[10px] text-slate-300">
              {differenceMeta.method}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg bg-amber-950/50 border border-amber-500/30 px-3 py-1.5 text-xs text-amber-300">
          <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
          <span>Difference Asset Unavailable for this Target</span>
        </div>
      )}
    </div>
  );
}
