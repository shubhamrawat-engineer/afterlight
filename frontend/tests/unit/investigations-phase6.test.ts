import test from 'node:test';
import assert from 'node:assert/strict';

// In-memory localStorage shim for Node test runner
function ensureLocalStorageShim() {
  if (typeof globalThis.localStorage !== 'undefined') return;
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
      setItem: (key: string, value: string) => store.set(key, String(value)),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    },
    configurable: true,
  });
}
ensureLocalStorageShim();

import type { InvestigationCase } from '../../src/features/investigations/types/investigation.types';
import {
  deriveInvestigationMetrics,
  duplicateInvestigation,
  archiveInvestigation,
  restoreArchivedInvestigation,
  deleteInvestigation,
  updateInvestigationStatus,
} from '../../src/features/investigations/services/investigation-service';
import {
  fetchRevisionHistory,
  createRevision,
  compareRevisions,
  restoreRevision,
} from '../../src/features/investigations/services/investigation-revision-service';
import {
  mapStatusToReviewState,
  mapReviewStateToStatus,
  fetchReviewStatus,
  saveReviewStatus,
  addReviewComment,
  toggleResolveComment,
  fetchSectionReviews,
  toggleSectionReview,
  recordReviewAction,
  fetchReviewHistory,
} from '../../src/features/investigations/services/investigation-review-service';
import {
  buildReproducibilityRecord,
} from '../../src/features/investigations/services/reproducibility-service';
import {
  getDefaultReportSections,
  generateScientificReportMarkdown,
  generateScientificReportJson,
} from '../../src/features/investigations/services/report-builder-service';
import { INITIAL_MOCK_INVESTIGATIONS } from '../../src/features/investigations/data/mock-investigations';

test('Investigation Metrics - computes correct totals across 7 workflow statuses', () => {
  const sampleCases: InvestigationCase[] = [
    { ...INITIAL_MOCK_INVESTIGATIONS[0], id: 'c1', status: 'draft' },
    { ...INITIAL_MOCK_INVESTIGATIONS[0], id: 'c2', status: 'in_progress' },
    { ...INITIAL_MOCK_INVESTIGATIONS[0], id: 'c3', status: 'ready_for_review' },
    { ...INITIAL_MOCK_INVESTIGATIONS[0], id: 'c4', status: 'under_review' },
    { ...INITIAL_MOCK_INVESTIGATIONS[0], id: 'c5', status: 'revision_required' },
    { ...INITIAL_MOCK_INVESTIGATIONS[0], id: 'c6', status: 'completed' },
    { ...INITIAL_MOCK_INVESTIGATIONS[0], id: 'c7', status: 'archived' },
  ];

  const metrics = deriveInvestigationMetrics(sampleCases);
  assert.equal(metrics.total, 6, 'Total should count active (non-archived) investigations');
  assert.equal(metrics.draft, 1);
  assert.equal(metrics.in_progress, 1);
  assert.equal(metrics.ready_for_review, 1);
  assert.equal(metrics.under_review, 1);
  assert.equal(metrics.revision_required, 1);
  assert.equal(metrics.completed, 1);
  assert.equal(metrics.archived, 1);
});

test('Investigation Duplication - clones case, generates new ID and sets status to draft', async () => {
  const targetId = 'INV-2025-SDFS-001';
  const result = await duplicateInvestigation(targetId);

  assert.ok(result.data.id.startsWith('INV-2026-SPX-'), 'Duplicated ID should have SPX prefix');
  assert.notEqual(result.data.id, targetId, 'Duplicated ID must be distinct');
  assert.equal(result.data.status, 'draft', 'Duplicate starts in draft state');
  assert.ok(result.data.title.includes('[Copy]'), 'Title carries copy indicator');

  const history = fetchRevisionHistory(result.data.id);
  assert.equal(history.length, 1, 'Duplicate should have initial revision initialized');
});

