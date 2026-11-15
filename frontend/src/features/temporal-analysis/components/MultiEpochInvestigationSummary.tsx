import { useState } from 'react';
import {
  FileText,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Bookmark,
  Layers,
} from 'lucide-react';
import type { MultiEpochRecord, CandidateChangeRecord } from '../types/multi-epoch.types';
import { calculateMultiEpochBaseline } from '../services/multi-epoch-service';
import { getObsId } from '../../observations/services/observation-service';

interface MultiEpochInvestigationSummaryProps {
  targetId: string;
  targetTitle: string;
  selectedEpochs: MultiEpochRecord[];
  allAvailableCount: number;
  candidateRecords: CandidateChangeRecord[];
  onSaveToSession: () => void;
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

export function MultiEpochInvestigationSummary({
  targetId,
  targetTitle,
  selectedEpochs,
  allAvailableCount,
  candidateRecords,
  onSaveToSession,
  className,
}: MultiEpochInvestigationSummaryProps) {
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  const { totalBaselineDays, earliestDate, latestDate } =
    calculateMultiEpochBaseline(selectedEpochs);

  const completeCount = selectedEpochs.filter((e) => e.completeness === 'complete').length;
  const partialCount = selectedEpochs.filter((e) => e.completeness === 'partial').length;

  const handleSave = () => {
    onSaveToSession();
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2500);
  };

  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5.5 backdrop-blur-xl shadow-lg space-y-4 ${className ?? ''}`}
      aria-label="Multi-Epoch Scientific Investigation Summary"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Investigation Progress &amp; State
          </span>
          <h3 className="text-base font-bold text-slate-100">
            Multi-Epoch Analysis Dossier
          </h3>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-950/40 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-600 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          {isSavedFeedback ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Dossier Saved!</span>
            </>
          ) : (
            <>
              <Bookmark className="h-3.5 w-3.5" />
              <span>Save to Investigation</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs font-mono">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">
            Target / Region
          </span>
          <span className="text-slate-100 font-bold block truncate" title={targetTitle}>
            {targetTitle}
          </span>
          <span className="text-[10px] text-slate-400 truncate block">{targetId}</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">
            Epoch Coverage
          </span>
          <div className="flex items-center gap-1.5 text-slate-100 font-bold">
            <Layers className="h-3.5 w-3.5 text-sky-400" />
            <span>{selectedEpochs.length} / {allAvailableCount} Epochs</span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans block">
            {completeCount} complete, {partialCount} partial
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">
            Temporal Span
          </span>
          <div className="flex items-center gap-1.5 text-slate-100 font-bold">
            <Clock className="h-3.5 w-3.5 text-sky-400" />
            <span>{totalBaselineDays !== null ? `${totalBaselineDays} days` : '0 days'}</span>
          </div>
          <span className="text-[10px] text-slate-400 truncate block">
            {formatDate(earliestDate)} → {formatDate(latestDate)}
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">
            Candidate Hypotheses
          </span>
          <div className="flex items-center gap-1.5 text-slate-100 font-bold">
            <FileText className="h-3.5 w-3.5 text-amber-400" />
            <span>{candidateRecords.length} Logged</span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans block">
            {candidateRecords.filter((c) => c.status === 'resolved').length} resolved
          </span>
        </div>
      </div>

      {/* Selected Observation IDs */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 space-y-1.5 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Selected Epoch IDs in Active Workspace
        </span>
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          {selectedEpochs.map((ep) => (
            <span
              key={getObsId(ep)}
              className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-slate-300"
            >
              {ep.epochLabel}: <strong className="text-white">{getObsId(ep)}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Scientific Limitations Reminder */}
      <div className="rounded-xl border border-amber-500/25 bg-amber-950/15 p-3 text-xs text-amber-200/90 flex items-start gap-2">
        <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <span className="text-[11px] leading-relaxed">
          <strong>Multi-Epoch Validation Notice: </strong>
          Multi-epoch light curves, centroid motion vectors, and difference image subtractions require sub-pixel WCS registration, PSF convolution matching, and zero-point cross-calibration before astrophysical findings can be published.
        </span>
      </div>
    </div>
  );
}
