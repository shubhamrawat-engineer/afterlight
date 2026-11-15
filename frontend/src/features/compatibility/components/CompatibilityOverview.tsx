import {
  Calendar,
  Sparkles,
  ArrowLeftRight,
  Cpu,
  Layers,
  Clock,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import type { CompatibilityDossier } from '../types/compatibility.types';
import type { ObservationRecord } from '../../observations/types/observation.types';
import { CompatibilityStatusBadge } from './CompatibilityStatusBadge';
import { getObsId, getObsDate, getObsProduct } from '../../observations/services/observation-service';

interface CompatibilityOverviewProps {
  dossier: CompatibilityDossier;
  observations: ObservationRecord[];
  onSetEarlier: (id: string) => void;
  onSetLater: (id: string) => void;
  onSwapPair: () => void;
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

export function CompatibilityOverview({
  dossier,
  observations,
  onSetEarlier,
  onSetLater,
  onSwapPair,
  className,
}: CompatibilityOverviewProps) {
  const earlierObs = dossier.earlierObs;
  const laterObs = dossier.laterObs;
  const earlierId = dossier.earlierId ?? '';
  const laterId = dossier.laterId ?? '';

  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-6 backdrop-blur-xl shadow-lg space-y-6 ${className ?? ''}`}
    >
      {/* Header & Overall Status Banner */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Section 1 — Pair Metadata &amp; Overall Scientific State
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Scientific Compatibility Assessment
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {dossier.overallSummary}
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Overall Assessment State
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <CompatibilityStatusBadge status={dossier.overallStatus} size="lg" />
            {dossier.isFallback && (
              <span className="rounded border border-amber-500/40 bg-amber-950/60 px-2 py-1 text-[10px] font-mono font-bold text-amber-300">
                COMPATIBILITY EVALUATION
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chronological Inversion Warning */}
      {dossier.isChronologicallyInverted && earlierObs && laterObs && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-amber-300 font-semibold">Chronological Order Inverted: </strong>
            <span>
              Designated Earlier epoch ({formatDate(getObsDate(earlierObs))}) is chronologically later than the Later epoch ({formatDate(getObsDate(laterObs))}). In time-series difference imaging, (T1 − T0) will compute negative temporal evolution. Use the &ldquo;Switch Earlier / Later Roles&rdquo; button to restore forward chronological progression.
            </span>
          </div>
        </div>
      )}

      {/* Disclaimers: No numerical substitute for scientific reasoning */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
        <HelpCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-blue-300">Scientific Methodology Notice: </strong>
          AFTERLIGHT does not condense observational suitability into an arbitrary numerical score (e.g. &ldquo;85% compatibility&rdquo;). Compatibility is strictly task-dependent: two observations may be suitable for morphological inspection yet completely invalid for calibrated image subtraction or proper-motion astrometry.
        </div>
      </div>

      {/* Pair Designation Grid with Selectors & Switcher */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Designated Multi-Epoch Pair
          </span>

          {observations.length >= 2 && (
            <button
              type="button"
              onClick={onSwapPair}
              aria-label="Switch Earlier and Later observation roles"
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-950/40 px-3 py-1.5 text-xs font-semibold text-blue-200 transition-colors hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span>Switch Earlier / Later Roles</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Earlier (T0) Card */}
          <div className="rounded-xl border border-sky-500/35 bg-sky-950/20 p-4.5 space-y-3">
            <div className="flex items-center justify-between border-b border-sky-500/20 pb-2.5">
              <span className="rounded bg-sky-950 px-2 py-0.5 text-[10px] font-bold text-sky-300 tracking-wider uppercase border border-sky-500/30">
                EARLIER OBSERVATION (T0)
              </span>
              <span className="font-mono text-xs font-bold text-slate-200">{earlierId}</span>
            </div>

            {earlierObs ? (
              <div className="space-y-2.5 text-xs">
                {observations.length >= 2 && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">Change T0:</span>
                    <select
                      value={earlierId}
                      onChange={(e) => onSetEarlier(e.target.value)}
                      aria-label="Select Earlier observation epoch"
                      className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                      {observations.map((o) => {
                        const id = getObsId(o);
                        return (
                          <option key={id} value={id} disabled={id === laterId}>
                            {id} • {o.detector ?? 'LVF'} ({o.wavelength_um ?? '—'} μm) • {formatDate(getObsDate(o))}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Epoch Date</span>
                    <div className="mt-0.5 flex items-center gap-1 font-mono text-slate-200">
                      <Calendar className="h-3 w-3 text-sky-400" />
                      <span>{formatDate(getObsDate(earlierObs))}</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Central Wavelength</span>
                    <div className="mt-0.5 flex items-center gap-1 font-mono text-sky-300 font-bold">
                      <Sparkles className="h-3 w-3" />
                      <span>{earlierObs.wavelength_um !== null ? `${earlierObs.wavelength_um} μm` : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-1 text-[11px] text-slate-400">
                  <p className="flex justify-between">
                    <span>Instrument Detector:</span>
                    <span className="font-mono text-slate-300">{earlierObs.detector ?? 'Not specified'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Calibrated Units:</span>
                    <span className="font-mono text-slate-300">{earlierObs.units ?? 'Not specified'}</span>
                  </p>
                  <p className="flex justify-between truncate">
                    <span>Product:</span>
                    <span className="text-slate-300 truncate max-w-[180px]">{getObsProduct(earlierObs)}</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No earlier epoch designated.</p>
            )}
          </div>

          {/* Later (T1) Card */}
          <div className="rounded-xl border border-indigo-500/35 bg-indigo-950/20 p-4.5 space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
              <span className="rounded bg-indigo-950 px-2 py-0.5 text-[10px] font-bold text-indigo-300 tracking-wider uppercase border border-indigo-500/30">
                LATER OBSERVATION (T1)
              </span>
              <span className="font-mono text-xs font-bold text-slate-200">{laterId}</span>
            </div>

            {laterObs ? (
              <div className="space-y-2.5 text-xs">
                {observations.length >= 2 && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">Change T1:</span>
                    <select
                      value={laterId}
                      onChange={(e) => onSetLater(e.target.value)}
                      aria-label="Select Later observation epoch"
                      className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                      {observations.map((o) => {
                        const id = getObsId(o);
                        return (
                          <option key={id} value={id} disabled={id === earlierId}>
                            {id} • {o.detector ?? 'LVF'} ({o.wavelength_um ?? '—'} μm) • {formatDate(getObsDate(o))}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Epoch Date</span>
                    <div className="mt-0.5 flex items-center gap-1 font-mono text-slate-200">
                      <Calendar className="h-3 w-3 text-indigo-400" />
                      <span>{formatDate(getObsDate(laterObs))}</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Central Wavelength</span>
                    <div className="mt-0.5 flex items-center gap-1 font-mono text-indigo-300 font-bold">
                      <Sparkles className="h-3 w-3" />
                      <span>{laterObs.wavelength_um !== null ? `${laterObs.wavelength_um} μm` : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-1 text-[11px] text-slate-400">
                  <p className="flex justify-between">
                    <span>Instrument Detector:</span>
                    <span className="font-mono text-slate-300">{laterObs.detector ?? 'Not specified'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Calibrated Units:</span>
                    <span className="font-mono text-slate-300">{laterObs.units ?? 'Not specified'}</span>
                  </p>
                  <p className="flex justify-between truncate">
                    <span>Product:</span>
                    <span className="text-slate-300 truncate max-w-[180px]">{getObsProduct(laterObs)}</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No later epoch designated.</p>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row: Temporal Baseline, Wavelength Discrepancy, Overlap & Detector */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Temporal Baseline
          </span>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-sm font-bold text-slate-100">
            <Clock className="h-3.5 w-3.5 text-sky-400" />
            <span>{dossier.temporalBaselineDays !== null ? `${dossier.temporalBaselineDays} days` : 'N/A'}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Passband Delta (Δλ)
          </span>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-sm font-bold text-slate-100">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span>{dossier.wavelengthDeltaUm !== null ? `${dossier.wavelengthDeltaUm} μm` : 'N/A'}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Relative Discrepancy
          </span>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-sm font-bold text-slate-100">
            <Layers className="h-3.5 w-3.5 text-sky-400" />
            <span>{dossier.wavelengthDeltaPct !== null ? `${dossier.wavelengthDeltaPct}%` : 'N/A'}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Estimated Overlap
          </span>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-sm font-bold text-slate-100">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>{dossier.passbandOverlapPct !== null ? `~${dossier.passbandOverlapPct}%` : 'N/A'}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Detector Array Match
          </span>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-sm font-bold text-slate-100">
            <Cpu className="h-3.5 w-3.5 text-sky-400" />
            <span>
              {earlierObs?.detector && laterObs?.detector && earlierObs.detector === laterObs.detector
                ? 'Identical Array'
                : 'Different Channels'}
            </span>
          </div>
        </div>
      </div>

      {/* Missing Metadata & Outstanding Validation Dual-Panel */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-2 border-t border-slate-800/80">
        <div className="rounded-xl border border-amber-500/25 bg-slate-950/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <AlertCircle className="h-4 w-4" />
            <span>Missing Metadata Parameters ({dossier.missingMetadataSummary.length})</span>
          </div>
          <ul className="list-disc ml-5 space-y-1 text-xs text-slate-300">
            {dossier.missingMetadataSummary.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-blue-500/25 bg-slate-950/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-300 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>Outstanding Validation Requirements ({dossier.outstandingValidationSummary.length})</span>
          </div>
          <ul className="list-disc ml-5 space-y-1 text-xs text-slate-300">
            {dossier.outstandingValidationSummary.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
