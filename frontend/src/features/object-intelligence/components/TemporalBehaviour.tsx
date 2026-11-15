import { Orbit, AlertTriangle } from 'lucide-react';
import type { TemporalMotionRecord } from '../types/object.types';

interface TemporalBehaviourProps {
  behaviour: TemporalMotionRecord;
  className?: string;
}

export function TemporalBehaviour({ behaviour, className }: TemporalBehaviourProps) {
  if (!behaviour.has_motion_data) {
    return (
      <div className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5 text-center text-xs text-slate-400 ${className ?? ''}`}>
        <Orbit className="mx-auto h-8 w-8 text-slate-600 mb-2" />
        Insufficient validated observations for a reliable motion or variability analysis.
      </div>
    );
  }

  const {
    motion_type,
    measured_displacement_arcsec,
    motion_rate_mas_per_day,
    position_angle_deg,
    flux_delta_value,
    flux_unit,
    uncertainty,
    time_baseline_days,
    scientific_notes,
    warnings,
  } = behaviour;

  return (
    <div className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5 backdrop-blur-xl shadow-lg space-y-4 ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Orbit className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            TEMPORAL BEHAVIOUR &amp; MULTI-EPOCH MEASUREMENTS
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-mono uppercase font-bold text-slate-300 border border-slate-700">
            {motion_type.replace(/_/g, ' ')}
          </span>
          <span className="rounded bg-blue-950 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-300 border border-blue-500/30">
            BASELINE: {time_baseline_days} DAYS
          </span>
        </div>
      </div>

      {/* Quantitative Measurements Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs font-mono">
        {measured_displacement_arcsec !== null && measured_displacement_arcsec !== undefined && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Angular Shift (Δθ)</span>
            <p className="font-extrabold text-sky-400 text-sm">{measured_displacement_arcsec} arcsec</p>
            <span className="text-[10px] font-sans text-sky-400/80 block">Total sky distance traveled</span>
          </div>
        )}

        {motion_rate_mas_per_day !== null && motion_rate_mas_per_day !== undefined && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Motion Rate (μ)</span>
            <p className="font-extrabold text-indigo-400 text-sm">{motion_rate_mas_per_day} mas/day</p>
            <span className="text-[10px] font-sans text-indigo-400/80 block">Speed across the sky</span>
          </div>
        )}

        {position_angle_deg !== null && position_angle_deg !== undefined && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Position Angle (PA)</span>
            <p className="font-extrabold text-slate-200 text-sm">{position_angle_deg}°</p>
            <span className="text-[10px] font-sans text-slate-400/80 block">Compass heading (0°=N, 90°=E)</span>
          </div>
        )}

        {flux_delta_value !== null && flux_delta_value !== undefined && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Flux Delta (ΔS_ν)</span>
            <p className="font-extrabold text-emerald-400 text-sm">
              +{flux_delta_value} {flux_unit}
            </p>
            <span className="text-[10px] font-sans text-emerald-400/80 block">Brightness change over time</span>
          </div>
        )}

        {uncertainty !== null && uncertainty !== undefined && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Measurement Uncertainty</span>
            <p className="font-bold text-slate-300 text-xs">± {uncertainty} {flux_unit ?? 'arcsec'}</p>
            <span className="text-[10px] font-sans text-slate-400/80 block">1σ statistical confidence</span>
          </div>
        )}
      </div>

      {/* Scientific Notes */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1 text-xs text-slate-300 leading-relaxed">
        <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">
          Astrophysical Pipeline Evaluation:
        </span>
        <p>{scientific_notes}</p>
      </div>

      {/* Mandatory Scientific Caveats and Warnings */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Epistemic Constraints &amp; Astrometric Limitations</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-amber-200/90 leading-relaxed">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
