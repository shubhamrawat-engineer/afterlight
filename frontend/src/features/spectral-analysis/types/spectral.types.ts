export type QualityFlag =
  | 'OK'
  | 'NOISY'
  | 'EDGE_CHANNEL'
  | 'CALIBRATION_WARNING'
  | 'INTERPOLATED'
  | 'SATURATED';

export type ComparisonMode = 'single' | 'overlay' | 'toggle';

export interface SpectralDataPoint {
  index: number;
  wavelength_um: number;
  signal_value: number;
  uncertainty: number | null;
  quality_flag: QualityFlag;
  quality_flag_description?: string;
}

export interface SpectralProfile {
  epoch_id: string;
  epoch_label: string;
  observation_id: string;
  obs_date_utc: string;
  source_id?: string;
  flux_unit: string;
  wavelength_unit: string;
  wavelength_min_um: number;
  wavelength_max_um: number;
  sampling_resolution: string;
  color: string;
  data_points: SpectralDataPoint[];
}

export interface SpectralProvenance {
  archive_source: string;
  mission: string;
  instrument_configuration: string;
  extraction_method: string;
  pipeline_version: string;
  retrieval_date_utc: string;
  archive_citation: string;
  doi_url?: string;
}

export interface TargetSpectralRecord {
  target_id: string;
  target_title: string;
  target_kind: string;
  status: string;
  supported_wavelength_range: string;
  profiles: SpectralProfile[];
  provenance: SpectralProvenance;
}

export interface ChartViewport {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  zoomLevel: number;
  panOffset: { x: number; y: number };
}
