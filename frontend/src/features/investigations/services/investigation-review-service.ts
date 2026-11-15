import type {
  ReviewComment,
  SectionReviewItem,
  ReviewHistoryEntry,
  ReviewWorkflowStatus,
} from '../types/review.types';
import type { InvestigationStatus } from '../types/investigation.types';

const COMMENTS_STORAGE_PREFIX = 'afterlight_review_comments_';
const SECTIONS_STORAGE_PREFIX = 'afterlight_section_reviews_';
const HISTORY_STORAGE_PREFIX = 'afterlight_review_history_';
const REVIEW_STATUS_PREFIX = 'afterlight_review_status_';

export function fetchReviewStatus(
  caseId: string,
  fallbackStatus?: ReviewWorkflowStatus
): ReviewWorkflowStatus {
  try {
    const raw = localStorage.getItem(`${REVIEW_STATUS_PREFIX}${caseId}`);
    if (raw) return raw as ReviewWorkflowStatus;
  } catch {
    // Demo fallback
  }
  return fallbackStatus ?? 'NOT_SUBMITTED';
}

export function saveReviewStatus(caseId: string, status: ReviewWorkflowStatus): void {
  try {
    localStorage.setItem(`${REVIEW_STATUS_PREFIX}${caseId}`, status);
  } catch {
    // Demo fallback
  }
}

const STANDARD_REPORT_SECTIONS = [
  { sectionId: 'identity', sectionTitle: 'Investigation Identity & Metadata' },
  { sectionId: 'objective', sectionTitle: 'Scientific Research Objective' },
  { sectionId: 'target_observation', sectionTitle: 'Target Context & Coordinates' },
  { sectionId: 'timeline', sectionTitle: 'Observation Epochs Timeline' },
  { sectionId: 'compatibility', sectionTitle: 'Instrument Compatibility Assessment' },
  { sectionId: 'temporal_comparison', sectionTitle: 'Temporal Analysis & Subtraction' },
  { sectionId: 'measurements', sectionTitle: 'Quantitative Measurements' },
  { sectionId: 'uncertainty_flags', sectionTitle: 'Uncertainty Budget & Quality Flags' },
  { sectionId: 'evidence_ledger', sectionTitle: 'Evidence Ledger' },
  { sectionId: 'provenance', sectionTitle: 'Data Provenance & Lineage' },
  { sectionId: 'explanations', sectionTitle: 'Working Hypotheses' },
  { sectionId: 'limitations', sectionTitle: 'Epistemic Unknowns & Limitations' },
  { sectionId: 'validation_required', sectionTitle: 'Required Follow-up Validation' },
  { sectionId: 'reproducibility', sectionTitle: 'Reproducibility Parameters' },
  { sectionId: 'references', sectionTitle: 'References & Software Attribution' },
];

export function mapStatusToReviewState(status: InvestigationStatus): ReviewWorkflowStatus {
  switch (status) {
    case 'ready_for_review':
      return 'SUBMITTED_FOR_REVIEW';
    case 'under_review':
    case 'submitted':
      return 'UNDER_REVIEW';
    case 'revision_required':
      return 'REVISION_REQUESTED';
    case 'completed':
      return 'APPROVED';
    case 'draft':
    case 'in_progress':
    case 'archived':
    default:
      return 'NOT_SUBMITTED';
  }
}

export function mapReviewStateToStatus(reviewState: ReviewWorkflowStatus): InvestigationStatus {
  switch (reviewState) {
    case 'SUBMITTED_FOR_REVIEW':
      return 'ready_for_review';
    case 'UNDER_REVIEW':
      return 'under_review';
    case 'REVISION_REQUESTED':
      return 'revision_required';
    case 'APPROVED':
      return 'completed';
    case 'REJECTED':
      return 'draft';
    case 'NOT_SUBMITTED':
    default:
      return 'in_progress';
  }
}

function getInitialCommentsForCase(caseId: string): ReviewComment[] {
  if (caseId === 'INV-2025-SDFS-001') {
    return [
      {
        id: `rev-comm-init-1`,
        investigationId: caseId,
        sectionId: 'measurements',
        authorLabel: 'Demonstration Reviewer (Photometry Working Group)',
        content:
          'Please verify that aperture correction was applied consistently for Band 3 (2.42 μm) across both April and October reference frames.',
        createdAtUtc: '2026-11-14T13:00:00Z',
        resolved: false,
        isRevisionRequest: true,
        isDemonstrationRecord: true,
      },
      {
        id: `rev-comm-init-2`,
        investigationId: caseId,
        sectionId: 'compatibility',
        authorLabel: 'Demonstration Reviewer (Instrument Calibration Team)',
        content:
          'Instrument passband overlap exceeds 94% — good compatibility for optimal difference imaging.',
        createdAtUtc: '2026-11-14T12:30:00Z',
        resolved: true,
        resolvedAtUtc: '2026-11-14T12:45:00Z',
        isRevisionRequest: false,
        isDemonstrationRecord: true,
      },
    ];
  }

  return [];
}

