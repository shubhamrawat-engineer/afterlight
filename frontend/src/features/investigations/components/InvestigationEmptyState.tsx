import { FolderKanban, FilePlus2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InvestigationEmptyStateProps {
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export function InvestigationEmptyState({
  isFiltered,
  onClearFilters,
}: InvestigationEmptyStateProps) {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center backdrop-blur-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
        <FolderKanban className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-200">
        {isFiltered ? 'No Matching Investigations' : 'No Investigations in Archive'}
      </h3>

      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-400">
        {isFiltered
          ? 'No saved case files matched your active search query or status filter. Try clearing your filters.'
          : 'You have not created any astronomical investigations yet. Create a case from the Evidence panel or begin a new investigation.'}
      </p>

      {isFiltered ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <span>Reset Search &amp; Filters</span>
        </button>
      ) : (
        <Link
          to="/investigations/new"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          <span>Create First Investigation</span>
        </Link>
      )}
    </div>
  );
}