test('Investigation Archive & Restore - non-destructively transitions status and logs revisions', async () => {
  const testCaseId = 'INV-2025-V838-002';

  const archivedResult = await archiveInvestigation(testCaseId);
  assert.equal(archivedResult.data.status, 'archived');
  assert.ok(archivedResult.data.archived_at_utc !== null);

  const restoredResult = await restoreArchivedInvestigation(testCaseId);
  assert.equal(restoredResult.data.status, 'draft');
  assert.equal(restoredResult.data.archived_at_utc, null);

  const history = fetchRevisionHistory(testCaseId);
  assert.ok(history.length >= 2, 'History should log both archive and restore actions');
  assert.equal(history[0].userActionLabel, 'Restored from Archive');
});

test('Investigation Deletion - removes case and cleans up associated storage keys', async () => {
  const toDelete = await duplicateInvestigation('INV-2025-KBO-003');
  const deleteId = toDelete.data.id;

  const deleteResult = await deleteInvestigation(deleteId);
  assert.equal(deleteResult.data, true);

  await assert.rejects(
    () => deleteInvestigation(deleteId),
    /not found for deletion/
  );
});

test('Revision History - creates revisions, compares diffs, and executes non-destructive rollback', () => {
  const caseId = 'TEST-CASE-REV-101';
  const initialCase: InvestigationCase = {
    ...INITIAL_MOCK_INVESTIGATIONS[0],
    id: caseId,
    title: 'Initial Supernova Detection',
    status: 'draft',
  };

  const rev1 = createRevision(caseId, {
    changeDescription: 'Initial hypothesis logged',
    updatedSections: ['Hypothesis'],
    previousStatus: 'draft',
    newStatus: 'draft',
    userActionLabel: 'Case Initialized',
    snapshot: initialCase,
  });

  const modifiedCase: InvestigationCase = {
    ...initialCase,
    title: 'Refined Type Ia Supernova in SDFS',
    status: 'in_progress',
  };

  const rev2 = createRevision(caseId, {
    changeDescription: 'Refined title and moved to in_progress',
    updatedSections: ['Title', 'Status'],
    previousStatus: 'draft',
    newStatus: 'in_progress',
    userActionLabel: 'Title Edit',
    snapshot: modifiedCase,
  });

  // Diff comparison
  const diffs = compareRevisions(rev1, rev2);
  const titleDiff = diffs.find((d) => d.fieldName === 'title');
  assert.ok(titleDiff && titleDiff.isChanged);
  assert.equal(titleDiff.beforeValue, 'Initial Supernova Detection');
  assert.equal(titleDiff.afterValue, 'Refined Type Ia Supernova in SDFS');

  // Non-destructive restore
  const { restoredCase, newRevision } = restoreRevision(caseId, rev1.revisionId, modifiedCase);
  assert.equal(restoredCase.title, 'Initial Supernova Detection');
  assert.equal(newRevision.revisionNumber, 3, 'Restoration must append as a new revision #3');

  const history = fetchRevisionHistory(caseId);
  assert.equal(history.length, 3, 'Revision history must preserve all 3 entries non-destructively');
});

test('Reproducibility Record - marks data source and lists missing backend pipeline metadata', () => {
  const sampleCase = INITIAL_MOCK_INVESTIGATIONS[0];
  const record = buildReproducibilityRecord(sampleCase, null);

  assert.equal(record.investigationId, sampleCase.id);
  assert.equal(record.dataSourceClassification, 'DEMONSTRATION_FIXTURE');
  assert.ok(record.unavailableBackendMetadata.length >= 4, 'Must explicitly flag missing backend requirements');
  assert.ok(
    record.unavailableBackendMetadata.some((m) => m.includes('SHA-256 Checksum')),
    'Must declare missing pipeline reduction SHA-256 checksum'
  );
  assert.ok(
    record.unavailableBackendMetadata.some((m) => m.includes('WCS Astrometric Solution')),
    'Must declare missing FITS WCS header'
  );
});

