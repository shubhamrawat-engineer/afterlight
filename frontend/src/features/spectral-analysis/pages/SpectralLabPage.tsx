import { useParams } from 'react-router-dom';
import { useSpectralData } from '../hooks/useSpectralData';
import { useSpectralComparison } from '../hooks/useSpectralComparison';
import { SpectralLabHeader } from '../components/SpectralLabHeader';
import { SpectralChart } from '../components/SpectralChart';
import { SpectralLegend } from '../components/SpectralLegend';
import { SpectralComparisonControls } from '../components/SpectralComparisonControls';
import { WavelengthMetadata } from '../components/WavelengthMetadata';
import { SpectralMeasurementPanel } from '../components/SpectralMeasurementPanel';
import { SpectralMeasurementTable } from '../components/SpectralMeasurementTable';
import { SpectralExplanation } from '../components/SpectralExplanation';
import { SpectralProvenance } from '../components/SpectralProvenance';
import { SpectralEmptyState } from '../components/SpectralEmptyState';
import { SpectralErrorState } from '../components/SpectralErrorState';
import { LoadingIndicator } from '../../../components/common/LoadingIndicator';
import { AlertCircle } from 'lucide-react';

export function SpectralLabPage() {
  const { targetId } = useParams<{ targetId: string }>();

  const {
    record,
    selectedPoint,
    setSelectedPoint,
    isLoading,
    error,
    isFallback,
    refetch,
  } = useSpectralData(targetId);

  const {
    mode,
    setMode,
    activeEpochIndex,
    setActiveEpochIndex,
    activeProfiles,
    isCompatible,
    hiddenEpochIds,
    toggleEpochVisibility,
    toggleNextEpoch,
  } = useSpectralComparison(record?.profiles ?? []);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-var(--navbar-height))] items-center justify-center bg-[#070B14]">
        <LoadingIndicator
          size="lg"
          message={`Loading SPHEREx demonstration spectral fixtures for ${targetId ?? 'target'}...`}
        />
      </div>
    );
  }

  if (error && !record) {
    return (
      <div className="min-h-[calc(100vh-var(--navbar-height))] bg-[#070B14] py-8 sm:py-10">
        <SpectralErrorState message={error} targetId={targetId} onRetry={refetch} />
      </div>
    );
  }

  if (!record || !record.profiles || record.profiles.length === 0) {
    return (
      <div className="min-h-[calc(100vh-var(--navbar-height))] bg-[#070B14] py-8 sm:py-10">
        <div
          className="mx-auto flex flex-col gap-6 px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: 'var(--content-max-width)' }}
        >
          <SpectralEmptyState targetId={targetId ?? 'unknown'} />
        </div>
      </div>
    );
  }

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
        {/* 1. Header with Target Identity, Passband Specs, and Navigation */}
        <SpectralLabHeader
          targetId={record.target_id}
          targetTitle={record.target_title}
          targetKind={record.target_kind}
          status={record.status}
          wavelengthRange={record.supported_wavelength_range}
          profileCount={record.profiles.length}
        />

        {/* Fallback Notice if using local fixtures */}
        {isFallback && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-[#131F33] px-4 py-2.5 text-xs text-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>
              Demonstration fixture mode: displayed spectral energy distributions are client-side reference fixtures pending backend pipeline integration.
            </span>
          </div>
        )}

        {/* 2. Comparison Controls & Series Legend */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5 backdrop-blur-xl shadow-lg">
          <SpectralComparisonControls
            mode={mode}
            onModeChange={setMode}
            profiles={record.profiles}
            activeEpochIndex={activeEpochIndex}
            onSelectEpochIndex={setActiveEpochIndex}
            onToggleNextEpoch={toggleNextEpoch}
            isCompatible={isCompatible}
          />

          <SpectralLegend
            profiles={record.profiles}
            hiddenEpochIds={hiddenEpochIds}
            onToggleEpoch={toggleEpochVisibility}
          />
        </div>

        {/* 3. Flagship Interactive Scientific Chart */}
        <SpectralChart
          profiles={activeProfiles}
          onSelectPoint={(profile, point) => setSelectedPoint({ profile, point })}
          selectedPoint={selectedPoint}
        />

        {/* 4. Measurement Inspector & Wavelength Metadata (Two Columns) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Channel Point Inspector */}
          <SpectralMeasurementPanel selectedPoint={selectedPoint} />

          {/* Wavelength & Instrument Configuration Metadata */}
          <WavelengthMetadata profiles={record.profiles} />
        </div>

        {/* 5. Scientific Principles & Data Provenance */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SpectralExplanation />
          <SpectralProvenance provenance={record.provenance} />
        </div>

        {/* 6. Expandable Tabular Measurement Inventory */}
        <SpectralMeasurementTable
          profiles={activeProfiles}
          onSelectPoint={(profile, point) => setSelectedPoint({ profile, point })}
          selectedPoint={selectedPoint}
        />
      </div>
    </div>
  );
}
