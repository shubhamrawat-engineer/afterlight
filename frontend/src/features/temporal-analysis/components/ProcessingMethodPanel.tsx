import { Cpu, ShieldCheck, AlertCircle, Info, Tag } from 'lucide-react';
import type { DifferenceMetadata } from '../types/temporal-analysis.types';

interface ProcessingMethodPanelProps {
  differenceMeta: DifferenceMetadata | null;
  className?: string;
}

/**
 * Technical documentation panel exposing scientific difference processing methods,
 * quality mask applications, and algorithmic limitations.
 */
export function ProcessingMethodPanel({ differenceMeta, className }: ProcessingMethodPanelProps) {
  if (!differenceMeta) {
    return (
      <div className={`rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-xs text-slate-400 ${className ?? ''}`}>
        No difference processing record registered for this target in the SPHEREx archive.
      </div>
    );
  }

  const { method, method_description, masked_flags_applied, limitations } = differenceMeta;

  const maskLabels = Array.isArray(masked_flags_applied)
    ? masked_flags_applied
    : masked_flags_applied === true
    ? ['STANDARD_QUALITY_MASK_APPLIED']
    : ['NONE_APPLIED'];

  return (
    <div className={`rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Scientific Processing &amp; Subtraction Method
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          SPHEREx Pipeline L2/L3
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {/* Method Title */}
        <div className="rounded-lg bg-slate-950/60 p-3.5 border border-slate-800/60">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Algorithm</span>
          <p className="mt-1 text-sm font-semibold font-mono text-slate-100">
            {method ?? 'Standard Linear Difference'}
          </p>
          {method_description && (
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              {method_description}
            </p>
          )}
        </div>

        {/* Applied Quality Masks */}
        <div className="rounded-lg bg-slate-950/60 p-3.5 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
            <span>Applied Data Quality Masks</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {maskLabels.map((flag) => (
              <span
                key={flag}
                className="inline-flex items-center gap-1 rounded bg-blue-950/80 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono text-blue-300"
              >
                <Tag className="h-2.5 w-2.5" />
                <span>{flag}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Processing Limitations */}
        {limitations && (
          <div className="rounded-lg bg-slate-950/60 p-3.5 border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-400 uppercase">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Algorithmic Limitations &amp; Residual Artifacts</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-300 leading-relaxed font-mono">
              {limitations}
            </p>
          </div>
        )}

        {/* Pipeline Ownership Disclaimer */}
        <div className="flex items-start gap-2 rounded-lg bg-slate-900/40 p-2.5 text-[11px] text-slate-400 border border-slate-800/40">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-400" />
          <p className="leading-relaxed">
            The Python astronomical pipeline owns point-spread function matching, spatial reprojection, flux normalisation, and difference generation. The frontend interface renders derived observational assets without modifying astronomical pixel counts.
          </p>
        </div>
      </div>
    </div>
  );
}
