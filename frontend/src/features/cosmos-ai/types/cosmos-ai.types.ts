export * from './explanation.types';
export * from './conversation.types';

export type AIAvailabilityStatus =
  | 'available'
  | 'unavailable'
  | 'not_configured'
  | 'processing'
  | 'checking';

export type AIContextType =
  | 'general'
  | 'global'
  | 'target'
  | 'observations'
  | 'observation'
  | 'temporal'
  | 'multi_epoch'
  | 'evidence'
  | 'spectral'
  | 'investigation'
  | 'object';

export interface AISourceReference {
  id: string;
  title: string;
  type: 'observation' | 'comparison' | 'catalogue' | 'documentation' | 'pipeline';
  referenceUrl?: string;
  internalRoute?: string;
}

export interface AIMeasurementItem {
  parameter: string;
  value: number | string;
  unit?: string;
  uncertainty?: string | number;
}

export interface StructuredAIResponse {
  directAnswer: string;
  observationalEvidence?: string[];
  measurements?: AIMeasurementItem[];
  interpretation?: string;
  limitations?: string[];
  sourceReferences?: AISourceReference[];
}

export interface AIContextReference {
  type: AIContextType;
  targetId?: string;
  targetName?: string;
  observationIds?: string[];
  comparisonId?: string;
  spectralSourceId?: string;
  caseId?: string;
  objectId?: string;
  summaryLabel?: string;
  details?: Record<string, string | number | boolean>;
}

export interface SuggestedQuestion {
  id: string;
  category: 'general' | 'observations' | 'temporal' | 'spectral' | 'investigation' | 'object';
  question: string;
  contextType?: AIContextType;
}

export interface AIInquiryPayload {
  prompt: string;
  context?: AIContextReference;
  conversationId?: string;
}

export interface AIBackendStatusResponse {
  configured: boolean;
  provider?: string;
  model?: string;
  streamingSupported?: boolean;
  status: string;
}
