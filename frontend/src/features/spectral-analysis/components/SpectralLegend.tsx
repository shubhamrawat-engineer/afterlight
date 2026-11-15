import { Eye, EyeOff } from 'lucide-react';
import type { SpectralProfile } from '../types/spectral.types';

interface SpectralLegendProps {
  profiles: SpectralProfile[];
  hiddenEpochIds: Set<string>;
  onToggleEpoch: (epochId: string) => void;
  className?: string;
}

export function SpectralLegend({
  profiles,
  hiddenEpochIds,
  onToggleEpoch,
  className,
}: SpectralLegendProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ''}`}>
      {profiles.map((p) => {
        const isHidden = hiddenEpochIds.has(p.epoch_id);
        return (
          <button
            key={p.epoch_id}
            type="button"
            onClick={() => onToggleEpoch(p.epoch_id)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
              isHidden
                ? 'border-slate-800 bg-slate-950/40 text-slate-500 opacity-60'
                : 'border-slate-800 bg-slate-900/80 text-slate-200 shadow-sm'
            }`}
          >
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{
                backgroundColor: isHidden ? '#475569' : p.color,
                boxShadow: isHidden ? 'none' : `0 0 8px ${p.color}`,
              }}
            />
            <span className="font-bold">{p.epoch_label}</span>
            <span className="font-mono text-[10px] text-slate-400">({p.flux_unit})</span>
            {isHidden ? (
              <EyeOff className="h-3.5 w-3.5 text-slate-500 ml-1" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-slate-400 ml-1" />
            )}
          </button>
        );
      })}
    </div>
  );
}
