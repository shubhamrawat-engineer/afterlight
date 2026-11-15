import { useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ArrowLeftRight,
  PlayCircle,
  LayoutGrid,
  CalendarRange,
} from 'lucide-react';
import { useTemporalAnalysis } from '../hooks/useTemporalAnalysis';
import { TemporalAnalysisHeader } from '../components/TemporalAnalysisHeader';
import { ComparisonToolbar } from '../components/ComparisonToolbar';
import { ComparisonViewer } from '../components/ComparisonViewer';
import { ComparisonWarning } from '../components/ComparisonWarning';
import { PairQualityPanel } from '../components/PairQualityPanel';
import { ProcessingMethodPanel } from '../components/ProcessingMethodPanel';
import { ViewerEmptyState } from '../components/ViewerEmptyState';
import { EpochTimeline } from '../components/EpochTimeline';
import { MultiEpochSelector } from '../components/MultiEpochSelector';
import { EpochSequenceViewer } from '../components/EpochSequenceViewer';
import { EpochGrid } from '../components/EpochGrid';
import { EpochMetadataPanel } from '../components/EpochMetadataPanel';
import { TemporalOverview } from '../components/TemporalOverview';
import { CandidateChangeTracker } from '../components/CandidateChangeTracker';
import { MultiEpochInvestigationSummary } from '../components/MultiEpochInvestigationSummary';
import { LoadingState } from '../../../components/common/LoadingState';
import { InvestigationProgress } from '../../../components/common/InvestigationProgress';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';
import { getObsDate, getObsId } from '../../observations/services/observation-service';
import { saveActiveInvestigationSession } from '../../../services/investigation-session';
import type { TemporalWorkspaceMode } from '../types/temporal-analysis.types';

