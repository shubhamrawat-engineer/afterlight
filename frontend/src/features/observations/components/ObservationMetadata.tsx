import { ExternalLink, Radio, Sparkles, Calendar, Tag, Activity } from 'lucide-react';
import type { ObservationRecord } from '../types/observation.types';
import { getObsId, getObsDate, getObsProduct, getObsRelease, getObsRole } from '../services/observation-service';

interface ObservationMetadataProps {
  observation: ObservationRecord | null;
  className?: string;
}

function formatUtcTimestamp(iso: string | null): string {
  if (!iso) return 'Not available';
  try {
    const d = new Date(iso);
    return d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
  } catch {
    return iso;
  }
}

/**
 * Detailed scientific metadata table for a selected observation record.
 * Displays all specified fields from the Data Contract with strict null handling.
 */
export function ObservationMetadata({ observation, className }: ObservationMetadataProps) {
  if (!observation) {
    return (
      <div className={`rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-xs text-slate-400 ${className ?? ''}`}>
        No observation selected. Select an epoch on the timeline above to view metadata.
      </div>
    );
  }

  const id = getObsId(observation);
  const dateStr = getObsDate(observation);
  const product = getObsProduct(observation);
  const release = getObsRelease(observation);
  const role = getObsRole(observation);
  const detector = observation.detector ?? 'Not available';
  const wavelength = observation.wavelength_um !== null ? `${observation.wavelength_um} μm` : 'Not available';
  const wavelengthRange = observation.wavelength_range_um ?? 'Not available';
  const units = observation.units ?? 'Not available';
  const displayScaling = observation.display_scaling ?? 'Not available';
  const sourceUrl = observation.source_url ?? null;

  return (
    <div className={`rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md ${className ?? ''}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Observation Record Specs
          </h3>
        </div>
        <span className="font-mono text-xs text-blue-300 font-semibold">{id}</span>
      </div>

      {/* Grid of Fields */}
      <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Role */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Designated Role</span>
          <p className="mt-1 text-xs font-mono font-semibold text-slate-100 uppercase">
            {role}
          </p>
        </div>

        {/* Observation ID */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Observation ID</span>
          <p className="mt-1 text-xs font-mono text-slate-100 truncate" title={id}>
            {id}
          </p>
        </div>

        {/* Observation Time (UTC) */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-slate-400">
            <Calendar className="h-3 w-3 text-sky-400" />
            <span>Observation Time (UTC)</span>
          </div>
          <p className="mt-1 text-xs font-mono text-slate-100">
            {formatUtcTimestamp(dateStr)}
          </p>
        </div>

        {/* Product Type */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Data Product</span>
          <p className="mt-1 text-xs font-medium text-slate-100 truncate" title={product}>
            {product}
          </p>
        </div>

        {/* Data Release */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Archive Release</span>
          <p className="mt-1 text-xs font-medium text-slate-100">
            {release}
          </p>
        </div>

        {/* Central Wavelength */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-slate-400">
            <Sparkles className="h-3 w-3 text-sky-400" />
            <span>Central Wavelength (λ)</span>
          </div>
          <p className="mt-1 text-xs font-mono font-bold text-sky-300">
            {wavelength}
          </p>
        </div>

        {/* Wavelength Range */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Passband Range (Δλ)</span>
          <p className="mt-1 text-xs font-mono text-slate-100">
            {wavelengthRange}
          </p>
        </div>

        {/* Flux Units */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Calibrated Units</span>
          <p className="mt-1 text-xs font-mono text-slate-100">
            {units}
          </p>
        </div>

        {/* Detector Channel */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-slate-400">
            <Radio className="h-3 w-3 text-indigo-400" />
            <span>Detector / Channel</span>
          </div>
          <p className="mt-1 text-xs text-slate-100 truncate" title={detector}>
            {detector}
          </p>
        </div>

        {/* Display Scaling */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-slate-400">
            <Activity className="h-3 w-3 text-blue-400" />
            <span>Display Scaling</span>
          </div>
          <p className="mt-1 text-xs font-mono text-slate-100 uppercase">
            {displayScaling}
          </p>
        </div>

        {/* External Source Link */}
        <div className="sm:col-span-2 rounded-lg bg-slate-950/60 p-3 border border-slate-800/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Archive Provenance</span>
            <p className="text-xs text-slate-300">
              {sourceUrl ? 'Remote archive repository available' : 'Processed via AFTERLIGHT Level 2 ingestion'}
            </p>
          </div>
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded bg-blue-950/70 border border-blue-500/30 px-2.5 py-1 text-xs text-blue-300 hover:bg-blue-900/60"
            >
              <span>External Archive</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="text-xs text-slate-400 font-mono">Not available</span>
          )}
        </div>
      </div>
    </div>
  );
}
