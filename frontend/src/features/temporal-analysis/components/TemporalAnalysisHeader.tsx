import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Calendar, Clock, Bot } from 'lucide-react';
import type { TargetStatus, TargetKind, PairGrade } from '../types/temporal-analysis.types';
import { StatusBadge } from '../../explorer/components/StatusBadge';
import { formatTargetKind } from '../../explorer/utils/formatters';
import { PairQualityIndicator } from '../../observations/components/PairQualityIndicator';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

interface TemporalAnalysisHeaderProps {
  targetId: string;
  targetTitle: string;
  targetKind: TargetKind;
  targetStatus: TargetStatus;
  pairGrade: PairGrade | null | undefined;
  earlierDate: string | null;
  laterDate: string | null;
  timeBaselineDays: number | null | undefined;
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

/**
 * Top command header for the Temporal Analysis Lab.
 * Uses refined medium-weight page heading and standardized Button/Badge components.
 */
export function TemporalAnalysisHeader({
  targetId,
  targetTitle,
  targetKind,
  targetStatus,
  pairGrade,
  earlierDate,
  laterDate,
  timeBaselineDays,
}: TemporalAnalysisHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#1A2940] pb-6">
      {/* Back to Catalogue Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#8293AD]">
        <Link
          to={`/observations/${targetId}`}
          className="inline-flex items-center gap-1.5 hover:text-[#F4F7FF] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Observation Catalogue ({targetId})</span>
        </Link>
        <span>/</span>
        <span className="font-mono text-[#F4F7FF]">Temporal Analysis Lab</span>
      </nav>

      {/* Main Title Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-page-heading text-[#F4F7FF]">
              Temporal Analysis Lab
            </h1>
            <StatusBadge status={targetStatus} />
            <Badge variant="default">
              {formatTargetKind(targetKind)}
            </Badge>
          </div>

          <p className="max-w-2xl text-[14px] text-[#B5C2D6]">
            Explore how the same astronomical region appears across different demonstration observation epochs.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-[#B5C2D6]">
            <span className="font-medium text-[#F4F7FF]">{targetTitle}</span>
            <div className="flex items-center gap-1 font-mono text-[#45D5F2]">
              <Compass className="h-3.5 w-3.5" />
              <span>{targetId}</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[#B5C2D6]">
              <Calendar className="h-3.5 w-3.5 text-[#45D5F2]" />
              <span>T0: {formatDate(earlierDate)}</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[#B5C2D6]">
              <Calendar className="h-3.5 w-3.5 text-[#9B8CFF]" />
              <span>T1: {formatDate(laterDate)}</span>
            </div>
            {timeBaselineDays !== null && timeBaselineDays !== undefined && (
              <div className="flex items-center gap-1 font-mono text-amber-300">
                <Clock className="h-3.5 w-3.5" />
                <span>Δt: {timeBaselineDays} days</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions & Pair Compatibility Badge */}
        <div className="flex flex-wrap shrink-0 items-center gap-3">
          <Button
            to={`/ai?contextType=temporal&targetId=${targetId}&targetName=${encodeURIComponent(targetTitle)}`}
            variant="secondary"
            size="sm"
            leftIcon={<Bot className="h-3.5 w-3.5 text-[#45D5F2]" />}
          >
            Explain this comparison
          </Button>
          <PairQualityIndicator grade={pairGrade} />
        </div>
      </div>
    </div>
  );
}
