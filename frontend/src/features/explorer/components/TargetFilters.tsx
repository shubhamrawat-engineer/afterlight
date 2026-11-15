import { RotateCcw } from 'lucide-react';
import type { TargetKind, TargetStatus } from '../types/explorer.types';
import { Button } from '../../../components/ui/Button';

interface TargetFiltersProps {
  selectedKind: TargetKind | 'all';
  selectedStatus: TargetStatus | 'all';
  onKindChange: (kind: TargetKind | 'all') => void;
  onStatusChange: (status: TargetStatus | 'all') => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const KIND_OPTIONS: { id: TargetKind | 'all'; label: string }[] = [
  { id: 'all', label: 'All Categories' },
  { id: 'deep_field', label: 'Deep Fields' },
  { id: 'moving_object', label: 'Moving Objects' },
  { id: 'variable_star', label: 'Variable Stars' },
  { id: 'control_static', label: 'Static Controls' },
];

const STATUS_OPTIONS: { id: TargetStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All Statuses' },
  { id: 'verified', label: 'Verified Datasets' },
  { id: 'preliminary', label: 'Preliminary' },
  { id: 'mock', label: 'Mock Fixtures' },
];

/**
 * Standardized filter bar for astronomical categories and scientific verification statuses.
 */
export function TargetFilters({
  selectedKind,
  selectedStatus,
  onKindChange,
  onStatusChange,
  onReset,
  hasActiveFilters,
}: TargetFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Target Kinds Row */}
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Target Kind Filters">
        {KIND_OPTIONS.map((opt) => {
          const isSelected = selectedKind === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onKindChange(opt.id)}
              className={`inline-flex h-8.5 items-center rounded-full px-3.5 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#45D5F2] cursor-pointer ${
                isSelected
                  ? 'border border-[#4388FF]/60 bg-[#4388FF]/16 text-[#F4F7FF] shadow-[0_0_12px_rgba(67,136,255,0.2)]'
                  : 'border border-[#24344D] bg-[#131F33] text-[#B5C2D6] hover:border-[#324869] hover:text-[#F4F7FF]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Status Dropdown & Reset Action */}
      <div className="flex items-center gap-2.5">
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as TargetStatus | 'all')}
          aria-label="Filter by verification status"
          className="h-9 rounded-lg border border-[#24344D] bg-[#080E1C] px-3 text-xs font-medium text-[#F4F7FF] transition-colors hover:border-[#324869] focus:border-[#4388FF] focus:outline-none cursor-pointer"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id} className="bg-[#0A1020] text-[#F4F7FF]">
              {opt.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onReset}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            title="Reset all filters and search"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
