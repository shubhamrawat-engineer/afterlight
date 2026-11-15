import { Calendar, Sparkles, Check } from 'lucide-react';
import type { MultiEpochRecord } from '../types/multi-epoch.types';
import { getObsId, getObsDate } from '../../observations/services/observation-service';

interface EpochTimelineProps {
  allEpochs: MultiEpochRecord[];
  selectedEpochIds: string[];
  activeEpochId: string | null;
  onToggleEpoch: (id: string) => void;
  onSelectActiveEpoch: (id: string) => void;
  className?: string;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'Date unrecorded';
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

export function EpochTimeline({
  allEpochs,
  selectedEpochIds,
  activeEpochId,
  onToggleEpoch,
  onSelectActiveEpoch,
  className,
}: EpochTimelineProps) {
  const selectedSet = new Set(selectedEpochIds);

  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5.5 backdrop-blur-xl shadow-lg space-y-4 ${className ?? ''}`}
      aria-label="Multi-Epoch Observation Timeline"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Multi-Epoch Cadence &amp; Timeline
          </span>
          <h3 className="text-base font-bold text-slate-100">
            Observation Epoch Sequence
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span>Complete</span>
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400 ml-1.5" />
            <span>Partial</span>
          </div>
          <span className="rounded bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 text-[11px] font-mono text-blue-300">
            {selectedEpochIds.length} of {allEpochs.length} Selected
          </span>
        </div>
      </div>

      {/* 1. Desktop Horizontal Timeline */}
      <div className="hidden md:block overflow-x-auto py-2">
        <div className="min-w-[680px] relative px-4 pt-4 pb-2">
          {/* Timeline continuous horizontal connector bar */}
          <div className="absolute top-9 left-10 right-10 h-0.5 bg-slate-800" aria-hidden="true" />

          <div className="flex items-start justify-between relative z-10">
            {allEpochs.map((epoch, idx) => {
              const id = getObsId(epoch);
              const isSelected = selectedSet.has(id);
              const isActive = activeEpochId === id;
              const date = getObsDate(epoch);

              return (
                <div key={id} className="flex flex-col items-center text-center group max-w-[150px]">
                  {/* Delta days interval badge connecting to previous */}
                  {idx > 0 && epoch.daysFromPrevious !== null && (
                    <div className="absolute text-[10px] font-mono text-slate-400 -translate-y-4 bg-[#0a0e1a] px-1 border border-slate-800 rounded">
                      +{epoch.daysFromPrevious}d
                    </div>
                  )}

                  {/* Epoch Node Button */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectActiveEpoch(id);
                      if (!isSelected) onToggleEpoch(id);
                    }}
                    aria-label={`Select ${epoch.epochLabel} (${id})`}
                    className={`h-10 w-10 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                      isActive
                        ? 'border-blue-400 bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110'
                        : isSelected
                        ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300'
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </button>

                  {/* Metadata Preview Card below node */}
                  <div className="mt-3 space-y-1">
                    <span className="text-[11px] font-bold text-slate-200 block truncate" title={id}>
                      {id}
                    </span>

                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Calendar className="h-3 w-3 text-sky-400 shrink-0" />
                      <span>{formatDate(date)}</span>
                    </div>

                    <div className="flex items-center justify-center gap-1 text-[10px] text-sky-300 font-mono">
                      <Sparkles className="h-3 w-3 shrink-0" />
                      <span>{epoch.wavelength_um !== null ? `${epoch.wavelength_um} μm` : 'N/A'}</span>
                    </div>

                    <div className="text-[9px] text-slate-400 truncate max-w-[130px]">
                      {epoch.detector ?? 'Array'}
                    </div>

                    {/* Selection Toggle Checkbox Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleEpoch(id);
                      }}
                      className={`mt-1.5 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                        isSelected
                          ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60'
                          : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {isSelected ? <Check className="h-3 w-3" /> : null}
                      <span>{isSelected ? 'Included' : 'Add Epoch'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Mobile Accessible Vertical Stacked Timeline */}
      <div className="block md:hidden space-y-2.5">
        {allEpochs.map((epoch, idx) => {
          const id = getObsId(epoch);
          const isSelected = selectedSet.has(id);
          const isActive = activeEpochId === id;
          const date = getObsDate(epoch);

          return (
            <div
              key={id}
              className={`rounded-xl border p-3 transition-colors ${
                isActive
                  ? 'border-blue-500 bg-blue-950/30'
                  : isSelected
                  ? 'border-emerald-500/40 bg-slate-950/60'
                  : 'border-slate-800 bg-slate-950/40 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`h-6 w-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">{id}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatDate(date)} • {epoch.wavelength_um ?? '—'} μm
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectActiveEpoch(id)}
                    className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-200"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleEpoch(id)}
                    className={`rounded border px-2 py-1 text-[11px] font-semibold ${
                      isSelected
                        ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                        : 'border-slate-700 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {isSelected ? 'Included' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
