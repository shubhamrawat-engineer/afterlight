import { FilePlus2, FolderKanban, FileEdit, CheckCircle2, Clock, Eye, Archive } from 'lucide-react';
import type { InvestigationMetrics } from '../types/investigation.types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

interface InvestigationHeaderProps {
  metrics: InvestigationMetrics;
}

export function InvestigationHeader({ metrics }: InvestigationHeaderProps) {
  const reviewCount = (metrics.under_review || 0) + (metrics.ready_for_review || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-[#1A2940] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="primary">Research Case Registry</Badge>
            <span className="text-xs font-medium text-[#8293AD]">
              Reproducibility &amp; Review Ledger
            </span>
          </div>

          <h1 className="text-page-heading text-[#F4F7FF]">
            Investigation Archive &amp; Review Management
          </h1>

          <p className="max-w-2xl text-[14px] leading-relaxed text-[#B5C2D6]">
            Explore, manage, and revisit astronomical investigations. Document flux variations,
            moving-object candidates, and multi-epoch case files with structured review history.
          </p>
        </div>

        <div className="flex shrink-0">
          <Button
            to="/investigations/new"
            variant="primary"
            size="md"
            leftIcon={<FilePlus2 className="h-4 w-4" />}
          >
            New Investigation
          </Button>
        </div>
      </div>

      {/* Hairline-Divided Editorial Metric Strip */}
      <div className="grid grid-cols-2 gap-4 border-b border-[#1A2940] pb-6 sm:grid-cols-3 lg:grid-cols-6">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#8293AD]">
            <FolderKanban className="h-3.5 w-3.5 text-[#4388FF]" />
            <span>Total Cases</span>
          </div>
          <div className="font-mono text-2xl font-semibold text-[#F4F7FF] tabular-nums">
            {metrics.total}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#8293AD]">
            <FileEdit className="h-3.5 w-3.5 text-[#B5C2D6]" />
            <span>Drafts</span>
          </div>
          <div className="font-mono text-2xl font-semibold text-[#F4F7FF] tabular-nums">
            {metrics.draft}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#8293AD]">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>In Progress</span>
          </div>
          <div className="font-mono text-2xl font-semibold text-amber-300 tabular-nums">
            {metrics.in_progress}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#8293AD]">
            <Eye className="h-3.5 w-3.5 text-[#45D5F2]" />
            <span>In Review</span>
          </div>
          <div className="font-mono text-2xl font-semibold text-[#45D5F2] tabular-nums">
            {reviewCount}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#8293AD]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Completed</span>
          </div>
          <div className="font-mono text-2xl font-semibold text-emerald-400 tabular-nums">
            {metrics.completed}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#8293AD]">
            <Archive className="h-3.5 w-3.5 text-[#64758F]" />
            <span>Archived</span>
          </div>
          <div className="font-mono text-2xl font-semibold text-[#8293AD] tabular-nums">
            {metrics.archived}
          </div>
        </div>
      </div>
    </div>
  );
}
