import { Lightbulb } from 'lucide-react';
import type { PossibleExplanation, ExplanationLikelihood } from '../types/evidence.types';

interface PossibleExplanationsProps {
  explanations: PossibleExplanation[];
  className?: string;
}

function getLikelihoodBadge(likelihood: ExplanationLikelihood) {
  switch (likelihood) {
    case 'PLAUSIBLE':
      return {
        bg: 'bg-emerald-950 border-emerald-500/40 text-emerald-300',
        label: 'PLAUSIBLE HYPOTHESIS',
      };
    case 'CONSIDERED':
      return {
        bg: 'bg-amber-950 border-amber-500/40 text-amber-300',
        label: 'CONSIDERED ALTERNATIVE',
      };
    case 'UNLIKELY':
      return {
        bg: 'bg-slate-900 border-slate-700 text-slate-400',
        label: 'UNLIKELY / RULED OUT',
      };
    default:
      return {
        bg: 'bg-blue-950 border-blue-500/40 text-blue-300',
        label: 'HYPOTHESIS',
      };
  }
}

export function PossibleExplanations({ explanations, className }: PossibleExplanationsProps) {
  return (
    <div className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5 backdrop-blur-xl shadow-lg space-y-4 ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            POSSIBLE EXPLANATIONS
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Scientifically Evaluated Models</span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        The hypotheses below represent candidate explanations evaluated against current SPHEREx photometric and astrometric data. None of these interpretations are proven discoveries; multi-epoch confirmation is required.
      </p>

      {explanations.length === 0 ? (
        <p className="text-xs text-slate-500 py-3 text-center">
          No candidate hypotheses are currently cataloged for this comparison.
        </p>
      ) : (
        <div className="space-y-3.5">
          {explanations.map((exp) => {
            const badge = getLikelihoodBadge(exp.likelihood);
            return (
              <div
                key={exp.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-100">{exp.title}</h4>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase border ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {exp.description}
                </p>

                {/* Supporting Evidence */}
                {exp.supporting_evidence.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-400">
                      Supporting Evidence:
                    </span>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                      {exp.supporting_evidence.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Known Limitations */}
                {exp.limitations.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-slate-900">
                    <span className="text-[10px] font-bold uppercase text-amber-400">
                      Hypothesis Limitations:
                    </span>
                    <ul className="list-disc list-inside text-xs text-slate-400 space-y-0.5">
                      {exp.limitations.map((lim, idx) => (
                        <li key={idx}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
