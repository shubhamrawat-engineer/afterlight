import { Calendar, Cpu } from 'lucide-react';
import type { MultiEpochRecord } from '../types/multi-epoch.types';
import { ObservationImage } from './ObservationImage';
import { getObsId, getObsDate } from '../../observations/services/observation-service';
import { resolveImageUrl } from '../services/temporal-analysis-service';

interface EpochGridProps {
  selectedEpochs: MultiEpochRecord[];
  activeEpochId: string | null;
  onSelectActiveEpoch: (id: string) => void;
  fallbackImage?: string | null;
  targetTitle?: string;
  className?: string;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'Not recorded';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return iso;
  }
}

export function EpochGrid({
  selectedEpochs,
  activeEpochId,
  onSelectActiveEpoch,
  fallbackImage,
  targetTitle,
  className,
}: EpochGridProps) {
  if (selectedEpochs.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center text-xs text-slate-400">
        No observation epochs selected to display in the grid.
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5.5 backdrop-blur-xl shadow-lg space-y-4 ${className ?? ''}`}
      aria-label="Multi-Epoch Cutout Comparison Grid"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Synchronized Field Cutouts
          </span>
          <h3 className="text-base font-bold text-slate-100">
            Multi-Epoch Comparison Grid ({selectedEpochs.length} Epochs)
          </h3>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Click any cutout card to inspect detailed calibration metadata
        </span>
      </div>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {selectedEpochs.map((epoch) => {
          const id = getObsId(epoch);
          const date = getObsDate(epoch);
          const isActive = activeEpochId === id;
          const imageUrl = resolveImageUrl(epoch.image || fallbackImage);

          return (
            <div
              key={id}
              onClick={() => onSelectActiveEpoch(id)}
              className={`group flex flex-col justify-between overflow-hidden rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'border-blue-500 bg-blue-950/30 shadow-[0_0_20px_rgba(59,130,246,0.25)] ring-1 ring-blue-500'
                  : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              {/* Card Header with Badges */}
              <div className="flex items-center justify-between border-b border-slate-800/80 p-2.5 bg-slate-950/80 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-blue-600 px-1.5 py-0.2 text-[10px] font-mono font-bold text-white uppercase">
                    {epoch.epochLabel}
                  </span>
                  <span className="font-mono font-bold text-slate-200 text-[11px] truncate max-w-[120px]">
                    {id}
                  </span>
                </div>
                <span className="rounded border border-emerald-500/30 bg-emerald-950/60 px-1.5 py-0.2 text-[9px] font-mono font-bold text-emerald-300">
                  SPHEREx
                </span>
              </div>

              {/* Cutout Image Display */}
              <div className="relative aspect-square w-full bg-black overflow-hidden flex items-center justify-center">
                <ObservationImage
                  src={imageUrl}
                  alt={`${targetTitle ?? 'Target'} (${id})`}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />

                {/* Completeness Chip */}
                <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-[9px] font-mono text-slate-300 backdrop-blur-md border border-slate-700">
                  {epoch.wavelength_um ?? 'N/A'} μm
                </div>
              </div>

              {/* Card Footer Metadata */}
              <div className="p-3 space-y-1.5 text-xs bg-slate-950/40">
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-400 font-mono">
                    <Calendar className="h-3 w-3 text-sky-400 shrink-0" />
                    <span>{formatDate(date)}</span>
                  </span>
                  {epoch.daysFromFirst > 0 ? (
                    <span className="font-mono text-[10px] text-slate-400">
                      +{epoch.daysFromFirst}d
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-emerald-400">Baseline (T₀)</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span className="flex items-center gap-1">
                    <Cpu className="h-3 w-3 text-slate-500" />
                    <span className="truncate max-w-[130px]">{epoch.detector ?? 'Array'}</span>
                  </span>
                  <span className="font-mono text-slate-300">{epoch.units ?? 'DN'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
