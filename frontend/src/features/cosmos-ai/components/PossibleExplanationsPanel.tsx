import React, { useState } from 'react';
import type { PossibleExplanationItem } from '../types/explanation.types';
import {
  Sparkles,
  Cpu,
  Sliders,
  Cloud,
  Compass,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

interface PossibleExplanationsPanelProps {
  explanations: PossibleExplanationItem[];
  className?: string;
}

export const PossibleExplanationsPanel: React.FC<PossibleExplanationsPanelProps> = ({
  explanations,
  className = '',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(explanations[0]?.id || null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'astrophysical':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'instrumental':
        return <Cpu className="w-4 h-4 text-orange-400" />;
      case 'calibration':
        return <Sliders className="w-4 h-4 text-cyan-400" />;
      case 'background':
        return <Cloud className="w-4 h-4 text-blue-400" />;
      case 'astrometric':
        return <Compass className="w-4 h-4 text-emerald-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'astrophysical':
        return 'text-purple-300 bg-purple-950/60 border-purple-800/40';
      case 'instrumental':
        return 'text-orange-300 bg-orange-950/60 border-orange-800/40';
      case 'calibration':
        return 'text-cyan-300 bg-cyan-950/60 border-cyan-800/40';
      case 'background':
        return 'text-blue-300 bg-blue-950/60 border-blue-800/40';
      case 'astrometric':
        return 'text-emerald-300 bg-emerald-950/60 border-emerald-800/40';
      default:
        return 'text-amber-300 bg-amber-950/60 border-amber-800/40';
    }
  };

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-md text-xs ${className}`}
    >
      {/* Banner */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-100 text-xs">
            Physical Hypotheses Matrix (6 Investigation Categories)
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          QUALITATIVE HYPOTHESES ONLY
        </span>
      </div>

      <div className="p-3.5 space-y-2">
        <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-slate-400 text-[11px] flex items-start space-x-2">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-200">Scientific Integrity Notice:</strong> Arbitrary probability percentages are withheld because uncalibrated Bayesian priors can mislead. Physical hypotheses are evaluated qualitatively against SPHEREx DR1 observational data and astrometric limits.
          </p>
        </div>

        <div className="space-y-2 pt-1">
          {explanations.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-lg border transition-all ${
                  isExpanded
                    ? 'bg-slate-950 border-sky-800/60 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-3 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    {getCategoryIcon(item.category)}
                    <span className="font-semibold text-slate-200">{item.categoryLabel}</span>
                    <span
                      className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded border ${getCategoryBadgeClass(
                        item.category
                      )}`}
                    >
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-200"
                    aria-label={isExpanded ? 'Collapse category details' : 'Expand category details'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 space-y-2.5 text-slate-300 border-t border-slate-800/60 text-[11px]">
                    <p className="leading-relaxed text-slate-200 italic">{item.explanation}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                      {/* Supporting */}
                      <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/60">
                        <span className="text-emerald-400 font-semibold block mb-1">
                          Supporting Evidence:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                          {item.supportingEvidence.map((ev, i) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Contradicting */}
                      <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/60">
                        <span className="text-rose-400 font-semibold block mb-1">
                          Contradicting Evidence:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                          {item.contradictingEvidence.map((ev, i) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Validation Required */}
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-800 text-[11px]">
                      <span className="text-sky-400 font-semibold block mb-0.5">
                        Required Validation Steps:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                        {item.validationRequired.map((val, i) => (
                          <li key={i}>{val}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
