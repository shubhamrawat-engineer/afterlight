import type { ObservationRecord } from '../../observations/types/observation.types';

export type TemporalWorkspaceMode = 'two_epoch' | 'sequence' | 'grid' | 'overview';

export interface MultiEpochRecord extends ObservationRecord {
  epochIndex: number;
  epochLabel: string;
  daysFromFirst: number;
  daysFromPrevious: number | null;
  completeness: 'complete' | 'partial' | 'minimal';
  missingFields: string[];
  availableFields: string[];
}

export type CandidateChangeCategory =
  | 'brightness_variation'
  | 'positional_shift'
  | 'morphological_change'
  | 'transient_candidate'
  | 'spectral_variation'
  | 'instrumental_artifact'
  | 'unclassified';

export type CandidateChangeStatus = 'unreviewed' | 'under_review' | 'resolved';

export interface CandidateChangeRecord {
  id: string;
  targetId: string;
  category: CandidateChangeCategory;
  title: string;
  description: string;
  associatedEpochIds: string[];
  status: CandidateChangeStatus;
  createdAtUtc: string;
  notes?: string;
  userHypothesis?: string;
}

export interface MultiEpochSequenceState {
  isPlaying: boolean;
  intervalMs: number;
  currentIndex: number;
}

export interface MultiEpochInvestigationSummaryData {
  targetId: string;
  targetTitle: string;
  totalAvailableEpochs: number;
  selectedEpochsCount: number;
  earliestDate: string | null;
  latestDate: string | null;
  totalBaselineDays: number | null;
  selectedObservationIds: string[];
  candidateRecords: CandidateChangeRecord[];
  metadataCompletenessSummary: {
    completeCount: number;
    partialCount: number;
    minimalCount: number;
  };
  scientificLimitations: string[];
}
