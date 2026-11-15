import { Calendar, Sparkles, Cpu, Package, CheckCircle2, Eye } from 'lucide-react';
import type { ObservationRecord } from '../types/observation.types';
import { getObsId, getObsDate, getObsProduct } from '../services/observation-service';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';

export interface ObservationCardProps {
  observation: ObservationRecord;
  isEarlier: boolean;
  isLater: boolean;
  isSelectedForDetail: boolean;
  canAssignRoles: boolean;
  onSetEarlier: (id: string) => void;
  onSetLater: (id: string) => void;
  onInspect: (id: string) => void;
}

function formatUtcTimestamp(iso: string | null): string {
  if (!iso) return 'Timestamp unavailable';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${d.toISOString().replace('T', ' ').slice(0, 19)} UTC`;
  } catch {
    return iso;
  }
}

/**
 * Reusable ObservationCard component for selecting and inspecting SPHEREx observation epochs.
 * Displays observation ID, acquisition timestamp, wavelength metadata, product type,
 * demonstration badge, and role assignment buttons (Earlier T0 / Later T1).
 */
export function ObservationCard({
  observation,
  isEarlier,
  isLater,
  isSelectedForDetail,
  canAssignRoles,
  onSetEarlier,
  onSetLater,
  onInspect,
}: ObservationCardProps) {
  const obsId = getObsId(observation);
  const obsDate = getObsDate(observation);
  const product = getObsProduct(observation);

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border p-4 transition-all duration-150 ${
        isEarlier
          ? 'border-sky-500/45 bg-sky-950/20 shadow-[0_0_20px_rgba(14,165,233,0.12)]'
          : isLater
          ? 'border-indigo-500/45 bg-indigo-950/20 shadow-[0_0_20px_rgba(99,102,241,0.12)]'
          : isSelectedForDetail
          ? 'border-blue-500/35 bg-slate-900/90'
          : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700'
      }`}
    >
      <div className="space-y-3">
        {/* Top Row: Role Badge & Demonstration Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {isEarlier ? (
              <span className="inline-flex items-center gap-1 rounded border border-sky-500/40 bg-sky-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
                <CheckCircle2 className="h-3 w-3 text-sky-400" />
                EARLIER (T0)
              </span>
            ) : isLater ? (
              <span className="inline-flex items-center gap-1 rounded border border-indigo-500/40 bg-indigo-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                <CheckCircle2 className="h-3 w-3 text-indigo-400" />
                LATER (T1)
              </span>
            ) : (
              <span className="rounded border border-slate-700/70 bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                AVAILABLE EPOCH
              </span>
            )}
          </div>
          <DemonstrationDataBadge variant="compact" label="SPHEREx EPOCH" />
        </div>

        {/* Observation ID */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Observation ID
          </span>
          <p className="mt-0.5 font-mono text-xs font-bold text-slate-100 break-all">
            {obsId}
          </p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
          <div className="rounded-lg border border-slate-800/70 bg-slate-950/70 p-2">
            <span className="text-[10px] font-semibold uppercase text-slate-400">
              Acquisition (UTC)
            </span>
            <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-slate-200">
              <Calendar className="h-3 w-3 shrink-0 text-blue-400" />
              <span className="truncate">{formatUtcTimestamp(obsDate)}</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800/70 bg-slate-950/70 p-2">
            <span className="text-[10px] font-semibold uppercase text-slate-400">
              Wavelength (LVF)
            </span>
            <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] font-bold text-sky-300">
              <Sparkles className="h-3 w-3 shrink-0" />
              <span>
                {observation.wavelength_um !== null
                  ? `${observation.wavelength_um} μm`
                  : 'Not available'}
                {observation.wavelength_range_um
                  ? ` (${observation.wavelength_range_um} μm)`
                  : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Product & Detector */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1 truncate">
            <Package className="h-3 w-3 shrink-0 text-slate-500" />
            <span className="font-medium text-slate-300">{product}</span>
          </span>
          {observation.detector && (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400">
              <Cpu className="h-3 w-3 text-slate-500" />
              {observation.detector}
            </span>
          )}
        </div>
      </div>

      {/* Interactive Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-3">
        {canAssignRoles && (
          <>
            <button
              type="button"
              disabled={isEarlier}
              onClick={() => onSetEarlier(obsId)}
              aria-label={`Select ${obsId} as Earlier observation (T0)`}
              className={`flex-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                isEarlier
                  ? 'border-sky-500/40 bg-sky-500/20 text-sky-200 cursor-default'
                  : 'border-slate-700/80 bg-slate-900 text-slate-300 hover:border-sky-500/50 hover:bg-sky-950/50 hover:text-sky-200'
              }`}
            >
              {isEarlier ? 'Selected Earlier (T0)' : 'Set as Earlier (T0)'}
            </button>

            <button
              type="button"
              disabled={isLater}
              onClick={() => onSetLater(obsId)}
              aria-label={`Select ${obsId} as Later observation (T1)`}
              className={`flex-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                isLater
                  ? 'border-indigo-500/40 bg-indigo-500/20 text-indigo-200 cursor-default'
                  : 'border-slate-700/80 bg-slate-900 text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-950/50 hover:text-indigo-200'
              }`}
            >
              {isLater ? 'Selected Later (T1)' : 'Set as Later (T1)'}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onInspect(obsId)}
          aria-label={`Inspect metadata for ${obsId}`}
          className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
            isSelectedForDetail
              ? 'border-blue-500/40 bg-blue-950/50 text-blue-200'
              : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <Eye className="h-3 w-3" />
          <span>{isSelectedForDetail ? 'Inspecting' : 'Inspect'}</span>
        </button>
      </div>
    </div>
  );
}
