import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Activity, ArrowUpRight, Sparkles } from 'lucide-react';
import { useObjectDetail } from '../hooks/useObjectDetail';
import { ObjectIdentityPanel } from '../components/ObjectIdentityPanel';
import { ObjectMultiEpochViewer } from '../components/ObjectMultiEpochViewer';
import { ObjectCoordinates } from '../components/ObjectCoordinates';
import { TemporalBehaviour } from '../components/TemporalBehaviour';
import { ObservationHistory } from '../components/ObservationHistory';
import { CatalogueMatches } from '../components/CatalogueMatches';
import { RelatedInvestigations } from '../components/RelatedInvestigations';
import { ObjectProvenance } from '../components/ObjectProvenance';
import { ObjectErrorState } from '../components/ObjectErrorState';

export function ObjectDetailPage() {
  const { objectId } = useParams<{ objectId: string }>();
  const { object, isLoading, error, refetch } = useObjectDetail(objectId);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-16 pt-6">
        <div
          className="mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
          style={{ maxWidth: 'var(--content-max-width)' }}
        >
          <div className="h-8 w-40 rounded bg-slate-800 animate-pulse" />
          <div
            className="h-44 rounded-xl border animate-pulse"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              borderColor: 'var(--color-border-primary)',
            }}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className="h-64 rounded-xl border animate-pulse"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border-primary)',
              }}
            />
            <div
              className="h-64 rounded-xl border animate-pulse"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border-primary)',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error || !object) {
    return (
      <div className="min-h-screen pb-16 pt-6">
        <div
          className="mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: 'var(--content-max-width)' }}
        >
          <ObjectErrorState
            message={error || `Object with identifier "${objectId}" could not be located.`}
            onRetry={refetch}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-var(--navbar-height))] bg-[#070B14] pb-16 pt-8">
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
        style={{ maxWidth: 'var(--content-max-width)' }}
      >
        {/* Breadcrumb / Navigation */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            to="/objects"
            className="inline-flex items-center gap-1.5 text-[#8293AD] hover:text-[#F4F7FF] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Object Directory</span>
          </Link>
          <span className="text-[#324869]">/</span>
          <span className="font-mono text-[#45D5F2] font-semibold">{object.id}</span>
        </div>

        {/* Identity & Header Panel */}
        <ObjectIdentityPanel object={object} />

        {/* Multi-Epoch Visual Verification: Epoch 1, Epoch 2, Difference Map, & Blink Ledger */}
        <ObjectMultiEpochViewer object={object} />

        {/* Two-Column Astrometric & Temporal Records */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <ObjectCoordinates
            raDeg={object.ra_deg}
            decDeg={object.dec_deg}
            frame={object.coordinate_frame}
            astrometricRef={object.provenance.astrometric_reference}
          />
          <TemporalBehaviour behaviour={object.temporal_behaviour} />
        </div>

        {/* Observation History */}
        <ObservationHistory
          observations={object.observations}
          targetId={object.target_id}
        />

        {/* Spectral Analysis Integration Banner */}
        {object.has_spectral_data && (
          <div
            className="rounded-xl border p-5 relative overflow-hidden transition-colors"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              borderColor: 'var(--color-border-primary)',
            }}
          >
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-white">
                      SPHEREx Spectral Profile Available (SPHEREx spectral-channel metadata — pending mission-documentation verification)
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      {object.spectral_wavelength_range || '0.75 - 5.00 μm'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Continuous spectrophotometric coverage across 0.75 to 5.00 μm. Inspect spectrophotometric signatures, calibrated line indices, and emission/absorption profiles in the Spectral Analysis Lab.
                  </p>
                </div>
              </div>

              <Link
                to={`/spectral-lab/${object.target_id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md shrink-0 self-start sm:self-auto"
              >
                <span>Open Spectral Lab</span>
                <ArrowUpRight className="w-4 h-4 opacity-80" />
              </Link>
            </div>
          </div>
        )}

        {/* External Catalogue Cross-Matches */}
        <CatalogueMatches matches={object.catalogue_matches} />

        {/* Related Scientific Investigations */}
        <RelatedInvestigations
          investigations={object.related_investigations}
          objectId={object.id}
          targetId={object.target_id}
          targetTitle={object.associated_region}
          earlierObsId={object.observations[0]?.observation_id ?? null}
          laterObsId={object.observations[1]?.observation_id ?? null}
          differenceImage={object.preview_image}
        />

        {/* Provenance & Archival Authority */}
        <ObjectProvenance
          provenance={object.provenance}
          status={object.status}
        />
      </div>
    </div>
  );
}
