import { Calendar, Clock, Layers, ShieldCheck } from 'lucide-react';
import type { CatalogueSummaryMetrics } from '../types/observation.types';
import { PairQualityIndicator } from './PairQualityIndicator';

interface ObservationSummaryProps {
  metrics: CatalogueSummaryMetrics | null;
  className?: string;
}

function formatSummaryDate(iso: string | null): string {
  if (!iso) return 'Not available';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }) + ' UTC';
  } catch {
    return iso;
  }
}

/**
 * High-level summary metrics cards for the Observation Catalogue.
 * Displays total epochs, earliest & latest timestamps, time baseline, and compatibility.
 */
export function ObservationSummary({ metrics, className }: ObservationSummaryProps) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 ${className ?? ''}`}>
      {/* 1. Total Observations */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <Layers className="h-3.5 w-3.5 text-blue-400" />
          <span>Total Epochs</span>
        </div>
        <p className="mt-2 text-xl font-bold font-mono text-slate-100">
          {metrics ? metrics.totalObservations : '—'}
        </p>
        <span className="text-[10px] text-slate-400">SPHEREx Mosaics</span>
      </div>

      {/* 2. Earliest Date */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <Calendar className="h-3.5 w-3.5 text-sky-400" />
          <span>Earliest Epoch</span>
        </div>
        <p className="mt-2 text-sm font-semibold font-mono text-slate-100 truncate">
          {formatSummaryDate(metrics?.earliestDate ?? null)}
        </p>
        <span className="text-[10px] text-slate-400">Initial Survey Pass</span>
      </div>

      {/* 3. Latest Date */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <Calendar className="h-3.5 w-3.5 text-indigo-400" />
          <span>Latest Epoch</span>
        </div>
        <p className="mt-2 text-sm font-semibold font-mono text-slate-100 truncate">
          {formatSummaryDate(metrics?.latestDate ?? null)}
        </p>
        <span className="text-[10px] text-slate-400">Subsequent Survey Pass</span>
      </div>

      {/* 4. Time Baseline */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <Clock className="h-3.5 w-3.5 text-amber-400" />
          <span>Time Baseline (Δt)</span>
        </div>
        <p className="mt-2 text-xl font-bold font-mono text-slate-100">
          {metrics?.timeBaselineDays !== null && metrics?.timeBaselineDays !== undefined
            ? `${metrics.timeBaselineDays} days`
            : 'Not available'}
        </p>
        <span className="text-[10px] text-slate-400">Temporal Coverage</span>
      </div>

      {/* 5. Pair Compatibility */}
      <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md flex flex-col justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Wavelength Proximity</span>
        </div>
        <div className="mt-2">
          <PairQualityIndicator grade={metrics?.pairGrade} />
        </div>
        <span className="text-[10px] text-slate-400">Preliminary Passband Check</span>
      </div>
    </div>
  );
}
