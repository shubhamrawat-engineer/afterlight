import { Activity } from 'lucide-react';
import type { SpectralProfile, SpectralDataPoint } from '../types/spectral.types';

interface SpectralMeasurementPanelProps {
  selectedPoint: { profile: SpectralProfile; point: SpectralDataPoint } | null;
  className?: string;
}

export function SpectralMeasurementPanel({
  selectedPoint,
  className,
}: SpectralMeasurementPanelProps) {
  if (!selectedPoint) {
    return (
      <div className={`rounded-xl border border-[#24344D] bg-[#101A2B] p-6 text-center ${className ?? ''}`}>
        <Activity className="mx-auto h-7 w-7 text-[#45D5F2] mb-2.5 opacity-80" />
        <h4 className="font-[family-name:var(--font-display)] text-sm font-semibold text-[#F4F7FF]">
          Point Inspector Inactive
        </h4>
        <p className="mt-1 text-xs text-[#B5C2D6]">
          Click or hover on any spectral data point on the chart to inspect its fixture flux, uncertainty, and quality flags.
        </p>
      </div>
    );
  }

  const { profile, point } = selectedPoint;
  const hasUncertainty = point.uncertainty !== null && point.uncertainty !== undefined;
  const isFlagged = point.quality_flag !== 'OK';

  return (
    <div className={`rounded-xl border border-[#24344D] bg-[#101A2B] p-5 space-y-4 ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-[#1A2940] pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#45D5F2]" />
          <h3 className="font-[family-name:var(--font-display)] text-sm font-semibold text-[#F4F7FF]">
            Spectral Channel Inspector
          </h3>
        </div>
        <span className="font-mono text-xs font-semibold text-[#45D5F2]">
          Channel #{point.index}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[#8293AD]">Central Wavelength</span>
          <p className="font-mono font-semibold text-[#45D5F2] text-sm">{point.wavelength_um} μm</p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[#8293AD]">Fixture Signal (S_ν)</span>
          <p className="font-mono font-semibold text-emerald-400 text-sm">
            {point.signal_value} {profile.flux_unit}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[#8293AD]">Measurement Uncertainty</span>
          <p className={`font-mono text-xs font-semibold ${hasUncertainty ? 'text-[#F4F7FF]' : 'text-amber-300'}`}>
            {hasUncertainty ? `± ${point.uncertainty} ${profile.flux_unit}` : 'Uncertainty not available'}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[#8293AD]">Quality Flag</span>
          <div className="flex items-center gap-1.5 pt-0.5">
            {isFlagged ? (
              <span className="rounded-md bg-amber-500/12 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300 border border-amber-500/35">
                {point.quality_flag}
              </span>
            ) : (
              <span className="rounded-md bg-emerald-500/12 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-300 border border-emerald-500/35">
                CLEAN / OK
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Epoch Context & Flag Description */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 text-xs space-y-1 font-mono">
        <div className="flex justify-between text-slate-300">
          <span>Observation Epoch:</span>
          <span className="text-white font-bold">{profile.epoch_label}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Observation ID:</span>
          <span>{profile.observation_id}</span>
        </div>
        {point.quality_flag_description && (
          <div className="mt-2 text-amber-300 border-t border-slate-900 pt-2 text-[11px] font-sans">
            Flag explanation: {point.quality_flag_description}
          </div>
        )}
      </div>
    </div>
  );
}
