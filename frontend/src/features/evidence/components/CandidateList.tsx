import { Sparkles, Compass, AlertCircle } from 'lucide-react';
import type { CandidateDetection } from '../types/evidence.types';

interface CandidateListProps {
  candidates: CandidateDetection[];
  selectedId: string | null;
  onSelectCandidate: (id: string) => void;
  className?: string;
}

export function CandidateList({
  candidates,
  selectedId,
  onSelectCandidate,
  className,
}: CandidateListProps) {
  if (candidates.length === 0) {
    return (
      <div className={`rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-center ${className ?? ''}`}>
        <AlertCircle className="mx-auto h-8 w-8 text-slate-500" />
        <h4 className="mt-2 text-sm font-semibold text-slate-300">
          No Candidate Measurements
        </h4>
        <p className="mt-1 text-xs text-slate-400">
          No candidate measurements are available for this comparison.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5 backdrop-blur-xl shadow-lg ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Detected Candidates ({candidates.length})
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">SPHEREx L3</span>
      </div>

      <div className="mt-3 flex flex-col gap-2.5" role="listbox" aria-label="Detected Candidates">
        {candidates.map((c) => {
          const isSelected = c.id === selectedId;
          return (
            <button
              key={c.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelectCandidate(c.id)}
              className={`flex flex-col gap-1.5 rounded-xl border p-3.5 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                isSelected
                  ? 'border-blue-500/80 bg-blue-950/40 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>
                  {c.label}
                </span>
                {c.significance_sigma && (
                  <span className="rounded bg-emerald-950 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                    {c.significance_sigma}σ
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <Compass className="h-3 w-3 text-slate-500 shrink-0" />
                <span>RA {c.ra_deg.toFixed(4)}°, Dec {c.dec_deg.toFixed(4)}°</span>
              </div>

              <div className="text-[11px] text-slate-400 line-clamp-2">
                {c.measured_summary}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
