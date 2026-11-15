import type {
  InvestigationRevision,
  RevisionDiffItem,
} from '../types/revision.types';
import type { InvestigationCase, InvestigationStatus } from '../types/investigation.types';

const REVISION_STORAGE_PREFIX = 'afterlight_investigation_revisions_';

function getStorageKey(caseId: string): string {
  return `${REVISION_STORAGE_PREFIX}${caseId}`;
}

export function fetchRevisionHistory(caseId: string): InvestigationRevision[] {
  try {
    const raw = localStorage.getItem(getStorageKey(caseId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRevisionHistory(caseId: string, revisions: InvestigationRevision[]) {
  try {
    localStorage.setItem(getStorageKey(caseId), JSON.stringify(revisions));
  } catch {
    // Ignore localStorage write failure in demo
  }
}

export function createRevision(
  caseId: string,
  params: {
    changeDescription: string;
    updatedSections: string[];
    previousStatus: InvestigationStatus;
    newStatus: InvestigationStatus;
    userActionLabel: string;
    snapshot: InvestigationCase;
  }
): InvestigationRevision {
  const existing = fetchRevisionHistory(caseId);
  const nextNumber = existing.length + 1;

  const newRevision: InvestigationRevision = {
    revisionId: `rev-${caseId}-${nextNumber}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    investigationId: caseId,
    revisionNumber: nextNumber,
    timestampUtc: new Date().toISOString(),
    changeDescription: params.changeDescription,
    updatedSections: params.updatedSections,
    previousStatus: params.previousStatus,
    newStatus: params.newStatus,
    userActionLabel: params.userActionLabel,
    snapshot: JSON.parse(JSON.stringify(params.snapshot)),
  };

  const updated = [newRevision, ...existing];
  saveRevisionHistory(caseId, updated);
  return newRevision;
}

export function compareRevisions(
  older: InvestigationRevision,
  newer: InvestigationRevision
): RevisionDiffItem[] {
  const diffs: RevisionDiffItem[] = [];
  const fieldsToCheck: { key: keyof InvestigationCase; label: string }[] = [
    { key: 'title', label: 'Investigation Title' },
    { key: 'summary', label: 'Executive Summary' },
    { key: 'research_objective', label: 'Research Objective' },
    { key: 'status', label: 'Investigation Status' },
    { key: 'confidence', label: 'Confidence Level' },
    { key: 'what_was_observed', label: 'Observations Summary' },
    { key: 'possible_explanation', label: 'Possible Explanations' },
    { key: 'uncertainty', label: 'Uncertainties & Limitations' },
    { key: 'earlier_obs_id', label: 'Earlier Observation ID' },
    { key: 'later_obs_id', label: 'Later Observation ID' },
  ];

  for (const field of fieldsToCheck) {
    const beforeVal = older.snapshot ? (older.snapshot as any)[field.key] : null;
    const afterVal = newer.snapshot ? (newer.snapshot as any)[field.key] : null;
    const isChanged = JSON.stringify(beforeVal) !== JSON.stringify(afterVal);

    diffs.push({
      fieldName: String(field.key),
      fieldLabel: field.label,
      beforeValue: beforeVal ?? 'Not specified',
      afterValue: afterVal ?? 'Not specified',
      isChanged,
    });
  }

  return diffs;
}

/**
 * Restores an older revision as a brand-new revision entry.
 * Strictly avoids overwriting past history.
 */
export function restoreRevision(
  caseId: string,
  revisionId: string,
  _currentCase: InvestigationCase
): { restoredCase: InvestigationCase; newRevision: InvestigationRevision } {
  const history = fetchRevisionHistory(caseId);
  const targetRev = history.find((r) => r.revisionId === revisionId);

  if (!targetRev || !targetRev.snapshot) {
    throw new Error(`Revision ${revisionId} could not be found for restoration.`);
  }

  const restoredSnapshot: InvestigationCase = {
    ...(targetRev.snapshot as InvestigationCase),
    updated_at_utc: new Date().toISOString(),
  };

  const newRevision = createRevision(caseId, {
    changeDescription: `Restored snapshot from Revision #${targetRev.revisionNumber} ("${targetRev.changeDescription}")`,
    updatedSections: ['All Sections (Restoration)'],
    previousStatus: _currentCase.status,
    newStatus: restoredSnapshot.status,
    userActionLabel: `Rollback to Rev #${targetRev.revisionNumber}`,
    snapshot: restoredSnapshot,
  });

  return {
    restoredCase: restoredSnapshot,
    newRevision,
  };
}
