import test from 'node:test';
import assert from 'node:assert/strict';
import { MOCK_TARGET_MANIFESTS } from '../../src/features/explorer/data/mock-targets';
import {
  buildMultiEpochRecords,
  calculateMultiEpochBaseline,
  evaluateEpochMetadataCompleteness,
  createCandidateChangeRecord,
  CANDIDATE_CATEGORY_CONFIG,
} from '../../src/features/temporal-analysis/services/multi-epoch-service';
import {
  resolveValidatedEpochIds,
  saveCandidateChangeRecord,
  loadCandidateChangeRecords,
  deleteCandidateChangeRecord,
  saveActiveInvestigationSession,
  getActiveInvestigationSession,
  clearActiveInvestigationSession,
} from '../../src/services/investigation-session';
import { getObsId } from '../../src/features/observations/services/observation-service';

// Ensure in-memory localStorage shim
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

// ---------------------------------------------------------------------------
// 1. Chronological Sorting & Multi-Epoch Record Generation
// ---------------------------------------------------------------------------

test('buildMultiEpochRecords sorts observations chronologically and assigns 1-based indices', () => {
  const target = MOCK_TARGET_MANIFESTS['kbo-2024-xr1'];
  assert.ok(target, 'Target kbo-2024-xr1 must exist');
  assert.equal(target.observations.length, 4, 'Must have 4 observations');

  const records = buildMultiEpochRecords(target.observations);
  assert.equal(records.length, 4);

  // Check 1-based index and labels
  assert.equal(records[0].epochIndex, 1);
  assert.equal(records[0].epochLabel, 'Epoch 1');
  assert.equal(records[3].epochIndex, 4);
  assert.equal(records[3].epochLabel, 'Epoch 4');

  // Verify chronological date ordering
  const dates = records.map((r) => new Date(r.date!).getTime());
  for (let i = 1; i < dates.length; i++) {
    assert.ok(dates[i] >= dates[i - 1], `Epoch ${i + 1} must be after epoch ${i}`);
  }

  // Days from first must be monotonically non-decreasing
  assert.equal(records[0].daysFromFirst, 0);
  assert.equal(records[0].daysFromPrevious, null);
  assert.ok(records[1].daysFromFirst > 0);
  assert.ok(records[1].daysFromPrevious !== null && records[1].daysFromPrevious > 0);
});

// ---------------------------------------------------------------------------
// 2. Selection, Filtering & Duplicate Prevention
// ---------------------------------------------------------------------------

test('resolveValidatedEpochIds rejects invalid IDs and deduplicates selections', () => {
  const target = MOCK_TARGET_MANIFESTS['v838-mon-echo'];
  assert.ok(target);

  const rawUrl = [
    'SPX-OBS-2025-0082-B2',
    'SPX-OBS-2025-0082-B2', // Duplicate
    'NONEXISTENT-ID-999',  // Invalid
    'SPX-OBS-2025-0290-B2',
    'SPX-OBS-2025-0115-B4',
  ];

  const resolved = resolveValidatedEpochIds(target.observations, rawUrl, target.id);
  assert.equal(resolved.length, 3);
  assert.deepEqual(resolved, [
    'SPX-OBS-2025-0082-B2',
    'SPX-OBS-2025-0290-B2',
    'SPX-OBS-2025-0115-B4',
  ]);
});

test('buildMultiEpochRecords honors selectedIds filter subset', () => {
  const target = MOCK_TARGET_MANIFESTS['spherex-deep-field-south'];
  assert.ok(target);
  assert.equal(target.observations.length, 4);

  // Select 3 of the 4 epochs
  const selectedIds = [
    'SPX-OBS-2025-0104-B3',
    'SPX-OBS-2025-0218-B3',
    'SPX-OBS-2025-0320-B3',
  ];

  const records = buildMultiEpochRecords(target.observations, selectedIds);
  assert.equal(records.length, 3);
  assert.equal(getObsId(records[0]), 'SPX-OBS-2025-0104-B3');
  assert.equal(getObsId(records[1]), 'SPX-OBS-2025-0218-B3');
  assert.equal(getObsId(records[2]), 'SPX-OBS-2025-0320-B3');
});

// ---------------------------------------------------------------------------
// 3. Multi-Epoch Baseline Calculations
// ---------------------------------------------------------------------------

test('calculateMultiEpochBaseline computes accurate cumulative baseline span', () => {
  const target = MOCK_TARGET_MANIFESTS['spherex-deep-field-south'];
  const records = buildMultiEpochRecords(target.observations);

  const baseline = calculateMultiEpochBaseline(records);
  assert.equal(baseline.earliestDate, '2025-04-12T08:34:21Z');
  assert.equal(baseline.latestDate, '2025-12-22T19:04:11Z');

  // Baseline from 2025-04-12 to 2025-12-22 is 254 days
  assert.equal(baseline.totalBaselineDays, 254);
  assert.match(baseline.cadenceDescription, /4 epochs spanning 254 days/);
});

