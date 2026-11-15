import { useInvestigations } from '../hooks/useInvestigations';
import { InvestigationHeader } from '../components/InvestigationHeader';
import { InvestigationFilters } from '../components/InvestigationFilters';
import { InvestigationCard } from '../components/InvestigationCard';
import { InvestigationEmptyState } from '../components/InvestigationEmptyState';
import { LoadingState } from '../../../components/common/LoadingState';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';
import { AlertCircle, Info } from 'lucide-react';
import {
  duplicateInvestigation,
  archiveInvestigation,
  restoreArchivedInvestigation,
  deleteInvestigation,
} from '../services/investigation-service';

export function InvestigationsArchivePage() {
  const {
    cases,
    metrics,
    filters,
    setFilters,
    isLoading,
    isFallback,
    refetch,
  } = useInvestigations();

  const handleDuplicate = async (caseId: string) => {
    try {
      await duplicateInvestigation(caseId);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchive = async (caseId: string) => {
    try {
      await archiveInvestigation(caseId);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async (caseId: string) => {
    try {
      await restoreArchivedInvestigation(caseId);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (caseId: string) => {
    try {
      await deleteInvestigation(caseId);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-var(--navbar-height))] items-center justify-center bg-[#070B14] px-4">
        <LoadingState message="Loading investigation archive dossiers..." fullHeight />
      </div>
    );
  }

  const isFiltered = Boolean(filters.search.trim() || filters.status !== 'all');

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
        {/* Header & Metrics */}
        <InvestigationHeader metrics={metrics} />

        {/* Consolidated Demonstration & Lifecycle Notice */}
        <div className="flex flex-col gap-2.5">
          <DemonstrationDataBadge
            variant="banner"
            label="Demonstration Case Registry"
            description="Cases below include demonstration fixtures and user-created dossiers persisted locally in browser storage."
          />

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#1A2940] bg-[#0A1020] px-4 py-2.5 text-xs text-[#B5C2D6]">
            <div className="flex items-start gap-2.5">
              <Info className="h-4 w-4 shrink-0 text-[#45D5F2] mt-0.5" />
              <span>
                <strong className="font-medium text-[#F4F7FF]">Workflow Scope:</strong> A status of <em>Completed</em> signifies finalized documentation, not scientific confirmation.
              </span>
            </div>
            {isFallback && (
              <span className="inline-flex items-center gap-1.5 text-amber-300">
                <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                <span>Local browser persistence active</span>
              </span>
            )}
          </div>
        </div>

        {/* Filters Bar */}
        <InvestigationFilters
          filters={filters}
          onFilterChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
        />

        {/* Investigation Cases Grid */}
        {cases.length === 0 ? (
          <InvestigationEmptyState
            isFiltered={isFiltered}
            onClearFilters={() => setFilters({ search: '', status: 'all', sortBy: 'created_desc' })}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {cases.map((c) => (
              <InvestigationCard
                key={c.id}
                investigation={c}
                onDuplicate={handleDuplicate}
                onArchive={handleArchive}
                onRestore={handleRestore}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
