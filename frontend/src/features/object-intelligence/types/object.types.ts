export type ObjectCategory =
  | 'transient_candidate'
  | 'variable_star'
  | 'moving_object'
  | 'brown_dwarf'
  | 'deep_field_source'
  | 'calibration_standard';

export type IdentificationStatus = 'VERIFIED' | 'PROVISIONAL' | 'CALIBRATION';

export interface CatalogueMatch {
  catalogue_name: string;
  catalogue_id: string;
  ra_deg: number;
  dec_deg: number;
  angular_separation_arcsec: number;
  match_quality: 'CONFIRMED' | 'TENTATIVE' | 'NO_MATCH';
  reference_url?: string;
}

export interface TemporalMotionRecord {
  has_motion_data: boolean;
  motion_type: 'proper_motion' | 'flux_variability' | 'morphological_expansion' | 'static_invariant';
  measured_displacement_arcsec?: number | null;
  motion_rate_mas_per_day?: number | null;
  position_angle_deg?: number | null;
  flux_delta_value?: number | null;
  flux_unit?: string;
  uncertainty?: number | null;
  time_baseline_days: number;
  scientific_notes: string;
  warnings: string[];
}

export interface ObjectObservationEntry {
  observation_id: string;
  date_utc: string;
  wavelength_um: number;
  product_type: string;
  data_release: string;
  detector: string;
}

export interface RelatedInvestigationRef {
  case_id: string;
  title: string;
  status: string;
  confidence: string;
}

export interface CelestialObject {
  id: string;
  target_id: string;
  name: string;
  designation: string;
  category: ObjectCategory;
  status: IdentificationStatus;
  ra_deg: number;
  dec_deg: number;
  coordinate_frame: string;
  preview_image: string | null;
  description: string;
  associated_region: string;
  observations: ObjectObservationEntry[];
  temporal_behaviour: TemporalMotionRecord;
  has_spectral_data: boolean;
  spectral_wavelength_range?: string;
  catalogue_matches: CatalogueMatch[];
  related_investigations: RelatedInvestigationRef[];
  provenance: {
    catalogue_source: string;
    archive: string;
    astrometric_reference: string;
    pipeline_version: string;
    retrieval_date_utc: string;
  };
}

export interface ObjectFiltersState {
  search: string;
  category: ObjectCategory | 'all';
  sortBy: 'name_asc' | 'ra_asc' | 'obs_count_desc';
}
