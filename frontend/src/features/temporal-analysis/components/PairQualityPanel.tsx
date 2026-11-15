import { Sparkles, Clock, Compass, Info } from 'lucide-react';
import type { PairQualitySummary } from '../types/temporal-analysis.types';
import { PairQualityIndicator } from '../../observations/components/PairQualityIndicator';

interface PairQualityPanelProps {
  pairQuality: PairQualitySummary | null | undefined;
  className?: string;
}

/**
 * Astrometric & Photometric Pair Quality Assessment Panel.
 * Validates SPHEREx multi-epoch cross-correlation, wavelength matching, and time delta.
 */
export function PairQualityPanel({ pairQuality, className }: PairQualityPanelProps) {
  if (!pairQuality) {
    return (
      <div className={`rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-xs text-slate-400 ${className ?? ''}`}>
        Compatibility has not been established for this observation pair.
      </div>
    );
  }

  const {
    grade,
    wavelength_diff_um,
    wavelength_diff_pct,
    time_baseline_days,
    registration_rms_arcsec,
    notes,
  } = pairQuality;

  return (
    <div className={`rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md ${className ?? ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400">Pair Metric Evaluation</span>
          <h3 className="text-sm font-bold text-slate-100">
            Cross-Epoch Astrometric &amp; Photometric Quality
          </h3>
        </div>
        <PairQualityIndicator grade={grade} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Wavelength Diff */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-slate-400">
            <Sparkles className="h-3 w-3 text-sky-400" />
            <span>Passband Delta (Δλ)</span>
          </div>
          <p className="mt-1 text-sm font-mono font-bold text-slate-100">
            {wavelength_diff_um !== null ? `${wavelength_diff_um} μm` : 'Not available'}
          </p>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-mono">
              {wavelength_diff_pct !== null ? `(${wavelength_diff_pct}%)` : ''}
            </span>
            <span className="text-sky-400/90 font-sans">Color match</span>
          </div>
        </div>

        {/* Time Baseline */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-slate-400">
            <Clock className="h-3 w-3 text-amber-400" />
            <span>Time Baseline (Δt)</span>
          </div>
          <p className="mt-1 text-sm font-mono font-bold text-slate-100">
            {time_baseline_days !== null ? `${time_baseline_days} days` : 'Not available'}
          </p>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Epoch Separation</span>
            <span className="text-amber-400/90 font-sans">Elapsed time</span>
          </div>
        </div>

        {/* Registration RMS */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-slate-400">
            <Compass className="h-3 w-3 text-indigo-400" />
            <span>Astrometric RMS</span>
          </div>
          <p className="mt-1 text-sm font-mono font-bold text-slate-100">
            {registration_rms_arcsec !== null ? `${registration_rms_arcsec}″` : 'Not available'}
          </p>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Pointing Stability</span>
            <span className="text-indigo-400/90 font-sans">Alignment accuracy</span>
          </div>
        </div>

        {/* Validation Status */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Temporal Validity</span>
          <p className={`mt-1 text-xs font-bold font-mono ${grade === 'POOR' ? 'text-rose-400' : 'text-emerald-400'}`}>
            {grade === 'POOR' ? 'INVALID LIKE-FOR-LIKE' : 'VALIDATED PAIR'}
          </p>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-mono">
              {grade === 'POOR' ? 'Slope disparity' : 'Calibrated zero-point'}
            </span>
            <span className="text-emerald-400/90 font-sans">Ready to compare</span>
          </div>
        </div>
      </div>

      {notes && (
        <div className="mt-3.5 flex items-start gap-2 rounded-lg bg-slate-950/40 p-2.5 text-xs text-slate-400 border border-slate-800/50">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-400" />
          <p className="leading-relaxed">
            <strong className="text-slate-300">Technical Note: </strong>
            {notes}
          </p>
        </div>
      )}
    </div>
  );
}
