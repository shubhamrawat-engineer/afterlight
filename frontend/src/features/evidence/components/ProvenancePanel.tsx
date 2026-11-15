import { Database, ExternalLink } from 'lucide-react';
import type { ScientificProvenance } from '../types/evidence.types';

interface ProvenancePanelProps {
  provenance: ScientificProvenance;
  className?: string;
}

export function ProvenancePanel({ provenance, className }: ProvenancePanelProps) {
  const {
    archive_source,
    mission,
    earlier_obs_id,
    later_obs_id,
    pipeline_version,
    subtraction_method,
    processing_date_utc,
    archive_citation,
    source_url,
    storage_asset_id,
  } = provenance;

  return (
    <div className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5 backdrop-blur-xl shadow-lg space-y-4 ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            PROVENANCE &amp; ARCHIVAL CITATION
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">IRSA Pipeline Provenance</span>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 text-xs">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Archive Source</span>
          <p className="font-mono text-slate-200">{archive_source}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Mission</span>
          <p className="font-mono text-slate-200">{mission}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pipeline Version</span>
          <p className="font-mono text-slate-200">{pipeline_version}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Subtraction Method</span>
          <p className="font-mono text-slate-200">{subtraction_method}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Observation Epoch Records</span>
          <p className="font-mono text-[11px] text-slate-300">
            T0: {earlier_obs_id} <br />
            T1: {later_obs_id}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Processing Timestamp</span>
          <p className="font-mono text-slate-200">{processing_date_utc}</p>
        </div>
      </div>

      {/* Citation and Source Link */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400">Official Citation:</span>
          <p className="text-slate-300 font-mono text-[11px]">{archive_citation}</p>
          {storage_asset_id && (
            <p className="text-slate-400 font-mono text-[10px]">Asset Hash: {storage_asset_id}</p>
          )}
        </div>

        {source_url && (
          <a
            href={source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:bg-slate-700 hover:text-blue-300 transition-colors"
          >
            <span>IRSA Archive</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
