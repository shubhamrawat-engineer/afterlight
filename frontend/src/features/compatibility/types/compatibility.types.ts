import type { ObservationRecord } from '../../observations/types/observation.types';

export type CompatibilityStatus =
  | 'READY_FOR_REVIEW'
  | 'CONDITIONALLY_READY'
  | 'INSUFFICIENT_METADATA'
  | 'NOT_ASSESSED';

export type CompatibilityTask =
  | 'visual'
  | 'difference_image'
  | 'photometric'
  | 'astrometric'
  | 'spectral';

export interface CompatibilityRequirement {
  id: string;
  name: string;
  isSatisfied: boolean;
  importance: 'essential' | 'conditional' | 'recommended';
  description: string;
  availableDetail?: string | null;
  missingImpact?: string | null;
}

export interface CompatibilityAssessment {
  task: CompatibilityTask;
  title: string;
  taskDescription: string;
  status: CompatibilityStatus;
  statusSummary: string;
  availableInformation: string[];
  missingInformation: string[];
  whyMissingMatters: string;
  requiredValidation: string;
  safeConclusions: string;
  requirements: CompatibilityRequirement[];
}

export interface CompatibilityDossier {
  targetId: string;
  targetTitle: string;
  earlierObs: ObservationRecord | null;
  laterObs: ObservationRecord | null;
  earlierId: string | null;
  laterId: string | null;
  temporalBaselineDays: number | null;
  wavelengthDeltaUm: number | null;
  wavelengthDeltaPct: number | null;
  passbandOverlapPct?: number | null;
  resolutionRatio?: number | null;
  isChronologicallyInverted?: boolean;
  overallStatus: CompatibilityStatus;
  overallSummary: string;
  missingMetadataSummary: string[];
  outstandingValidationSummary: string[];
  assessments: Record<CompatibilityTask, CompatibilityAssessment>;
  evaluatedAtUtc: string;
  isFallback: boolean;
  offlineFallbackReason?: string | null;
}
