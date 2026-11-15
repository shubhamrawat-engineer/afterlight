import type {
  InvestigationStatus,
  SubmissionStatus,
  InvestigationConfidence,
} from '../types/investigation.types';

interface StatusBadgeProps {
  status: InvestigationStatus;
  className?: string;
}

export function InvestigationStatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case 'completed':
      return (
        <span className={`inline-flex items-center rounded-md border border-emerald-500/50 bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 ${className ?? ''}`}>
          COMPLETED
        </span>
      );
    case 'ready_for_review':
      return (
        <span className={`inline-flex items-center rounded-md border border-sky-500/50 bg-sky-950/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300 ${className ?? ''}`}>
          READY FOR REVIEW
        </span>
      );
    case 'revision_required':
      return (
        <span className={`inline-flex items-center rounded-md border border-rose-500/50 bg-rose-950/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-300 ${className ?? ''}`}>
          REVISION REQUIRED
        </span>
      );
    case 'submitted':
      return (
        <span className={`inline-flex items-center rounded-md border border-emerald-500/40 bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 ${className ?? ''}`}>
          SUBMITTED
        </span>
      );
    case 'under_review':
      return (
        <span className={`inline-flex items-center rounded-md border border-amber-500/40 bg-amber-950/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 ${className ?? ''}`}>
          UNDER REVIEW
        </span>
      );
    case 'in_progress':
      return (
        <span className={`inline-flex items-center rounded-md border border-blue-500/40 bg-blue-950/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300 ${className ?? ''}`}>
          IN PROGRESS
        </span>
      );
    case 'archived':
      return (
        <span className={`inline-flex items-center rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${className ?? ''}`}>
          ARCHIVED
        </span>
      );
    case 'draft':
    default:
      return (
        <span className={`inline-flex items-center rounded-md border border-slate-700 bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 ${className ?? ''}`}>
          DRAFT
        </span>
      );
  }
}

interface SubmissionBadgeProps {
  status: SubmissionStatus;
  className?: string;
}

export function SubmissionStatusBadge({ status, className }: SubmissionBadgeProps) {
  switch (status) {
    case 'accepted':
      return (
        <span className={`inline-flex items-center rounded-md border border-emerald-500/50 bg-emerald-950 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400 ${className ?? ''}`}>
          ACCEPTED TO ARCHIVE
        </span>
      );
    case 'submitted':
      return (
        <span className={`inline-flex items-center rounded-md border border-sky-500/40 bg-sky-950 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-300 ${className ?? ''}`}>
          SUBMITTED FOR REVIEW
        </span>
      );
    case 'revision_requested':
      return (
        <span className={`inline-flex items-center rounded-md border border-amber-500/40 bg-amber-950 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300 ${className ?? ''}`}>
          REVISION REQUESTED
        </span>
      );
    case 'unsubmitted':
    default:
      return (
        <span className={`inline-flex items-center rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-slate-400 ${className ?? ''}`}>
          UNSUBMITTED
        </span>
      );
  }
}

interface ConfidenceBadgeProps {
  confidence: InvestigationConfidence;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  switch (confidence) {
    case 'HIGH':
      return (
        <span
          title="User-assigned qualitative confidence rating (not an automated Bayesian posterior probability)"
          className={`inline-flex items-center rounded border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300 ${className ?? ''}`}
        >
          USER CONFIDENCE: HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          title="User-assigned qualitative confidence rating (not an automated Bayesian posterior probability)"
          className={`inline-flex items-center rounded border border-amber-500/40 bg-amber-950/60 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 ${className ?? ''}`}
        >
          USER CONFIDENCE: MEDIUM
        </span>
      );
    case 'LOW':
    default:
      return (
        <span
          title="User-assigned qualitative confidence rating (not an automated Bayesian posterior probability)"
          className={`inline-flex items-center rounded border border-slate-700 bg-slate-900/60 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 ${className ?? ''}`}
        >
          USER CONFIDENCE: LOW
        </span>
      );
  }
}
