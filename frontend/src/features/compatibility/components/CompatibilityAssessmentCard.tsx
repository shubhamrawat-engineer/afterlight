import {
  Eye,
  Layers,
  Sparkles,
  Compass,
  Radio,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { CompatibilityAssessment, CompatibilityTask } from '../types/compatibility.types';
import { CompatibilityStatusBadge } from './CompatibilityStatusBadge';
import { CompatibilityExplanation } from './CompatibilityExplanation';

interface CompatibilityAssessmentCardProps {
  assessment: CompatibilityAssessment;
  defaultExpanded?: boolean;
  className?: string;
}

const TASK_ICONS: Record<CompatibilityTask, typeof Eye> = {
  visual: Eye,
  difference_image: Layers,
  photometric: Sparkles,
  astrometric: Compass,
  spectral: Radio,
};

export function CompatibilityAssessmentCard({
  assessment,
  defaultExpanded = false,
  className,
}: CompatibilityAssessmentCardProps) {
  const Icon = TASK_ICONS[assessment.task] ?? Eye;

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5.5 backdrop-blur-xl shadow-lg transition-all ${className ?? ''}`}
      id={`assessment-${assessment.task}`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-950/50 text-blue-400">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Scientific Investigation Task
              </span>
              <h3 className="text-base font-bold text-slate-100">{assessment.title}</h3>
            </div>
          </div>

          <CompatibilityStatusBadge status={assessment.status} size="md" />
        </div>

        {/* Task description */}
        <p className="text-xs text-slate-300 leading-relaxed">
          {assessment.taskDescription}
        </p>

        {/* Status Summary Banner */}
        <div
          className={`rounded-xl border p-3 text-xs leading-relaxed ${
            assessment.status === 'READY_FOR_REVIEW'
              ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
              : assessment.status === 'CONDITIONALLY_READY'
              ? 'border-amber-500/30 bg-amber-950/20 text-amber-200'
              : assessment.status === 'INSUFFICIENT_METADATA'
              ? 'border-rose-500/30 bg-rose-950/20 text-rose-200'
              : 'border-slate-800 bg-slate-900/60 text-slate-300'
          }`}
        >
          <strong className="font-semibold">Assessment: </strong>
          {assessment.statusSummary}
        </div>

        {/* Requirements Checklist */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Scientific Parameter Requirements ({assessment.requirements.filter((r) => r.isSatisfied).length}/{assessment.requirements.length} Satisfied)
          </span>

          <div className="space-y-2">
            {assessment.requirements.map((req) => (
              <div
                key={req.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-800/70 bg-slate-950/50 p-2.5 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  {req.isSatisfied ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  )}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{req.name}</span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider border ${
                          req.importance === 'essential'
                            ? 'border-rose-500/30 bg-rose-950/50 text-rose-300'
                            : req.importance === 'conditional'
                            ? 'border-amber-500/30 bg-amber-950/50 text-amber-300'
                            : 'border-slate-700 bg-slate-900 text-slate-400'
                        }`}
                      >
                        {req.importance}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{req.description}</p>
                    {req.isSatisfied && req.availableDetail && (
                      <p className="text-[11px] text-emerald-300 font-mono">
                        ✓ {req.availableDetail}
                      </p>
                    )}
                    {!req.isSatisfied && req.missingImpact && (
                      <p className="text-[11px] text-amber-300">
                        ⚠ {req.missingImpact}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expandable Scientific Reasoning Breakdown */}
        <CompatibilityExplanation
          assessment={assessment}
          defaultExpanded={defaultExpanded}
        />
      </div>
    </div>
  );
}
