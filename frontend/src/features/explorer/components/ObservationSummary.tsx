import { Calendar, Radio, Sparkles, Database } from 'lucide-react';
import type { ObservationMetadata } from '../types/explorer.types';

interface ObservationSummaryProps {
  observations: ObservationMetadata[];
  className?: string;
}

/** Format ISO timestamp into clean scientific date format */
function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
  } catch {
    return iso;
  }
}

/**
 * Observation Summary component detailing all available SPHEREx
 * observation passes, spectral bands, and calibrated data releases.
 */
export function ObservationSummary({ observations, className }: ObservationSummaryProps) {
  if (!observations || observations.length === 0) {
    return (
      <div className={`rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-xs text-slate-400 ${className ?? ''}`}>
        No observation records registered for this target region.
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Available Observations ({observations.length})
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          SPHEREx Level 2 Pipeline
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {observations.map((obs, idx) => (
          <div
            key={obs.id || idx}
            className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 transition-colors hover:border-slate-700"
          >
            {/* Header: ID, Date, Release */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/70 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-950/80 text-[10px] font-bold text-blue-400 border border-blue-500/20">
                  {idx + 1}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-200">
                  {obs.id}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-mono text-[11px]">{formatDate(obs.date)}</span>
              </div>
            </div>

            {/* Observation Specs */}
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Product Type</span>
                <p className="mt-0.5 text-xs text-slate-200 font-medium truncate">
                  {obs.product_type ?? '—'}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Data Release</span>
                <p className="mt-0.5 text-xs text-slate-200 font-medium">
                  {obs.data_release ?? '—'}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Wavelength (λ)</span>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-sky-400" />
                  <p className="text-xs font-mono font-medium text-sky-300">
                    {obs.wavelength_um !== null ? `${obs.wavelength_um} μm` : '—'}
                  </p>
                </div>
                {obs.wavelength_range_um && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({obs.wavelength_range_um})
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Units</span>
                <p className="mt-0.5 text-xs text-slate-200 font-mono">
                  {obs.units ?? '—'}
                </p>
              </div>
            </div>

            {/* Detector info if available */}
            {obs.detector && (
              <div className="mt-2.5 flex items-center gap-2 rounded bg-slate-900/60 px-2.5 py-1 text-[11px] text-slate-400 border border-slate-800/40">
                <Radio className="h-3 w-3 text-blue-400 shrink-0" />
                <span>Detector / Channel: <strong className="text-slate-300 font-medium">{obs.detector}</strong></span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
