import { Activity } from 'lucide-react';
import type { ScientificMeasurement } from '../types/evidence.types';
import { MeasurementCard } from './MeasurementCard';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';

interface MeasurementPanelProps {
  measurements: ScientificMeasurement[];
  className?: string;
}

export function MeasurementPanel({ measurements, className }: MeasurementPanelProps) {
  return (
    <div className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5 backdrop-blur-xl shadow-lg space-y-4 ${className ?? ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Demonstration Measurements ({measurements.length})
          </h3>
        </div>
        <DemonstrationDataBadge variant="compact" label="MOCK MEASUREMENTS" />
      </div>

      <div className="rounded-lg border border-amber-500/25 bg-amber-950/20 px-3 py-2 text-[11px] text-amber-200/90">
        <strong>Scientific Honesty Notice:</strong> Values below are structured demonstration fixtures
        illustrating how AFTERLIGHT presents photometric deltas, uncertainties, and SNR once connected
        to a verified SPHEREx subtraction pipeline. They are not real scientific findings.
      </div>

      {measurements.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 text-center">
          No demonstration measurements are available for this candidate.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          {measurements.map((m) => (
            <MeasurementCard key={m.id} measurement={m} />
          ))}
        </div>
      )}
    </div>
  );
}
