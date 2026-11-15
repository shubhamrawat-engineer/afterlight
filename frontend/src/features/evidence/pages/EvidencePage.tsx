import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Layers,
  HelpCircle,
  FileText,
  Lightbulb,
  Crosshair,
} from 'lucide-react';
import { useEvidence } from '../hooks/useEvidence';
import { useSelectedCandidate } from '../hooks/useSelectedCandidate';
import { EvidenceHeader } from '../components/EvidenceHeader';
import { EvidenceOverview } from '../components/EvidenceOverview';
import { ComparisonSummary } from '../components/ComparisonSummary';
import { ObservedChangeSection } from '../components/ObservedChangeSection';
import { CandidateList } from '../components/CandidateList';
import { CandidateDetail } from '../components/CandidateDetail';
import { CandidateImageOverlay } from '../components/CandidateImageOverlay';
import { MeasurementChart } from '../components/MeasurementChart';
import { MeasurementInspector } from '../components/MeasurementInspector';
import { UncertaintyExplorer } from '../components/UncertaintyExplorer';
import { QualityFlagPanel } from '../components/QualityFlagPanel';
import { EvidenceLedger } from '../components/EvidenceLedger';
import { ProvenanceInspector } from '../components/ProvenanceInspector';
import { EvidenceInterpretationPanel } from '../components/EvidenceInterpretationPanel';
import { MultiEpochEvidencePanel } from '../components/MultiEpochEvidencePanel';
import { InvestigationSummary } from '../components/InvestigationSummary';
import { EvidenceEmptyState } from '../components/EvidenceEmptyState';
import { EvidenceErrorState } from '../components/EvidenceErrorState';
import { LoadingState } from '../../../components/common/LoadingState';
import { InvestigationProgress } from '../../../components/common/InvestigationProgress';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';
import { ComparisonWarning } from '../../temporal-analysis/components/ComparisonWarning';
import { getObsDate, getObsId } from '../../observations/services/observation-service';
import { evaluatePreliminaryWavelengthCheck } from '../../observations/hooks/useObservationSelection';
import { MOCK_TARGET_MANIFESTS } from '../../explorer/data/mock-targets';
import {
  resolveValidatedPairIds,
  saveActiveInvestigationSession,
} from '../../../services/investigation-session';

type EvidenceWorkspaceTab =
  | 'overview'
  | 'candidate_cutouts'
  | 'measurements'
  | 'uncertainty_flags'
  | 'ledger_provenance'
  | 'multi_epoch_hypotheses';

/**
 * Phase 5: Scientific Evidence, Measurements and Provenance (/evidence/:targetId)
 *
 * Professional astronomical evidence inspection interface providing:
 * 1. Multi-epoch evidence overview with explicit verification states
 * 2. Visual difference map with calibrated candidate marker overlay
 * 3. Structured Measurement Inspector (Photometric, Astrometric, Spectral, Temporal)
 * 4. Uncertainty Explorer breaking down statistical, calibration, and instrumental error budgets
 * 5. Scientific Quality Flags (masking, saturation, registration pending, psf pending)
 * 6. Chronological filterable Evidence Ledger
 * 7. End-to-end 7-stage Provenance Pipeline Lineage
 * 8. Evaluated working hypotheses with supporting/contradicting criteria
 * 9. Multi-epoch temporal integration linking to Phase 4
 * 10. Structured dossier export preview (Markdown & JSON)
 */
