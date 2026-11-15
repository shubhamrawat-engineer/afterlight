import type {
  TargetManifest,
  TargetStatus,
  TargetKind,
  PairQualitySummary,
  PairGrade,
  RegionMetadata,
} from '../../explorer/types/explorer.types';
import type { ObservationRecord } from '../../observations/types/observation.types';

export type ComparisonMode = 'then_now' | 'side_by_side' | 'blink' | 'difference';

export type ActiveEpoch = 'then' | 'now';

/**
 * Calibrated difference image processing metadata.
 * Adheres strictly to the AFTERLIGHT Scientific Data Contract.
 */
export interface DifferenceMetadata {
  image: string | null;
  method: string | null;
  method_description: string | null;
  masked_flags_applied: boolean | string[] | null;
  limitations: string | null;
}

/**
 * Synchronized viewport coordinates and zoom scale
 * shared identically across THEN, NOW, SIDE-BY-SIDE, BLINK, and DIFFERENCE views.
 */
export interface SyncedViewportState {
  scale: number;
  position: { x: number; y: number };
}

/**
 * State configuration for astronomical Blink Mode.
 */
export interface BlinkState {
  isPlaying: boolean;
  intervalMs: number;
  currentEpoch: ActiveEpoch;
}

/**
 * Verification status vs. Pair compatibility comparison status
 */
export interface ComparisonStatusInfo {
  targetStatus: TargetStatus;
  pairGrade: PairGrade | null;
  isComparisonReady: boolean;
  compatibilityEstablished: boolean;
  hasDifferenceAsset: boolean;
}

export type {
  TargetManifest,
  TargetStatus,
  TargetKind,
  PairQualitySummary,
  PairGrade,
  RegionMetadata,
  ObservationRecord,
};

export type {
  TemporalWorkspaceMode,
  MultiEpochRecord,
  CandidateChangeCategory,
  CandidateChangeStatus,
  CandidateChangeRecord,
  MultiEpochSequenceState,
  MultiEpochInvestigationSummaryData,
} from './multi-epoch.types';