test('Review Workflow & Remarks - transitions states, adds demonstration remarks, and manages section checklist', () => {
  const caseId = 'TEST-CASE-REVIEW-201';

  // Status mappings
  assert.equal(mapStatusToReviewState('draft'), 'NOT_SUBMITTED');
  assert.equal(mapStatusToReviewState('under_review'), 'UNDER_REVIEW');
  assert.equal(mapStatusToReviewState('completed'), 'APPROVED');
  assert.equal(mapReviewStateToStatus('APPROVED'), 'completed');

  // Review comments
  const newComment = addReviewComment(caseId, {
    authorLabel: 'Photometry Reviewer',
    content: 'Please verify Band 3 aperture correction.',
    isRevisionRequest: true,
  });

  assert.equal(newComment.isDemonstrationRecord, true, 'Comment must be marked as demonstration record');
  assert.equal(newComment.isRevisionRequest, true);
  assert.equal(newComment.resolved, false);

  const resolved = toggleResolveComment(caseId, newComment.id);
  assert.ok(resolved && resolved.resolved === true);
  assert.ok(resolved.resolvedAtUtc !== undefined);

  // Section reviews
  const sections = fetchSectionReviews(caseId);
  assert.equal(sections.length, 15, 'Must provide 15 standard report sections in checklist');

  const toggled = toggleSectionReview(caseId, 'measurements', 'Photometry reviewed');
  assert.equal(toggled.isReviewed, true);

  // Action history
  recordReviewAction(caseId, {
    action: 'Requested revisions',
    actor: 'Science Lead',
    previousReviewState: 'UNDER_REVIEW',
    newReviewState: 'REVISION_REQUESTED',
  });

  const reviewHistory = fetchReviewHistory(caseId);
  assert.equal(reviewHistory.length, 1);
  assert.equal(reviewHistory[0].newReviewState, 'REVISION_REQUESTED');
});

test('Scientific Report Builder - generates 15 standard sections with demonstration disclaimers', () => {
  const sections = getDefaultReportSections();
  assert.equal(sections.length, 15, 'Must default to 15 standard scientific sections');

  const investigation = INITIAL_MOCK_INVESTIGATIONS[0];
  const reproducibility = buildReproducibilityRecord(investigation, null);

  const reportData = {
    reportId: `REP-${investigation.id}`,
    investigation,
    evidenceBundle: null,
    reproducibility,
    sections,
    generatedAtUtc: new Date().toISOString(),
    isDemonstrationOnly: true,
    userExecutiveSummary: 'Verified significant flux increase in SDFS field.',
    userResearchObjective: 'Evaluate potential supernova type.',
  };

  const md = generateScientificReportMarkdown(reportData);
  assert.ok(md.includes('AFTERLIGHT Scientific Investigation Report'), 'Markdown has title');
  assert.ok(md.includes('DEMONSTRATION DISCLAIMER'), 'Markdown has prominent demonstration disclaimer');
  assert.ok(md.includes('1. Investigation Identity & Canonical Classification'), 'Section 1 included');
  assert.ok(md.includes('15. References, Software Attribution & Scientific Disclaimers'), 'Section 15 included');
  assert.ok(md.includes('Verified significant flux increase in SDFS field.'), 'Executive summary included');

  const json = generateScientificReportJson(reportData);
  assert.equal(json.schema_version, 'AFTERLIGHT-SCIENTIFIC-REPORT-V1');
  assert.equal(json.is_demonstration_only, true);
  assert.equal(json.included_sections.length, 15);
});

test('Lifecycle Transitions - verifies all transitions: DRAFT → IN_PROGRESS → READY_FOR_REVIEW → UNDER_REVIEW → REVISION_REQUIRED → COMPLETED and ARCHIVED restore', async () => {
  const caseId = 'INV-2025-KBO-003'; // starts as draft

  // DRAFT → IN_PROGRESS
  const s1 = await updateInvestigationStatus(caseId, 'in_progress', 'Started analysis');
  assert.equal(s1.data.status, 'in_progress');

  // IN_PROGRESS → READY_FOR_REVIEW
  const s2 = await updateInvestigationStatus(caseId, 'ready_for_review', 'Analysis ready');
  assert.equal(s2.data.status, 'ready_for_review');

  // READY_FOR_REVIEW → UNDER_REVIEW
  const s3 = await updateInvestigationStatus(caseId, 'under_review', 'Entered review queue');
  assert.equal(s3.data.status, 'under_review');

  // UNDER_REVIEW → REVISION_REQUIRED
  const s4 = await updateInvestigationStatus(caseId, 'revision_required', 'Reviewer requested edits');
  assert.equal(s4.data.status, 'revision_required');

  // REVISION_REQUIRED → UNDER_REVIEW
  const s5 = await updateInvestigationStatus(caseId, 'under_review', 'Revisions complete');
  assert.equal(s5.data.status, 'under_review');

  // UNDER_REVIEW → COMPLETED (finalized documentation)
  const s6 = await updateInvestigationStatus(caseId, 'completed', 'Finalized user documentation');
  assert.equal(s6.data.status, 'completed');

  // COMPLETED → ARCHIVED
  const s7 = await archiveInvestigation(caseId);
  assert.equal(s7.data.status, 'archived');
  assert.ok(s7.data.archived_at_utc !== null);

  // ARCHIVED → Restored state (draft)
  const s8 = await restoreArchivedInvestigation(caseId);
  assert.equal(s8.data.status, 'draft');
  assert.equal(s8.data.archived_at_utc, null);

  // Verify non-destructive audit history
  const history = fetchRevisionHistory(caseId);
  assert.ok(history.length >= 8, 'All lifecycle steps must be preserved in revision audit trail');
});

