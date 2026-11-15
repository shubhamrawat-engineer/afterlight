import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Compass, Layers, Bot } from 'lucide-react';
import { useTargetDetail } from '../hooks/useTargetDetail';
import { StatusBadge } from '../components/StatusBadge';
import { formatTargetKind } from '../utils/formatters';
import { RegionViewer } from '../components/RegionViewer';
import { RegionMetadata } from '../components/RegionMetadata';
import { ObservationSummary } from '../components/ObservationSummary';
import { PairQualityBadge } from '../components/PairQualityBadge';
import { ExplorerErrorState } from '../components/ExplorerErrorState';
import { LoadingState } from '../../../components/common/LoadingState';
import { InvestigationProgress } from '../../../components/common/InvestigationProgress';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';
import { Button } from '../../../components/ui/Button';
import {
  getActiveInvestigationSession,
  saveActiveInvestigationSession,
} from '../../../services/investigation-session';

/**
 * Target Detail Page (/explore/:targetId)
 * Provides comprehensive scientific inspection of a single celestial region:
 * - Astronomical Cutout Interactive Viewer (Pan/Zoom)
 * - Astrometric Coordinate & Geometry Specifications
 * - Registered Observation Records
 * - Multi-epoch Photometric Pair Compatibility Assessment
 * - Primary Action Link to /observations/:targetId (Phase 3)
 */
export function TargetDetailPage() {
  const { targetId } = useParams<{ targetId: string }>();
  const { manifest, isLoading, error, refetch } = useTargetDetail(targetId);

  useEffect(() => {
    if (manifest) {
      saveActiveInvestigationSession({
        targetId: manifest.id,
        targetTitle: manifest.title,
      });
    }
  }, [manifest]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-var(--navbar-height))] items-center justify-center bg-[#070B14] px-4">
        <LoadingState message="Loading astronomical target manifest..." fullHeight />
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
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#45D5F2] hover:text-[#8BB6FF]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Universe Explorer</span>
          </Link>
        </div>
      </div>
    );
  }

  const session = getActiveInvestigationSession();
  const activeEarlierId =
    session?.targetId === manifest.id ? session.earlierObsId : null;
  const activeLaterId =
    session?.targetId === manifest.id ? session.laterObsId : null;

  return (
    <div className="min-h-[calc(100vh-var(--navbar-height))] bg-[#070B14] py-8 sm:py-10">
      <div
        className="mx-auto flex flex-col gap-8 px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--content-max-width)' }}
      >
        {/* 6-Step Core Investigation Journey Progress */}
        <InvestigationProgress
          currentStage="discover"
          targetId={manifest.id}
          targetTitle={manifest.title}
          earlierObsId={activeEarlierId}
          laterObsId={activeLaterId}
        />

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#8293AD]">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Universe Explorer</span>
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-mono">{manifest.id}</span>
        </nav>

        {/* Section 6.A: Region Header */}
        <div className="flex flex-col gap-4 border-b border-[rgba(148,163,184,0.13)] pb-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-page-heading text-slate-100">
                {manifest.title}
              </h1>
              <StatusBadge status={manifest.status} />
              <DemonstrationDataBadge />
              <span className="rounded-md border border-slate-700/60 bg-slate-800/80 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                {formatTargetKind(manifest.kind)}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-blue-400">
              <Compass className="h-4 w-4" />
              <span>Target ID: {manifest.id}</span>
            </div>
          </div>

          {/* Section 7: Prominent Primary Action CTAs */}
          <div className="flex flex-wrap shrink-0 items-center gap-3">
            <Button
              to={`/ai?contextType=target&targetId=${manifest.id}&targetName=${encodeURIComponent(manifest.title)}`}
              variant="secondary"
              size="md"
              leftIcon={<Bot className="h-4 w-4 text-sky-400" />}
            >
              Ask AI about this region
            </Button>

            <Button
              to={`/observations/${manifest.id}`}
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              View Observations
            </Button>
          </div>
        </div>

        {/* Main 2-Column Scientific Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Astronomical Region Viewer (7 cols) */}
          <div className="space-y-6 lg:col-span-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                  Astronomical Cutout Viewer
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Interactive Pan &amp; Zoom
              </span>
            </div>

            {/* Section 6.B: Viewer */}
            <RegionViewer
              imageSrc={manifest.preview_image || manifest.thumbnail}
              title={manifest.title}
              targetId={manifest.id}
              cutoutSize={manifest.region?.cutout_size ?? '0.25° × 0.25°'}
            />

            {/* Section 6.E: Observation Pair Quality Assessment */}
            <PairQualityBadge quality={manifest.pair_quality} />
          </div>

          {/* Right Column: Metadata & Observation Inventory (5 cols) */}
          <div className="space-y-6 lg:col-span-5">
            {/* Section 6.C: Region Metadata */}
            <RegionMetadata region={manifest.region} />

            {/* Section 6.D: Observation Summary */}
            <ObservationSummary observations={manifest.observations} />
          </div>
        </div>
      </div>
    </div>
  );
}
