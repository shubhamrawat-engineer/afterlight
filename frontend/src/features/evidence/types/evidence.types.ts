export type { TargetStatus, TargetKind, PairGrade, RegionMetadata } from '../../explorer/types/explorer.types';
import type { TargetStatus, TargetKind, PairGrade, RegionMetadata } from '../../explorer/types/explorer.types';
import type { ObservationRecord } from '../../observations/types/observation.types';

export * from './measurement.types';
export * from './provenance.types';

export type ChangeCategory =
  | 'brightness_variation'
  | 'apparent_motion'
  | 'morphological_expansion'
  | 'color_evolution'
  | 'static_invariant';

export type EvidenceLabelType = 'OBSERVED' | 'MEASURED' | 'INTERPRETATION' | 'UNKNOWN';

export type ExplanationCategory =
  | 'astrophysical'
  | 'instrumental'
  | 'registration'
  | 'background'
  | 'calibration'
  | 'insufficient_evidence';

export type ExplanationLikelihood = 'PLAUSIBLE' | 'CONSIDERED' | 'UNLIKELY' | 'UNKNOWN';

export interface ScientificMeasurement {
  id: string;
  parameter: string;
  label: string;
  earlier_value: number | string | null;
  later_value: number | string | null;
  delta_value: number | string | null;
  unit: string;
  uncertainty: number | string | null;
  method: string;
  provenance: string;
}

export interface PossibleExplanation {
  id: string;
  title: string;
  category: ExplanationCategory;
  likelihood: ExplanationLikelihood;
  description: string;
  supporting_evidence: string[];
  limitations: string[];
}

export interface CandidateDetection {
  id: string;
  label: string;
  pixel_x: number;
  pixel_y: number;
  ra_deg: number;
  dec_deg: number;
  change_category: ChangeCategory;
  significance_sigma?: number | null;
  observed_summary: string;
  measured_summary: string;
  measurements: ScientificMeasurement[];
  possible_explanations: PossibleExplanation[];
  unknowns: string[];
  supporting_observations: string[];
}

export interface ScientificProvenance {
  archive_source: string;
  mission: string;
  earlier_obs_id: string;
  later_obs_id: string;
  pipeline_version: string;
  subtraction_method: string;
  processing_date_utc: string;
  archive_citation: string;
  source_url?: string | null;
  storage_asset_id?: string | null;
}

export interface InvestigationSummaryData {
  what_was_observed: string[];
  what_was_measured: string[];
  what_could_explain_it: string[];
  what_remains_unknown: string[];
  what_evidence_is_needed_next: string[];
}

export interface EvidenceRecord {
  targetId: string;
  targetTitle: string;
  targetKind: TargetKind;
  targetStatus: TargetStatus;
  comparisonJobId?: string | null;
  earlierObs: ObservationRecord | null;
  laterObs: ObservationRecord | null;
  pairGrade: PairGrade | null;
  pairNotes?: string | null;
  differenceImage: string | null;
  region: RegionMetadata;
  candidates: CandidateDetection[];
  provenance: ScientificProvenance;
  summary: InvestigationSummaryData;
}

// ============================================================================
// Phase 5 Enhanced Contracts: Quality Flags, Uncertainties, Ledger, Overview
// ============================================================================

export type QualityFlagIdentifier =
  | 'BAD_PIXEL_MASK'
  | 'COSMIC_RAY_REJECTION'
  | 'EDGE_VIGNETTE'
  | 'SATURATION'
  | 'BACKGROUND_MISMATCH'
  | 'ASTROMETRIC_REGISTRATION_PENDING'
  | 'PSF_HOMOGENISATION_PENDING'
  | 'PHOTOMETRIC_CALIBRATION_PENDING'
  | 'DEMONSTRATION_FIXTURE';

export type QualityFlagSeverity = 'CRITICAL' | 'WARNING' | 'INFORMATIONAL' | 'CAUTION';
export type QualityFlagReviewStatus = 'UNREVIEWED' | 'REVIEWED' | 'WAIVED' | 'CONFIRMED';
export type QualityFlagSource = 'BACKEND_CONFIRMED' | 'AVAILABLE';

export interface ScientificQualityFlag {
  id: string;
  flag: QualityFlagIdentifier;
  name: string;
  severity: QualityFlagSeverity;
  description: string;
  affectedObservation: string;
  scientificImplication: string;
  reviewStatus: QualityFlagReviewStatus;
  source: QualityFlagSource;
}

export interface UncertaintyCategoryItem {
  id: string;
  categoryName: string;
  value: number | string | null;
  unit: string;
  status: 'AVAILABLE' | 'PENDING_BACKEND' | 'UNAVAILABLE' | 'AVAILABLE';
  method: string;
  notes: string;
  isDemonstrationOnly: boolean;
}

export interface UncertaintyBreakdown {
  statistical: UncertaintyCategoryItem;
  calibration: UncertaintyCategoryItem;
  background: UncertaintyCategoryItem;
  astrometric: UncertaintyCategoryItem;
  instrumental: UncertaintyCategoryItem;
  processing: UncertaintyCategoryItem;
  missingNotes: string[];
}

export type EvidenceLedgerCategory =
  | 'PHOTOMETRIC'
  | 'ASTROMETRIC'
  | 'SPECTRAL'
  | 'TEMPORAL'
  | 'CALIBRATION'
  | 'MORPHOLOGICAL';

export interface EvidenceLedgerEntry {
  id: string;
  category: EvidenceLedgerCategory;
  associatedObsIds: string[];
  timestampUtc: string;
  description: string;
  source: string;
  processingStage: string;
  validationStatus:
    | 'AVAILABLE'
    | 'PENDING_VALIDATION'
    | 'INCOMPLETE'
    | 'AVAILABLE'
    | 'NOT_AVAILABLE';
  uncertaintyAvailability: 'FULL' | 'PARTIAL' | 'UNAVAILABLE' | 'PENDING_BACKEND';
  provenanceReference?: string;
  metadata?: Record<string, string | number | boolean>;
}

export type ScientificEvidenceStatus =
  | 'AVAILABLE'
  | 'PENDING VALIDATION'
  | 'INCOMPLETE'
  | 'DEMONSTRATION ONLY'
  | 'NOT AVAILABLE';

export interface EvidenceOverviewData {
  investigationId: string;
  targetId: string;
  targetTitle: string;
  skyRegion: string;
  associatedEpochIds: string[];
  selectedObservationIds: string[];
  temporalBaseline: string;
  evidenceStatus: ScientificEvidenceStatus;
  measurementAvailability: string;
  scientificValidationStatus: string;
  isDemonstrationOnly: boolean;
}

export interface StructuredInterpretation {
  id: string;
  title: string;
  category: ExplanationCategory;
  description: string;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  missingInformation: string[];
  additionalValidationRequired: string[];
  isDemonstrationOnly: boolean;
}
