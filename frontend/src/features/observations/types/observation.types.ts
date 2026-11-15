import type { TargetStatus, TargetKind, PairQualitySummary, PairGrade, RegionMetadata } from '../../explorer/types/explorer.types';

export type ObservationRole = 'earlier' | 'later' | 'reference' | 'comparison' | 'candidate';

export type DisplayScaling = 'linear' | 'asinh' | 'log' | 'sqrt';

/**
 * Standard observation record adhering to the AFTERLIGHT Observation Data Contract.
 * Normalizes both direct property names and backend variant keys.
 */
export interface ObservationRecord {
  id: string;
  observation_id?: string;
  role?: ObservationRole | string | null;
  date: string | null;
  obs_time_utc?: string | null;
  product?: string | null;
  product_type?: string | null;
  release?: string | null;
  data_release?: string | null;
  wavelength_um: number | null;
  wavelength_range_um?: string | null;
  units?: string | null;
  detector?: string | null;
  source_url?: string | null;
  image?: string | null;
  display_scaling?: DisplayScaling | string | null;
}

/**
 * Pair of selected observations designated for temporal investigation.
 */
export interface ObservationPairSelection {
  earlierId: string | null;
  laterId: string | null;
}

/**
 * High-level summary metrics derived for the observation catalogue.
 */
export interface CatalogueSummaryMetrics {
  totalObservations: number;
  earliestDate: string | null;
  latestDate: string | null;
  timeBaselineDays: number | null;
  pairGrade: PairGrade | null;
  isComparisonReady: boolean;
}

/**
 * Sort options for multi-epoch observation inventories.
 */
export type ObservationSortOrder = 'chronological_asc' | 'chronological_desc' | 'wavelength_asc';

export type {
  TargetStatus,
  TargetKind,
  PairQualitySummary,
  PairGrade,
  RegionMetadata,
};
