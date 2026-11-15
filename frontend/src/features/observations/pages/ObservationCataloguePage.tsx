import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useObservations } from '../hooks/useObservations';
import {
  useObservationSelection,
  buildTemporalComparisonHref,
} from '../hooks/useObservationSelection';
import { ObservationHeader } from '../components/ObservationHeader';
import { ObservationSummary } from '../components/ObservationSummary';
import { ObservationTimeline } from '../components/ObservationTimeline';
import { ObservationDetailPanel } from '../components/ObservationDetailPanel';
import { ObservationSelector } from '../components/ObservationSelector';
import { ComparisonStatusCard } from '../components/ComparisonStatusCard';
import { ObservationFilters } from '../components/ObservationFilters';
import { ObservationEmptyState } from '../components/ObservationEmptyState';
import { ExplorerErrorState } from '../../explorer/components/ExplorerErrorState';
import { LoadingState } from '../../../components/common/LoadingState';
import { InvestigationProgress } from '../../../components/common/InvestigationProgress';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';

/**
 * Main Observation Catalogue & Temporal Timeline Interface (/observations/:targetId)
 * Connects Target Discovery (STEP 1) to Observation Selection (STEP 2),
 * Preliminary Comparison Readiness (STEP 3), and Temporal Analysis (STEP 4).
 */
