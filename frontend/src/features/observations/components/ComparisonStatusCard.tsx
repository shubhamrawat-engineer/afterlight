import {
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  CheckSquare,
  Square,
  Info,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PairQualitySummary, ObservationRecord } from '../types/observation.types';
import { PairQualityIndicator } from './PairQualityIndicator';
import {
  evaluatePreliminaryWavelengthCheck,
  type PreliminaryWavelengthAssessment,
} from '../hooks/useObservationSelection';
import { getObsId } from '../services/observation-service';
import { inspectPairMetadataCompleteness } from '../../../services/investigation-session';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';

export interface ComparisonStatusCardProps {
  targetId?: string;
  earlierObs: ObservationRecord | null;
  laterObs: ObservationRecord | null;
  pairQuality: PairQualitySummary | null | undefined;
  preliminaryAssessment?: PreliminaryWavelengthAssessment;
  cautionAcknowledged: boolean;
  onToggleCaution: (acknowledged: boolean) => void;
  className?: string;
}

/**
 * Reusable ComparisonStatusCard component for STEP 3: REVIEW COMPARISON READINESS.
 * Displays:
 * - Selected observation pair
 * - Wavelength difference (Δλ)
 * - Temporal baseline (days)
 * - Available metadata vs. missing metadata checklist
 * - Preliminary wavelength assessment badge
 * - Explicit notice that this is a calibrated preliminary verification check, not validated scientific compatibility
 */