export function EvidencePage() {
  const { targetId } = useParams<{ targetId: string }>();
  const [searchParams] = useSearchParams();

  const comparisonJobId = searchParams.get('jobId');
  const candidateParam = searchParams.get('candidateId');
  const earlierParam = searchParams.get('earlier');
  const laterParam = searchParams.get('later');
  const epochsParam = searchParams.get('epochs');

  const [activeTab, setActiveTab] = useState<EvidenceWorkspaceTab>('overview');

  const parsedEpochs = useMemo(() => {
    if (epochsParam) {
      return epochsParam.split(',').filter(Boolean);
    }
    return undefined;
  }, [epochsParam]);

  const { evidence, completeBundle, isLoading, error, refetch } = useEvidence(
    targetId,
    comparisonJobId,
    {
      candidateId: candidateParam ?? undefined,
      epochIds: parsedEpochs,
    }
  );

  const { selectedId, selectedCandidate, selectCandidate } = useSelectedCandidate(
    evidence?.candidates ?? [],
    candidateParam
  );

  // Resolve selected observation pair from URL or persisted session against target manifest
  const resolvedPair = useMemo(() => {
    if (!evidence) {
      return {
        earlierObs: null,
        laterObs: null,
        earlierId: null,
        laterId: null,
        effectiveGrade: null,
      };
    }
    const manifest = MOCK_TARGET_MANIFESTS[evidence.targetId];
    const observations = manifest?.observations ?? [];
    if (observations.length >= 2) {
      const validated = resolveValidatedPairIds(
        observations,
        earlierParam,
        laterParam,
        evidence.targetId
      );
      const earlierObs =
        observations.find((o) => getObsId(o) === validated.earlierId) ??
        evidence.earlierObs;
      const laterObs =
        observations.find((o) => getObsId(o) === validated.laterId) ??
        evidence.laterObs;
      const check = evaluatePreliminaryWavelengthCheck(
        earlierObs,
        laterObs,
        manifest?.pair_quality
      );
      return {
        earlierObs,
        laterObs,
        earlierId: earlierObs ? getObsId(earlierObs) : validated.earlierId,
        laterId: laterObs ? getObsId(laterObs) : validated.laterId,
        effectiveGrade: check.preliminaryGrade ?? evidence.pairGrade,
      };
    }

    const earlierId =
      earlierParam || (evidence.earlierObs ? getObsId(evidence.earlierObs) : null);
    const laterId =
      laterParam || (evidence.laterObs ? getObsId(evidence.laterObs) : null);
    return {
      earlierObs: evidence.earlierObs,
      laterObs: evidence.laterObs,
      earlierId,
      laterId,
      effectiveGrade: evidence.pairGrade,
    };
  }, [evidence, earlierParam, laterParam]);

  useEffect(() => {
    if (evidence && resolvedPair.earlierId && resolvedPair.laterId) {
      saveActiveInvestigationSession({
        targetId: evidence.targetId,
        targetTitle: evidence.targetTitle,
        earlierObsId: resolvedPair.earlierId,
        laterObsId: resolvedPair.laterId,
        selectedEpochIds: parsedEpochs,
      });
    }
  }, [evidence, resolvedPair.earlierId, resolvedPair.laterId, parsedEpochs]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-var(--navbar-height))] items-center justify-center bg-[#070B14] px-4">
        <LoadingState
          message={`Compiling scientific evidence workspace for ${targetId ?? 'target'}...`}
          fullHeight
        />
      </div>
    );
  }

  if (error || !evidence) {
    return (
      <div className="min-h-[calc(100vh-var(--navbar-height))] bg-[#070B14] py-8 sm:py-10">
        <EvidenceErrorState message={error ?? undefined} targetId={targetId} onRetry={refetch} />
      </div>
    );
  }

  const activeEarlierObs = resolvedPair.earlierObs;
  const activeLaterObs = resolvedPair.laterObs;
  const earlierDate = activeEarlierObs ? getObsDate(activeEarlierObs) : null;
  const laterDate = activeLaterObs ? getObsDate(activeLaterObs) : null;
  const earlierId = resolvedPair.earlierId;
  const laterId = resolvedPair.laterId;
  const activePairGrade = resolvedPair.effectiveGrade;
  const isPoorGrade = activePairGrade === 'POOR';

  const pairQueryString =
    earlierId && laterId
      ? `?earlier=${encodeURIComponent(earlierId)}&later=${encodeURIComponent(laterId)}${
          parsedEpochs ? `&epochs=${encodeURIComponent(parsedEpochs.join(','))}` : ''
        }`
      : '';

  const manifest = MOCK_TARGET_MANIFESTS[evidence.targetId];
  const observations = manifest?.observations ?? [];
  const selectedEpochIds =
    parsedEpochs && parsedEpochs.length > 0
      ? parsedEpochs
      : observations.map((o) => getObsId(o));

  const qualityFlagsList =
    completeBundle?.qualityFlags ??
    (Array.isArray(manifest?.difference?.masked_flags_applied)
      ? [
          ...manifest.difference.masked_flags_applied.map((f, i) => ({
            id: `qf-fallback-${i}`,
            flag: f as any,
            name: f,
            severity: 'INFORMATIONAL' as const,
            description: `Quality flag ${f} applied in difference generation.`,
            affectedObservation: 'All Epochs',
            scientificImplication: 'Masked from difference calculation.',
            reviewStatus: 'CONFIRMED' as const,
            source: 'BACKEND_CONFIRMED' as const,
          })),
        ]
      : []);

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
          currentStage="evidence"
          targetId={evidence.targetId}
          targetTitle={evidence.targetTitle}
          earlierObsId={earlierId}
          laterObsId={laterId}
        />

        {/* Demonstration Dataset Banner */}
        <DemonstrationDataBadge
          variant="banner"
          label="Scientific Evidence & Measurement Workspace (Demonstration Data)"
          description="All candidate detections, photometric measurements, uncertainties, and quality flags on this page are clearly labelled demonstration fixtures and are not presented as real scientific findings."
        />

        {/* 1. Investigation Header */}
        <EvidenceHeader
          targetId={evidence.targetId}
          targetTitle={evidence.targetTitle}
          targetKind={evidence.targetKind}
          targetStatus={evidence.targetStatus}
          comparisonJobId={evidence.comparisonJobId}
          pairGrade={activePairGrade}
          earlierDate={earlierDate}
          laterDate={laterDate}
        />

        {/* 2. Scientific Pair Limitation Warning if POOR */}
        {isPoorGrade && (
          <ComparisonWarning
            grade="POOR"
            warningMessage={
              evidence.pairNotes ?? 'Observations acquired with incompatible passbands.'
            }
            isDifferenceMode={true}
          />
        )}

        {/* 3. Section 3: Evidence Overview Card */}
        {completeBundle?.overview && (
          <EvidenceOverview overview={completeBundle.overview} />
        )}

        {/* 4. Comparison Summary */}
        <ComparisonSummary
          earlierObs={activeEarlierObs}
          laterObs={activeLaterObs}
          pairGrade={activePairGrade}
          pairNotes={evidence.pairNotes}
          qualityFlags={qualityFlagsList.map((f) => f.flag)}
        />

        {/* 5. Observed Change Overview Banner */}
        <ObservedChangeSection candidate={selectedCandidate} />

        {/* 6. Workspace Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#1A2940] pb-3.5">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border border-[#4388FF]/60 bg-[#4388FF]/16 text-[#F4F7FF] shadow-[0_0_12px_rgba(67,136,255,0.2)]'
                : 'border border-[#24344D] bg-[#101A2B] text-[#B5C2D6] hover:border-[#324869] hover:text-[#F4F7FF]'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Complete Evidence Dossier</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('candidate_cutouts')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'candidate_cutouts'
                ? 'border border-[#4388FF]/60 bg-[#4388FF]/16 text-[#F4F7FF] shadow-[0_0_12px_rgba(67,136,255,0.2)]'
                : 'border border-[#24344D] bg-[#101A2B] text-[#B5C2D6] hover:border-[#324869] hover:text-[#F4F7FF]'
            }`}
          >
            <Crosshair className="h-3.5 w-3.5" />
            <span>Candidate &amp; Cutouts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('measurements')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'measurements'
                ? 'border border-[#4388FF]/60 bg-[#4388FF]/16 text-[#F4F7FF] shadow-[0_0_12px_rgba(67,136,255,0.2)]'
                : 'border border-[#24344D] bg-[#101A2B] text-[#B5C2D6] hover:border-[#324869] hover:text-[#F4F7FF]'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Measurement Inspector</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('uncertainty_flags')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'uncertainty_flags'
                ? 'border border-[#4388FF]/60 bg-[#4388FF]/16 text-[#F4F7FF] shadow-[0_0_12px_rgba(67,136,255,0.2)]'
                : 'border border-[#24344D] bg-[#101A2B] text-[#B5C2D6] hover:border-[#324869] hover:text-[#F4F7FF]'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Uncertainties &amp; Flags</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ledger_provenance')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'ledger_provenance'
                ? 'border border-[#4388FF]/60 bg-[#4388FF]/16 text-[#F4F7FF] shadow-[0_0_12px_rgba(67,136,255,0.2)]'
                : 'border border-[#24344D] bg-[#101A2B] text-[#B5C2D6] hover:border-[#324869] hover:text-[#F4F7FF]'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Ledger &amp; Provenance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('multi_epoch_hypotheses')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'multi_epoch_hypotheses'
                ? 'border border-[#4388FF]/60 bg-[#4388FF]/16 text-[#F4F7FF] shadow-[0_0_12px_rgba(67,136,255,0.2)]'
                : 'border border-[#24344D] bg-[#101A2B] text-[#B5C2D6] hover:border-[#324869] hover:text-[#F4F7FF]'
            }`}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Multi-Epoch &amp; Hypotheses</span>
          </button>
        </div>

        {/* 7. Active Workspace Content */}
        {evidence.candidates.length === 0 ? (
          <div className="space-y-6">
            <EvidenceEmptyState targetId={evidence.targetId} />
            {completeBundle && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ProvenanceInspector lineage={completeBundle.provenance} />
                <UncertaintyExplorer
                  uncertainties={completeBundle.uncertainties}
                  unknowns={evidence.summary.what_remains_unknown}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* View A: Candidate & Cutouts */}
            {(activeTab === 'overview' || activeTab === 'candidate_cutouts') && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left Column: Visual Map & Specifications (7 cols) */}
                <div className="flex flex-col gap-6 lg:col-span-7">
                  <CandidateImageOverlay
                    imageUrl={evidence.differenceImage}
                    region={evidence.region}
                    candidate={selectedCandidate}
                    targetTitle={evidence.targetTitle}
                  />
                  <CandidateDetail candidate={selectedCandidate} />
                  <MeasurementChart measurements={selectedCandidate?.measurements ?? []} />
                </div>

                {/* Right Column: Candidates List (5 cols) */}
                <div className="flex flex-col gap-6 lg:col-span-5">
                  <CandidateList
                    candidates={evidence.candidates}
                    selectedId={selectedId}
                    onSelectCandidate={selectCandidate}
                  />
                  {completeBundle?.interpretations && (
                    <EvidenceInterpretationPanel
                      interpretations={completeBundle.interpretations}
                    />
                  )}
                </div>
              </div>
            )}

            {/* View B: Structured Measurement Inspector */}
            {(activeTab === 'overview' || activeTab === 'measurements') && (
              <div>
                {completeBundle?.measurements && (
                  <MeasurementInspector measurements={completeBundle.measurements} />
                )}
              </div>
            )}

            {/* View C: Uncertainty Explorer & Quality Flags */}
            {(activeTab === 'overview' || activeTab === 'uncertainty_flags') && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  {completeBundle?.uncertainties && (
                    <UncertaintyExplorer
                      uncertainties={completeBundle.uncertainties}
                      unknowns={selectedCandidate?.unknowns ?? evidence.summary.what_remains_unknown}
                    />
                  )}
                </div>
                <div className="lg:col-span-5">
                  <QualityFlagPanel flags={qualityFlagsList} />
                </div>
              </div>
            )}

            {/* View D: Evidence Ledger & End-to-End Provenance */}
            {(activeTab === 'overview' || activeTab === 'ledger_provenance') && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-6">
                  {completeBundle?.ledger && (
                    <EvidenceLedger
                      entries={completeBundle.ledger}
                      availableEpochIds={selectedEpochIds}
                    />
                  )}
                </div>
                <div className="lg:col-span-6">
                  {completeBundle?.provenance && (
                    <ProvenanceInspector lineage={completeBundle.provenance} />
                  )}
                </div>
              </div>
            )}

            {/* View E: Multi-Epoch Temporal Integration & Hypotheses */}
            {(activeTab === 'overview' || activeTab === 'multi_epoch_hypotheses') && (
              <div className="space-y-6">
                <MultiEpochEvidencePanel
                  targetId={evidence.targetId}
                  targetTitle={evidence.targetTitle}
                  observations={observations}
                  selectedEpochIds={selectedEpochIds}
                  earlierId={earlierId}
                  laterId={laterId}
                />
                {activeTab === 'multi_epoch_hypotheses' && completeBundle?.interpretations && (
                  <EvidenceInterpretationPanel
                    interpretations={completeBundle.interpretations}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* 8. Scientific Investigation Synthesis & Export / Step 6 CTA */}
        <InvestigationSummary
          summary={evidence.summary}
          targetId={evidence.targetId}
          targetTitle={evidence.targetTitle}
          comparisonJobId={evidence.comparisonJobId}
          selectedCandidateId={selectedId}
          earlierObsId={earlierId}
          laterObsId={laterId}
          pairGrade={activePairGrade}
          differenceImage={evidence.differenceImage}
          isPoorGrade={isPoorGrade}
          completeBundle={completeBundle}
        />

        {/* Bottom Navigation Link */}
        <div className="pt-2 text-center">
          <Link
            to={`/temporal-analysis/${evidence.targetId}${pairQueryString}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Temporal Analysis Lab ({evidence.targetId})</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