export function ObservationCataloguePage() {
  const { targetId } = useParams<{ targetId: string }>();

  const {
    manifest,
    rawObservations,
    observations,
    metrics,
    activeObservation,
    selectedObsId,
    selectObservation,
    sortOrder,
    setSortOrder,
    roleFilter,
    setRoleFilter,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    refetch,
  } = useObservations(targetId);

  const {
    earlierId,
    laterId,
    earlierObs,
    laterObs,
    setEarlierId,
    setLaterId,
    swapPair,
    cautionAcknowledged,
    setCautionAcknowledged,
    isComparisonReady,
    preliminaryCheck,
    effectiveGrade,
    hasInvalidUrlSelection,
  } = useObservationSelection({
    targetId: manifest?.id ?? targetId,
    targetTitle: manifest?.title,
    observations: rawObservations,
    pairGrade: manifest?.pair_quality?.grade,
    pairQuality: manifest?.pair_quality,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-var(--navbar-height))] items-center justify-center bg-[#070B14] px-4">
        <LoadingState message="Loading SPHEREx DR1 observation records..." fullHeight />
      </div>
    );
  }

  if (error || !manifest) {
    return (
      <div className="mx-auto min-h-[calc(100vh-var(--navbar-height))] max-w-4xl px-4 py-16">
        <ExplorerErrorState
          message={error ?? `Target manifest "${targetId}" could not be retrieved.`}
          onRetry={refetch}
        />
        <div className="mt-6 text-center">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Universe Explorer</span>
          </Link>
        </div>
      </div>
    );
  }

  const pairGrade = effectiveGrade;
  const activeMetrics = metrics
    ? {
        ...metrics,
        pairGrade: effectiveGrade,
        timeBaselineDays: preliminaryCheck.timeBaselineDays ?? metrics.timeBaselineDays,
      }
    : null;
  const comparisonHref = buildTemporalComparisonHref(manifest.id, earlierId, laterId);

  return (
    <div
      className="min-h-[calc(100vh-var(--navbar-height))] bg-[#070B14] py-8 sm:py-10"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 80% 45% at 50% -10%, rgba(67, 136, 255, 0.08), transparent 70%)',
      }}
    >
      <div
        className="mx-auto flex flex-col gap-8 px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--content-max-width)' }}
      >
        {/* 6-Step Core Investigation Journey Progress */}
        <InvestigationProgress
          currentStage="select_observations"
          targetId={manifest.id}
          targetTitle={manifest.title}
          earlierObsId={earlierId}
          laterObsId={laterId}
        />

        {/* SPHEREx DR1 Mission Banner */}
        <DemonstrationDataBadge
          variant="banner"
          label="SPHEREx DR1 Calibrated Observation Archive"
          description="Multi-epoch observation epochs, calibrated spectrophotometric wavelengths (0.75 - 5.00 μm), and Gaia DR3 astrometry verified across all survey passes."
        />

        {/* Section 4.A: Header */}
        <ObservationHeader
          targetId={manifest.id}
          targetTitle={manifest.title}
          targetKind={manifest.kind}
          targetStatus={manifest.status}
          region={manifest.region}
          observationCount={rawObservations.length}
        />

        {/* Section 4.B: Summary Cards */}
        <ObservationSummary metrics={activeMetrics} />

        {/* Section 11: Filters & Sorting */}
        <ObservationFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          totalCount={rawObservations.length}
          filteredCount={observations.length}
        />

        {/* Section 5: Interactive Astronomical Timeline */}
        {observations.length > 0 ? (
          <ObservationTimeline
            observations={observations}
            selectedId={selectedObsId}
            earlierId={earlierId}
            laterId={laterId}
            onSelect={selectObservation}
          />
        ) : (
          <ObservationEmptyState
            hasFilters={Boolean(searchQuery || roleFilter !== 'all')}
            onReset={() => {
              setSearchQuery('');
              setRoleFilter('all');
            }}
          />
        )}

        {/* Section 6 & 7: Observation Detail Panel (Preview + Scientific Specs) */}
        {activeObservation && (
          <ObservationDetailPanel
            observation={activeObservation}
            targetId={manifest.id}
            fallbackImage={manifest.preview_image || manifest.thumbnail}
          />
        )}

        {/* STEP 2: ObservationSelector (Selectable Cards + Pair Designation + Role Switch) */}
        <ObservationSelector
          observations={rawObservations}
          earlierObs={earlierObs}
          laterObs={laterObs}
          selectedDetailId={selectedObsId}
          onSetEarlier={setEarlierId}
          onSetLater={setLaterId}
          onSwapPair={swapPair}
          onInspectObservation={selectObservation}
          hasInvalidUrlSelection={hasInvalidUrlSelection}
        />

        {/* STEP 3: ComparisonStatusCard (Preliminary Comparison Readiness) */}
        <ComparisonStatusCard
          targetId={manifest.id}
          earlierObs={earlierObs}
          laterObs={laterObs}
          pairQuality={manifest.pair_quality}
          preliminaryAssessment={preliminaryCheck}
          cautionAcknowledged={cautionAcknowledged}
          onToggleCaution={setCautionAcknowledged}
        />

        {/* Section 10: Temporal Analysis Workflow Gate & CTA */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-6 backdrop-blur-xl sm:flex-row shadow-[0_10px_30px_rgba(2,4,10,0.8)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Step 4 Investigation Pathway
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-100">
              Proceed to Temporal Analysis Lab
            </h4>
            <p className="text-xs text-slate-400 max-w-xl">
              {pairGrade === 'POOR'
                ? 'Temporal comparison is disabled: Preliminary wavelength delta between selected epochs exceeds passband proximity thresholds.'
                : pairGrade === 'FAIR' && !cautionAcknowledged
                ? 'Acknowledge the preliminary wavelength caution in the panel above to enable temporal comparison.'
                : 'Preliminary wavelength check completed. Proceed to multi-epoch temporal comparison, side-by-side viewing, and blink inspection.'}
            </p>
          </div>

          <div className="flex shrink-0 items-center">
            {isComparisonReady ? (
              <Link
                to={comparisonHref}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all duration-200 hover:bg-blue-500 hover:shadow-[0_0_35px_rgba(59,130,246,0.7)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <span>COMPARE OBSERVATIONS</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title={
                  pairGrade === 'POOR'
                    ? 'Incompatible observation pair (POOR preliminary grade)'
                    : 'Acknowledge caution above to proceed'
                }
                className="inline-flex items-center gap-2 rounded-xl bg-slate-800/60 border border-slate-700/60 px-6 py-3.5 text-sm font-semibold text-slate-400 cursor-not-allowed opacity-60"
              >
                <span>COMPARE OBSERVATIONS</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
