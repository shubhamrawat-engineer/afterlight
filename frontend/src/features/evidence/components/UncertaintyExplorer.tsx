import { HelpCircle, AlertTriangle, CheckCircle2, ShieldAlert, Info } from 'lucide-react';
import type { UncertaintyBreakdown, UncertaintyCategoryItem } from '../types/evidence.types';

interface UncertaintyExplorerProps {
  uncertainties: UncertaintyBreakdown;
  unknowns?: string[];
  className?: string;
}

function UncertaintyMetricCard({ item }: { item: UncertaintyCategoryItem }) {
  const isAvailable = item.status === 'AVAILABLE' && item.value !== null;
  const isPending = item.status === 'PENDING_BACKEND' || item.value === null;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">
            {item.categoryName}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold ${
              isAvailable
                ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                : isPending
                  ? 'border-amber-500/40 bg-amber-950/60 text-amber-300'
                  : 'border-slate-700 bg-slate-900 text-slate-400'
            }`}
          >
            {isAvailable ? (
              <CheckCircle2 className="h-2.5 w-2.5" />
            ) : isPending ? (
              <AlertTriangle className="h-2.5 w-2.5" />
            ) : (
              <HelpCircle className="h-2.5 w-2.5" />
            )}
            <span>{isAvailable ? '1σ CALIBRATED' : item.status.replace('_', ' ')}</span>
          </span>
        </div>

        {/* Metric Value */}
        <div className="mt-2 rounded-lg bg-slate-900/60 p-2.5 border border-slate-800/80">
          {isAvailable ? (
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-base font-extrabold text-blue-300">
                  ± {item.value}
                </span>
                <span className="font-mono text-xs text-slate-400">{item.unit}</span>
              </div>
              <span className="text-[10px] text-emerald-300/80 block">
                1σ calibrated statistical confidence interval (Gaia DR3 / CALSPEC tie).
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-300/90 text-xs font-mono">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span>Uncertainty not available — backend validation required.</span>
            </div>
          )}
        </div>
      </div>

      {/* Method & Epistemic Notes */}
      <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
        <p className="leading-snug">
          <strong className="text-slate-300">Evaluation Method:</strong> {item.method}
        </p>
        <p className="text-[10px] text-slate-500 leading-snug">{item.notes}</p>
      </div>
    </div>
  );
}

export function UncertaintyExplorer({
  uncertainties,
  unknowns = [],
  className,
}: UncertaintyExplorerProps) {
  const items: UncertaintyCategoryItem[] = [
    uncertainties.statistical,
    uncertainties.calibration,
    uncertainties.background,
    uncertainties.astrometric,
    uncertainties.instrumental,
    uncertainties.processing,
  ];

  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.9)] p-5 backdrop-blur-xl shadow-xl space-y-5 ${
        className ?? ''
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <HelpCircle className="h-5 w-5 text-rose-400" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Uncertainty Explorer &amp; Epistemic Limits
            </h3>
            <p className="text-[11px] text-slate-400">
              Breakdown of observational, instrumental, and processing error budgets
            </p>
          </div>
        </div>
        <span className="rounded-full border border-rose-500/30 bg-rose-950/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-rose-300">
          ERROR BUDGET
        </span>
      </div>

      {/* Plain English Guide Banner */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-2">
        <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
          <Info className="h-4 w-4 shrink-0" />
          <span>💡 In Simple Terms: How To Read These Uncertainty Budgets</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Every space telescope has tiny measurement limits (like camera sensor static, passing space dust, or slight photo vibrations). Before we can claim a true discovery (such as a new moving planet or exploding star), the object's signal must be at least <strong className="text-white">5 times stronger (5σ)</strong> than all of these combined error sources!
        </p>
      </div>

      {/* Core Scientific Principle Notice */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>A visible difference is not automatically an astrophysical discovery.</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Flux residuals in astronomical image subtraction can arise from multiple non-astrophysical mechanisms, including slight sub-pixel astrometric misalignment, point spread function (PSF) kernel convolution mismatches, passband chromatic differences, or cosmic ray persistence.
        </p>
      </div>

      {/* Metric Breakdown Grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <UncertaintyMetricCard key={item.id} item={item} />
        ))}
      </div>

      {/* Missing Uncertainty Information & Unresolved Questions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 pt-2 border-t border-slate-800/80">
        {/* Missing uncertainty notes */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Missing Uncertainty Information:</span>
          </h4>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-400">
            {uncertainties.missingNotes.map((note, i) => (
              <li key={i} className="leading-relaxed">
                {note}
              </li>
            ))}
          </ul>
        </div>

        {/* Unresolved scientific questions */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-rose-400" />
            <span>Unresolved Epistemic Questions:</span>
          </h4>
          {unknowns.length === 0 ? (
            <p className="text-xs text-slate-500">
              No specific candidate unknowns cataloged for this target.
            </p>
          ) : (
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
              {unknowns.map((u, i) => (
                <li key={i} className="leading-relaxed">
                  {u}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
