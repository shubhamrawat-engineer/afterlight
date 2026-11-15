/**
 * AFTERLIGHT Explorer Data Contract Types
 *
 * Types for Target Discovery, Manifest Inspection, and Region Analysis
 * adhering strictly to the AFTERLIGHT Data Contract.
 */

export type TargetKind = 'deep_field' | 'moving_object' | 'variable_star' | 'control_static';

export type TargetStatus = 'verified' | 'preliminary' | 'mock';

export type PairGrade = 'GOOD' | 'FAIR' | 'POOR';

/**
 * Summary target item returned in the target index (GET /api/targets)
 */
export interface TargetSummary {
  id: string;
  title: string;
  kind: TargetKind;
  status: TargetStatus;
  thumbnail: string | null;
  short_info?: string | null;
  center_ra?: number | null;
  center_dec?: number | null;
  coordinate_frame?: string | null;
  observation_count?: number;
}

/**
 * Full target index envelope returned by GET /api/targets
 */
export interface TargetIndexResponse {
  schema_version: string;
  generated_at: string;
  targets: TargetSummary[];
}

/**
 * Astronomical coordinate region metadata
 */
export interface RegionMetadata {
  center_ra: number | null;
  center_dec: number | null;
  coordinate_frame: string | null;
  cutout_size: string | null;
  pixel_scale: string | null;
  dimensions: {
    width: number;
    height: number;
  } | null;
}

/**
 * Individual observation metadata entry in target manifest
 */
export interface ObservationMetadata {
  id: string;
  observation_id?: string;
  role?: string | null;
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
  display_scaling?: string | null;
}

/**
 * Observation pair compatibility and photometric quality assessment
 */
export interface PairQualitySummary {
  grade: PairGrade;
  wavelength_diff_um: number | null;
  wavelength_diff_pct: number | null;
  time_baseline_days: number | null;
  registration_rms_arcsec: number | null;
  notes: string | null;
  compatibility_warning?: string | null;
}

/**
 * Target manifest returned by GET /api/targets/{id}
 */
export interface TargetManifest {
  id: string;
  title: string;
  kind: TargetKind;
  status: TargetStatus;
  thumbnail: string | null;
  preview_image: string | null;
  region: RegionMetadata;
  observations: ObservationMetadata[];
  pair_quality: PairQualitySummary | null;
  difference?: {
    image: string | null;
    method: string | null;
    method_description: string | null;
    masked_flags_applied: boolean | string[] | null;
    limitations: string | null;
  } | null;
}

/**
 * Client-side search and filtering parameters
 */
export interface ExplorerFilters {
  search: string;
  kind: TargetKind | 'all';
  status: TargetStatus | 'all';
}
