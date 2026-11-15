import type { InvestigationStatus } from './investigation.types';

export interface InvestigationRevision {
  revisionId: string;
  investigationId: string;
  revisionNumber: number;
  timestampUtc: string;
  changeDescription: string;
  updatedSections: string[];
  previousStatus: InvestigationStatus;
  newStatus: InvestigationStatus;
  userActionLabel: string;
  snapshot: Record<string, any>;
}

export interface RevisionDiffItem {
  fieldName: string;
  fieldLabel: string;
  beforeValue: string | number | boolean | null | undefined;
  afterValue: string | number | boolean | null | undefined;
  isChanged: boolean;
}
