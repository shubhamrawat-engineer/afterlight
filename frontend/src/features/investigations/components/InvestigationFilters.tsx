import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import type { InvestigationFiltersState, InvestigationStatus } from '../types/investigation.types';

interface InvestigationFiltersProps {
  filters: InvestigationFiltersState;
  onFilterChange: (updated: Partial<InvestigationFiltersState>) => void;
  className?: string;
}

const STATUS_TABS: Array<{ id: InvestigationStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All Cases' },
  { id: 'draft', label: 'Draft' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'ready_for_review', label: 'Ready for Review' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'revision_required', label: 'Revision Required' },
  { id: 'completed', label: 'Completed' },
  { id: 'archived', label: 'Archived' },
];

export function InvestigationFilters({
  filters,
  onFilterChange,
  className,
}: InvestigationFiltersProps) {
  return (
    <div className={`flex flex-col gap-4 rounded-xl border border-[#24344D] bg-[#101A2B] p-4 sm:p-5 ${className ?? ''}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <Input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder="Search by case title, ID (e.g. INV-2025), or target..."
          leftIcon={<Search className="h-4 w-4" />}
          containerClassName="flex-1"
        />

        {/* Sort Select */}
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-4 w-4 text-[#8293AD] shrink-0" />
          <select
            value={filters.sortBy}
            aria-label="Sort investigations by"
            onChange={(e) =>
              onFilterChange({
                sortBy: e.target.value as 'created_desc' | 'created_asc' | 'updated_desc' | 'updated_asc',
              })
            }
            className="h-11 rounded-xl border border-[#24344D] bg-[#080E1C] px-3.5 text-xs font-medium text-[#F4F7FF] hover:border-[#324869] focus:border-[#4388FF] focus:outline-none cursor-pointer"
          >
            <option value="created_desc" className="bg-[#0A1020]">Newest Created First</option>
            <option value="created_asc" className="bg-[#0A1020]">Oldest Created First</option>
            <option value="updated_desc" className="bg-[#0A1020]">Recently Updated</option>
            <option value="updated_asc" className="bg-[#0A1020]">Least Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-t border-[#1A2940] pt-3.5">
        {STATUS_TABS.map((tab) => {
          const isActive = filters.status === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange({ status: tab.id })}
              className={`h-8.5 rounded-full px-3.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'border border-[#4388FF]/60 bg-[#4388FF]/16 text-[#F4F7FF] shadow-[0_0_12px_rgba(67,136,255,0.2)]'
                  : 'border border-[#24344D] bg-[#131F33] text-[#B5C2D6] hover:border-[#324869] hover:text-[#F4F7FF]'
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
