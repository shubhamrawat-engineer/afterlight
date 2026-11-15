import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useTargets } from '../hooks/useTargets';
import { ExplorerHeader } from '../components/ExplorerHeader';
import { TargetSearch } from '../components/TargetSearch';
import { TargetFilters } from '../components/TargetFilters';
import { TargetGrid } from '../components/TargetGrid';
import { TargetList } from '../components/TargetList';
import { ExplorerEmptyState } from '../components/ExplorerEmptyState';
import { ExplorerErrorState } from '../components/ExplorerErrorState';
import { LoadingState } from '../../../components/common/LoadingState';
import { InvestigationProgress } from '../../../components/common/InvestigationProgress';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';
import { getActiveInvestigationSession } from '../../../services/investigation-session';

/**
 * Main Universe Explorer Interface (/explore)
 * Allows browsing supported astronomical regions, searching targets,
 * filtering by categories/statuses, and inspecting observations.
 */
export function ExplorerPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchParams] = useSearchParams();
  const flow = searchParams.get('flow');
  const session = getActiveInvestigationSession();

  const {
    filteredTargets,
    totalCount,
    filteredCount,
    filters,
    isLoading,
    error,
    isFallback,
    setSearch,
    setKind,
    setStatus,
    resetFilters,
    refetch,
  } = useTargets();

  const flowGuides: Record<string, string> = {
    temporal: 'Select an astronomical target below to initiate Multi-Epoch Temporal Analysis.',
    spectral: 'Select an astronomical target below to enter the Infrared Spectral Lab.',
    objects: 'Select an astronomical target below to inspect its Object Intelligence dossier.',
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.kind !== 'all' || filters.status !== 'all'
  );

  return (
    <div
      className="min-h-[calc(100vh-var(--navbar-height))] bg-[#070B14] py-8 sm:py-10"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 80% 45% at 50% -10%, rgba(67, 136, 255, 0.08), transparent 70%)',
      }}
    >
      <div
        className="mx-auto flex flex-col gap-6 px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--content-max-width)' }}
      >
        {/* 6-Step Core Investigation Journey Progress */}
        <InvestigationProgress
          currentStage="discover"
          targetId={session?.targetId}
          targetTitle={session?.targetTitle}
          earlierObsId={session?.earlierObsId}
          laterObsId={session?.laterObsId}
        />

        {/* Demonstration Dataset Banner */}
        <DemonstrationDataBadge
          variant="banner"
          label="SPHEREx Demonstration Sky Catalogue"
          description="Sky regions, astrometric coordinates, and cutout previews below are curated demonstration fixtures for frontend workflow verification."
        />

        {/* Guided flow banner if redirected from homepage cards */}
        {flow && flowGuides[flow] && (
          <div className="flex items-center gap-2.5 rounded-xl border border-[#4388FF]/35 bg-[#101A2B] px-4 py-2.5 text-xs text-[#F4F7FF]">
            <Sparkles className="h-4 w-4 text-[#45D5F2] shrink-0" />
            <span>{flowGuides[flow]}</span>
          </div>
        )}

        {/* Section A: Header */}
        <ExplorerHeader
          totalCount={totalCount}
          filteredCount={filteredCount}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isFallback={isFallback}
        />

        {/* Section B & C: Search & Filter Toolbar */}
        <div className="flex flex-col gap-4 rounded-xl border border-[#24344D] bg-[#101A2B] p-4">
          <TargetSearch
            value={filters.search}
            onChange={setSearch}
          />
          <TargetFilters
            selectedKind={filters.kind}
            selectedStatus={filters.status}
            onKindChange={setKind}
            onStatusChange={setStatus}
            onReset={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Section D: Target Display Area */}
        {isLoading ? (
          <LoadingState message="Accessing SPHEREx demonstration target catalogue..." />
        ) : error && totalCount === 0 ? (
          <ExplorerErrorState message={error} onRetry={refetch} />
        ) : filteredTargets.length === 0 ? (
          <ExplorerEmptyState
            hasFilters={hasActiveFilters}
            onReset={resetFilters}
          />
        ) : viewMode === 'grid' ? (
          <TargetGrid targets={filteredTargets} flow={flow} />
        ) : (
          <TargetList targets={filteredTargets} flow={flow} />
        )}
      </div>
    </div>
  );
}
