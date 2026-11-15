import { CheckCircle2, AlertTriangle, Layers, Ruler, Sparkles } from 'lucide-react';
import type { StructuredAIResponse } from '../types/cosmos-ai.types';
import { SourceReferences } from './SourceReferences';

interface ResponseSectionProps {
  structured: StructuredAIResponse;
}

export function ResponseSection({ structured }: ResponseSectionProps) {
  const {
    directAnswer,
    observationalEvidence,
    measurements,
    interpretation,
    limitations,
    sourceReferences,
  } = structured;

  return (
    <div className="space-y-4 text-xs font-sans leading-relaxed">
      {/* Observational Evidence */}
      {observationalEvidence && observationalEvidence.length > 0 && (
        <div className="p-3.5 rounded-xl bg-[#0A1020] border border-[#24344D] space-y-2">
          <div className="flex items-center gap-1.5 text-[#45D5F2] font-semibold text-xs">
            <Layers className="w-3.5 h-3.5" />
            <span>Observational Evidence</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[#B5C2D6]">
            {observationalEvidence.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Measurements */}
      {measurements && measurements.length > 0 && (
        <div className="p-3.5 rounded-xl bg-[#0A1020] border border-[#24344D] space-y-2">
          <div className="flex items-center gap-1.5 text-[#45D5F2] font-semibold text-xs">
            <Ruler className="w-3.5 h-3.5" />
            <span>Quantitative Metrics &amp; Uncertainties</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono">
            {measurements.map((m, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#101A2B] border border-[#1A2940]">
                <span className="font-sans text-[11px] text-[#8293AD] block">{m.parameter}</span>
                <span className="text-[#F4F7FF] font-semibold">
                  {m.value} {m.unit || ''}
                </span>
                {m.uncertainty && (
                  <span className="text-[#8293AD] text-[10px] block">± {m.uncertainty}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interpretation */}
      {interpretation && (
        <div className="p-3.5 rounded-xl bg-[#0A1020] border border-[#24344D] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#9B8CFF] font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scientific Interpretation</span>
          </div>
          <p className="text-[#B5C2D6] italic">{interpretation}</p>
        </div>
      )}

      {/* Limitations & Epistemic Boundaries */}
      {limitations && limitations.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/25 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Epistemic Limitations &amp; Unresolved Uncertainties</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-amber-100/90 text-xs">
            {limitations.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Source References */}
      {sourceReferences && sourceReferences.length > 0 && (
        <div className="pt-2 border-t border-[#1A2940]">
          <div className="flex items-center gap-1.5 text-[#8293AD] font-semibold text-xs mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Source Attribution &amp; Verification Trail</span>
          </div>
          <SourceReferences references={sourceReferences} />
        </div>
      )}
    </div>
  );
}
