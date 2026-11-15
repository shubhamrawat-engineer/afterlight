import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { ObservationRecord } from '../types/observation.types';
import { getObsId, getObsDate, getObsProduct } from '../services/observation-service';

interface TimelineMarkerProps {
  observation: ObservationRecord;
  isSelected: boolean;
  isEarlier: boolean;
  isLater: boolean;
  onSelect: (id: string) => void;
  index: number;
  total: number;
}

function formatMarkerDate(iso: string | null): string {
  if (!iso) return 'Unknown Date';
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
 * Individual interactive astronomical marker on the horizontal observation timeline.
 */
export function TimelineMarker({
  observation,
  isSelected,
  isEarlier,
  isLater,
  onSelect,
  index,
}: TimelineMarkerProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const id = getObsId(observation);
  const dateStr = getObsDate(observation);
  const formattedDate = formatMarkerDate(dateStr);
  const product = getObsProduct(observation);

  // Distinct badge styling for earlier / later
  const roleBadge = isEarlier ? (
    <span className="rounded bg-sky-950/90 border border-sky-500/40 px-1.5 py-0.2 text-[9px] font-bold text-sky-300 uppercase">
      EARLIER
    </span>
  ) : isLater ? (
    <span className="rounded bg-indigo-950/90 border border-indigo-500/40 px-1.5 py-0.2 text-[9px] font-bold text-indigo-300 uppercase">
      LATER
    </span>
  ) : null;

  return (
    <div className="relative flex flex-col items-center">
      {/* Tooltip Overlay */}
      {showTooltip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute -top-28 z-30 w-56 rounded-lg border border-slate-700 bg-slate-950 p-2.5 shadow-2xl backdrop-blur-xl text-left"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[10px] text-slate-400">
            <span className="font-semibold text-slate-200">Epoch {index + 1}</span>
            <span className="font-mono text-blue-400">{observation.wavelength_um ?? '—'} μm</span>
          </div>
          <p className="mt-1 font-mono text-[11px] font-semibold text-slate-100 truncate">
            {id}
          </p>
          <p className="text-[10px] text-slate-400 truncate">{product}</p>
          <p className="mt-1 text-[10px] font-mono text-slate-400">{dateStr ?? 'UTC Date Pending'}</p>
        </div>
      )}

      {/* Observation Meta (Top) */}
      <div className="mb-3 flex flex-col items-center gap-1 text-center">
        {roleBadge}
        <span className="text-xs font-semibold font-mono text-slate-200 whitespace-nowrap">
          {formattedDate}
        </span>
      </div>

      {/* Interactive Marker Node */}
      <button
        type="button"
        onClick={() => onSelect(id)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={`Select observation ${id} from ${formattedDate}`}
        aria-pressed={isSelected}
        className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
          isSelected
            ? 'bg-blue-600 border-2 border-white text-white shadow-[0_0_18px_rgba(59,130,246,0.8)] scale-110'
            : isEarlier
            ? 'bg-sky-950 border-2 border-sky-400 text-sky-200 hover:scale-105'
            : isLater
            ? 'bg-indigo-950 border-2 border-indigo-400 text-indigo-200 hover:scale-105'
            : 'bg-slate-900 border-2 border-slate-600 text-slate-400 hover:border-slate-400 hover:text-white hover:scale-105'
        }`}
      >
        <span className="text-[10px] font-bold font-mono">{index + 1}</span>
      </button>

      {/* Observation Identifier & Wavelength (Bottom) */}
      <div className="mt-3 flex flex-col items-center gap-0.5 text-center">
        <span
          className={`font-mono text-[11px] truncate max-w-[130px] ${
            isSelected ? 'text-blue-300 font-semibold' : 'text-slate-400'
          }`}
        >
          {id}
        </span>
        <div className="flex items-center gap-1 text-[11px] font-mono text-sky-400">
          <Sparkles className="h-3 w-3" />
          <span>{observation.wavelength_um !== null ? `${observation.wavelength_um} μm` : '—'}</span>
        </div>
      </div>
    </div>
  );
}
