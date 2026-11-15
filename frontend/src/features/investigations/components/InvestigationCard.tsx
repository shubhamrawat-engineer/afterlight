import { useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Compass,
  FileText,
  Layers,
  Tag,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import type { InvestigationCase } from '../types/investigation.types';
import {
  InvestigationStatusBadge,
  SubmissionStatusBadge,
  ConfidenceBadge,
} from './InvestigationStatusBadge';
import { formatInvestigationCategory } from '../services/investigation-service';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

interface InvestigationCardProps {
  investigation: InvestigationCase;
  onDuplicate?: (caseId: string) => void;
  onArchive?: (caseId: string) => void;
  onRestore?: (caseId: string) => void;
  onDelete?: (caseId: string) => void;
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

export function InvestigationCard({
  investigation,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
}: InvestigationCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    id,
    title,
    summary,
    category,
    target_title,
    comparison_job_id,
    status,
    submission_status,
    confidence,
    evidence_items,
    created_at_utc,
    candidate_id,
  } = investigation;

  const isArchived = status === 'archived';

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-[#24344D] bg-[#101A2B] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4388FF]/50 hover:bg-[#131F33] shadow-[0_4px_18px_rgba(3,6,14,0.38)] hover:shadow-[0_12px_30px_rgba(3,6,14,0.58)]">
      <div className="space-y-3.5">
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-medium text-[#45D5F2]">{id}</span>
            <InvestigationStatusBadge status={status} />
            <span className="inline-flex items-center gap-1 rounded-md border border-[#24344D] bg-[#131F33] px-2 py-0.5 text-[10px] font-medium text-[#B5C2D6]">
              <Tag className="h-2.5 w-2.5 text-[#45D5F2]" />
              {formatInvestigationCategory(category)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <DemonstrationDataBadge variant="compact" label="ACTIVE DOSSIER" />
            <ConfidenceBadge confidence={confidence} />
          </div>
        </div>

        {/* Title */}
        <h3 className="font-[family-name:var(--font-display)] text-[18px] font-semibold leading-snug tracking-[-0.01em] text-[#F4F7FF] transition-colors group-hover:text-[#45D5F2]">
          {title}
        </h3>

        {/* Target and Candidate Context */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#8293AD]">
          <div className="flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 shrink-0 text-[#45D5F2]" />
            <span className="font-medium text-[#F4F7FF]">{target_title}</span>
          </div>

          {comparison_job_id && (
            <div className="flex items-center gap-1.5 font-mono">
              <Layers className="h-3.5 w-3.5 shrink-0 text-[#8293AD]" />
              <span>Job: {comparison_job_id}</span>
            </div>
          )}

          {candidate_id && (
            <Badge variant="primary" mono className="px-2 py-0.5 text-[10px]">
              {candidate_id}
            </Badge>
          )}
        </div>

        {/* Summary Description */}
        <p className="text-[13.5px] leading-relaxed text-[#B5C2D6] line-clamp-2">
          {summary}
        </p>
      </div>

      {/* Bottom Footer Row & Quick Actions */}
      <div className="mt-5 space-y-3 border-t border-[#1A2940] pt-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span>{formatDate(created_at_utc)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              <span>{evidence_items.length} ref{evidence_items.length === 1 ? '' : 's'}</span>
            </div>

            <SubmissionStatusBadge status={submission_status} />
          </div>

          {/* Quick Management Actions */}
          <div className="flex items-center gap-1">
            {onDuplicate && (
              <button
                type="button"
                onClick={() => onDuplicate(id)}
                title="Duplicate as new draft"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-blue-300 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            )}

            {isArchived ? (
              onRestore && (
                <button
                  type="button"
                  onClick={() => onRestore(id)}
                  title="Restore from archive"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-300 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )
            ) : (
              onArchive && (
                <button
                  type="button"
                  onClick={() => onArchive(id)}
                  title="Archive investigation"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-300 transition-colors"
                >
                  <Archive className="h-3.5 w-3.5" />
                </button>
              )
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete investigation"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-950/60 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Primary Open Case Button */}
        <div className="flex items-center justify-end">
          <Button
            to={`/investigations/${id}`}
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto group-hover:border-blue-500/40 group-hover:bg-blue-600 group-hover:text-white"
            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
          >
            Open Case Dossier
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-[#0d1322] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-semibold text-white">
                Delete Investigation {id}?
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong>"{title}"</strong>? This action will remove the case and its local revision logs from browser storage.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete?.(id);
                }}
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
