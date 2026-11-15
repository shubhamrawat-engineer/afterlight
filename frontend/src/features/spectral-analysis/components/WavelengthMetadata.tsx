import { Sliders } from 'lucide-react';
import type { SpectralProfile } from '../types/spectral.types';

interface WavelengthMetadataProps {
  profiles: SpectralProfile[];
  className?: string;
}

export function WavelengthMetadata({ profiles, className }: WavelengthMetadataProps) {
  if (profiles.length === 0) return null;

  const active = profiles[0];
  const totalPoints = active.data_points.length;
  const okPoints = active.data_points.filter((p) => p.quality_flag === 'OK').length;
  const flaggedPoints = totalPoints - okPoints;

  return (
    <div className={`rounded-xl border border-[#24344D] bg-[#101A2B] p-5 space-y-4 ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-[#1A2940] pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[#45D5F2]" />
          <h3 className="font-[family-name:var(--font-display)] text-sm font-semibold text-[#F4F7FF]">
            Wavelength &amp; Passband Specifications
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#8293AD]">Continuous LVF Scan</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 border-b border-[#1A2940] pb-4 text-xs">
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[#8293AD]">Passband Coverage</span>
          <p className="font-mono font-semibold text-[#F4F7FF]">
            {active.wavelength_min_um.toFixed(2)} – {active.wavelength_max_um.toFixed(2)} μm
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[#8293AD]">Spectral Resolution</span>
          <p className="font-mono font-semibold text-[#45D5F2]">{active.sampling_resolution}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[#8293AD]">Sampled Fixture Points</span>
          <p className="font-mono font-semibold text-[#F4F7FF]">
            {totalPoints} <span className="text-[#8293AD] font-normal">({okPoints} clean)</span>
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[#8293AD]">Flux Unit</span>
          <p className="font-mono font-semibold text-emerald-400">{active.flux_unit}</p>
        </div>
      </div>

      {/* Scientific Instrument Architecture Note */}
      <div className="text-xs text-[#B5C2D6] leading-relaxed">
        <p>
          <strong className="text-[#F4F7FF]">Instrument Note:</strong> SPHEREx utilises a Linear Variable Filter (LVF) across six focal plane detector arrays (Bands 1–6), spanning 0.75 μm to 5.0 μm with resolving power ranging from R ≈ 41 in the near-IR up to R ≈ 130 at 4.4–5.0 μm.
        </p>
        {flaggedPoints > 0 && (
          <p className="mt-2 text-amber-300 text-[11px]">
            Notice: {flaggedPoints} fixture point{flaggedPoints === 1 ? '' : 's'} carry quality flags (telluric zone or detector edge) and are highlighted in amber on the chart.
          </p>
        )}
      </div>
    </div>
  );
}
