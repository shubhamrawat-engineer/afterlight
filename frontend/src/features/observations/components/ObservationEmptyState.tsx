import { Database, RotateCcw } from 'lucide-react';

interface ObservationEmptyStateProps {
  hasFilters: boolean;
  onReset?: () => void;
}

/**
 * Empty state displayed when no observations exist or active filters yield zero results.
 */
export function ObservationEmptyState({ hasFilters, onReset }: ObservationEmptyStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center backdrop-blur-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
        <Database className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-200">
        No Observations Found
      </h3>

      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-400">
        {hasFilters
          ? 'No observation records match your current search and role filters. Try adjusting your filter terms.'
          : 'No calibrated observation records have been registered for this astronomical region in the SPHEREx pipeline.'}
      </p>

      {hasFilters && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
}
