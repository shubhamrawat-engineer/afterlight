export interface ReproducibilityRecordData {
  investigationId: string;
  revisionNumber: number;
  targetId: string;
  targetTitle: string;
  skyCoordinates: {
    raDeg: number | null;
    decDeg: number | null;
    coordinateFrame: string;
  };
  observationIds: string[];
  selectedEarlierObsId: string | null;
  selectedLaterObsId: string | null;
  selectedMultiEpochObsIds: string[];
  compatibilityAssessmentState: string;
  comparisonMode: string;
  evidenceRecordReference: string;
  provenanceStatus: string;
  dataSourceClassification: 'DEMONSTRATION_FIXTURE' | 'VERIFIED_BACKEND' | 'SPHEREx_VERIFIED_ARCHIVE';
  applicationVersion: string;
  reportGenerationTimestampUtc: string;
  unavailableBackendMetadata: string[];
}
