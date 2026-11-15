import { Lightbulb, CheckCircle2, XCircle, HelpCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import type {
  StructuredInterpretation,
  ExplanationCategory,
} from '../types/evidence.types';

interface EvidenceInterpretationPanelProps {
  interpretations: StructuredInterpretation[];
  className?: string;
}

function getCategoryBadge(category: ExplanationCategory) {
  switch (category) {
    case 'astrophysical':
      return {
        badgeClass: 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300',
        label: 'ASTROPHYSICAL',
      };
    case 'instrumental':
      return {
        badgeClass: 'border-rose-500/40 bg-rose-950/60 text-rose-300',
        label: 'INSTRUMENTAL ARTIFACT',
      };
    case 'calibration':
      return {
        badgeClass: 'border-amber-500/40 bg-amber-950/60 text-amber-300',
        label: 'CALIBRATION DIFFERENCE',
      };
    case 'background':
      return {
        badgeClass: 'border-yellow-500/40 bg-yellow-950/60 text-yellow-300',
        label: 'BACKGROUND VARIATION',
      };
    case 'registration':
      return {
        badgeClass: 'border-purple-500/40 bg-purple-950/60 text-purple-300',
        label: 'ASTROMETRIC MISALIGNMENT',
      };
    case 'insufficient_evidence':
    default:
      return {
        badgeClass: 'border-slate-700 bg-slate-900 text-slate-300',
        label: 'INSUFFICIENT EVIDENCE',
      };
  }
}

export function EvidenceInterpretationPanel({
  interpretations,
  className,
}: EvidenceInterpretationPanelProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.9)] p-5 backdrop-blur-xl shadow-xl space-y-5 ${
        className ?? ''
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Scientific Evidence Interpretations &amp; Working Hypotheses
            </h3>
            <p className="text-[11px] text-slate-400">
              Evaluated candidate explanations with supporting, contradicting, and missing evidence
            </p>
          </div>
        </div>

        <span className="rounded-full border border-amber-500/30 bg-amber-950/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-300">
          {interpretations.length} Hypotheses
        </span>
      </div>

      {/* Epistemic boundary notice */}
      <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 px-3.5 py-2.5 text-[11px] text-amber-200/90 flex items-start gap-2.5">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Scientific Interpretation Boundary:</strong> The candidate models below are scientific working hypotheses evaluated against current data. They are not automated diagnoses, and no invented probabilities or confidence scores are assigned.
        </p>
      </div>

      {/* Interpretations List */}
      <div className="space-y-4">
        {interpretations.map((item) => {
          const badge = getCategoryBadge(item.category);

          return (
            <div
              key={item.id}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 shadow-sm"
            >
              {/* Title & Category Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                <span
                  className={`rounded border px-2 py-0.5 text-[9px] font-extrabold uppercase ${badge.badgeClass}`}
                >
                  {badge.label}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {item.description}
              </p>

              {/* 4 Quadrants: Supporting, Contradicting, Missing, Required Validation */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1 text-xs">
                {/* Supporting Evidence */}
                <div className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-3 space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Supporting Evidence:</span>
                  </span>
                  {item.supportingEvidence.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No direct positive evidence found.</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                      {item.supportingEvidence.map((s, idx) => (
                        <li key={idx} className="leading-snug">{s}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Contradicting Evidence */}
                <div className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-3 space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-rose-400">
                    <XCircle className="h-3 w-3" />
                    <span>Contradicting Evidence / Discrepancies:</span>
                  </span>
                  {item.contradictingEvidence.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No direct conflicting observations identified.</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                      {item.contradictingEvidence.map((c, idx) => (
                        <li key={idx} className="leading-snug">{c}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Missing Information */}
                <div className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-3 space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-amber-400">
                    <HelpCircle className="h-3 w-3" />
                    <span>Missing Information:</span>
                  </span>
                  {item.missingInformation.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No critical missing parameters noted.</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                      {item.missingInformation.map((m, idx) => (
                        <li key={idx} className="leading-snug">{m}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Additional Validation Required */}
                <div className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-3 space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-blue-400">
                    <ArrowRight className="h-3 w-3" />
                    <span>Additional Scientific Validation Required:</span>
                  </span>
                  {item.additionalValidationRequired.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">Standard survey monitoring sufficient.</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                      {item.additionalValidationRequired.map((v, idx) => (
                        <li key={idx} className="leading-snug">{v}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
