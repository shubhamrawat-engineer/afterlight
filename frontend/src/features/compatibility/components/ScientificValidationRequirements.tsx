import {
  ShieldAlert,
  AlertTriangle,
  Layers,
  Sparkles,
  Compass,
  Radio,
  HelpCircle,
  Sliders,
} from 'lucide-react';
import { COMPATIBILITY_THRESHOLDS } from '../config/compatibility-thresholds';

interface ScientificValidationRequirementsProps {
  className?: string;
}

export function ScientificValidationRequirements({
  className,
}: ScientificValidationRequirementsProps) {
  return (
    <div
      className={`rounded-2xl border border-amber-500/40 bg-[rgba(16,12,6,0.85)] p-6 backdrop-blur-xl shadow-xl space-y-5 ${className ?? ''}`}
      aria-labelledby="scientific-validation-requirements-heading"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-950/60 text-amber-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Scientific Boundaries &amp; Rigor
            </span>
            <h3
              id="scientific-validation-requirements-heading"
              className="text-lg font-bold text-white tracking-tight"
            >
              Scientific Validation Requirements
            </h3>
          </div>
        </div>

        <span className="rounded-md border border-amber-500/40 bg-amber-950/80 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-300">
          MANDATORY PRE-SUBTRACTION CRITERIA
        </span>
      </div>

      {/* Primary Caveat Lead */}
      <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
        Preliminary metadata checks do not establish verified scientific compatibility. In astronomical surveys like SPHEREx, valid difference photometry and candidate extraction require rigorous physical and mathematical prerequisites that cannot be substituted by client-side filtering.
      </p>

      {/* Grid of the 6 Core Scientific Rules */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 text-xs">
        {/* 1. WCS Alignment */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold">
            <Compass className="h-4 w-4 shrink-0" />
            <span>WCS Sub-Pixel Alignment</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Relative astrometric registration must be solved with an RMS precision below 0.20 arcseconds. Any bulk translation, rotation, or optical distortion will manifest as false positive dipole residuals across every star in the cutout.
          </p>
        </div>

        {/* 2. PSF Matching */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold">
            <Layers className="h-4 w-4 shrink-0" />
            <span>PSF Homogenisation Kernel</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Point spread functions vary across telescope epochs due to jitter, thermal focus breathing, and detector mapping. One epoch must be mathematically convolved using an empirical kernel (e.g. Alard-Lupton) before image subtraction is valid.
          </p>
        </div>

        {/* 3. Background & Calibration Differences */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>Background &amp; Zero-Point Matching</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Infrared zodiacal light background levels fluctuate seasonally. Fluxes must be scaled to an identical physical zero point; subtracting images with mismatched background offsets produces systematic gradient artifacts.
          </p>
        </div>

        {/* 4. Instrumental & Processing Effects */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Artifact vs. Astrophysical Change</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Visible residuals often stem from cosmic ray hits, persistence, bad pixel masks, or optical reflections. A visible brightness change cannot be assumed to be astrophysical without cross-band validation and multi-pass persistence checks.
          </p>
        </div>

        {/* 5. Missing Metadata Impact */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span>Missing Metadata Constraints</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            When instrumental uncertainty arrays or calibration provenance records are absent, quantitative signal-to-noise ratios cannot be claimed. Researchers must not quote confidence intervals without error propagation planes.
          </p>
        </div>

        {/* 6. Difference != Detection */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold">
            <Radio className="h-4 w-4 shrink-0" />
            <span>Residual != Detection</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            A difference-image residual is merely a statistical hypothesis. Formal transient classification requires photometric significance exceeding 5-sigma, absence of detector flags, and spectroscopic or temporal follow-up.
          </p>
        </div>
      </div>

      {/* Configurable SPHEREx Thresholds & Epistemic Boundaries */}
      <div className="rounded-xl border border-amber-500/30 bg-slate-950/90 p-4.5 space-y-3 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Sliders className="h-4 w-4 text-amber-400" />
            <span>Configurable SPHEREx Thresholds &amp; Instrument Assumptions</span>
          </div>
          <span className="rounded bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono text-amber-300">
            SPHEREx DR1 MISSION COMPATIBILITY STANDARDS
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          The following parameters govern client-side compatibility triage in AFTERLIGHT. These values are calibration heuristics and must not be interpreted as universal SPHEREx mission limits:
        </p>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          {Object.values(COMPATIBILITY_THRESHOLDS).map((thresh) => (
            <div
              key={thresh.id}
              className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 text-[11px] truncate max-w-[170px]" title={thresh.name}>
                  {thresh.name}
                </span>
                <span className="font-mono font-bold text-amber-300 text-[11px]">
                  {thresh.value} {thresh.unit}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                {thresh.purpose}
              </p>
              <span className="inline-block rounded bg-slate-800/80 px-1.5 py-0.2 text-[9px] font-mono text-slate-400">
                {thresh.isDemonstrationAssumption ? 'Operational Heuristic' : 'Mission Parameter'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
