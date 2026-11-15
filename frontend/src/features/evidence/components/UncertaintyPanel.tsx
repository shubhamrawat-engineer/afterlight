import { AlertTriangle, HelpCircle } from 'lucide-react';
import type { PairGrade } from '../types/evidence.types';

interface UncertaintyPanelProps {
  unknowns: string[];
  pairGrade: PairGrade | null;
  pairNotes?: string | null;
  className?: string;
}

export function UncertaintyPanel({
  unknowns,
  pairGrade,
  pairNotes,
  className,
}: UncertaintyPanelProps) {
  return (
    <div className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5 backdrop-blur-xl shadow-lg space-y-4 ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-rose-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            WHAT WE DON'T KNOW &amp; SCIENTIFIC LIMITATIONS
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Epistemic Uncertainty</span>
      </div>

      {/* Primary Caveat Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>A visible difference is not automatically an astrophysical discovery.</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Flux residuals in astronomical image subtraction can arise from multiple non-astrophysical mechanisms, including slight astrometric misalignment, point spread function (PSF) kernel convolution mismatches, passband chromatic differences, or cosmic ray persistence.
        </p>
      </div>

      {/* Active Unknowns List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Unresolved Scientific Questions:
        </h4>
        {unknowns.length === 0 ? (
          <p className="text-xs text-slate-500">
            No specific candidate unknowns cataloged for this target.
          </p>
        ) : (
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
            {unknowns.map((u, i) => (
              <li key={i} className="leading-relaxed">
                {u}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pair Compatibility & Registration Limitations */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-400">Passband Match Grade:</span>
          <span className="font-mono font-bold text-slate-200">{pairGrade ?? 'UNASSESSED'}</span>
        </div>
        <p className="text-[11px] text-slate-400">
          {pairNotes ?? 'Observations were acquired through compatible survey passbands.'}
        </p>
      </div>
    </div>
  );
}
