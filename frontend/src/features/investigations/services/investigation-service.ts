import { get, post } from '../../../services/api-client';
import type {
  InvestigationCase,
  CreateInvestigationInput,
  InvestigationMetrics,
  InvestigationCategory,
  InvestigationStatus,
} from '../types/investigation.types';
import { INITIAL_MOCK_INVESTIGATIONS } from '../data/mock-investigations';
import { MOCK_TARGET_MANIFESTS } from '../../explorer/data/mock-targets';
import { getObsId, getObsDate } from '../../observations/services/observation-service';
import { createRevision } from './investigation-revision-service';

const LOCAL_STORAGE_KEY = 'afterlight_investigations_cache';

const CATEGORY_LABELS: Record<InvestigationCategory, string> = {
  transient_phenomenon: 'Transient Phenomenon',
  stellar_variability: 'Stellar Variability',
  proper_motion: 'Proper Motion / Moving Object',
  instrumental_artifact: 'Instrumental / Passband Artifact',
  general_anomaly: 'General Anomaly',
};

export function formatInvestigationCategory(
  category: InvestigationCategory | string | null | undefined
): string {
  if (!category) return 'General Anomaly';
  return CATEGORY_LABELS[category as InvestigationCategory] ?? category;
}

function getStoredCases(): InvestigationCase[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_INVESTIGATIONS));
      return INITIAL_MOCK_INVESTIGATIONS;
    }
    return JSON.parse(raw) as InvestigationCase[];
  } catch {
    return INITIAL_MOCK_INVESTIGATIONS;
  }
}

function saveStoredCases(cases: InvestigationCase[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cases));
  } catch {
    // Ignore localStorage write failures
  }
}

export interface ServiceResult<T> {
  data: T;
  isFallback: boolean;
  error?: string;
}

/**
 * List all investigation cases.
 * Queries GET /api/investigations, falls back to session/mock storage if offline.
 */
