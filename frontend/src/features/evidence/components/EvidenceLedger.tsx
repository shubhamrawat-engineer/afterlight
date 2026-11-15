import { useState, useMemo } from 'react';
import {
  FileText,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
  Layers,
  Database,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type {
  EvidenceLedgerEntry,
  EvidenceLedgerCategory,
} from '../types/evidence.types';

interface EvidenceLedgerProps {
  entries: EvidenceLedgerEntry[];
  availableEpochIds?: string[];
  className?: string;
}

export function EvidenceLedger({
  entries,
  availableEpochIds = [],
  className,
}: EvidenceLedgerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedEpoch, setSelectedEpoch] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('asc');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        if (selectedCategory !== 'ALL' && entry.category !== selectedCategory) {
          return false;
        }
        if (selectedEpoch !== 'ALL' && !entry.associatedObsIds.includes(selectedEpoch)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestampUtc).getTime();
        const timeB = new Date(b.timestampUtc).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      });
  }, [entries, selectedCategory, selectedEpoch, sortOrder]);

  const categories: EvidenceLedgerCategory[] = [
    'CALIBRATION',
    'MORPHOLOGICAL',
    'PHOTOMETRIC',
    'ASTROMETRIC',
    'TEMPORAL',
    'SPECTRAL',
  ];

  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.9)] p-5 backdrop-blur-xl shadow-xl space-y-4 ${
        className ?? ''
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <FileText className="h-5 w-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Chronological Evidence Ledger
            </h3>
            <p className="text-[11px] text-slate-400">
              Auditable timestamped record of calibration, subtraction, and measurement events
            </p>
          </div>
        </div>
        <span className="rounded-full border border-indigo-500/30 bg-indigo-950/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-indigo-300">
          {filteredEntries.length} Records
        </span>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
            <Filter className="h-3 w-3 text-slate-400" />
            <select
              aria-label="Filter by Evidence Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Epoch Filter */}
          {availableEpochIds.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
              <Layers className="h-3 w-3 text-slate-400" />
              <select
                aria-label="Filter by Observation Epoch"
                value={selectedEpoch}
                onChange={(e) => setSelectedEpoch(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none"
              >
                <option value="ALL">All Observation Epochs</option>
                {availableEpochIds.map((id, idx) => (
                  <option key={id} value={id}>
                    Epoch {idx + 1} ({id.slice(-6)})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Sort Chronological Button */}
        <button
          type="button"
          onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <ArrowUpDown className="h-3 w-3 text-blue-400" />
          <span>{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
        </button>
      </div>

      {/* Ledger Table / List */}
      <div className="space-y-2">
        {filteredEntries.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500">
            No evidence ledger entries match the selected filters.
          </p>
        ) : (
          filteredEntries.map((entry) => {
            const isExpanded = expandedIds.has(entry.id);

            return (
              <div
                key={entry.id}
                className="rounded-xl border border-slate-800/80 bg-slate-950/60 transition-colors hover:border-slate-700/80"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpand(entry.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand(entry.id);
                    }
                  }}
                  className="flex flex-wrap items-center justify-between gap-3 p-3.5 cursor-pointer select-none"
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span>{entry.timestampUtc.replace('T', ' ').slice(0, 19)}</span>
                    </div>

                    {/* Category Badge */}
                    <span className="rounded border border-indigo-500/30 bg-indigo-950/50 px-2 py-0.5 text-[9px] font-bold text-indigo-300">
                      {entry.category}
                    </span>

                    {/* Evidence ID */}
                    <span className="font-mono text-[10px] text-slate-500">
                      #{entry.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Validation Pill */}
                    <span
                      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[9px] font-bold ${
                        entry.validationStatus === 'AVAILABLE'
                          ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                          : entry.validationStatus === 'AVAILABLE'
                            ? 'border-blue-500/40 bg-blue-950/60 text-blue-300'
                            : 'border-amber-500/40 bg-amber-950/60 text-amber-300'
                      }`}
                    >
                      {entry.validationStatus === 'AVAILABLE' ? (
                        <CheckCircle2 className="h-2.5 w-2.5" />
                      ) : entry.validationStatus === 'AVAILABLE' ? (
                        <Tag className="h-2.5 w-2.5" />
                      ) : (
                        <AlertTriangle className="h-2.5 w-2.5" />
                      )}
                      <span>{entry.validationStatus.replace('_', ' ')}</span>
                    </span>

                    {/* Expand icon */}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Entry summary banner */}
                <div className="px-3.5 pb-3">
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {entry.description}
                  </p>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 bg-slate-900/30 p-3.5 space-y-2 text-xs text-slate-400">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-500">
                          Source Engine:
                        </span>
                        <span className="font-mono text-slate-300">{entry.source}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-500">
                          Processing Stage:
                        </span>
                        <span className="font-mono text-slate-300">{entry.processingStage}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-500">
                          Associated Epochs:
                        </span>
                        <span className="font-mono text-slate-300">
                          {entry.associatedObsIds.join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-500">
                          Uncertainty Availability:
                        </span>
                        <span className="font-mono text-slate-300">
                          {entry.uncertaintyAvailability}
                        </span>
                      </div>
                    </div>

                    {entry.provenanceReference && (
                      <div className="pt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Database className="h-3 w-3 text-blue-400" />
                        <span>Provenance Citation:</span>
                        <span className="font-mono text-slate-300">
                          {entry.provenanceReference}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
