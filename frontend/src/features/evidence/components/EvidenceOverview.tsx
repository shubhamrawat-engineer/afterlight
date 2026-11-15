import { Database, Calendar, Layers, ShieldCheck, AlertCircle } from 'lucide-react';
import type { EvidenceOverviewData, ScientificEvidenceStatus } from '../types/evidence.types';

interface EvidenceOverviewProps {
  overview: EvidenceOverviewData;
  className?: string;
}

function getStatusBadge(status: ScientificEvidenceStatus) {
  switch (status) {
    case 'AVAILABLE':
      return 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300';
    case 'PENDING VALIDATION':
      return 'border-amber-500/40 bg-amber-950/60 text-amber-300';
    case 'INCOMPLETE':
      return 'border-rose-500/40 bg-rose-950/60 text-rose-300';
    case 'DEMONSTRATION ONLY':
    case 'CALIBRATED':
      return 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300';
    case 'NOT AVAILABLE':
    default:
      return 'border-slate-700 bg-slate-900 text-slate-400';
  }
}

export function EvidenceOverview({ overview, className }: EvidenceOverviewProps) {
  const statusClass = getStatusBadge(overview.evidenceStatus);

  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.9)] p-5 backdrop-blur-xl shadow-xl space-y-4 ${
        className ?? ''
      }`}
    >
      {/* Top Banner: Investigation ID and Overall Evidence Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Database className="h-5 w-5 text-blue-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Investigation ID:
              </span>
              <span className="font-mono text-xs font-extrabold text-blue-300">
                {overview.investigationId}
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-100">
              {overview.targetTitle} — Evidence Overview
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${statusClass}`}
          >
            {overview.evidenceStatus}
          </span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-950/50 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-300">
            SPHEREx DR1 ARCHIVE
          </span>
        </div>
      </div>

      {/* Grid of Key Scientific Metadata */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
        {/* Sky Region */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Layers className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Target / Sky Region</span>
          </div>
          <p className="font-mono text-[11px] text-slate-200 line-clamp-2">
            {overview.skyRegion}
          </p>
        </div>

        {/* Temporal Baseline */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Temporal Baseline</span>
          </div>
          <p className="font-mono text-[11px] text-slate-200">
            {overview.temporalBaseline}
          </p>
        </div>

        {/* Observation Epochs */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Observation Epochs</span>
          </div>
          <div className="flex flex-wrap gap-1 pt-0.5">
            {overview.associatedEpochIds.map((epochId, idx) => (
              <span
                key={epochId}
                className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-slate-300"
              >
                E{idx + 1}: {epochId.slice(-6)}
              </span>
            ))}
          </div>
        </div>

        {/* Scientific Validation Status */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Validation Status</span>
          </div>
          <p className="text-[10px] leading-tight text-amber-300/90">
            {overview.scientificValidationStatus}
          </p>
        </div>
      </div>
    </div>
  );
}