export function fetchReviewComments(caseId: string): ReviewComment[] {
  try {
    const raw = localStorage.getItem(`${COMMENTS_STORAGE_PREFIX}${caseId}`);
    if (!raw) {
      const initial = getInitialCommentsForCase(caseId);
      if (initial.length > 0) {
        localStorage.setItem(`${COMMENTS_STORAGE_PREFIX}${caseId}`, JSON.stringify(initial));
      }
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialCommentsForCase(caseId);
  }
}

export function saveReviewComments(caseId: string, comments: ReviewComment[]) {
  try {
    localStorage.setItem(`${COMMENTS_STORAGE_PREFIX}${caseId}`, JSON.stringify(comments));
  } catch {
    // Demo persistence fallback
  }
}

export function addReviewComment(
  caseId: string,
  input: {
    authorLabel: string;
    content: string;
    sectionId?: string;
    isRevisionRequest?: boolean;
  }
): ReviewComment {
  const comments = fetchReviewComments(caseId);
  const newComment: ReviewComment = {
    id: `comm-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    investigationId: caseId,
    sectionId: input.sectionId,
    authorLabel: input.authorLabel.trim() || 'Demonstration Reviewer',
    content: input.content.trim(),
    createdAtUtc: new Date().toISOString(),
    resolved: false,
    isRevisionRequest: Boolean(input.isRevisionRequest),
    isDemonstrationRecord: true,
  };

  const updated = [newComment, ...comments];
  saveReviewComments(caseId, updated);
  return newComment;
}

export function toggleResolveComment(caseId: string, commentId: string): ReviewComment | null {
  const comments = fetchReviewComments(caseId);
  let updatedComment: ReviewComment | null = null;

  const updated = comments.map((c) => {
    if (c.id === commentId) {
      const nextResolved = !c.resolved;
      updatedComment = {
        ...c,
        resolved: nextResolved,
        resolvedAtUtc: nextResolved ? new Date().toISOString() : undefined,
      };
      return updatedComment;
    }
    return c;
  });

  saveReviewComments(caseId, updated);
  return updatedComment;
}

export function deleteReviewComment(caseId: string, commentId: string): boolean {
  const comments = fetchReviewComments(caseId);
  const filtered = comments.filter((c) => c.id !== commentId);
  saveReviewComments(caseId, filtered);
  return filtered.length < comments.length;
}

export function fetchSectionReviews(caseId: string): SectionReviewItem[] {
  try {
    const raw = localStorage.getItem(`${SECTIONS_STORAGE_PREFIX}${caseId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Fall back to default
  }

  const defaults: SectionReviewItem[] = STANDARD_REPORT_SECTIONS.map((sec) => ({
    sectionId: sec.sectionId,
    sectionTitle: sec.sectionTitle,
    isReviewed: false,
  }));

  try {
    localStorage.setItem(`${SECTIONS_STORAGE_PREFIX}${caseId}`, JSON.stringify(defaults));
  } catch {
    // Demo persistence fallback
  }

  return defaults;
}

export function toggleSectionReview(
  caseId: string,
  sectionId: string,
  notes?: string
): SectionReviewItem {
  const sections = fetchSectionReviews(caseId);
  let targetItem: SectionReviewItem | undefined;

  const updated = sections.map((item) => {
    if (item.sectionId === sectionId) {
      const nextReviewed = !item.isReviewed;
      targetItem = {
        ...item,
        isReviewed: nextReviewed,
        reviewedAtUtc: nextReviewed ? new Date().toISOString() : undefined,
        notes: notes !== undefined ? notes : item.notes,
      };
      return targetItem;
    }
    return item;
  });

  try {
    localStorage.setItem(`${SECTIONS_STORAGE_PREFIX}${caseId}`, JSON.stringify(updated));
  } catch {
    // Demo persistence fallback
  }

  return targetItem || { sectionId, sectionTitle: sectionId, isReviewed: true };
}

export function fetchReviewHistory(caseId: string): ReviewHistoryEntry[] {
  try {
    const raw = localStorage.getItem(`${HISTORY_STORAGE_PREFIX}${caseId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordReviewAction(
  caseId: string,
  params: {
    action: string;
    actor: string;
    previousReviewState: ReviewWorkflowStatus;
    newReviewState: ReviewWorkflowStatus;
    notes?: string;
  }
): ReviewHistoryEntry {
  const existing = fetchReviewHistory(caseId);
  const entry: ReviewHistoryEntry = {
    id: `rev-hist-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    investigationId: caseId,
    timestampUtc: new Date().toISOString(),
    action: params.action,
    actor: params.actor || 'Lead Investigator (Demo)',
    previousReviewState: params.previousReviewState,
    newReviewState: params.newReviewState,
    notes: params.notes,
  };

  const updated = [entry, ...existing];
  try {
    localStorage.setItem(`${HISTORY_STORAGE_PREFIX}${caseId}`, JSON.stringify(updated));
  } catch {
    // Demo persistence fallback
  }

  return entry;
}
