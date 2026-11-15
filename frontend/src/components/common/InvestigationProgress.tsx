import { Link } from 'react-router-dom';
import {
  Compass,
  Calendar,
  ShieldCheck,
  Eye,
  Microscope,
  FilePlus2,
  CheckCircle2,
} from 'lucide-react';
import { buildInvestigationStageHref, type InvestigationStageId } from './investigation-progress-utils';

interface InvestigationProgressProps {
  currentStage: InvestigationStageId;
  targetId?: string | null;
  targetTitle?: string | null;
  earlierObsId?: string | null;
  laterObsId?: string | null;
  className?: string;
}

const STAGES: Array<{
  id: InvestigationStageId;
  stepNumber: number;
  label: string;
  shortLabel: string;
  icon: typeof Compass;
}> = [
  { id: 'discover', stepNumber: 1, label: '1. Discover Region', shortLabel: 'Discover', icon: Compass },
  { id: 'select_observations', stepNumber: 2, label: '2. Select Observations', shortLabel: 'Observations', icon: Calendar },
  { id: 'readiness', stepNumber: 3, label: '3. Readiness Check', shortLabel: 'Readiness', icon: ShieldCheck },
  { id: 'investigate', stepNumber: 4, label: '4. Temporal Lab', shortLabel: 'Temporal', icon: Eye },
  { id: 'evidence', stepNumber: 5, label: '5. Review Evidence', shortLabel: 'Evidence', icon: Microscope },
  { id: 'create_case', stepNumber: 6, label: '6. Create Case File', shortLabel: 'Case File', icon: FilePlus2 },
];

/**
 * 6-Step Core Investigation Journey Progress Bar.
 * Connects Universe Explorer -> Observation Catalogue -> Readiness -> Temporal Analysis -> Evidence -> Case File
 * while preserving the active sky region and selected observation pair across all stages.
 */
export function InvestigationProgress({
  currentStage,
  targetId,
  targetTitle,
  earlierObsId,
  laterObsId,
  className,
}: InvestigationProgressProps) {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <nav
      aria-label="Investigation Workflow Progress"
      className={`rounded-xl border border-[#24344D] bg-[#0A1020] px-4 py-3.5 ${className ?? ''}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A2940] pb-2.5 mb-3">
        <div className="flex items-center gap-2.5 text-xs">
          <span className="font-semibold tracking-wide text-[#45D5F2]">
            Investigation Journey
          </span>
          {targetId && (
            <span className="rounded-md bg-[#101A2B] border border-[#24344D] px-2 py-0.5 font-mono text-[11px] text-[#B5C2D6]">
              Region: {targetTitle || targetId}
            </span>
          )}
        </div>

        {earlierObsId && laterObsId && (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#8293AD]">
            <span className="font-sans">Active Pair:</span>
            <span className="rounded bg-[#101A2B] border border-[#45D5F2]/30 px-1.5 py-0.5 text-[#45D5F2]">
              {earlierObsId}
            </span>
            <span>→</span>
            <span className="rounded bg-[#101A2B] border border-[#9B8CFF]/30 px-1.5 py-0.5 text-[#9B8CFF]">
              {laterObsId}
            </span>
          </div>
        )}
      </div>

      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isCurrent = stage.id === currentStage;
          const isCompleted = idx < currentIndex;
          const href = buildInvestigationStageHref(stage.id, targetId, earlierObsId, laterObsId);

          return (
            <li key={stage.id}>
              <Link
                to={href}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  isCurrent
                    ? 'border-[#4388FF]/60 bg-[#4388FF]/16 text-[#F4F7FF] shadow-[0_0_14px_rgba(67,136,255,0.2)]'
                    : isCompleted
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15'
                    : 'border-[#1A2940] bg-[#101A2B]/60 text-[#8293AD] hover:border-[#24344D] hover:text-[#F4F7FF]'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <Icon
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isCurrent ? 'text-[#45D5F2]' : 'text-[#8293AD]'
                    }`}
                  />
                )}
                <span className="truncate">{stage.label}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
