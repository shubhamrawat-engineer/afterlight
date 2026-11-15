import { Clock, Info } from 'lucide-react';
import type { ObservationRecord } from '../types/observation.types';
import { TimelineMarker } from './TimelineMarker';
import { getObsId, getObsDate } from '../services/observation-service';

interface ObservationTimelineProps {
  observations: ObservationRecord[];
  selectedId: string | null;
  earlierId: string | null;
  laterId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

/**
 * Astronomical Multi-Epoch Temporal Timeline.
 * Visually lays out all verified observations chronologically along a celestial time-axis.
 */
export function ObservationTimeline({
  observations,
  selectedId,
  earlierId,
  laterId,
  onSelect,
  className,
}: ObservationTimelineProps) {
  // Sort chronologically for timeline display
  const chronologicalObs = [...observations].sort((a, b) => {
    const dateA = getObsDate(a) ? new Date(getObsDate(a)!).getTime() : 0;
    const dateB = getObsDate(b) ? new Date(getObsDate(b)!).getTime() : 0;
    return dateA - dateB;
  });

  if (chronologicalObs.length === 0) {
    return (
      <div className={`rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center text-xs text-slate-400 ${className ?? ''}`}>
        No observation timeline records available.
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md ${className ?? ''}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Observation Temporal Sequence
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Info className="h-3.5 w-3.5" />
          <span>Click any marker to inspect epoch metadata</span>
        </div>
      </div>

      {/* Horizontal Timeline Track */}
      <div className="mt-8 overflow-x-auto pb-4 pt-6">
        <div className="relative min-w-[500px] px-8">
          {/* Background Connecting Timeline Track Line */}
          <div
            className="absolute top-1/2 left-12 right-12 h-0.5 -translate-y-1 bg-gradient-to-r from-blue-900/40 via-blue-500/50 to-indigo-900/40"
            aria-hidden="true"
          />

          {/* Markers Distributed along the Time Axis */}
          <div className="relative z-10 flex items-center justify-around gap-8">
            {chronologicalObs.map((obs, idx) => {
              const id = getObsId(obs);
              return (
                <TimelineMarker
                  key={id}
                  observation={obs}
                  index={idx}
                  total={chronologicalObs.length}
                  isSelected={id === selectedId}
                  isEarlier={id === earlierId}
                  isLater={id === laterId}
                  onSelect={onSelect}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-800/60 pt-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 border border-white" />
            <span>Active Selection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-950 border border-sky-400" />
            <span>Earlier Observation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-950 border border-indigo-400" />
            <span>Later Observation</span>
          </div>
        </div>

        <span className="font-mono text-[10px] text-slate-400">
          Chronological Order (UTC)
        </span>
      </div>
    </div>
  );
}
