import React, { useState } from 'react';
import type { EvidenceExplanationData } from '../types/explanation.types';
import {
  Layers,
  BarChart2,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface EvidenceExplanationCardProps {
  evidence: EvidenceExplanationData;
  className?: string;
}

export const EvidenceExplanationCard: React.FC<EvidenceExplanationCardProps> = ({
  evidence,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={`bg-slate-900/90 border border-sky-900/40 rounded-xl overflow-hidden shadow-md text-xs ${className}`}
    >
      {/* Header Banner */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-slate-950/80 px-4 py-2.5 border-b border-sky-900/30 flex items-center justify-between cursor-pointer hover:bg-slate-950 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-slate-100 text-xs tracking-wide">
            Scientific Evidence Explainer
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 uppercase">
            VERIFIED ARCHIVE
          </span>
        </div>

        <button
          type="button"
          className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          aria-label={isExpanded ? 'Collapse evidence sections' : 'Expand evidence sections'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Section 1: Available Evidence */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5 text-sky-300 font-semibold text-xs">
              <Layers className="w-3.5 h-3.5" />
              <span>1. Available Observational Evidence</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-300">
              {evidence.availableEvidence.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: Supporting Measurements Table */}
          {evidence.supportingMeasurements && evidence.supportingMeasurements.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold text-xs">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>2. Supporting Photometric & Astrometric Measurements</span>
              </div>
              <div className="overflow-x-auto rounded border border-slate-800">
                <table className="w-full text-left font-mono text-[11px] bg-slate-950/70">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-1.5 px-3">Parameter</th>
                      <th className="py-1.5 px-3">Value</th>
                      <th className="py-1.5 px-3">Uncertainty (±)</th>
                      <th className="py-1.5 px-3">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {evidence.supportingMeasurements.map((m, i) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="py-1 px-3 text-slate-300 font-sans">{m.parameter}</td>
                        <td className="py-1 px-3 font-semibold text-sky-300">{m.value}</td>
                        <td className="py-1 px-3 text-amber-300">
                          {m.uncertainty ? `± ${m.uncertainty}` : 'Unquantified'}
                        </td>
                        <td className="py-1 px-3 text-slate-400">{m.unit || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3: Contradicting Evidence */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5 text-rose-300 font-semibold text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>3. Contradicting or Inconsistent Evidence</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-300">
              {evidence.contradictingEvidence.map((item, i) => (
                <li key={i} className="leading-relaxed text-rose-200/90">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4: Missing Information */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5 text-amber-300 font-semibold text-xs">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>4. Missing Observational Metadata & Follow-up</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-300">
              {evidence.missingInformation.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 5: Instrumental Caveats */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5 text-orange-300 font-semibold text-xs">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>5. Instrumental & Reduction Caveats</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-300">
              {evidence.instrumentalCaveats.map((item, i) => (
                <li key={i} className="leading-relaxed text-orange-200/90">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 6: Possible Astrophysical Explanations */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5 text-purple-300 font-semibold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>6. Possible Astrophysical Interpretations</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-300">
              {evidence.possibleAstrophysicalExplanations.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 7: Recommended Next Steps */}
          <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold text-xs">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>7. Recommended Verification Next Steps</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-300">
              {evidence.recommendedNextSteps.map((item, i) => (
                <li key={i} className="leading-relaxed text-emerald-100/90">
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
