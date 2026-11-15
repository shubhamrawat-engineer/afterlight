import { Compass, RotateCcw } from 'lucide-react';

interface ExplorerEmptyStateProps {
  hasFilters: boolean;
  onReset?: () => void;
}

/**
 * Empty state displayed when search queries or filters yield zero target matches.
 */
export function ExplorerEmptyState({ hasFilters, onReset }: ExplorerEmptyStateProps) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center backdrop-blur-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
        <Compass className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-200">
        No Matching Celestial Targets
      </h3>

      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-400">
        {hasFilters
          ? 'No targets match your current search terms and category filters. Try broadening your query or clearing filters.'
          : 'No supported target regions were returned from the astronomical catalog.'}
      </p>

      {hasFilters && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Clear All Filters</span>
        </button>
      )}
    </div>
  );
}
