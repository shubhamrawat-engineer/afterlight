import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { ObjectFiltersState, ObjectCategory } from '../types/object.types';
import { Input } from '../../../components/ui/Input';
import { IconButton } from '../../../components/ui/IconButton';

interface ObjectSearchProps {
  filters: ObjectFiltersState;
  onFilterChange: (updated: Partial<ObjectFiltersState>) => void;
  className?: string;
}

const CATEGORY_TABS: Array<{ id: ObjectCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All Objects' },
  { id: 'transient_candidate', label: 'Transients' },
  { id: 'variable_star', label: 'Variable Stars' },
  { id: 'moving_object', label: 'Moving Bodies / KBO' },
  { id: 'calibration_standard', label: 'Calibrators' },
];

export function ObjectSearch({
  filters,
  onFilterChange,
  className,
}: ObjectSearchProps) {
  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Standardized Search Input */}
        <div className="flex-1">
          <Input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by object name, designation (e.g. SPHEREx J0404), ID, or sky region..."
            aria-label="Search celestial objects"
            leftIcon={<Search className="h-4 w-4" />}
            rightElement={
              filters.search ? (
                <IconButton
                  size="sm"
                  variant="ghost"
                  onClick={() => onFilterChange({ search: '' })}
                  aria-label="Clear search query"
                >
                  <X className="h-4 w-4" />
                </IconButton>
              ) : undefined
            }
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#8293AD]" />
          <select
            value={filters.sortBy}
            aria-label="Sort celestial objects by"
            onChange={(e) =>
              onFilterChange({
                sortBy: e.target.value as 'name_asc' | 'ra_asc' | 'obs_count_desc',
              })
            }
            className="h-11 rounded-xl border border-[#24344D] bg-[#080E1C] px-3.5 text-xs font-medium text-[#F4F7FF] transition-colors hover:border-[#324869] focus:border-[#4388FF] focus:outline-none cursor-pointer"
          >
            <option value="name_asc" className="bg-[#0A1020]">Name (A → Z)</option>
            <option value="ra_asc" className="bg-[#0A1020]">Right Ascension (RA Ascending)</option>
            <option value="obs_count_desc" className="bg-[#0A1020]">Observation Epoch Count</option>
          </select>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORY_TABS.map((tab) => {
          const isActive = filters.category === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange({ category: tab.id })}
              className={`inline-flex h-8.5 items-center rounded-full px-3.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'border border-[#4388FF]/60 bg-[#4388FF]/16 text-[#F4F7FF] shadow-[0_0_12px_rgba(67,136,255,0.2)]'
                  : 'border border-[#24344D] bg-[#101A2B] text-[#B5C2D6] hover:border-[#324869] hover:bg-[#131F33] hover:text-[#F4F7FF]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
