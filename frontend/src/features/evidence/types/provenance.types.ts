export type ProvenanceStageStatus =
  | 'Completed'
  | 'Pending'
  | 'Failed'
  | 'Not available'
  | 'Demonstration only';

export type PipelineStageId =
  | 'observation'
  | 'archive_retrieval'
  | 'calibration'
  | 'image_registration'
  | 'psf_homogenisation'
  | 'measurement_comparison'
  | 'evidence_record';

export interface ProvenanceStageData {
  stageId: PipelineStageId;
  stageNumber: number;
  stageName: string;
  description: string;
  status: ProvenanceStageStatus;
  inputReferences: string[];
  outputReferences: string[];
  processingTimestampUtc: string | null;
  softwarePipelineVersion: string | null;
  validationState: string;
  notes?: string;
  isBackendConfirmed: boolean;
}

export interface CompleteProvenanceLineage {
  lineageId: string;
  targetId: string;
  pipelineName: string;
  stages: ProvenanceStageData[];
  overallValidationState: string;
  lastUpdatedUtc: string;
}
