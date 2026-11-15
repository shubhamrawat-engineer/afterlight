import { ArrowLeftRight, Calendar, Sparkles, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ObservationRecord } from '../types/observation.types';
import { getObsId, getObsDate, getObsProduct } from '../services/observation-service';
import { ObservationCard } from './ObservationCard';

export interface ObservationSelectorProps {
  observations: ObservationRecord[];
  earlierObs: ObservationRecord | null;
  laterObs: ObservationRecord | null;
  selectedDetailId?: string | null;
  onSetEarlier: (id: string) => void;
  onSetLater: (id: string) => void;
  onSwapPair?: () => void;
  onInspectObservation?: (id: string) => void;
  hasInvalidUrlSelection?: boolean;
  className?: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Not available';
  try {
    const d = new Date(iso);
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

/**
 * Reusable ObservationSelector component for STEP 2: SELECT OBSERVATIONS.
 * Combines interactive observation epoch cards with Earlier (T0) / Later (T1) pair
 * designation and one-click role swapping.
 */
export function ObservationSelector({
  observations,
  earlierObs,
  laterObs,
  selectedDetailId,
  onSetEarlier,
  onSetLater,
  onSwapPair,
  onInspectObservation,
  hasInvalidUrlSelection = false,
  className,
}: ObservationSelectorProps) {
  const earlierId = earlierObs ? getObsId(earlierObs) : '';
  const laterId = laterObs ? getObsId(laterObs) : '';

  const handleSwap = () => {
    if (onSwapPair) {
      onSwapPair();
      return;
    }
    if (earlierId && laterId) {
      onSetEarlier(laterId);
      onSetLater(earlierId);
    }
  };

  const handleCardSetEarlier = (id: string) => {
    if (id === laterId && earlierId) {
      handleSwap();
    } else {
      onSetEarlier(id);
    }
  };

  const handleCardSetLater = (id: string) => {
    if (id === earlierId && laterId) {
      handleSwap();
    } else {
      onSetLater(id);
    }
  };

  return (
    <div className={`rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md ${className ?? ''}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Step 2 — Observation Selection &amp; Pair Designation
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Select an Earlier (T0) and Later (T1) SPHEREx observation epoch below, or switch roles to update the active comparison pair across all stages.
          </p>
        </div>

        {observations.length >= 2 && (
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap earlier and later observation assignments"
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-950/40 px-3 py-1.5 text-xs font-semibold text-blue-200 transition-colors hover:bg-blue-600 hover:text-white"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>Switch Earlier / Later Roles</span>
          </button>
        )}
      </div>

      {hasInvalidUrlSelection && (
        <div
          role="status"
          className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-950/30 p-3 text-xs text-amber-200"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <span>
            One or more observation IDs in the URL were not found in this target&apos;s observation manifest (or were identical). Reverted to validated manifest observations.
          </span>
        </div>
      )}

      {/* Selectable Observation Cards Grid */}
      {observations.length > 0 && (
        <div className="mt-5">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Available Survey Epochs ({observations.length})
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Active Pair: {earlierId || 'None'} → {laterId || 'None'}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {observations.map((obs) => {
              const id = getObsId(obs);
              return (
                <ObservationCard
                  key={id}
                  observation={obs}
                  isEarlier={id === earlierId}
                  isLater={id === laterId}
                  isSelectedForDetail={id === selectedDetailId}
                  canAssignRoles={observations.length >= 2}
                  onSetEarlier={handleCardSetEarlier}
                  onSetLater={handleCardSetLater}
                  onInspect={(obsId) => onInspectObservation?.(obsId)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 2-Column Active Pair Summary */}
      <div className="mt-6 grid grid-cols-1 gap-5 border-t border-slate-800/80 pt-5 md:grid-cols-2">
        {/* EARLIER OBSERVATION */}
        <div className="relative rounded-xl border border-sky-500/30 bg-sky-950/20 p-4.5">
          <div className="flex items-center justify-between border-b border-sky-500/20 pb-2.5">
            <span className="rounded bg-sky-950 px-2 py-0.5 text-[10px] font-bold text-sky-300 tracking-wider uppercase border border-sky-500/30">
              EARLIER OBSERVATION (T0)
            </span>
            <div className="flex items-center gap-1 text-[11px] text-sky-400 font-mono">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Assigned</span>
            </div>
          </div>

          {earlierObs ? (
            <div className="mt-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200 font-mono">
                  {getObsId(earlierObs)}
                </span>
                {observations.length >= 2 && (
                  <select
                    value={earlierId}
                    onChange={(e) => handleCardSetEarlier(e.target.value)}
                    aria-label="Change earlier observation"
                    className="rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs text-slate-300 focus:outline-none"
                  >
                    {observations.map((o) => {
                      const id = getObsId(o);
                      return (
                        <option key={id} value={id} disabled={id === laterId}>
                          {id} ({o.wavelength_um ?? '—'} μm)
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="rounded bg-slate-950/60 p-2 border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Epoch Date</span>
                  <div className="mt-0.5 flex items-center gap-1 font-mono text-slate-200">
                    <Calendar className="h-3 w-3 text-sky-400" />
                    <span>{formatDate(getObsDate(earlierObs))}</span>
                  </div>
                </div>

                <div className="rounded bg-slate-950/60 p-2 border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Wavelength</span>
                  <div className="mt-0.5 flex items-center gap-1 font-mono text-sky-300 font-bold">
                    <Sparkles className="h-3 w-3" />
                    <span>{earlierObs.wavelength_um !== null ? `${earlierObs.wavelength_um} μm` : 'Not available'}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 truncate">
                <span className="font-semibold text-slate-300">Product: </span>
                {getObsProduct(earlierObs)}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-400">No earlier epoch designated.</p>
          )}
        </div>

        {/* LATER OBSERVATION */}
        <div className="relative rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4.5">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
            <span className="rounded bg-indigo-950 px-2 py-0.5 text-[10px] font-bold text-indigo-300 tracking-wider uppercase border border-indigo-500/30">
              LATER OBSERVATION (T1)
            </span>
            <div className="flex items-center gap-1 text-[11px] text-indigo-400 font-mono">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Assigned</span>
            </div>
          </div>

          {laterObs ? (
            <div className="mt-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200 font-mono">
                  {getObsId(laterObs)}
                </span>
                {observations.length >= 2 && (
                  <select
                    value={laterId}
                    onChange={(e) => handleCardSetLater(e.target.value)}
                    aria-label="Change later observation"
                    className="rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs text-slate-300 focus:outline-none"
                  >
                    {observations.map((o) => {
                      const id = getObsId(o);
                      return (
                        <option key={id} value={id} disabled={id === earlierId}>
                          {id} ({o.wavelength_um ?? '—'} μm)
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="rounded bg-slate-950/60 p-2 border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Epoch Date</span>
                  <div className="mt-0.5 flex items-center gap-1 font-mono text-slate-200">
                    <Calendar className="h-3 w-3 text-indigo-400" />
                    <span>{formatDate(getObsDate(laterObs))}</span>
                  </div>
                </div>

                <div className="rounded bg-slate-950/60 p-2 border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Wavelength</span>
                  <div className="mt-0.5 flex items-center gap-1 font-mono text-indigo-300 font-bold">
                    <Sparkles className="h-3 w-3" />
                    <span>{laterObs.wavelength_um !== null ? `${laterObs.wavelength_um} μm` : 'Not available'}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 truncate">
                <span className="font-semibold text-slate-300">Product: </span>
                {getObsProduct(laterObs)}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-400">No later epoch designated.</p>
          )}
        </div>
      </div>
    </div>
  );
}
