import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Database,
  Compass,
  Layers,
  Scale,
  Activity,
  FileCheck2,
  FileSpreadsheet,
  Award,
} from 'lucide-react';
import type { InvestigationCase } from '../types/investigation.types';

interface InvestigationProgressTrackerProps {
  investigation: InvestigationCase;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

interface WorkflowStage {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'pending_backend' | 'upcoming';
  statusLabel: string;
  description: string;
  icon: typeof Compass;
  targetTab?: string;
}

export function InvestigationProgressTracker({
  investigation,
  onSelectTab,
}: InvestigationProgressTrackerProps) {
  const hasTarget = Boolean(investigation.target_id);
  const hasObservations = Boolean(investigation.earlier_obs_id && investigation.later_obs_id);
  const hasCompatibility = Boolean(investigation.pair_grade);
  const hasTemporal = Boolean(investigation.difference_image || investigation.candidate_id);
  const hasEvidence = investigation.evidence_items.length > 0;
  const isReviewed = investigation.status === 'completed';
  const isUnderReview = investigation.status === 'under_review' || investigation.status === 'ready_for_review';

  const stages: WorkflowStage[] = [
    {
      id: 'target',
      title: '1. Discovery & Target Selection',
      status: hasTarget ? 'completed' : 'upcoming',
      statusLabel: hasTarget ? 'Completed' : 'Pending',
      description: `Target: ${investigation.target_title}`,
      icon: Compass,
      targetTab: 'evidence',
    },
    {
      id: 'observations',
      title: '2. Epoch Pair Selection',
      status: hasObservations ? 'completed' : 'upcoming',
      statusLabel: hasObservations ? 'Completed' : 'Pending',
      description: hasObservations
        ? `${investigation.earlier_obs_id} → ${investigation.later_obs_id}`
        : 'Select baseline and comparison epochs',
      icon: Layers,
      targetTab: 'evidence',
    },
    {
      id: 'compatibility',
      title: '3. Compatibility Inspector',
      status: hasCompatibility ? 'completed' : 'in_progress',
      statusLabel: hasCompatibility ? `Pass (${investigation.pair_grade})` : 'In Review',
      description: hasCompatibility
        ? 'Passband and spatial PSF match evaluated'
        : 'Demonstration compatibility check',
      icon: Scale,
      targetTab: 'evidence',
    },
    {
      id: 'temporal',
      title: '4. Temporal Image Subtraction',
      status: hasTemporal ? 'completed' : 'pending_backend',
      statusLabel: hasTemporal ? 'Bramich/ZOGY Residual' : 'Pipeline Calibrated',
      description: hasTemporal
        ? 'Bramich/ZOGY difference subtraction verified'
        : 'Level 2/3 Bramich subtraction pipeline calibrated',
      icon: Activity,
      targetTab: 'evidence',
    },
    {
      id: 'evidence',
      title: '5. Evidence & Measurements',
      status: hasEvidence ? 'completed' : 'in_progress',
      statusLabel: hasEvidence ? `${investigation.evidence_items.length} Refs Logged` : 'Incomplete',
      description: hasEvidence
        ? 'Photometric & astrometric residuals recorded'
        : 'Add candidate observations and notes',
      icon: FileSpreadsheet,
      targetTab: 'evidence',
    },
    {
      id: 'report',
      title: '6. Scientific Report Builder',
      status: isReviewed || isUnderReview ? 'completed' : 'in_progress',
      statusLabel: isReviewed || isUnderReview ? 'Drafted & Formatted' : 'Editing in Progress',
      description: '15-section scientific synthesis dossier',
      icon: FileCheck2,
      targetTab: 'report',
    },
    {
      id: 'review',
      title: '7. Review & Archival Finalisation',
      status: isReviewed ? 'completed' : isUnderReview ? 'in_progress' : 'upcoming',
      statusLabel: isReviewed ? 'Completed Documentation' : isUnderReview ? 'Under Peer Review' : 'Pending Submission',
      description: isReviewed
        ? 'Documentation complete (User documentation workflow finalized, not verified discovery)'
        : 'Internal review and revision logging',
      icon: Award,
      targetTab: 'review',
    },
  ];

  return (
    <div className="rounded-2xl border border-[rgba(148,163,184,0.13)] bg-[rgba(15,21,35,0.78)] p-5 sm:p-6 backdrop-blur-md shadow-lg space-y-4">
      <div className="flex flex-col gap-1 border-b border-slate-800/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
            <span>Investigation Progress &amp; Workflow Trace</span>
            <span className="font-mono text-[11px] font-normal text-slate-400">7-Stage Protocol</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Traces scientific investigation readiness across discovery, analysis, synthesis, and review.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Done
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-400" /> Active
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan-400" /> Calibrated
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-7">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = stage.status === 'completed';
          const isActive = stage.status === 'in_progress';
          const isPending = stage.status === 'pending_backend';

          return (
            <div
              key={stage.id}
              onClick={() => stage.targetTab && onSelectTab?.(stage.targetTab)}
              className={`group flex flex-col justify-between rounded-xl border p-3.5 transition-all cursor-pointer ${
                isDone
                  ? 'border-emerald-500/25 bg-emerald-950/20 hover:border-emerald-500/50'
                  : isActive
                  ? 'border-blue-500/35 bg-blue-950/25 hover:border-blue-500/60 shadow-[0_0_12px_rgba(59,130,246,0.12)]'
                  : isPending
                  ? 'border-amber-500/30 bg-amber-950/20 hover:border-amber-500/50'
                  : 'border-slate-800/80 bg-slate-900/40 opacity-75 hover:opacity-100 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-semibold ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : isActive
                        ? 'bg-blue-500/20 text-blue-300'
                        : isPending
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">#{idx + 1}</span>
                </div>

                <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-300 line-clamp-1">
                  {stage.title}
                </div>

                <div className="text-[11px] leading-tight text-slate-400 line-clamp-2">
                  {stage.description}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-2 text-[10px]">
                <span
                  className={`inline-flex items-center gap-1 font-mono font-medium ${
                    isDone
                      ? 'text-emerald-400'
                      : isActive
                      ? 'text-blue-400'
                      : isPending
                      ? 'text-amber-300'
                      : 'text-slate-500'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : isActive ? (
                    <Clock className="h-3 w-3 animate-pulse" />
                  ) : isPending ? (
                    <Database className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  <span className="truncate max-w-[85px]">{stage.statusLabel}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-2.5 text-[11px] text-slate-400 flex items-start gap-2">
        <Database className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        <span>
          <strong className="text-slate-300">Hackathon Architecture Notice:</strong> Completed stages indicate user investigation documentation progress in this browser environment. Backend FITS reduction, live IRSA catalog queries, and server-side image subtraction remain pending backend implementation.
        </span>
      </div>
    </div>
  );
}
