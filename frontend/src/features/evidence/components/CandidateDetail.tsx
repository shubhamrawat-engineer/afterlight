import { FileText } from 'lucide-react';
import type { CandidateDetection } from '../types/evidence.types';

interface CandidateDetailProps {
  candidate: CandidateDetection | null;
  className?: string;
}

export function CandidateDetail({ candidate, className }: CandidateDetailProps) {
  if (!candidate) return null;

  return (
    <div className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5 backdrop-blur-xl shadow-lg space-y-4 ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Candidate Specifications &amp; Astrometry
          </h3>
        </div>
        <span className="font-mono text-xs font-bold text-blue-300">
          ID: {candidate.id}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <span className="text-[10px] uppercase font-bold text-slate-400">Right Ascension</span>
          <p className="mt-1 font-mono font-bold text-slate-100">{candidate.ra_deg.toFixed(5)}°</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <span className="text-[10px] uppercase font-bold text-slate-400">Declination</span>
          <p className="mt-1 font-mono font-bold text-slate-100">{candidate.dec_deg.toFixed(5)}°</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pixel Center</span>
          <p className="mt-1 font-mono font-bold text-slate-100">({candidate.pixel_x}, {candidate.pixel_y})</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <span className="text-[10px] uppercase font-bold text-slate-400">Detection Significance</span>
          <p className="mt-1 font-mono font-bold text-emerald-400">
            {candidate.significance_sigma ? `${candidate.significance_sigma}σ` : 'Uncalibrated'}
          </p>
        </div>
      </div>

      {/* Supporting Observations */}
      {(candidate.supporting_observations ?? []).length > 0 && (
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400">Supporting Observations</span>
          <div className="flex flex-wrap gap-2 pt-1">
            {(candidate.supporting_observations ?? []).map((obs, i) => (
              <span
                key={i}
                className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 font-mono text-[11px] text-slate-300"
              >
                {obs}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