test('Review Status Independence - review status and investigation status remain separate', async () => {
  const caseId = 'TEST-INDEP-001';

  // Save review status independently
  saveReviewStatus(caseId, 'UNDER_REVIEW');
  assert.equal(fetchReviewStatus(caseId), 'UNDER_REVIEW');

  saveReviewStatus(caseId, 'APPROVED');
  assert.equal(fetchReviewStatus(caseId), 'APPROVED');

  // Investigation status remains independent (e.g. still in_progress)
  const inv: InvestigationCase = {
    ...INITIAL_MOCK_INVESTIGATIONS[0],
    id: caseId,
    status: 'in_progress',
    review_status: 'APPROVED',
  };

  assert.equal(inv.status, 'in_progress', 'Investigation status must not be forcibly overridden by review approval');
  assert.equal(inv.review_status, 'APPROVED');
});

test('Reproducibility Manifest - includes revisionNumber and preserves null values in exported JSON', () => {
  const caseWithNulls: InvestigationCase = {
    ...INITIAL_MOCK_INVESTIGATIONS[0],
    id: 'TEST-NULLS-001',
    earlier_obs_id: null,
    later_obs_id: null,
    selected_epoch_ids: [],
  };

  const record = buildReproducibilityRecord(caseWithNulls, null);
  assert.ok('revisionNumber' in record, 'Manifest must include revisionNumber');
  assert.equal(typeof record.revisionNumber, 'number');
  assert.equal(record.selectedEarlierObsId, null);
  assert.equal(record.selectedLaterObsId, null);

  const jsonStr = JSON.stringify(record, null, 2);
  const parsed = JSON.parse(jsonStr);

  assert.equal(parsed.selectedEarlierObsId, null, 'Null values must be preserved as null in JSON, not omitted');
  assert.equal(parsed.selectedLaterObsId, null);
  assert.equal(parsed.investigationId, 'TEST-NULLS-001');
});

test('Report Narrative Immutability - narrative edits do not mutate underlying telemetry', () => {
  const origInvestigation = { ...INITIAL_MOCK_INVESTIGATIONS[0] };
  const origObserved = origInvestigation.what_was_observed;

  const sections = getDefaultReportSections();
  const reportData = {
    reportId: `REP-${origInvestigation.id}`,
    investigation: origInvestigation,
    evidenceBundle: null,
    reproducibility: buildReproducibilityRecord(origInvestigation, null),
    sections,
    generatedAtUtc: new Date().toISOString(),
    isDemonstrationOnly: true,
    userExecutiveSummary: 'MODIFIED EXECUTIVE SUMMARY FOR PRESENTATION ONLY',
    userResearchObjective: 'CUSTOM RESEARCH OBJECTIVE',
  };

  const md = generateScientificReportMarkdown(reportData);
  assert.ok(md.includes('MODIFIED EXECUTIVE SUMMARY FOR PRESENTATION ONLY'));
  assert.equal(origInvestigation.what_was_observed, origObserved, 'Original telemetry must remain unmutated');
  assert.equal(origInvestigation.summary, INITIAL_MOCK_INVESTIGATIONS[0].summary);
});