export async function fetchInvestigations(): Promise<ServiceResult<InvestigationCase[]>> {
  try {
    const data = await get<InvestigationCase[]>('/api/investigations', { timeoutMs: 5000 });
    return { data, isFallback: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Backend unreachable';
    const cases = getStoredCases();
    return {
      data: cases,
      isFallback: true,
      error: errorMsg,
    };
  }
}

/**
 * Retrieve a single investigation case by ID.
 * Queries GET /api/investigations/{caseId}.
 */
export async function fetchInvestigationDetail(caseId: string): Promise<ServiceResult<InvestigationCase>> {
  try {
    const data = await get<InvestigationCase>(`/api/investigations/${caseId}`, { timeoutMs: 5000 });
    return { data, isFallback: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Case fetch failed';
    const cases = getStoredCases();
    const found = cases.find((c) => c.id === caseId);

    if (found) {
      return {
        data: found,
        isFallback: true,
        error: errorMsg,
      };
    }

    throw new Error(`Investigation case "${caseId}" could not be found.`);
  }
}

/**
 * Create and persist a new investigation case.
 * Queries POST /api/investigations, falls back to local persistence if offline.
 */
export async function createInvestigation(
  input: CreateInvestigationInput
): Promise<ServiceResult<InvestigationCase>> {
  try {
    const data = await post<InvestigationCase>('/api/investigations', input, { timeoutMs: 8000 });
    // Keep local cache in sync
    const cases = getStoredCases();
    saveStoredCases([data, ...cases.filter((c) => c.id !== data.id)]);
    return { data, isFallback: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Backend unavailable for persistence';

    const manifest = MOCK_TARGET_MANIFESTS[input.target_id];
    const earlierObs = manifest?.observations.find((o) => getObsId(o) === input.earlier_obs_id);
    const laterObs = manifest?.observations.find((o) => getObsId(o) === input.later_obs_id);

    // Synthesize fallback persistent investigation
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newCase: InvestigationCase = {
      id: `INV-2026-SPX-${randomSuffix}`,
      title: input.title,
      summary: input.summary,
      category: input.category ?? 'general_anomaly',
      target_id: input.target_id,
      target_title: input.target_title ?? manifest?.title ?? input.target_id,
      comparison_job_id: input.comparison_job_id ?? null,
      status: 'draft',
      submission_status: 'unsubmitted',
      confidence: input.confidence,
      what_was_observed: input.what_was_observed,
      possible_explanation: input.possible_explanation,
      uncertainty: input.uncertainty,
      earlier_obs_id: input.earlier_obs_id ?? null,
      later_obs_id: input.later_obs_id ?? null,
      earlier_date: earlierObs ? getObsDate(earlierObs) : null,
      later_date: laterObs ? getObsDate(laterObs) : null,
      wavelength_um: earlierObs?.wavelength_um ?? laterObs?.wavelength_um ?? null,
      pair_grade: input.pair_grade ?? manifest?.pair_quality?.grade ?? null,
      difference_image: input.difference_image ?? manifest?.difference?.image ?? null,
      candidate_id: input.candidate_id ?? null,
      evidence_items: [
        ...(input.earlier_obs_id
          ? [
              {
                id: `ev-${Date.now()}-1`,
                type: 'observation_reference' as const,
                title: `Earlier Observation Pass (${input.earlier_obs_id})`,
                description: 'Baseline observation epoch referenced from temporal analysis.',
                source_reference: input.earlier_obs_id,
                created_at_utc: new Date().toISOString(),
              },
            ]
          : []),
        ...(input.later_obs_id
          ? [
              {
                id: `ev-${Date.now()}-2`,
                type: 'observation_reference' as const,
                title: `Later Observation Pass (${input.later_obs_id})`,
                description: 'Comparison observation epoch referenced from temporal analysis.',
                source_reference: input.later_obs_id,
                created_at_utc: new Date().toISOString(),
              },
            ]
          : []),
        ...(input.difference_image
          ? [
              {
                id: `ev-${Date.now()}-3`,
                type: 'difference_asset' as const,
                title: 'Residual Difference Map Asset (Demonstration Placeholder)',
                description: 'Demonstration subtraction placeholder registered for target.',
                source_reference: input.difference_image,
                created_at_utc: new Date().toISOString(),
              },
            ]
          : []),
      ],
      created_at_utc: new Date().toISOString(),
      updated_at_utc: null,
      submitted_at_utc: null,
    };

    const cases = getStoredCases();
    saveStoredCases([newCase, ...cases]);

    return {
      data: newCase,
      isFallback: true,
      error: errorMsg,
    };
  }
}

/**
 * Submit an existing investigation case for formal archival review.
 * Queries POST /api/investigations/{caseId}/submit.
 */
export async function submitInvestigation(
  caseId: string
): Promise<ServiceResult<InvestigationCase>> {
  try {
    const data = await post<InvestigationCase>(`/api/investigations/${caseId}/submit`, {}, { timeoutMs: 8000 });
    const cases = getStoredCases();
    saveStoredCases(cases.map((c) => (c.id === caseId ? data : c)));
    return { data, isFallback: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Backend submission failed';
    const cases = getStoredCases();
    const targetCase = cases.find((c) => c.id === caseId);

    if (!targetCase) {
      throw new Error(`Investigation "${caseId}" not found for submission.`);
    }

    const updated: InvestigationCase = {
      ...targetCase,
      status: 'submitted',
      submission_status: 'submitted',
      submitted_at_utc: new Date().toISOString(),
      updated_at_utc: new Date().toISOString(),
    };

    saveStoredCases(cases.map((c) => (c.id === caseId ? updated : c)));

    return {
      data: updated,
      isFallback: true,
      error: errorMsg,
    };
  }
}

/**
 * Compute metric summary counts from an array of investigations.
 */
export function deriveInvestigationMetrics(cases: InvestigationCase[]): InvestigationMetrics {
  const activeCases = cases.filter((c) => c.status !== 'archived');
  return {
    total: activeCases.length,
    draft: cases.filter((c) => c.status === 'draft').length,
    in_progress: cases.filter((c) => c.status === 'in_progress').length,
    ready_for_review: cases.filter((c) => c.status === 'ready_for_review').length,
    under_review: cases.filter((c) => c.status === 'under_review' || c.status === 'submitted').length,
    revision_required: cases.filter((c) => c.status === 'revision_required').length,
    completed: cases.filter((c) => c.status === 'completed').length,
    archived: cases.filter((c) => c.status === 'archived').length,
    submitted: cases.filter((c) => c.status === 'under_review' || c.status === 'submitted').length,
  };
}

/**
 * Duplicate an existing investigation case as a new draft.
 */
export async function duplicateInvestigation(
  caseId: string
): Promise<ServiceResult<InvestigationCase>> {
  const cases = getStoredCases();
  const source = cases.find((c) => c.id === caseId);

  if (!source) {
    throw new Error(`Investigation "${caseId}" not found for duplication.`);
  }

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();
  const duplicateId = `INV-2026-SPX-${randomSuffix}`;

  const duplicatedCase: InvestigationCase = {
    ...source,
    id: duplicateId,
    title: `[Copy] ${source.title}`,
    status: 'draft',
    submission_status: 'not_submitted',
    created_at_utc: now,
    updated_at_utc: null,
    submitted_at_utc: null,
    archived_at_utc: null,
    revision_count: 1,
  };

  saveStoredCases([duplicatedCase, ...cases]);

  // Initialize revision 1 for duplicate
  createRevision(duplicateId, {
    changeDescription: `Duplicated from case ${source.id} ("${source.title}")`,
    updatedSections: ['All Sections (Duplication)'],
    previousStatus: 'draft',
    newStatus: 'draft',
    userActionLabel: 'Duplicated Case Draft',
    snapshot: duplicatedCase,
  });

  return {
    data: duplicatedCase,
    isFallback: true,
  };
}

/**
 * Archive an investigation case.
 */
export async function archiveInvestigation(
  caseId: string
): Promise<ServiceResult<InvestigationCase>> {
  const cases = getStoredCases();
  const targetCase = cases.find((c) => c.id === caseId);

  if (!targetCase) {
    throw new Error(`Investigation "${caseId}" not found for archiving.`);
  }

  const prevStatus = targetCase.status;
  const now = new Date().toISOString();
  const updatedCase: InvestigationCase = {
    ...targetCase,
    status: 'archived',
    archived_at_utc: now,
    updated_at_utc: now,
  };

  saveStoredCases(cases.map((c) => (c.id === caseId ? updatedCase : c)));

  createRevision(caseId, {
    changeDescription: `Investigation archived. Previous status: ${prevStatus}.`,
    updatedSections: ['Status (Archived)'],
    previousStatus: prevStatus,
    newStatus: 'archived',
    userActionLabel: 'Archived Case',
    snapshot: updatedCase,
  });

  return {
    data: updatedCase,
    isFallback: true,
  };
}

/**
 * Restore an archived investigation case to draft status.
 */
export async function restoreArchivedInvestigation(
  caseId: string
): Promise<ServiceResult<InvestigationCase>> {
  const cases = getStoredCases();
  const targetCase = cases.find((c) => c.id === caseId);

  if (!targetCase) {
    throw new Error(`Investigation "${caseId}" not found for restoration.`);
  }

  const now = new Date().toISOString();
  const updatedCase: InvestigationCase = {
    ...targetCase,
    status: 'draft',
    archived_at_utc: null,
    updated_at_utc: now,
  };

  saveStoredCases(cases.map((c) => (c.id === caseId ? updatedCase : c)));

  createRevision(caseId, {
    changeDescription: 'Investigation restored from archive to active Draft state.',
    updatedSections: ['Status (Restored)'],
    previousStatus: 'archived',
    newStatus: 'draft',
    userActionLabel: 'Restored from Archive',
    snapshot: updatedCase,
  });

  return {
    data: updatedCase,
    isFallback: true,
  };
}

/**
 * Delete an investigation case permanently from local cache.
 */
export async function deleteInvestigation(
  caseId: string
): Promise<ServiceResult<boolean>> {
  const cases = getStoredCases();
  const exists = cases.some((c) => c.id === caseId);

  if (!exists) {
    throw new Error(`Investigation "${caseId}" not found for deletion.`);
  }

  saveStoredCases(cases.filter((c) => c.id !== caseId));

  try {
    localStorage.removeItem(`afterlight_investigation_revisions_${caseId}`);
    localStorage.removeItem(`afterlight_review_comments_${caseId}`);
    localStorage.removeItem(`afterlight_section_reviews_${caseId}`);
    localStorage.removeItem(`afterlight_review_history_${caseId}`);
  } catch {
    // Ignore storage deletion errors
  }

  return {
    data: true,
    isFallback: true,
  };
}

/**
 * Update the status of an investigation and record a revision.
 */
export async function updateInvestigationStatus(
  caseId: string,
  newStatus: InvestigationStatus,
  actionDescription?: string
): Promise<ServiceResult<InvestigationCase>> {
  const cases = getStoredCases();
  const targetCase = cases.find((c) => c.id === caseId);

  if (!targetCase) {
    throw new Error(`Investigation "${caseId}" not found.`);
  }

  const prevStatus = targetCase.status;
  const now = new Date().toISOString();
  const updatedCase: InvestigationCase = {
    ...targetCase,
    status: newStatus,
    updated_at_utc: now,
  };

  saveStoredCases(cases.map((c) => (c.id === caseId ? updatedCase : c)));

  createRevision(caseId, {
    changeDescription: actionDescription ?? `Status updated from ${prevStatus} to ${newStatus}.`,
    updatedSections: ['Status'],
    previousStatus: prevStatus,
    newStatus,
    userActionLabel: `Status Change: ${newStatus}`,
    snapshot: updatedCase,
  });

  return {
    data: updatedCase,
    isFallback: true,
  };
}

/**
 * Builds the structured JSON export payload for an investigation case.
 */
export function buildInvestigationExportPayload(investigation: InvestigationCase) {
  return {
    schema_version: 'AFTERLIGHT-CASE-V1',
    exported_at_utc: new Date().toISOString(),
    data_notice: 'Demonstration investigation dossier exported from AFTERLIGHT frontend.',
    investigation: {
      ...investigation,
      category: investigation.category ?? 'general_anomaly',
      archive_metadata: {
        system: 'AFTERLIGHT Astronomical Exploration Platform',
        team: 'Team ASTRION',
        mission: 'NASA SPHEREx',
      },
    },
  };
}

/**
 * Export investigation case as a formatted scientific JSON file.
 */
export function triggerInvestigationJsonDownload(investigation: InvestigationCase) {
  const exportPayload = buildInvestigationExportPayload(investigation);

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${investigation.id}_scientific_dossier.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
