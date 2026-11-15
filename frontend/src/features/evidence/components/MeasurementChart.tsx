import { BarChart3, Info } from 'lucide-react';
import type { ScientificMeasurement } from '../types/evidence.types';

interface MeasurementChartProps {
  measurements: ScientificMeasurement[];
  className?: string;
}

export function MeasurementChart({ measurements, className }: MeasurementChartProps) {
  // Find numeric measurements suitable for direct visual comparison
  const numericItem = measurements.find(
    (m) => typeof m.earlier_value === 'number' && typeof m.later_value === 'number'
  );

  if (!numericItem) {
    return (
      <div className={`rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 text-center text-xs text-slate-400 ${className ?? ''}`}>
        <BarChart3 className="mx-auto h-7 w-7 text-slate-600 mb-2" />
        No scalar numeric baseline/follow-up measurements available for graphical comparison.
      </div>
    );
  }

  const eVal = numericItem.earlier_value as number;
  const lVal = numericItem.later_value as number;
  const unit = numericItem.unit;
  const maxVal = Math.max(eVal, lVal) * 1.25 || 100;

  const barHeightE = (eVal / maxVal) * 100;
  const barHeightL = (lVal / maxVal) * 100;

  const unc = typeof numericItem.uncertainty === 'number' ? numericItem.uncertainty : null;
  const uncPct = unc ? (unc / maxVal) * 100 : null;

  return (
    <div className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5 backdrop-blur-xl shadow-lg space-y-4 ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Multi-Epoch Measurement Comparison
          </h3>
        </div>
        <span className="font-mono text-xs text-blue-300">
          {numericItem.parameter}
        </span>
      </div>

      {/* SVG Bar Chart with Error Whiskers */}
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="relative flex h-52 w-full max-w-sm items-end justify-around border-b border-l border-slate-700 pb-2 pl-4">
          {/* Left Y-Axis Label */}
          <div className="absolute -left-6 top-1/2 -rotate-90 text-[10px] font-mono text-slate-400 tracking-wider">
            {unit}
          </div>

          {/* Earlier (T0) Bar */}
          <div className="group relative flex flex-col items-center">
            {/* Uncertainty Error Bar */}
            {uncPct && (
              <div
                className="absolute flex flex-col items-center pointer-events-none"
                style={{ bottom: `calc(${barHeightE}% - ${uncPct / 2}%)` }}
              >
                <div className="h-0.5 w-3 bg-sky-300" />
                <div className="w-0.5 bg-sky-300" style={{ height: `${uncPct * 1.5}px` }} />
                <div className="h-0.5 w-3 bg-sky-300" />
              </div>
            )}

            {/* Bar */}
            <div
              className="w-14 rounded-t-md bg-gradient-to-t from-sky-900 to-sky-500 transition-all duration-300 group-hover:brightness-125"
              style={{ height: `${Math.max(barHeightE, 6)}%` }}
            />
            <span className="mt-2 font-mono text-xs font-bold text-sky-300">
              {eVal.toFixed(1)}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">T0 (Earlier)</span>
          </div>

          {/* Later (T1) Bar */}
          <div className="group relative flex flex-col items-center">
            {/* Uncertainty Error Bar */}
            {uncPct && (
              <div
                className="absolute flex flex-col items-center pointer-events-none"
                style={{ bottom: `calc(${barHeightL}% - ${uncPct / 2}%)` }}
              >
                <div className="h-0.5 w-3 bg-indigo-300" />
                <div className="w-0.5 bg-indigo-300" style={{ height: `${uncPct * 1.5}px` }} />
                <div className="h-0.5 w-3 bg-indigo-300" />
              </div>
            )}

            {/* Bar */}
            <div
              className="w-14 rounded-t-md bg-gradient-to-t from-indigo-900 to-indigo-500 transition-all duration-300 group-hover:brightness-125 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
              style={{ height: `${Math.max(barHeightL, 6)}%` }}
            />
            <span className="mt-2 font-mono text-xs font-bold text-indigo-300">
              {lVal.toFixed(1)}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">T1 (Later)</span>
          </div>
        </div>

        {/* Legend and Caption */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <span>
            Measured change Δ = <strong className="text-white font-mono">{numericItem.delta_value} {unit}</strong>
            {unc && <span className="font-mono text-slate-300"> (uncertainty ±{unc} {unit})</span>}.
          </span>
        </div>
      </div>
    </div>
  );
}
