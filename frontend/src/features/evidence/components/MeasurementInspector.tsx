import { useState } from 'react';
import {
  Activity,
  Compass,
  Rainbow,
  Clock,
  Layers,
  Info,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import type {
  CategorizedMeasurements,
  MeasurementValidationStatus,
} from '../types/measurement.types';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';

interface MeasurementInspectorProps {
  measurements: CategorizedMeasurements;
  className?: string;
}

type CategoryTab = 'all' | 'photometric' | 'astrometric' | 'spectral' | 'temporal';

function getValidationBadge(status: MeasurementValidationStatus) {
  switch (status) {
    case 'AVAILABLE':
      return {
        badgeClass: 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300',
        icon: CheckCircle2,
        label: '1σ CALIBRATED',
      };
    case 'PENDING_VALIDATION':
      return {
        badgeClass: 'border-amber-500/40 bg-amber-950/60 text-amber-300',
        icon: AlertTriangle,
        label: 'PENDING VALIDATION',
      };
    case 'INCOMPLETE':
      return {
        badgeClass: 'border-rose-500/40 bg-rose-950/60 text-rose-300',
        icon: AlertTriangle,
        label: 'INCOMPLETE',
      };
    case 'NOT_AVAILABLE':
    default:
      return {
        badgeClass: 'border-slate-700 bg-slate-900 text-slate-400',
        icon: HelpCircle,
        label: 'NOT AVAILABLE',
      };
  }
}

export function MeasurementInspector({ measurements, className }: MeasurementInspectorProps) {
  const [activeTab, setActiveTab] = useState<CategoryTab>('all');

  const totalCount =
    measurements.photometric.length +
    measurements.astrometric.length +
    measurements.spectral.length +
    measurements.temporal.length;

  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.9)] p-5 backdrop-blur-xl shadow-xl space-y-5 ${
        className ?? ''
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Activity className="h-5 w-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Scientific Measurement Inspector
            </h3>
            <p className="text-[11px] text-slate-400">
              Structured inspection across Photometric, Astrometric, Spectral, and Temporal domains
            </p>
          </div>
        </div>
        <DemonstrationDataBadge variant="compact" label="MOCK MEASUREMENTS" />
      </div>

      {/* Epistemic disclaimer */}
      <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 px-3.5 py-2.5 text-[11px] text-amber-200/90 leading-relaxed">
        <strong>Scientific Rigour Notice:</strong> Quantitative measurements below are structured demonstration fixtures. Missing parameters are explicitly marked; no measurements or uncertainty bars are fabricated.
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>All Measurements ({totalCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('photometric')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'photometric'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Activity className="h-3.5 w-3.5 text-blue-400" />
          <span>Photometric ({measurements.photometric.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('astrometric')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'astrometric'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Compass className="h-3.5 w-3.5 text-emerald-400" />
          <span>Astrometric ({measurements.astrometric.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('spectral')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'spectral'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Rainbow className="h-3.5 w-3.5 text-purple-400" />
          <span>Spectral ({measurements.spectral.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('temporal')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'temporal'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Clock className="h-3.5 w-3.5 text-amber-400" />
          <span>Temporal ({measurements.temporal.length})</span>
        </button>
      </div>

      {/* Measurement Panels */}
      <div className="space-y-6">
        {/* A. Photometric Section */}
        {(activeTab === 'all' || activeTab === 'photometric') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
              <Activity className="h-4 w-4" />
              <span>A. Photometric Measurements</span>
            </div>
            <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
              {measurements.photometric.map((m) => {
                const status = getValidationBadge(m.validationStatus);
                const StatusIcon = status.icon;
                return (
                  <div
                    key={m.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400">{m.label}</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold ${status.badgeClass}`}
                        >
                          <StatusIcon className="h-2.5 w-2.5" />
                          <span>{status.label}</span>
                        </span>
                      </div>
                      <h4 className="font-mono text-xs font-bold text-slate-100 mt-0.5">
                        {m.parameter}
                      </h4>
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-900/60 p-2.5 border border-slate-800/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Measured Flux</span>
                        <span className="font-mono font-bold text-blue-300">
                          {m.flux !== null ? `${m.flux} ${m.fluxUnit}` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Uncertainty (1σ)</span>
                        <span className="font-mono font-bold text-slate-200">
                          {m.fluxUncertainty !== null ? `± ${m.fluxUncertainty} ${m.fluxUnit}` : 'Pending validation'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">SNR</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {m.snr !== null ? `${m.snr}σ` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
                      <div className="flex justify-between">
                        <span>Background Level:</span>
                        <span className="font-mono text-slate-300">
                          {m.backgroundLevel !== null ? `${m.backgroundLevel} ${m.backgroundUnit}` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Calibration:</span>
                        <span className="font-mono text-slate-300 text-right">{m.calibrationStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aperture Metadata:</span>
                        <span className="font-mono text-slate-300 text-right">
                          r = {m.apertureRadiusArcsec ?? 'N/A'}″ ({m.apertureMethod})
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Source Obs / Provenance:</span>
                        <span className="font-mono text-right">{m.sourceObsId} · {m.provenance}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* B. Astrometric Section */}
        {(activeTab === 'all' || activeTab === 'astrometric') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Compass className="h-4 w-4" />
              <span>B. Astrometric Measurements</span>
            </div>
            <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
              {measurements.astrometric.map((m) => {
                const status = getValidationBadge(m.validationStatus);
                const StatusIcon = status.icon;
                return (
                  <div
                    key={m.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400">{m.label}</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold ${status.badgeClass}`}
                        >
                          <StatusIcon className="h-2.5 w-2.5" />
                          <span>{status.label}</span>
                        </span>
                      </div>
                      <h4 className="font-mono text-xs font-bold text-slate-100 mt-0.5">
                        {m.parameter}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-900/60 p-2.5 border border-slate-800/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Coordinates (RA / Dec)</span>
                        <span className="font-mono font-bold text-emerald-300">
                          {m.raDeg !== null && m.decDeg !== null
                            ? `RA ${m.raDeg.toFixed(4)}°, Dec ${m.decDeg.toFixed(4)}°`
                            : 'Relative offset analysis'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Positional Uncertainty</span>
                        <span className="font-mono font-bold text-slate-200">
                          {m.positionalUncertaintyArcsec !== null
                            ? `± ${m.positionalUncertaintyArcsec} arcsec`
                            : 'Uncertainty not available'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
                      <div className="flex justify-between">
                        <span>Reference Frame:</span>
                        <span className="font-mono text-slate-300">{m.coordinateFrame}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Registration Status:</span>
                        <span className="font-mono text-slate-300">{m.registrationStatus}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Epoch / Provenance:</span>
                        <span className="font-mono text-right">{m.observationEpoch} · {m.provenance}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* C. Spectral Section */}
        {(activeTab === 'all' || activeTab === 'spectral') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
              <Rainbow className="h-4 w-4" />
              <span>C. Spectral Measurements</span>
            </div>
            <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
              {measurements.spectral.map((m) => {
                const status = getValidationBadge(m.validationStatus);
                const StatusIcon = status.icon;
                return (
                  <div
                    key={m.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400">{m.label}</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold ${status.badgeClass}`}
                        >
                          <StatusIcon className="h-2.5 w-2.5" />
                          <span>{status.label}</span>
                        </span>
                      </div>
                      <h4 className="font-mono text-xs font-bold text-slate-100 mt-0.5">
                        {m.parameter}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-900/60 p-2.5 border border-slate-800/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Wavelength (λ)</span>
                        <span className="font-mono font-bold text-purple-300">
                          {m.wavelengthUm !== null ? `${m.wavelengthUm} μm` : 'Not extracted'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Flux Density</span>
                        <span className="font-mono font-bold text-slate-200">
                          {m.spectralFluxDensity !== null
                            ? `${m.spectralFluxDensity} ${m.fluxDensityUnit}`
                            : 'Not available'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
                      <div className="flex justify-between">
                        <span>Passband:</span>
                        <span className="font-mono text-slate-300">{m.passbandLabel} ({m.passbandRangeUm})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Detector Array / Position:</span>
                        <span className="font-mono text-slate-300">
                          {m.detectorArray}
                          {m.pixelPosition ? ` · (${m.pixelPosition.x}, ${m.pixelPosition.y})` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Spectral Response:</span>
                        <span className="font-mono">
                          {m.spectralResponseAvailable ? 'Available (Linear Variable Filter)' : 'Not available'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* D. Temporal Section */}
        {(activeTab === 'all' || activeTab === 'temporal') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Clock className="h-4 w-4" />
              <span>D. Temporal Measurements</span>
            </div>
            <div className="space-y-3.5">
              {measurements.temporal.map((m) => {
                const status = getValidationBadge(m.validationStatus);
                const StatusIcon = status.icon;
                return (
                  <div
                    key={m.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400">{m.label}</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold ${status.badgeClass}`}
                        >
                          <StatusIcon className="h-2.5 w-2.5" />
                          <span>{status.label}</span>
                        </span>
                      </div>
                      <h4 className="font-mono text-xs font-bold text-slate-100 mt-0.5">
                        {m.parameter}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-2 rounded-lg bg-slate-900/60 p-2.5 border border-slate-800/80 sm:grid-cols-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Baseline Interval</span>
                        <span className="font-mono font-bold text-amber-300">
                          {m.timeIntervalDays !== null ? `${m.timeIntervalDays} days (Δt)` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Survey Span</span>
                        <span className="font-mono font-bold text-slate-200">
                          {m.baselineDurationDays !== null ? `${m.baselineDurationDays} days` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Epoch Count</span>
                        <span className="font-mono font-bold text-slate-200">
                          {m.associatedEpochCount} observation epochs
                        </span>
                      </div>
                    </div>

                    {/* Multi-Epoch Availability Matrix */}
                    <div className="space-y-1.5 border-t border-slate-800/60 pt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Measurement Availability Across Epochs:
                      </span>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {m.availabilityAcrossEpochs.map((ep) => (
                          <div
                            key={ep.epochId}
                            className={`rounded-lg border p-2 text-xs space-y-0.5 ${
                              ep.available
                                ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                                : 'border-slate-800 bg-slate-900/40 text-slate-500'
                            }`}
                          >
                            <span className="font-bold block text-[11px]">{ep.label}</span>
                            <span className="font-mono text-[9px] block text-slate-400">{ep.date}</span>
                            <span className="text-[10px] block">
                              {ep.available ? '✓ Measured' : 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
