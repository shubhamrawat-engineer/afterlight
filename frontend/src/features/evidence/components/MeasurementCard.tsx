import type { ScientificMeasurement } from '../types/evidence.types';

interface MeasurementCardProps {
  measurement: ScientificMeasurement;
}

export function MeasurementCard({ measurement }: MeasurementCardProps) {
  const { parameter, label, earlier_value, later_value, delta_value, unit, uncertainty, method, provenance } =
    measurement;

  const hasUncertainty = uncertainty !== null && uncertainty !== undefined && uncertainty !== 'Uncertainty not available';

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
      {/* Top Parameter Title */}
      <div>
        <span className="text-[10px] uppercase font-bold text-slate-400">{label}</span>
        <h4 className="text-xs font-bold text-slate-100 font-mono mt-0.5">{parameter}</h4>
      </div>

      {/* Quantitative Values */}
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-900/60 p-2.5 border border-slate-800/80 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block">Earlier (T0)</span>
          <span className="font-mono font-bold text-slate-200">
            {earlier_value !== null ? `${earlier_value} ${typeof earlier_value === 'number' ? unit : ''}` : 'N/A'}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block">Later (T1)</span>
          <span className="font-mono font-bold text-slate-200">
            {later_value !== null ? `${later_value} ${typeof later_value === 'number' ? unit : ''}` : 'N/A'}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block">Measured Delta (Δ)</span>
          <span className="font-mono font-extrabold text-blue-400">
            {delta_value !== null ? `${delta_value} ${typeof delta_value === 'number' ? unit : ''}` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Uncertainty & Method */}
      <div className="space-y-1.5 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
        <div className="flex items-center justify-between">
          <span>Uncertainty:</span>
          <span className={`font-mono font-semibold ${hasUncertainty ? 'text-emerald-400' : 'text-amber-400/90'}`}>
            {hasUncertainty ? `± ${uncertainty} ${unit}` : 'Uncertainty not available'}
          </span>
        </div>

        <div className="flex items-start justify-between gap-2">
          <span>Method:</span>
          <span className="font-mono text-slate-300 text-right">{method}</span>
        </div>

        <div className="flex items-start justify-between gap-2">
          <span>Provenance:</span>
          <span className="font-mono text-slate-400 text-right">{provenance}</span>
        </div>
      </div>
    </div>
  );
}
