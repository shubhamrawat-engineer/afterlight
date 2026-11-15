import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Layers,
  Sparkles,
  Compass,
  Radio,
  FilePlus2,
  Calendar,
} from 'lucide-react';
import { useCompatibility } from '../hooks/useCompatibility';
import { CompatibilityOverview } from '../components/CompatibilityOverview';
import { CompatibilityMatrix } from '../components/CompatibilityMatrix';
import { CompatibilityAssessmentCard } from '../components/CompatibilityAssessmentCard';
import { ScientificValidationRequirements } from '../components/ScientificValidationRequirements';
import { InvestigationProgress } from '../../../components/common/InvestigationProgress';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';
import { LoadingState } from '../../../components/common/LoadingState';
import { ErrorState } from '../../../components/common/ErrorState';
import { Button } from '../../../components/ui/Button';
import type { CompatibilityTask } from '../types/compatibility.types';

export function CompatibilityInspectorPage() {
  const { targetId } = useParams<{ targetId: string }>();
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<CompatibilityTask | 'all'>('all');

  const handleSelectTask = (task: CompatibilityTask | 'all') => {
    setSelectedTaskFilter(task);
    if (task !== 'all') {
      setTimeout(() => {
        const el = document.getElementById(`assessment-${task}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  };

  const {
    dossier,
    manifest,
    rawObservations,
    earlierId,
    laterId,
    setEarlierId,
    setLaterId,
    swapPair,
    isLoading,
    error,
    refetch,
  } = useCompatibility({ targetId });

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-var(--navbar-height))] items-center justify-center bg-[#070B14] px-4">
        <LoadingState
          message={`Evaluating scientific compatibility for ${targetId ?? 'target'}...`}
          fullHeight
        />
      </div>
    );
  }

  if (error || !dossier || !manifest) {
    return (
      <div className="mx-auto min-h-[calc(100vh-var(--navbar-height))] max-w-4xl px-4 py-16">
        <ErrorState
          title="Compatibility Assessment Unavailable"
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

  const queryParams = new URLSearchParams();
  if (earlierId) queryParams.set('earlier', earlierId);
  if (laterId) queryParams.set('later', laterId);
  const qStr = queryParams.toString();
  const pairSuffix = qStr ? `?${qStr}` : '';

  const temporalHref = `/temporal-analysis/${manifest.id}${pairSuffix}`;
  const observationsHref = `/observations/${manifest.id}${pairSuffix}`;
  const evidenceHref = `/evidence/${manifest.id}${pairSuffix}`;
  const isSeverelyIncompatible = dossier.overallStatus === 'INSUFFICIENT_METADATA';

  const taskFilters: Array<{ id: CompatibilityTask | 'all'; label: string; icon?: typeof Eye }> = [
    { id: 'all', label: 'All 5 Scientific Tasks' },
    { id: 'visual', label: 'Visual', icon: Eye },
    { id: 'difference_image', label: 'Difference Image', icon: Layers },
    { id: 'photometric', label: 'Photometric', icon: Sparkles },
    { id: 'astrometric', label: 'Astrometric', icon: Compass },
    { id: 'spectral', label: 'Spectral', icon: Radio },
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
        className="mx-auto flex flex-col gap-8 px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--content-max-width)' }}
      >
        {/* 6-Step Core Investigation Journey Progress */}
        <InvestigationProgress
          currentStage="readiness"
          targetId={manifest.id}
          targetTitle={manifest.title}
          earlierObsId={earlierId}
          laterObsId={laterId}
        />

        {/* SPHEREx Mission Banner */}
        <DemonstrationDataBadge
          variant="banner"
          label="Scientific Compatibility Inspector (SPHEREx Quality Evaluation)"
          description="Compatibility assessments evaluate observational metadata completeness, passband alignment, and task-specific prerequisites for high-precision temporal image differencing."
        />

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Universe Explorer</span>
          </Link>
          <span>/</span>
          <Link
            to={`/observations/${manifest.id}${pairSuffix}`}
            className="hover:text-slate-200 transition-colors"
          >
            Observations ({manifest.id})
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-mono">Compatibility Inspector</span>
        </nav>

        {/* Section 1: Compatibility Overview */}
        <CompatibilityOverview
          dossier={dossier}
          observations={rawObservations}
          onSetEarlier={setEarlierId}
          onSetLater={setLaterId}
          onSwapPair={swapPair}
        />

        {/* Section 4: Comparison Readiness Matrix */}
        <CompatibilityMatrix
          assessments={dossier.assessments}
          onSelectTask={handleSelectTask}
        />

        {/* Section 2 & 3: Task-Specific Detailed Assessments */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Detailed Task Breakdown
              </span>
              <h3 className="text-lg font-bold text-slate-100">
                Task-Specific Scientific Assessments
              </h3>
            </div>

            {/* Task Filters */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
              {taskFilters.map((tf) => (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => handleSelectTask(tf.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                    selectedTaskFilter === tf.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {tf.icon && <tf.icon className="h-3 w-3" />}
                  <span>{tf.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {(selectedTaskFilter === 'all' || selectedTaskFilter === 'visual') && (
              <CompatibilityAssessmentCard
                assessment={dossier.assessments.visual}
                defaultExpanded={selectedTaskFilter === 'visual'}
              />
            )}

            {(selectedTaskFilter === 'all' || selectedTaskFilter === 'difference_image') && (
              <CompatibilityAssessmentCard
                assessment={dossier.assessments.difference_image}
                defaultExpanded={selectedTaskFilter === 'difference_image'}
              />
            )}

            {(selectedTaskFilter === 'all' || selectedTaskFilter === 'photometric') && (
              <CompatibilityAssessmentCard
                assessment={dossier.assessments.photometric}
                defaultExpanded={selectedTaskFilter === 'photometric'}
              />
            )}

            {(selectedTaskFilter === 'all' || selectedTaskFilter === 'astrometric') && (
              <CompatibilityAssessmentCard
                assessment={dossier.assessments.astrometric}
                defaultExpanded={selectedTaskFilter === 'astrometric'}
              />
            )}

            {(selectedTaskFilter === 'all' || selectedTaskFilter === 'spectral') && (
              <CompatibilityAssessmentCard
                assessment={dossier.assessments.spectral}
                defaultExpanded={selectedTaskFilter === 'spectral'}
              />
            )}
          </div>
        </div>

        {/* Section 6: Scientific Limitations */}
        <ScientificValidationRequirements />

        {/* Section 5: Action & Navigation Toolbar */}
        <div className="flex flex-col gap-5 rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-6 backdrop-blur-xl shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Investigation Pathway Navigation
            </span>
            <h4 className="text-base font-bold text-white">
              Proceed with Preserved Investigation Context
            </h4>
            <p className="text-xs text-slate-300 max-w-xl">
              {isSeverelyIncompatible
                ? 'Direct image subtraction is not recommended due to large passband discrepancies. You can still inspect spectral curves or select another pair.'
                : 'Observation pair is ready for multi-epoch temporal comparison, side-by-side inspection, or formal case documentation.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              to={observationsHref}
              variant="secondary"
              size="md"
              leftIcon={<Calendar className="h-4 w-4" />}
            >
              Observation Metadata
            </Button>

            <Button
              to={evidenceHref}
              variant="secondary"
              size="md"
              leftIcon={<Layers className="h-4 w-4" />}
            >
              Review Evidence
            </Button>

            <Button
              to="/investigations/new"
              variant="secondary"
              size="md"
              leftIcon={<FilePlus2 className="h-4 w-4 text-sky-400" />}
            >
              Document Case
            </Button>

            <Button
              to={temporalHref}
              variant="primary"
              size="md"
              disabled={isSeverelyIncompatible}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Temporal Analysis Lab
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
