import { Layers, ShieldCheck } from 'lucide-react';
import type { ObservationRecord } from '../../observations/types/observation.types';
import type { PairGrade } from '../types/evidence.types';
import { PairQualityIndicator } from '../../observations/components/PairQualityIndicator';
import { getObsId, getObsDate, getObsProduct, getObsRelease } from '../../observations/services/observation-service';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';

interface ComparisonSummaryProps {
  earlierObs: ObservationRecord | null;
  laterObs: ObservationRecord | null;
  pairGrade: PairGrade | null;
  pairNotes?: string | null;
  qualityFlags?: string[];
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

const DEFAULT_DEMO_QUALITY_FLAGS = [
  'BAD_PIXEL_MASK',
  'COSMIC_RAY_REJECTION',
  'EDGE_VIGNETTE',
  'PRELIMINARY_DEMO_FIXTURE',
];

export function ComparisonSummary({
  earlierObs,
  laterObs,
  pairGrade,
  pairNotes,
  qualityFlags = DEFAULT_DEMO_QUALITY_FLAGS,
  className,
}: ComparisonSummaryProps) {
  const earlierWave = earlierObs?.wavelength_um ? `${earlierObs.wavelength_um} μm` : 'Not available';
  const laterWave = laterObs?.wavelength_um ? `${laterObs.wavelength_um} μm` : 'Not available';

  return (
    <div className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5 backdrop-blur-xl shadow-lg ${className ?? ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Selected Observation Pair Context &amp; Quality Flags
          </h3>
        </div>
        <DemonstrationDataBadge variant="compact" label="CALIBRATED PAIR" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* 1. Earlier Observation */}
        <div className="rounded-xl border border-sky-500/30 bg-sky-950/15 p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-sky-500/20 pb-2">
            <span className="rounded bg-sky-950 px-2 py-0.5 text-[10px] font-bold text-sky-300 uppercase tracking-wider border border-sky-500/30">
              Earlier (T0)
            </span>
            <span className="font-mono text-xs font-semibold text-slate-200">
              {earlierObs ? getObsId(earlierObs) : 'Unavailable'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>UTC Date:</span>
              <span className="font-mono text-slate-200">{formatUtc(earlierObs ? getObsDate(earlierObs) : null)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Wavelength:</span>
              <span className="font-mono font-bold text-sky-300">{earlierWave}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Product:</span>
              <span className="text-slate-200 truncate max-w-[140px]">{earlierObs ? getObsProduct(earlierObs) : 'N/A'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Data Release:</span>
              <span className="text-slate-200">{earlierObs ? getObsRelease(earlierObs) : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* 2. Later Observation */}
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/15 p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
            <span className="rounded bg-indigo-950 px-2 py-0.5 text-[10px] font-bold text-indigo-300 uppercase tracking-wider border border-indigo-500/30">
              Later (T1)
            </span>
            <span className="font-mono text-xs font-semibold text-slate-200">
              {laterObs ? getObsId(laterObs) : 'Unavailable'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>UTC Date:</span>
              <span className="font-mono text-slate-200">{formatUtc(laterObs ? getObsDate(laterObs) : null)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Wavelength:</span>
              <span className="font-mono font-bold text-indigo-300">{laterWave}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Product:</span>
              <span className="text-slate-200 truncate max-w-[140px]">{laterObs ? getObsProduct(laterObs) : 'N/A'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Data Release:</span>
              <span className="text-slate-200">{laterObs ? getObsRelease(laterObs) : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* 3. Comparison Quality & Quality Flags */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Preliminary Assessment</span>
            <PairQualityIndicator grade={pairGrade} />
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Preliminary Grade:</span>
              <span className="font-mono font-bold text-slate-100">{pairGrade ?? 'UNASSESSED'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Asset Status:</span>
              <span className="font-mono text-amber-300">Demonstration Fixture</span>
            </div>
            <div className="text-[11px] text-slate-400 leading-tight pt-1">
              {pairNotes ?? 'Demonstration evidence record for frontend workflow verification.'}
            </div>
          </div>

          {/* Quality Flags */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <ShieldCheck className="h-3 w-3 text-sky-400" />
              <span>Quality Flags</span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {qualityFlags.map((flag) => (
                <span
                  key={flag}
                  className="rounded border border-slate-700/80 bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-slate-300"
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
