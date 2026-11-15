import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, ShieldCheck, Bot } from 'lucide-react';
import type { TargetStatus, TargetKind, PairGrade } from '../types/evidence.types';
import { StatusBadge } from '../../explorer/components/StatusBadge';
import { formatTargetKind } from '../../explorer/utils/formatters';
import { PairQualityIndicator } from '../../observations/components/PairQualityIndicator';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

interface EvidenceHeaderProps {
  targetId: string;
  targetTitle: string;
  targetKind: TargetKind;
  targetStatus: TargetStatus;
  comparisonJobId?: string | null;
  pairGrade: PairGrade | null;
  earlierDate: string | null;
  laterDate: string | null;
  timeBaselineDays?: number | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Not available';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return iso;
  }
}

export function EvidenceHeader({
  targetId,
  targetTitle,
  targetKind,
  targetStatus,
  comparisonJobId,
  pairGrade,
  earlierDate,
  laterDate,
  timeBaselineDays,
}: EvidenceHeaderProps) {
  return (
    <div className="flex flex-col gap-5 border-b border-[#1A2940] pb-6">
      {/* Top breadcrumb & back link */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/temporal-analysis/${targetId}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#45D5F2] hover:text-[#8BB6FF] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Temporal Analysis Lab</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            to={`/ai?contextType=temporal&targetId=${targetId}&targetName=${encodeURIComponent(targetTitle)}`}
            variant="secondary"
            size="sm"
            leftIcon={<Bot className="h-3.5 w-3.5 text-[#45D5F2]" />}
          >
            Help me understand this measurement
          </Button>
          {comparisonJobId && (
            <Badge variant="default" mono>
              JOB: {comparisonJobId}
            </Badge>
          )}
          <StatusBadge status={targetStatus} />
          {pairGrade && <PairQualityIndicator grade={pairGrade} />}
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <Badge variant="primary">Scientific Evidence Workspace</Badge>
          <span className="font-mono text-xs text-[#8293AD]">
            {formatTargetKind(targetKind)} &bull; {targetId}
          </span>
        </div>

        <h1 className="text-page-heading text-[#F4F7FF]">
          Scientific Evidence: <span className="text-[#45D5F2]">{targetTitle}</span>
        </h1>

        <p className="max-w-3xl text-[14px] leading-relaxed text-[#B5C2D6]">
          Inspect demonstration candidate measurements, review mock uncertainty budgets and provenance lineage, and examine working hypotheses across selected observation epochs.
        </p>
      </div>

      {/* Epoch & Baseline Metadata Strip (Open hairline row) */}
      <div className="mt-1 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-[#1A2940] pt-4">
        <div className="flex items-center gap-2.5">
          <Calendar className="h-4 w-4 shrink-0 text-[#45D5F2]" />
          <div>
            <div className="text-[11px] font-medium text-[#8293AD]">Earlier Epoch (T0)</div>
            <div className="font-mono text-xs font-medium text-[#F4F7FF]">{formatDate(earlierDate)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Calendar className="h-4 w-4 shrink-0 text-[#9B8CFF]" />
          <div>
            <div className="text-[11px] font-medium text-[#8293AD]">Later Epoch (T1)</div>
            <div className="font-mono text-xs font-medium text-[#F4F7FF]">{formatDate(laterDate)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 shrink-0 text-[#4388FF]" />
          <div>
            <div className="text-[11px] font-medium text-[#8293AD]">Time Baseline</div>
            <div className="font-mono text-xs font-medium text-[#F4F7FF]">
              {timeBaselineDays ? `${timeBaselineDays} days` : 'Not available'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400" />
          <div>
            <div className="text-[11px] font-medium text-[#8293AD]">Pair Readiness</div>
            <div className="font-mono text-xs font-medium text-amber-300">
              {pairGrade === 'POOR' ? 'Incompatible Pair' : 'Demo Fixture Mode'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
