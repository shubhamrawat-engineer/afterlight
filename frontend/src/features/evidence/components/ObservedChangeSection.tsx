import { Eye } from 'lucide-react';
import type { CandidateDetection } from '../types/evidence.types';

interface ObservedChangeSectionProps {
  candidate: CandidateDetection | null;
  className?: string;
}

export function ObservedChangeSection({ candidate, className }: ObservedChangeSectionProps) {
  if (!candidate) {
    return (
      <div className={`rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl ${className ?? ''}`}>
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Eye className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-bold text-white tracking-wide">WHAT CHANGED?</h2>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          No candidate changes or flux residuals detected above the survey significance threshold for this comparison.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-blue-500/30 bg-[rgba(10,14,26,0.9)] p-6 backdrop-blur-xl shadow-xl ${className ?? ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <Eye className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-extrabold text-white tracking-wide">WHAT CHANGED?</h2>
        </div>
        <span className="rounded bg-blue-950 px-2.5 py-1 text-xs font-mono font-bold text-blue-300 border border-blue-500/30">
          {candidate.label}
        </span>
      </div>

      {/* Grid of the 4 Strict Scientific Evidence Pillars */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 1. OBSERVED */}
        <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-900/80 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-sky-200 border border-sky-500/40">
              OBSERVED
            </span>
            <span className="text-xs font-bold text-sky-300">Direct Visual Evidence</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-200">
            {candidate.observed_summary}
          </p>
          <div className="text-[11px] text-slate-400 font-mono">
            Pixel Coordinates: ({candidate.pixel_x}, {candidate.pixel_y}) • Cutout Center
          </div>
        </div>

        {/* 2. MEASURED */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-900/80 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 border border-emerald-500/40">
              MEASURED
            </span>
            <span className="text-xs font-bold text-emerald-300">Pipeline Quantitative Calculation</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-200">
            {candidate.measured_summary}
          </p>
          {candidate.significance_sigma && (
            <div className="text-[11px] text-emerald-400 font-mono font-bold">
              Residual Significance: {candidate.significance_sigma}σ (Sigma Deviation)
            </div>
          )}
        </div>

        {/* 3. INTERPRETATION */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-900/80 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-200 border border-amber-500/40">
              INTERPRETATION
            </span>
            <span className="text-xs font-bold text-amber-300">Supported Working Hypotheses</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-200">
            {candidate.possible_explanations?.[0]?.description ?? 'Astrophysical flux variability or proper motion consistent with source profile.'}
          </p>
          <div className="text-[11px] text-amber-300/80 italic">
            Note: Working interpretations require multi-band follow-up confirmation.
          </div>
        </div>

        {/* 4. UNKNOWN */}
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded bg-rose-900/80 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-200 border border-rose-500/40">
              UNKNOWN
            </span>
            <span className="text-xs font-bold text-rose-300">Scientific Uncertainties</span>
          </div>
          {(candidate.unknowns ?? []).length > 0 ? (
            <ul className="list-disc list-inside text-xs leading-relaxed text-slate-200 space-y-1">
              {(candidate.unknowns ?? []).map((u, i) => (
                <li key={i}>{u}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs leading-relaxed text-slate-400">
              Multi-epoch observational follow-up required to constrain orbital parameters and physical dimensions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
