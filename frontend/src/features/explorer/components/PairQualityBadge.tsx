import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';
import type { PairQualitySummary } from '../types/explorer.types';

interface PairQualityBadgeProps {
  quality: PairQualitySummary | null | undefined;
  className?: string;
}

/**
 * Photometric pair compatibility and registration quality badge.
 * Evaluates whether multi-epoch observations are compatible for like-for-like analysis.
 */
export function PairQualityBadge({ quality, className }: PairQualityBadgeProps) {
  if (!quality) {
    return (
      <div className={`rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400 ${className ?? ''}`}>
        No observation pair analysis available for this target.
      </div>
    );
  }

  const { grade, wavelength_diff_um, wavelength_diff_pct, time_baseline_days, registration_rms_arcsec, notes, compatibility_warning } = quality;

  const gradeConfig = {
    GOOD: {
      badgeBg: 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300',
      icon: ShieldCheck,
      label: 'GOOD COMPATIBILITY',
      headerText: 'Valid Multi-Epoch Pair',
    },
    FAIR: {
      badgeBg: 'bg-amber-950/80 border-amber-500/30 text-amber-300',
      icon: AlertTriangle,
      label: 'FAIR COMPATIBILITY',
      headerText: 'Observation Pair with Moderate Delta',
    },
    POOR: {
      badgeBg: 'bg-rose-950/80 border-rose-500/30 text-rose-300',
      icon: AlertCircle,
      label: 'POOR COMPATIBILITY',
      headerText: 'Incompatible Observation Pair',
    },
  }[grade];

  const Icon = gradeConfig.icon;

  return (
    <div className={`rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md ${className ?? ''}`}>
      {/* Header with grade badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Observation Pair Quality
          </span>
        </div>
        <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wider ${gradeConfig.badgeBg}`}>
          <Icon className="h-3.5 w-3.5" />
          <span>{gradeConfig.label}</span>
        </div>
      </div>

      {/* Scientific Incompatibility Warning for POOR */}
      {grade === 'POOR' && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-rose-500/40 bg-rose-950/40 p-3.5 text-xs text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-300">
              Scientific Compatibility Warning
            </p>
            <p className="text-rose-200/90 leading-relaxed">
              {compatibility_warning ?? 'Observations exhibit significant passband discrepancy (>20%). Direct differential flux subtraction will introduce severe non-physical spectral artifacts.'}
            </p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Wavelength Δλ</span>
          <p className="mt-0.5 text-sm font-mono font-medium text-slate-100">
            {wavelength_diff_um !== null ? `${wavelength_diff_um} μm` : '—'}
          </p>
        </div>

        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Δλ Percentage</span>
          <p className="mt-0.5 text-sm font-mono font-medium text-slate-100">
            {wavelength_diff_pct !== null ? `${wavelength_diff_pct}%` : '—'}
          </p>
        </div>

        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Time Baseline</span>
          <p className="mt-0.5 text-sm font-mono font-medium text-slate-100">
            {time_baseline_days !== null ? `${time_baseline_days} days` : '—'}
          </p>
        </div>

        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Registration RMS</span>
          <p className="mt-0.5 text-sm font-mono font-medium text-slate-100">
            {registration_rms_arcsec !== null ? `${registration_rms_arcsec}″` : '—'}
          </p>
        </div>
      </div>

      {/* Quality notes */}
      {notes && (
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-300">Technical Notes: </span>
          {notes}
        </p>
      )}
    </div>
  );
}
