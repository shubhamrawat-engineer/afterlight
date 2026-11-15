import { SearchX, RotateCcw } from 'lucide-react';

interface ObjectEmptyStateProps {
  query?: string;
  onReset?: () => void;
}

export function ObjectEmptyState({ query, onReset }: ObjectEmptyStateProps) {
  return (
    <div
      className="rounded-xl border p-12 text-center flex flex-col items-center justify-center my-8"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border-primary)',
      }}
    >
      <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4 text-slate-400">
        <SearchX className="w-6 h-6" />
      </div>

      <h3 className="text-base font-semibold text-white">
        No Celestial Objects Located
      </h3>

      <p className="text-xs text-slate-400 max-w-md mt-1.5 leading-relaxed">
        {query
          ? `No catalogued objects matching "${query}" were found under the current classification filter.`
          : 'No objects match the current classification criteria. Try broadening your filter parameters.'}
      </p>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-sm cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
}
