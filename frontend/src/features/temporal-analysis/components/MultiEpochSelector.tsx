import { useMemo } from 'react';
import {
  CheckSquare,
  ArrowUpDown,
  Filter,
  RotateCcw,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';
import type { MultiEpochRecord } from '../types/multi-epoch.types';
import { getObsId } from '../../observations/services/observation-service';

interface MultiEpochSelectorProps {
  allEpochs: MultiEpochRecord[];
  selectedEpochIds: string[];
  onSelectAll: () => void;
  onClearToDefaultPair: () => void;
  sortOrder: 'asc' | 'desc';
  onToggleSortOrder: () => void;
  detectorFilter: string | 'all';
  onSetDetectorFilter: (detector: string | 'all') => void;
  className?: string;
}

export function MultiEpochSelector({
  allEpochs,
  selectedEpochIds,
  onSelectAll,
  onClearToDefaultPair,
  sortOrder,
  onToggleSortOrder,
  detectorFilter,
  onSetDetectorFilter,
  className,
}: MultiEpochSelectorProps) {
  const selectedSet = useMemo(() => new Set(selectedEpochIds), [selectedEpochIds]);

  // Unique detectors for filter dropdown
  const detectors = useMemo(() => {
    const set = new Set<string>();
    allEpochs.forEach((e) => {
      if (e.detector) set.add(e.detector);
    });
    return Array.from(set);
  }, [allEpochs]);

  // Warnings for selected epochs lacking calibration
  const warnings = useMemo(() => {
    return allEpochs
      .filter((e) => selectedSet.has(getObsId(e)) && e.completeness !== 'complete')
      .map((e) => `${getObsId(e)} has unverified calibration metadata.`);
  }, [allEpochs, selectedSet]);

  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-4.5 backdrop-blur-xl shadow-lg space-y-3.5 ${className ?? ''}`}
      aria-label="Multi-Epoch Observation Filter & Selection Panel"
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Multi-Epoch Selection Workspace
          </span>
          <span className="rounded-full bg-blue-950/80 border border-blue-500/30 px-2 py-0.2 text-[10px] font-mono font-bold text-blue-300">
            {selectedEpochIds.length} of {allEpochs.length} Epochs Selected
          </span>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onSelectAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-950/40 px-2.5 py-1 text-xs font-semibold text-blue-200 hover:bg-blue-600 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>Select All</span>
          </button>

          <button
            type="button"
            onClick={onClearToDefaultPair}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Pair</span>
          </button>

          {/* Chronological Sort Toggle */}
          <button
            type="button"
            onClick={onToggleSortOrder}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-sky-400" />
            <span>{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
          </button>

          {/* Detector Filter Dropdown */}
          {detectors.length > 1 && (
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={detectorFilter}
                onChange={(e) => onSetDetectorFilter(e.target.value)}
                aria-label="Filter epochs by detector array"
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <option value="all">All Arrays ({detectors.length})</option>
                {detectors.map((det) => (
                  <option key={det} value={det}>
                    {det}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Missing Metadata Warnings */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-2.5 text-xs text-amber-200 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="text-amber-300 font-semibold">Metadata Completeness Advisory: </strong>
            <span>{warnings.join(' ')} Quantitative error propagation requires multi-epoch pipeline execution.</span>
          </div>
        </div>
      )}
    </div>
  );
}