// ---------------------------------------------------------------------------
// 4. Metadata Completeness Evaluation
// ---------------------------------------------------------------------------

test('evaluateEpochMetadataCompleteness distinguishes available vs missing vs pending calibration', () => {
  const target = MOCK_TARGET_MANIFESTS['spherex-deep-field-south'];
  const obs = target.observations[0];

  const comp = evaluateEpochMetadataCompleteness(obs);
  assert.equal(comp.completeness, 'complete');
  assert.equal(comp.isDemonstrationOnly, true);
  assert.ok(comp.availableFields.some((f) => f.includes('Wavelength')));
  assert.ok(comp.availableFields.some((f) => f.includes('Detector Array')));

  // Missing backend prerequisites must be flagged
  assert.ok(comp.missingFields.some((f) => f.includes('WCS CD/CRPIX Matrix')));
  assert.ok(comp.missingFields.some((f) => f.includes('PSF Convolution Kernel')));
  assert.ok(comp.missingFields.some((f) => f.includes('Zero-Point Solution')));
});

// ---------------------------------------------------------------------------
// 5. Candidate Change Record Creation & Session Persistence
// ---------------------------------------------------------------------------

test('createCandidateChangeRecord creates valid hypothesis record with category metadata', () => {
  const record = createCandidateChangeRecord({
    targetId: 'v838-mon-echo',
    category: 'brightness_variation',
    title: 'Infrared light echo expansion',
    description: 'Apparent surface brightness step between Epoch 1 and Epoch 3.',
    associatedEpochIds: ['SPX-OBS-2025-0082-B2', 'SPX-OBS-2025-0115-B4'],
    userHypothesis: 'Possible dust scattering echo following 2002 nova eruption.',
  });

  assert.ok(record.id.startsWith('cand-brig-'));
  assert.equal(record.targetId, 'v838-mon-echo');
  assert.equal(record.category, 'brightness_variation');
  assert.equal(record.status, 'unreviewed');
  assert.equal(record.associatedEpochIds.length, 2);
  assert.ok(CANDIDATE_CATEGORY_CONFIG.brightness_variation);
});

test('candidate change records persist and delete in localStorage correctly', () => {
  const targetId = 'pds-70-disk';
  const cand = createCandidateChangeRecord({
    targetId,
    category: 'transient_candidate',
    title: 'Circumplanetary accretion candidate',
    description: 'PDS 70 c position shows localized excess.',
    associatedEpochIds: ['SPX-OBS-2025-0210-B2', 'SPX-OBS-2025-0512-B2'],
  });

  saveCandidateChangeRecord(cand);
  const loaded = loadCandidateChangeRecords(targetId);
  assert.ok(loaded.some((c) => c.id === cand.id));

  deleteCandidateChangeRecord(targetId, cand.id);
  const afterDelete = loadCandidateChangeRecords(targetId);
  assert.ok(!afterDelete.some((c) => c.id === cand.id));
});

// ---------------------------------------------------------------------------
// 6. Active Session Multi-Epoch State Persistence
// ---------------------------------------------------------------------------

test('saveActiveInvestigationSession persists selectedEpochIds and temporalWorkspaceMode', () => {
  clearActiveInvestigationSession();

  const targetId = 'hd-106906-b';
  const selectedEpochs = [
    'SPX-OBS-2025-0010-B4',
    'SPX-OBS-2025-0201-B3',
    'SPX-OBS-2025-0501-B3',
  ];

  saveActiveInvestigationSession({
    targetId,
    targetTitle: 'Wide-Separation Exoplanet HD 106906 b',
    earlierObsId: selectedEpochs[0],
    laterObsId: selectedEpochs[2],
    selectedEpochIds: selectedEpochs,
    activeEpochId: selectedEpochs[1],
    temporalWorkspaceMode: 'sequence',
  });

  const session = getActiveInvestigationSession();
  assert.equal(session?.targetId, targetId);
  assert.equal(session?.temporalWorkspaceMode, 'sequence');
  assert.equal(session?.activeEpochId, 'SPX-OBS-2025-0201-B3');
  assert.deepEqual(session?.selectedEpochIds, selectedEpochs);

  clearActiveInvestigationSession();
});

// ---------------------------------------------------------------------------
// 7. Backward Compatibility: Existing Two-Epoch T0/T1 Workflows
// ---------------------------------------------------------------------------

test('existing two-epoch earlier/later resolution remains intact when multi-epoch is active', () => {
  const target = MOCK_TARGET_MANIFESTS['spherex-deep-field-south'];
  const selectedEpochs = buildMultiEpochRecords(target.observations, [
    'SPX-OBS-2025-0104-B3',
    'SPX-OBS-2025-0320-B3',
  ]);

  assert.equal(selectedEpochs.length, 2);
  assert.equal(getObsId(selectedEpochs[0]), 'SPX-OBS-2025-0104-B3');
  assert.equal(getObsId(selectedEpochs[1]), 'SPX-OBS-2025-0320-B3');
});
