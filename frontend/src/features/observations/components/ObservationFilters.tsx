import { Search, ArrowUpDown, Filter, X } from 'lucide-react';
import type { ObservationSortOrder } from '../types/observation.types';

interface ObservationFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortOrder: ObservationSortOrder;
  onSortChange: (sort: ObservationSortOrder) => void;
  roleFilter: 'all' | 'earlier' | 'later';
  onRoleFilterChange: (role: 'all' | 'earlier' | 'later') => void;
  totalCount: number;
  filteredCount: number;
  className?: string;
}

/**
 * Filter and sorting toolbar for astronomical observation catalogs.
 */
export function ObservationFilters({
  searchQuery,
  onSearchChange,
  sortOrder,
  onSortChange,
  roleFilter,
  onRoleFilterChange,
  totalCount,
  filteredCount,
  className,
}: ObservationFiltersProps) {
  return (
    <div className={`flex flex-col gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between ${className ?? ''}`}>
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by observation ID, detector, product..."
          aria-label="Filter observations"
          className="w-full rounded-lg border border-slate-700/80 bg-slate-950/70 py-1.5 pr-8 pl-9 text-xs text-slate-100 placeholder-slate-400 backdrop-blur-md transition-colors focus:border-blue-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear filter search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Controls: Role & Sorting */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Role Filter */}
        <div className="flex items-center gap-1 text-xs">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value as 'all' | 'earlier' | 'later')}
            aria-label="Filter by designated role"
            className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:border-blue-400 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="earlier">Earlier Only</option>
            <option value="later">Later Only</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="flex items-center gap-1 text-xs">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as ObservationSortOrder)}
            aria-label="Sort observations"
            className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:border-blue-400 focus:outline-none"
          >
            <option value="chronological_asc">Earliest First</option>
            <option value="chronological_desc">Latest First</option>
            <option value="wavelength_asc">Wavelength (λ)</option>
          </select>
        </div>

        {/* Count */}
        <span className="text-[11px] font-mono text-slate-400 border-l border-slate-800 pl-3">
          {filteredCount} / {totalCount}
        </span>
      </div>
    </div>
  );
}
