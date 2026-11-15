import { LayoutGrid, List, Database, WifiOff } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { IconButton } from '../../../components/ui/IconButton';

interface ExplorerHeaderProps {
  totalCount: number;
  filteredCount: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  isFallback: boolean;
}

/**
 * Top command header for the Universe Explorer interface.
 * Uses refined medium-weight page heading, standardized badges, and icon buttons.
 */
export function ExplorerHeader({
  totalCount,
  filteredCount,
  viewMode,
  onViewModeChange,
  isFallback,
}: ExplorerHeaderProps) {
  return (
    <div className="flex flex-col gap-6 border-b border-[#1A2940] pb-6 md:flex-row md:items-end md:justify-between">
      {/* Title & Subtitle */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-page-heading text-[#F4F7FF]">
            Universe Explorer
          </h1>

          {/* Archive Status Indicator */}
          {isFallback ? (
            <Badge
              variant="warning"
              icon={<WifiOff className="h-3 w-3" />}
              title="Remote backend is offline. Displaying local demonstration fixtures."
            >
              Offline / Cached Archive
            </Badge>
          ) : (
            <Badge
              variant="success"
              icon={<Database className="h-3 w-3" />}
              title="Connected to AFTERLIGHT backend pipeline."
            >
              Archive Connected
            </Badge>
          )}
        </div>

        <p className="max-w-2xl text-[14px] leading-relaxed text-[#B5C2D6]">
          Explore demonstration astronomical sky regions, inspect celestial coordinates, and advance into multi-epoch observation selection.
        </p>
      </div>

      {/* Stats Counter & View Toggles */}
      <div className="flex items-center justify-between gap-4 md:justify-end">
        <div className="text-right">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#8293AD]">
            Cataloged Targets
          </span>
          <p className="text-lg font-semibold font-mono text-[#F4F7FF]">
            {filteredCount}
            {filteredCount !== totalCount && (
              <span className="text-xs font-normal text-[#8293AD]"> / {totalCount}</span>
            )}
          </p>
        </div>

        <div
          className="flex items-center gap-1 rounded-xl border border-[#24344D] bg-[#101A2B] p-1"
          role="group"
          aria-label="View format"
        >
          <IconButton
            size="sm"
            variant={viewMode === 'grid' ? 'active' : 'ghost'}
            onClick={() => onViewModeChange('grid')}
            aria-label="Switch to grid view"
            aria-pressed={viewMode === 'grid'}
          >
            <LayoutGrid className="h-4 w-4" />
          </IconButton>
          <IconButton
            size="sm"
            variant={viewMode === 'list' ? 'active' : 'ghost'}
            onClick={() => onViewModeChange('list')}
            aria-label="Switch to list view"
            aria-pressed={viewMode === 'list'}
          >
            <List className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
