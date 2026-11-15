import type { AIMeasurementItem } from './cosmos-ai.types';

export type ExplanationMode = 'researcher' | 'curious_explorer' | 'kids';

export interface EvidenceExplanationData {
  availableEvidence: string[];
  supportingMeasurements: AIMeasurementItem[];
  contradictingEvidence: string[];
  missingInformation: string[];
  instrumentalCaveats: string[];
  possibleAstrophysicalExplanations: string[];
  recommendedNextSteps: string[];
  dataClassification: 'VERIFIED_BACKEND' | 'DEMONSTRATION_FIXTURE';
}

export type PossibleExplanationCategory =
  | 'astrophysical'
  | 'instrumental'
  | 'calibration'
  | 'background'
  | 'astrometric'
  | 'insufficient_evidence';

export interface PossibleExplanationItem {
  id: string;
  category: PossibleExplanationCategory;
  categoryLabel: string;
  explanation: string;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  missingInformation: string[];
  validationRequired: string[];
  relevantObservationIds: string[];
  provenanceReferences: string[];
}
