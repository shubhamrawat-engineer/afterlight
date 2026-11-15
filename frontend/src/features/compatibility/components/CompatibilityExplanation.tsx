import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Clock,
  HelpCircle,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import type { CompatibilityAssessment } from '../types/compatibility.types';

interface CompatibilityExplanationProps {
  assessment: CompatibilityAssessment;
  defaultExpanded?: boolean;
  className?: string;
}

/**
 * Expandable scientific explanation panel answering the 5 core scientific reasoning questions:
 * 1. What information is available?
 * 2. What information is missing?
 * 3. Why does the missing information matter?
 * 4. What validation or processing is required?
 * 5. What can the researcher safely conclude at this stage?
 */
export function CompatibilityExplanation({
  assessment,
  defaultExpanded = true,
  className,
}: CompatibilityExplanationProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div
      className={`rounded-xl border border-slate-800/80 bg-slate-950/60 overflow-hidden transition-all ${className ?? ''}`}
    >
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        aria-label={`Toggle scientific reasoning explanation for ${assessment.title}`}
        className="flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-slate-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-400 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Scientific Reasoning &amp; Epistemic Bounds ({assessment.title})
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>{isExpanded ? 'Collapse' : 'Explain Reasoning'}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-800/80 p-4 space-y-4 text-xs">
          {/* Question 1: What information is available? */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>1. What information is available?</span>
            </div>
            <ul className="ml-5 list-disc space-y-1 text-slate-300">
              {assessment.availableInformation.length > 0 ? (
                assessment.availableInformation.map((info, i) => (
                  <li key={i} className="leading-relaxed">
                    {info}
                  </li>
                ))
              ) : (
                <li className="text-slate-400">No verified parameters registered for this task.</li>
              )}
            </ul>
          </div>

          {/* Question 2: What information is missing? */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>2. What information is missing?</span>
            </div>
            <ul className="ml-5 list-disc space-y-1 text-slate-300">
              {assessment.missingInformation.length > 0 ? (
                assessment.missingInformation.map((info, i) => (
                  <li key={i} className="leading-relaxed">
                    {info}
                  </li>
                ))
              ) : (
                <li className="text-emerald-400">All required parameters verified for this task.</li>
              )}
            </ul>
          </div>

          {/* Question 3: Why does the missing information matter? */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-400">
              <HelpCircle className="h-3.5 w-3.5 shrink-0" />
              <span>3. Why does the missing information matter?</span>
            </div>
            <p className="ml-5 text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
              {assessment.whyMissingMatters}
            </p>
          </div>

          {/* Question 4: What validation or processing is required? */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-sky-400">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              <span>4. What validation or processing is required?</span>
            </div>
            <p className="ml-5 text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
              {assessment.requiredValidation}
            </p>
          </div>

          {/* Question 5: What can the researcher safely conclude at this stage? */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-blue-300">
              <Compass className="h-3.5 w-3.5 shrink-0" />
              <span>5. What can the researcher safely conclude at this stage?</span>
            </div>
            <p className="ml-5 text-slate-200 leading-relaxed bg-blue-950/25 p-2.5 rounded-lg border border-blue-500/25">
              {assessment.safeConclusions}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
