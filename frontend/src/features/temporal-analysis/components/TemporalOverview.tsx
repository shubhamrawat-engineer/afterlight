import { Calendar, Clock } from 'lucide-react';
import type { MultiEpochRecord } from '../types/multi-epoch.types';
import { getObsId, getObsDate } from '../../observations/services/observation-service';
import { calculateMultiEpochBaseline } from '../services/multi-epoch-service';

interface TemporalOverviewProps {
  selectedEpochs: MultiEpochRecord[];
  onSelectActiveEpoch?: (id: string) => void;
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

export function TemporalOverview({
  selectedEpochs,
  onSelectActiveEpoch,
  className,
}: TemporalOverviewProps) {
  const { totalBaselineDays, earliestDate, latestDate, cadenceDescription } =
    calculateMultiEpochBaseline(selectedEpochs);

  if (selectedEpochs.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center text-xs text-slate-400">
        No observation epochs selected to construct a temporal overview.
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5.5 backdrop-blur-xl shadow-lg space-y-4 ${className ?? ''}`}
      aria-label="Multi-Epoch Temporal Overview & Baseline Breakdown"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Cadence &amp; Temporal Baseline Breakdown
          </span>
          <h3 className="text-base font-bold text-slate-100">
            Chronological Epoch Sequence
          </h3>
        </div>

        <span className="rounded bg-blue-950/60 border border-blue-500/30 px-2.5 py-1 text-xs font-mono font-bold text-blue-300">
          {cadenceDescription}
        </span>
      </div>

      {/* Cadence Summary Metrics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Earliest Epoch (T₀)</span>
          <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-100">
            <Calendar className="h-4 w-4 text-sky-400" />
            <span>{formatDate(earliestDate)}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono truncate block">
            {getObsId(selectedEpochs[0])}
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Latest Epoch (T_N)</span>
          <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-100">
            <Calendar className="h-4 w-4 text-indigo-400" />
            <span>{formatDate(latestDate)}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono truncate block">
            {getObsId(selectedEpochs[selectedEpochs.length - 1])}
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Temporal Span</span>
          <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-emerald-300">
            <Clock className="h-4 w-4 text-emerald-400" />
            <span>{totalBaselineDays !== null ? `${totalBaselineDays} days` : '0 days'}</span>
          </div>
          <span className="text-[10px] text-slate-400">Across {selectedEpochs.length} distinct survey passes</span>
        </div>
      </div>

      {/* Chronological Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
        <table className="w-full text-left text-xs" aria-label="Chronological Observation Table">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-2.5 px-3">Epoch</th>
              <th className="py-2.5 px-3">Observation ID</th>
              <th className="py-2.5 px-3">UTC Timestamp</th>
              <th className="py-2.5 px-3">Wavelength</th>
              <th className="py-2.5 px-3">Detector Array</th>
              <th className="py-2.5 px-3">Interval (Δt)</th>
              <th className="py-2.5 px-3">Cumulative</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {selectedEpochs.map((epoch, idx) => {
              const id = getObsId(epoch);
              const date = getObsDate(epoch);

              return (
                <tr key={id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="rounded bg-blue-950 border border-blue-500/30 px-1.5 py-0.5 text-[10px] font-bold text-blue-300">
                      {epoch.epochLabel}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-200">{id}</td>
                  <td className="py-2.5 px-3 text-slate-300">{formatDate(date)}</td>
                  <td className="py-2.5 px-3 text-sky-300">
                    {epoch.wavelength_um !== null ? `${epoch.wavelength_um} μm` : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{epoch.detector ?? 'Array'}</td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {idx === 0 ? (
                      <span className="text-slate-500">—</span>
                    ) : (
                      <span className="text-amber-300 font-bold">+{epoch.daysFromPrevious} days</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {idx === 0 ? (
                      <span className="text-emerald-400 font-bold">Reference (0d)</span>
                    ) : (
                      <span>+{epoch.daysFromFirst} days</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {onSelectActiveEpoch && (
                      <button
                        type="button"
                        onClick={() => onSelectActiveEpoch(id)}
                        className="font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        Inspect →
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
