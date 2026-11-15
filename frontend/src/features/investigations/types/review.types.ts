export type ReviewWorkflowStatus =
  | 'NOT_SUBMITTED'
  | 'SUBMITTED_FOR_REVIEW'
  | 'UNDER_REVIEW'
  | 'REVISION_REQUESTED'
  | 'APPROVED'
  | 'REJECTED';

export interface ReviewComment {
  id: string;
  investigationId: string;
  sectionId?: string;
  authorLabel: string;
  content: string;
  createdAtUtc: string;
  resolved: boolean;
  resolvedAtUtc?: string;
  isRevisionRequest: boolean;
  isDemonstrationRecord: boolean;
}

export interface SectionReviewItem {
  sectionId: string;
  sectionTitle: string;
  isReviewed: boolean;
  reviewedAtUtc?: string;
  notes?: string;
}

export interface ReviewHistoryEntry {
  id: string;
  investigationId: string;
  timestampUtc: string;
  action: string;
  actor: string;
  previousReviewState: ReviewWorkflowStatus;
  newReviewState: ReviewWorkflowStatus;
  notes?: string;
}
