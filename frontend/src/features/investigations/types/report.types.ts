import type { CompleteEvidenceBundle } from '../../evidence/services/evidence-service';
import type { InvestigationCase } from './investigation.types';
import type { ReproducibilityRecordData } from './reproducibility.types';

export type ReportSectionId =
  | 'identity'
  | 'objective'
  | 'target_observation'
  | 'timeline'
  | 'compatibility'
  | 'temporal_comparison'
  | 'measurements'
  | 'uncertainty_flags'
  | 'evidence_ledger'
  | 'provenance'
  | 'explanations'
  | 'limitations'
  | 'validation_required'
  | 'reproducibility'
  | 'references';

export interface ReportSectionConfig {
  id: ReportSectionId;
  title: string;
  included: boolean;
  isEditableText: boolean;
  userText?: string;
  defaultText?: string;
}

export interface CompleteScientificReportData {
  reportId: string;
  investigation: InvestigationCase;
  evidenceBundle: CompleteEvidenceBundle | null;
  reproducibility: ReproducibilityRecordData;
  sections: ReportSectionConfig[];
  generatedAtUtc: string;
  isDemonstrationOnly: boolean;
  userExecutiveSummary?: string;
  userResearchObjective?: string;
  userConclusion?: string;
}
