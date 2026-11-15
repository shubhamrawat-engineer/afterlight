export type MeasurementValidationStatus =
  | 'AVAILABLE'
  | 'PENDING_VALIDATION'
  | 'INCOMPLETE'
  | 'AVAILABLE'
  | 'NOT_AVAILABLE';

export interface PhotometricMeasurementData {
  id: string;
  parameter: string;
  label: string;
  flux: number | null;
  fluxUnit: string;
  fluxUncertainty: number | null;
  snr: number | null;
  backgroundLevel: number | null;
  backgroundUnit: string;
  calibrationStatus: string;
  apertureRadiusArcsec: number | null;
  apertureMethod: string;
  sourceObsId: string;
  provenance: string;
  validationStatus: MeasurementValidationStatus;
  notes?: string;
}

export interface AstrometricMeasurementData {
  id: string;
  parameter: string;
  label: string;
  raDeg: number | null;
  decDeg: number | null;
  coordinateFrame: string;
  positionalUncertaintyArcsec: number | null;
  observationEpoch: string;
  registrationStatus: string;
  sourceObsId: string;
  provenance: string;
  validationStatus: MeasurementValidationStatus;
  notes?: string;
}

export interface SpectralMeasurementData {
  id: string;
  parameter: string;
  label: string;
  wavelengthUm: number | null;
  spectralFluxDensity: number | null;
  fluxDensityUnit: string;
  fluxUncertainty: number | null;
  passbandLabel: string;
  passbandRangeUm: string;
  spectralResponseAvailable: boolean;
  detectorArray: string;
  pixelPosition: { x: number; y: number } | null;
  sourceObsId: string;
  provenance: string;
  validationStatus: MeasurementValidationStatus;
  notes?: string;
}

export interface TemporalMeasurementData {
  id: string;
  parameter: string;
  label: string;
  observationTimestampUtc: string;
  timeIntervalDays: number | null;
  baselineDurationDays: number | null;
  associatedEpochCount: number;
  cadenceDescription: string;
  availabilityAcrossEpochs: {
    epochId: string;
    label: string;
    date: string;
    available: boolean;
    reasonIfMissing?: string;
  }[];
  sourceObsId: string;
  provenance: string;
  validationStatus: MeasurementValidationStatus;
  notes?: string;
}

export interface CategorizedMeasurements {
  photometric: PhotometricMeasurementData[];
  astrometric: AstrometricMeasurementData[];
  spectral: SpectralMeasurementData[];
  temporal: TemporalMeasurementData[];
}
