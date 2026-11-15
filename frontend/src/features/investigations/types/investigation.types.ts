import type { ReviewWorkflowStatus } from './review.types';

export * from './revision.types';
export * from './review.types';
export * from './reproducibility.types';
export * from './report.types';

export type InvestigationStatus =
  | 'draft'
  | 'in_progress'
  | 'ready_for_review'
  | 'under_review'
  | 'revision_required'
  | 'completed'
  | 'archived'
  | 'submitted'; // backward compatibility

export type SubmissionStatus =
  | 'not_submitted'
  | 'unsubmitted' // backward compatibility
  | 'submitted'
  | 'under_review'
  | 'revision_requested'
  | 'accepted'
  | 'approved'
  | 'rejected';

export type InvestigationConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

export type InvestigationCategory =
  | 'transient_phenomenon'
  | 'stellar_variability'
  | 'proper_motion'
  | 'instrumental_artifact'
  | 'general_anomaly';

export type EvidenceItemType =
  | 'observation_reference'
  | 'difference_asset'
  | 'candidate_measurement'
  | 'user_annotation';

export interface InvestigationEvidenceItem {
  id: string;
  type: EvidenceItemType;
  title: string;
  description: string;
  source_reference: string;
  created_at_utc: string;
}

export interface InvestigationCase {
  id: string;
  title: string;
  summary: string;
  research_objective?: string;
  category?: InvestigationCategory;
  target_id: string;
  target_title: string;
  comparison_job_id: string | null;
  status: InvestigationStatus;
  submission_status: SubmissionStatus;
  review_status?: ReviewWorkflowStatus;
  confidence: InvestigationConfidence;
  what_was_observed: string;
  possible_explanation: string;
  uncertainty: string;
  earlier_obs_id: string | null;
  later_obs_id: string | null;
  selected_epoch_ids?: string[];
  associated_epochs_count?: number;
  earlier_date: string | null;
  later_date: string | null;
  wavelength_um: number | null;
  pair_grade: string | null;
  difference_image: string | null;
  candidate_id: string | null;
  evidence_items: InvestigationEvidenceItem[];
  created_at_utc: string;
  updated_at_utc: string | null;
  submitted_at_utc: string | null;
  archived_at_utc?: string | null;
  revision_count?: number;
}

export interface CreateInvestigationInput {
  title: string;
  summary: string;
  research_objective?: string;
  category?: InvestigationCategory;
  target_id: string;
  target_title?: string;
  comparison_job_id?: string | null;
  confidence: InvestigationConfidence;
  what_was_observed: string;
  possible_explanation: string;
  uncertainty: string;
  earlier_obs_id?: string | null;
  later_obs_id?: string | null;
  selected_epoch_ids?: string[];
  candidate_id?: string | null;
  difference_image?: string | null;
  pair_grade?: string | null;
}

export interface InvestigationFiltersState {
  search: string;
  status: InvestigationStatus | 'all';
  sortBy: 'created_desc' | 'created_asc' | 'updated_desc' | 'updated_asc';
}

export interface InvestigationMetrics {
  total: number;
  draft: number;
  in_progress: number;
  ready_for_review: number;
  under_review: number;
  revision_required: number;
  completed: number;
  archived: number;
  submitted?: number; // legacy backward compatibility
}