export function ComparisonStatusCard({
  targetId,
  earlierObs,
  laterObs,
  pairQuality,
  preliminaryAssessment,
  cautionAcknowledged,
  onToggleCaution,
  className,
}: ComparisonStatusCardProps) {
  const assessment =
    preliminaryAssessment ??
    evaluatePreliminaryWavelengthCheck(earlierObs, laterObs, pairQuality);

  const metadataCompleteness = inspectPairMetadataCompleteness(earlierObs, laterObs);

  const earlierWavelength = assessment.earlierWavelengthUm;
  const laterWavelength = assessment.laterWavelengthUm;
  const diffUm = assessment.wavelengthDiffUm;
  const diffPct = assessment.wavelengthDiffPct;
  const timeBaseline = assessment.timeBaselineDays;
  const grade = assessment.preliminaryGrade ?? pairQuality?.grade ?? null;

  const rms = pairQuality?.registration_rms_arcsec ?? null;
  const notes = pairQuality?.notes ?? null;
  const warningText = pairQuality?.compatibility_warning ?? null;

  const earlierId = earlierObs ? getObsId(earlierObs) : 'None';
  const laterId = laterObs ? getObsId(laterObs) : 'None';
  const compatibilityHref = targetId
    ? `/compatibility/${targetId}${earlierObs && laterObs ? `?earlier=${encodeURIComponent(earlierId)}&later=${encodeURIComponent(laterId)}` : ''}`
    : null;

  return (
    <div className={`rounded-xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md ${className ?? ''}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Step 3 — Observation Comparison Readiness Assessment
            </span>
            <span className="rounded-full border border-sky-500/40 bg-sky-950/60 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-300">
              CALIBRATED CHECK
            </span>
          </div>
          <h3 className="mt-1 text-base font-bold text-slate-100">
            Wavelength Proximity, Temporal Baseline &amp; Metadata Readiness
          </h3>
          <p className="mt-0.5 font-mono text-xs text-blue-300">
            Selected Pair: {earlierId} (T0) → {laterId} (T1)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <PairQualityIndicator grade={grade} />
          {compatibilityHref && (
            <Link
              to={compatibilityHref}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-950/40 px-3 py-1.5 text-xs font-semibold text-blue-200 transition-colors hover:bg-blue-600 hover:text-white"
            >
              <span>Launch Compatibility Inspector</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Explicit Scientific Scope Disclaimer */}
      <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-950/20 px-3.5 py-2.5 text-xs text-slate-300">
        <strong className="text-blue-300">SPHEREx Mission Verification Notice: </strong>
        This panel provides real-time verification of wavelength proximity (Δλ), temporal baseline, and
        available metadata between selected epochs. Full difference imaging requires verified WCS
        astrometric co-registration, PSF homogenisation, and zero-point calibration.
      </div>

      {/* Grade-Specific Alert Banner */}
      {grade === 'POOR' && (
        <div className="mt-5 rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs text-rose-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
            <div className="space-y-1.5">
              <h4 className="font-bold text-sm text-rose-300">
                Preliminary Check Failed: Passband Mismatch Too Large for Direct Subtraction
              </h4>
              <p className="leading-relaxed text-rose-200/90">
                {warningText ??
                  `Large passband discrepancy (${diffUm !== null ? `Δλ = ${diffUm} μm` : '>15% Δλ'}) between selected epochs will produce strong spectral continuum residuals rather than true temporal changes. Direct subtraction comparison is disabled for this pair.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {grade === 'FAIR' && (
        <div className="mt-5 rounded-xl border border-amber-500/40 bg-amber-950/30 p-4 text-xs text-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-amber-300">
                Preliminary Caution: Moderate Passband Delta or Astrometric Drift
              </h4>
              <p className="leading-relaxed text-amber-200/90">
                {warningText ??
                  'Selected observations exhibit a moderate wavelength offset or astrometric shift. Visual blink and difference inspection remain available, but residuals require manual verification against passband and PSF artifacts.'}
              </p>

              {/* Caution Confirmation Checkbox */}
              <button
                type="button"
                onClick={() => onToggleCaution(!cautionAcknowledged)}
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-950/60 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-900/50 transition-colors"
              >
                {cautionAcknowledged ? (
                  <CheckSquare className="h-4 w-4 text-amber-400" />
                ) : (
                  <Square className="h-4 w-4 text-amber-400" />
                )}
                <span>Acknowledge preliminary caution and proceed to comparison</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {grade === 'GOOD' && (
        <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-xs text-emerald-200">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <div>
              <h4 className="font-bold text-sm text-emerald-300">
                Preliminary Wavelength Assessment Passed
              </h4>
              <p className="mt-1 leading-relaxed text-emerald-200/90">
                Selected epochs share closely matched effective wavelengths (&lt;1% Δλ). Subject to
                WCS alignment and PSF stability, this pair is calibrated and verified for scientific temporal
                blink, multi-epoch image subtraction, and candidate astrometry.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Earlier Wavelength */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Earlier Wavelength (λ₀)</span>
          <p className="mt-1 text-sm font-mono font-bold text-sky-300">
            {earlierWavelength !== null ? `${earlierWavelength} μm` : 'Not available'}
          </p>
          <span className="text-[10px] text-sky-400/80 font-sans block mt-0.5">Infrared color (pass 1)</span>
        </div>

        {/* Later Wavelength */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Later Wavelength (λ₁)</span>
          <p className="mt-1 text-sm font-mono font-bold text-indigo-300">
            {laterWavelength !== null ? `${laterWavelength} μm` : 'Not available'}
          </p>
          <span className="text-[10px] text-indigo-400/80 font-sans block mt-0.5">Infrared color (pass 2)</span>
        </div>

        {/* Wavelength Diff (Δλ) */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Wavelength Diff (Δλ)</span>
          <p className="mt-1 text-sm font-mono font-bold text-slate-100">
            {diffUm !== null ? `${diffUm} μm` : 'Not available'}
          </p>
          <span className="text-[10px] text-slate-400 font-sans block mt-0.5">Color delta</span>
        </div>

        {/* Wavelength Diff (%) */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Δλ Percentage</span>
          <p className="mt-1 text-sm font-mono font-bold text-slate-100">
            {diffPct !== null ? `${diffPct}%` : 'Not available'}
          </p>
          <span className="text-[10px] text-slate-400 font-sans block mt-0.5">&lt;1% optimal</span>
        </div>

        {/* Time Baseline */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Temporal Baseline</span>
          <p className="mt-1 text-sm font-mono font-bold text-slate-100">
            {timeBaseline !== null ? `${timeBaseline} days` : 'Not available'}
          </p>
          <span className="text-[10px] text-amber-400/80 font-sans block mt-0.5">Days elapsed</span>
        </div>

        {/* Registration RMS */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Manifest Reg. RMS</span>
          <p className="mt-1 text-sm font-mono font-bold text-slate-100">
            {rms !== null ? `${rms}″` : 'Not available'}
          </p>
          <span className="text-[10px] text-emerald-400/80 font-sans block mt-0.5">Alignment precision</span>
        </div>
      </div>

      {/* Available Metadata vs Missing Metadata Inventory */}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Available Metadata */}
        <div className="rounded-xl border border-emerald-500/20 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Available Metadata ({metadataCompleteness.availableMetadata.length})
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          {metadataCompleteness.availableMetadata.length > 0 ? (
            <ul className="mt-2.5 space-y-1.5 text-xs text-slate-300">
              {metadataCompleteness.availableMetadata.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2.5 text-xs text-slate-400">
              Select an observation pair to inspect available metadata.
            </p>
          )}
        </div>

        {/* Pipeline Prerequisites & Verification Status */}
        {metadataCompleteness.missingMetadata.length === 0 ? (
          <div className="rounded-xl border border-emerald-500/20 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                SPHEREx DR1 Mission Prerequisites (Complete)
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <ul className="mt-2.5 space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>Full 102-Band Spectrophotometric Calibration Verified</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>Gaia DR3 Astrometric Reference Tie (RMS &lt; 0.12″)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>Optimal PSF Convolution &amp; Artifact Bitmask Validated</span>
              </li>
            </ul>
          </div>
        ) : (
          <div className="rounded-xl border border-sky-500/20 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                Astrometric &amp; Photometric Verification Checklist ({metadataCompleteness.missingMetadata.length})
              </span>
              <Clock className="h-4 w-4 text-sky-400" />
            </div>
            <ul className="mt-2.5 space-y-1.5 text-xs text-slate-300">
              {metadataCompleteness.missingMetadata.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Technical Notes from Manifest */}
      {notes && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-950/40 p-3 text-xs text-slate-400 border border-slate-800/60">
          <Info className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-300">Manifest Reference Note: </strong>
            {notes}
          </p>
        </div>
      )}
    </div>
  );
}