export function TemporalAnalysisPage() {
  const { targetId } = useParams<{ targetId: string }>();
  const [searchParams] = useSearchParams();

  const earlierParam = searchParams.get('earlier');
  const laterParam = searchParams.get('later');
  const epochsParam = searchParams.get('epochs');

  const {
    manifest,
    allEpochs,
    selectedEpochIds,
    selectedEpochs,
    activeEpochId,
    setActiveEpochId,
    activeEpochRecord,
    workspaceMode,
    switchWorkspaceMode,
    toggleEpoch,
    selectAllEpochs,
    resetToDefaultPair,
    sortOrder,
    toggleSortOrder,
    detectorFilter,
    setDetectorFilter,
    sequenceIndex,
    setSequenceIndex,
    isSequencePlaying,
    toggleSequencePlay,
    playbackSpeedMs,
    setPlaybackSpeedMs,
    candidateRecords,
    handleAddCandidate,
    handleDeleteCandidate,
    handleUpdateCandidateStatus,
    earlierObs,
    laterObs,
    differenceMeta,
    mode,
    switchMode,
    activeEpoch,
    setThen,
    setNow,
    blink,
    currentImageUrl,
    isLoading,
    error,
    refetch,
  } = useTemporalAnalysis(targetId, earlierParam, laterParam, epochsParam);

  const handleSaveInvestigationState = useCallback(() => {
    if (!manifest) return;
    saveActiveInvestigationSession({
      targetId: manifest.id,
      targetTitle: manifest.title,
      earlierObsId: earlierObs ? getObsId(earlierObs) : null,
      laterObsId: laterObs ? getObsId(laterObs) : null,
      selectedEpochIds,
      activeEpochId,
      temporalWorkspaceMode: workspaceMode,
    });
  }, [manifest, earlierObs, laterObs, selectedEpochIds, activeEpochId, workspaceMode]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-var(--navbar-height))] items-center justify-center bg-[#070B14] px-4">
        <LoadingState
          message={`Initializing Multi-Epoch Temporal Workstation for ${targetId ?? 'target'}...`}
          fullHeight
        />
      </div>
    );
  }

  if (error || !manifest) {
    return (
      <div className="mx-auto min-h-[calc(100vh-var(--navbar-height))] max-w-4xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-8 shadow-xl">
          <ShieldAlert className="mx-auto h-12 w-12 text-rose-400" />
          <h2 className="mt-4 text-xl font-bold text-white">Target Analysis Manifest Unavailable</h2>
          <p className="mt-2 text-sm text-slate-300">
            {error ?? `Target manifest "${targetId}" could not be retrieved from the scientific archive.`}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Retry Connection
            </button>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Universe Explorer</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pairGrade = manifest.pair_quality?.grade;
  const isPoorGrade = pairGrade === 'POOR';
  const earlierDate = earlierObs ? getObsDate(earlierObs) : null;
  const laterDate = laterObs ? getObsDate(laterObs) : null;
  const resolvedEarlierId = earlierObs ? getObsId(earlierObs) : earlierParam;
  const resolvedLaterId = laterObs ? getObsId(laterObs) : laterParam;

  const pairParams = new URLSearchParams();
  if (resolvedEarlierId) pairParams.set('earlier', resolvedEarlierId);
  if (resolvedLaterId) pairParams.set('later', resolvedLaterId);
  if (selectedEpochIds.length > 0) pairParams.set('epochs', selectedEpochIds.join(','));
  const pairQueryString = pairParams.toString() ? `?${pairParams.toString()}` : '';

  const workspaceModes: Array<{
    id: TemporalWorkspaceMode;
    label: string;
    icon: typeof ArrowLeftRight;
  }> = [
    { id: 'two_epoch', label: 'Two-Epoch Comparison', icon: ArrowLeftRight },
    { id: 'sequence', label: 'Multi-Epoch Sequence', icon: PlayCircle },
    { id: 'grid', label: 'Cutout Grid', icon: LayoutGrid },
    { id: 'overview', label: 'Temporal Overview', icon: CalendarRange },
  ];

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
        {/* Step 4 Investigation Journey Progress */}
        <InvestigationProgress
          currentStage="investigate"
          targetId={manifest.id}
          targetTitle={manifest.title}
          earlierObsId={resolvedEarlierId}
          laterObsId={resolvedLaterId}
        />

        {/* Calibrated Dataset Banner */}
        <DemonstrationDataBadge
          variant="banner"
          label="Multi-Epoch Temporal Investigation (SPHEREx DR1 Archive)"
          description="Calibrated cutout images, sequence stepping, and difference maps verified against SPHEREx LVF spectrophotometric and Gaia DR3 astrometric reference frames."
        />

        {/* 1. Header with Metadata, Baseline, and Back Link to Phase 3 */}
        <TemporalAnalysisHeader
          targetId={manifest.id}
          targetTitle={manifest.title}
          targetKind={manifest.kind}
          targetStatus={manifest.status}
          pairGrade={pairGrade}
          earlierDate={earlierDate}
          laterDate={laterDate}
          timeBaselineDays={manifest.pair_quality?.time_baseline_days}
        />

        {/* 2. Scientific Limitation Warning Banner (POOR / FAIR pairs) */}
        {pairGrade && (
          <ComparisonWarning
            grade={pairGrade}
            warningMessage={manifest.pair_quality?.notes}
            isDifferenceMode={mode === 'difference'}
          />
        )}

        {/* 3. Multi-Epoch Observation Timeline */}
        <EpochTimeline
          allEpochs={allEpochs}
          selectedEpochIds={selectedEpochIds}
          activeEpochId={activeEpochId}
          onToggleEpoch={toggleEpoch}
          onSelectActiveEpoch={setActiveEpochId}
        />

        {/* 4. Multi-Epoch Selection & Filter Panel */}
        <MultiEpochSelector
          allEpochs={allEpochs}
          selectedEpochIds={selectedEpochIds}
          onSelectAll={selectAllEpochs}
          onClearToDefaultPair={resetToDefaultPair}
          sortOrder={sortOrder}
          onToggleSortOrder={toggleSortOrder}
          detectorFilter={detectorFilter}
          onSetDetectorFilter={setDetectorFilter}
        />

        {/* 5. Workspace Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A2940] pb-3">
          <span className="text-xs font-medium text-[#8293AD]">
            Comparison Viewport Workspace
          </span>

          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#24344D] bg-[#101A2B] p-1">
            {workspaceModes.map((wm) => {
              const Icon = wm.icon;
              const isActive = workspaceMode === wm.id;
              return (
                <button
                  key={wm.id}
                  type="button"
                  onClick={() => switchWorkspaceMode(wm.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{wm.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Active Viewport Canvas */}
        {workspaceMode === 'two_epoch' && (
          !earlierObs || !laterObs ? (
            <ViewerEmptyState targetId={manifest.id} />
          ) : (
            <div className="flex flex-col gap-4">
              <ComparisonToolbar
                mode={mode}
                onModeChange={switchMode}
                activeEpoch={activeEpoch}
                onSetThen={setThen}
                onSetNow={setNow}
                earlierDate={earlierDate}
                laterDate={laterDate}
                isBlinking={blink.isPlaying}
                onToggleBlink={blink.togglePlay}
                blinkInterval={blink.intervalMs}
                onBlinkIntervalChange={blink.changeInterval}
                differenceMeta={differenceMeta}
              />
              <ComparisonViewer
                mode={mode}
                activeEpoch={activeEpoch}
                currentImageUrl={currentImageUrl}
                earlierObs={earlierObs}
                laterObs={laterObs}
                differenceMeta={differenceMeta}
                targetId={manifest.id}
                targetTitle={manifest.title}
                fallbackImage={manifest.preview_image || manifest.thumbnail}
              />
            </div>
          )
        )}

        {workspaceMode === 'sequence' && (
          <EpochSequenceViewer
            selectedEpochs={selectedEpochs}
            currentIndex={sequenceIndex}
            onSelectIndex={setSequenceIndex}
            isPlaying={isSequencePlaying}
            onTogglePlay={toggleSequencePlay}
            playbackSpeedMs={playbackSpeedMs}
            onChangeSpeed={setPlaybackSpeedMs}
            fallbackImage={manifest.preview_image || manifest.thumbnail}
            targetTitle={manifest.title}
          />
        )}

        {workspaceMode === 'grid' && (
          <EpochGrid
            selectedEpochs={selectedEpochs}
            activeEpochId={activeEpochId}
            onSelectActiveEpoch={setActiveEpochId}
            fallbackImage={manifest.preview_image || manifest.thumbnail}
            targetTitle={manifest.title}
          />
        )}

        {workspaceMode === 'overview' && (
          <TemporalOverview
            selectedEpochs={selectedEpochs}
            onSelectActiveEpoch={setActiveEpochId}
          />
        )}

        {/* 7. Multi-Epoch Investigation Summary */}
        <MultiEpochInvestigationSummary
          targetId={manifest.id}
          targetTitle={manifest.title}
          selectedEpochs={selectedEpochs}
          allAvailableCount={allEpochs.length}
          candidateRecords={candidateRecords}
          onSaveToSession={handleSaveInvestigationState}
        />

        {/* 8. Scientific Context, Epoch Metadata & Candidate Change Tracking */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column: Detailed Epoch Metadata & Processing Panels */}
          <div className="flex flex-col gap-6">
            <EpochMetadataPanel
              epoch={activeEpochRecord}
              coordinateFrame={manifest.region?.coordinate_frame}
              pixelScale={manifest.region?.pixel_scale}
              dimensions={manifest.region?.dimensions}
            />
            <PairQualityPanel pairQuality={manifest.pair_quality} />
            <ProcessingMethodPanel differenceMeta={differenceMeta} />
          </div>

          {/* Right Column: User Candidate Change Tracking */}
          <div className="flex flex-col gap-6">
            <CandidateChangeTracker
              targetId={manifest.id}
              selectedEpochs={selectedEpochs}
              candidateRecords={candidateRecords}
              onAddCandidate={handleAddCandidate}
              onDeleteCandidate={handleDeleteCandidate}
              onUpdateStatus={handleUpdateCandidateStatus}
            />
          </div>
        </div>

        {/* 9. Step 5 Forward Navigation / Action Bar */}
        <div className="rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-6 backdrop-blur-xl shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                  Step 5 Investigation Stage
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                Candidate Transient Detection &amp; Evidence Inspection
              </h3>
              <p className="text-xs text-slate-400 max-w-xl">
                Proceed with {selectedEpochIds.length} designated observation epochs into the Evidence Inspection lab to
                review calibrated measurements, quality flags, uncertainties, and scientific limitations.
              </p>
            </div>

            <div className="flex shrink-0 items-center">
              {isPoorGrade ? (
                <div className="flex flex-col items-end gap-1.5">
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    title="Evidence inspection is gated for incompatible passband pairs"
                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-3.5 text-sm font-bold text-slate-400 opacity-60"
                  >
                    <span>EVIDENCE INSPECTION LOCKED</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <span className="text-[11px] text-rose-400 font-medium">
                    Passband mismatch (grade POOR) prevents valid candidate extraction
                  </span>
                </div>
              ) : (
                <Link
                  to={`/evidence/${manifest.id}${pairQueryString}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all duration-200 hover:bg-blue-500 hover:shadow-[0_0_35px_rgba(59,130,246,0.7)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <span>CONTINUE TO EVIDENCE INSPECTION</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Back Links to Stage 2 & 3 */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-center text-xs">
          <Link
            to={`/compatibility/${manifest.id}${pairQueryString}`}
            className="inline-flex items-center gap-1.5 font-semibold text-slate-400 hover:text-blue-400 transition-colors"
          >
            <span>Review Scientific Compatibility Inspector</span>
          </Link>
          <span className="text-slate-600">•</span>
          <Link
            to={`/observations/${manifest.id}${pairQueryString}`}
            className="inline-flex items-center gap-1.5 font-semibold text-slate-400 hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Observation Catalogue ({manifest.id})</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
