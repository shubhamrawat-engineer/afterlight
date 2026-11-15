import { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';
import type { ObservationRecord } from '../types/temporal-analysis.types';
import { getObsId, getObsDate, getObsProduct, getObsRelease } from '../../observations/services/observation-service';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';

interface ObservationMetadataPanelProps {
  earlierObs: ObservationRecord | null;
  laterObs: ObservationRecord | null;
  className?: string;
}

function formatUtc(iso: string | null): string {
  if (!iso) return 'Not available';
  try {
    const d = new Date(iso);
    return d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
  } catch {
    return iso;
  }
}

/**
 * Collapsible dual-column metadata inspection panel detailing technical instrument
 * specifications for both Earlier (T0) and Later (T1) observation epochs.
 */
export function ObservationMetadataPanel({
  earlierObs,
  laterObs,
  className,
}: ObservationMetadataPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md overflow-hidden ${className ?? ''}`}>
      {/* Header Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle observation epoch metadata panel"
        className="flex w-full items-center justify-between p-4.5 text-left transition-colors hover:bg-slate-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Layers className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Observation Epoch Technical Metadata (T0 vs. T1)
          </h3>
          <DemonstrationDataBadge variant="compact" label="SPHEREx METADATA" />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isOpen ? 'Collapse' : 'Expand'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="border-t border-slate-800/80 p-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* EARLIER OBSERVATION (T0) */}
            <div className="rounded-xl border border-sky-500/30 bg-sky-950/15 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-sky-500/20 pb-2">
                <span className="rounded bg-sky-950 px-2 py-0.5 text-[10px] font-bold text-sky-300 uppercase tracking-wider border border-sky-500/30">
                  EARLIER (T0)
                </span>
                <span className="font-mono text-xs font-semibold text-slate-200">
                  {earlierObs ? getObsId(earlierObs) : 'Not available'}
                </span>
              </div>

              {earlierObs ? (
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">UTC Date:</span>
                    <span className="font-mono text-slate-200">{formatUtc(getObsDate(earlierObs))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Central Wavelength (λ):</span>
                    <span className="font-mono font-bold text-sky-300">
                      {earlierObs.wavelength_um !== null ? `${earlierObs.wavelength_um} μm` : 'Not available'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Passband Range:</span>
                    <span className="font-mono text-slate-200">{earlierObs.wavelength_range_um ?? 'Not available'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Product Type:</span>
                    <span className="text-slate-200 truncate max-w-[180px]">{getObsProduct(earlierObs)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Data Release:</span>
                    <span className="text-slate-200">{getObsRelease(earlierObs)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Calibrated Units:</span>
                    <span className="font-mono text-slate-200">{earlierObs.units ?? 'Not available'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Detector Channel:</span>
                    <span className="text-slate-200 truncate max-w-[180px]">{earlierObs.detector ?? 'Not available'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Asset Type:</span>
                    <span className="font-mono text-emerald-300">SPHEREx Calibrated Cutout</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Earlier observation record unavailable.</p>
              )}
            </div>

            {/* LATER OBSERVATION (T1) */}
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/15 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                <span className="rounded bg-indigo-950 px-2 py-0.5 text-[10px] font-bold text-indigo-300 uppercase tracking-wider border border-indigo-500/30">
                  LATER (T1)
                </span>
                <span className="font-mono text-xs font-semibold text-slate-200">
                  {laterObs ? getObsId(laterObs) : 'Not available'}
                </span>
              </div>

              {laterObs ? (
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">UTC Date:</span>
                    <span className="font-mono text-slate-200">{formatUtc(getObsDate(laterObs))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Central Wavelength (λ):</span>
                    <span className="font-mono font-bold text-indigo-300">
                      {laterObs.wavelength_um !== null ? `${laterObs.wavelength_um} μm` : 'Not available'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Passband Range:</span>
                    <span className="font-mono text-slate-200">{laterObs.wavelength_range_um ?? 'Not available'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Product Type:</span>
                    <span className="text-slate-200 truncate max-w-[180px]">{getObsProduct(laterObs)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Data Release:</span>
                    <span className="text-slate-200">{getObsRelease(laterObs)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Calibrated Units:</span>
                    <span className="font-mono text-slate-200">{laterObs.units ?? 'Not available'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Detector Channel:</span>
                    <span className="text-slate-200 truncate max-w-[180px]">{laterObs.detector ?? 'Not available'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Asset Type:</span>
                    <span className="font-mono text-emerald-300">SPHEREx Calibrated Cutout</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Later observation record unavailable.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
