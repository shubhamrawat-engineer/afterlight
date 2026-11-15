import { useState } from 'react';
import { Table, ChevronDown, ChevronUp } from 'lucide-react';
import type { SpectralProfile, SpectralDataPoint } from '../types/spectral.types';

interface SpectralMeasurementTableProps {
  profiles: SpectralProfile[];
  onSelectPoint?: (profile: SpectralProfile, point: SpectralDataPoint) => void;
  selectedPoint?: { profile: SpectralProfile; point: SpectralDataPoint } | null;
  className?: string;
}

export function SpectralMeasurementTable({
  profiles,
  onSelectPoint,
  selectedPoint,
  className,
}: SpectralMeasurementTableProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (profiles.length === 0) return null;

  return (
    <div className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] backdrop-blur-xl shadow-lg overflow-hidden ${className ?? ''}`}>
      {/* Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-slate-900/60"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Table className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Tabular Spectral Channel Inventory
          </h3>
          <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
            {profiles.reduce((acc, p) => acc + p.data_points.length, 0)} channels
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isOpen ? 'Collapse Table' : 'Expand Table'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expandable Table Content */}
      {isOpen && (
        <div className="border-t border-slate-800 p-5 space-y-4">
          <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead className="sticky top-0 bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Wavelength (μm)</th>
                  <th className="p-3">Signal (S_ν)</th>
                  <th className="p-3">Uncertainty (±σ)</th>
                  <th className="p-3">Quality Flag</th>
                  <th className="p-3">Epoch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {profiles.map((profile) =>
                  profile.data_points.map((pt) => {
                    const isSelected =
                      selectedPoint?.point.index === pt.index &&
                      selectedPoint?.profile.epoch_id === profile.epoch_id;
                    const isFlagged = pt.quality_flag !== 'OK';

                    return (
                      <tr
                        key={`${profile.epoch_id}-${pt.index}`}
                        onClick={() => onSelectPoint?.(profile, pt)}
                        className={`cursor-pointer transition-colors hover:bg-blue-950/30 ${
                          isSelected ? 'bg-blue-950/50 text-blue-200' : 'text-slate-300'
                        }`}
                      >
                        <td className="p-3 text-slate-500">{pt.index}</td>
                        <td className="p-3 font-bold text-sky-400">{pt.wavelength_um.toFixed(2)}</td>
                        <td className="p-3 font-bold text-white">
                          {pt.signal_value.toFixed(2)} {profile.flux_unit}
                        </td>
                        <td className="p-3 text-slate-400">
                          {pt.uncertainty !== null ? `±${pt.uncertainty.toFixed(2)}` : 'N/A'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              isFlagged
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {pt.quality_flag}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{profile.epoch_id}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
