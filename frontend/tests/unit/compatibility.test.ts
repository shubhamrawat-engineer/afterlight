import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateMockCompatibility,
  fetchCompatibilityAssessment,
} from '../../src/features/compatibility/services/compatibility-service';
import { COMPATIBILITY_THRESHOLDS } from '../../src/features/compatibility/config/compatibility-thresholds';
import {
  getActiveInvestigationSession,
  saveActiveInvestigationSession,
  clearActiveInvestigationSession,
  swapObservationPair,
} from '../../src/services/investigation-session';
import { buildInvestigationStageHref } from '../../src/components/common/investigation-progress-utils';

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
// 1. Each Compatibility Assessment Category (Visual, Difference, Photometric, Astrometric, Spectral)
// ---------------------------------------------------------------------------

test('evaluateMockCompatibility evaluates all 5 distinct task categories for a verified target', () => {
  const dossier = evaluateMockCompatibility('spherex-deep-field-south');

  assert.equal(dossier.targetId, 'spherex-deep-field-south');
  assert.ok(dossier.assessments.visual, 'Must have visual assessment');
  assert.ok(dossier.assessments.difference_image, 'Must have difference-image assessment');
  assert.ok(dossier.assessments.photometric, 'Must have photometric assessment');
  assert.ok(dossier.assessments.astrometric, 'Must have astrometric assessment');
  assert.ok(dossier.assessments.spectral, 'Must have spectral assessment');

  // A. Visual Comparability
  const vis = dossier.assessments.visual;
  assert.equal(vis.task, 'visual');
  assert.equal(vis.status, 'READY_FOR_REVIEW');
  assert.ok(vis.requirements.some((r) => r.id === 'vis-img' && r.isSatisfied));
  assert.ok(vis.requirements.some((r) => r.id === 'vis-coord' && r.isSatisfied));

  // B. Difference-Image Readiness
  const diff = dossier.assessments.difference_image;
  assert.equal(diff.task, 'difference_image');
  assert.equal(diff.status, 'CONDITIONALLY_READY');
  assert.ok(diff.requirements.some((r) => r.id === 'diff-psf'));
  assert.ok(diff.requirements.some((r) => r.id === 'diff-proc' && !r.isSatisfied));

  // C. Photometric Comparability
  const phot = dossier.assessments.photometric;
  assert.equal(phot.task, 'photometric');
  assert.equal(phot.status, 'CONDITIONALLY_READY');
  assert.ok(phot.requirements.some((r) => r.id === 'phot-units' && r.isSatisfied));

  // D. Astrometric Comparability
  const astro = dossier.assessments.astrometric;
  assert.equal(astro.task, 'astrometric');
  assert.equal(astro.status, 'CONDITIONALLY_READY');
  assert.ok(astro.requirements.some((r) => r.id === 'astro-frame' && r.isSatisfied));

  // E. Spectral Comparability
  const spec = dossier.assessments.spectral;
  assert.equal(spec.task, 'spectral');
  assert.equal(spec.status, 'READY_FOR_REVIEW');
  assert.ok(spec.requirements.some((r) => r.id === 'spec-wl' && r.isSatisfied));
});

// ---------------------------------------------------------------------------
// 2. Missing Metadata States & Incomplete Pairs
// ---------------------------------------------------------------------------

test('evaluateMockCompatibility returns NOT_ASSESSED when observations are missing or identical', () => {
  // Incomplete pair (no observations specified for an unpopulated ID)
  const incomplete = evaluateMockCompatibility('non-existent-target', null, null);
  assert.equal(incomplete.overallStatus, 'NOT_ASSESSED');
  assert.equal(incomplete.assessments.visual.status, 'NOT_ASSESSED');
  assert.equal(incomplete.assessments.spectral.status, 'NOT_ASSESSED');
  assert.ok(incomplete.missingMetadataSummary.length > 0);

  // Identical observations
  const identical = evaluateMockCompatibility(
    'v838-mon-echo',
    'SPX-OBS-2025-0082-B2',
    'SPX-OBS-2025-0082-B2'
  );
  assert.equal(identical.overallStatus, 'NOT_ASSESSED');
  assert.match(identical.overallSummary, /Identical observation epochs/);
  assert.equal(identical.assessments.visual.status, 'NOT_ASSESSED');
});

// ---------------------------------------------------------------------------
// 3. State Updates After Pair Changes & Severe Passband Mismatch
// ---------------------------------------------------------------------------

test('compatibility state updates from READY/CONDITIONALLY_READY to INSUFFICIENT_METADATA on cross-band pair', () => {
  // 1. Matched Band 4 pair on V838 Monocerotis (3.55 μm vs 3.56 μm)
  const matched = evaluateMockCompatibility(
    'v838-mon-echo',
    'SPX-OBS-2025-0115-B4',
    'SPX-OBS-2025-0720-B4'
  );
  assert.equal(matched.assessments.spectral.status, 'READY_FOR_REVIEW');
  assert.equal(matched.assessments.difference_image.status, 'CONDITIONALLY_READY');

  // 2. Mismatched Band 2 (1.65 μm) vs Band 4 (3.56 μm): Δλ = 1.91 μm (>15%)
  const mismatched = evaluateMockCompatibility(
    'v838-mon-echo',
    'SPX-OBS-2025-0082-B2',
    'SPX-OBS-2025-0720-B4'
  );
  assert.equal(mismatched.assessments.spectral.status, 'INSUFFICIENT_METADATA');
  assert.equal(mismatched.assessments.difference_image.status, 'INSUFFICIENT_METADATA');
  assert.equal(mismatched.assessments.photometric.status, 'INSUFFICIENT_METADATA');
  assert.equal(mismatched.overallStatus, 'INSUFFICIENT_METADATA');
});

// ---------------------------------------------------------------------------
// 4. Switching Observation Roles & Persistence
// ---------------------------------------------------------------------------

test('swapObservationPair switches earlier and later roles and preserves session state', () => {
  clearActiveInvestigationSession();

  const swapped = swapObservationPair('SPX-OBS-2025-0104-B3', 'SPX-OBS-2025-0320-B3');
  assert.equal(swapped.earlierId, 'SPX-OBS-2025-0320-B3');
  assert.equal(swapped.laterId, 'SPX-OBS-2025-0104-B3');

  saveActiveInvestigationSession({
    targetId: 'spherex-deep-field-south',
    earlierObsId: swapped.earlierId,
    laterObsId: swapped.laterId,
  });

  const session = getActiveInvestigationSession();
  assert.equal(session?.earlierObsId, 'SPX-OBS-2025-0320-B3');
  assert.equal(session?.laterObsId, 'SPX-OBS-2025-0104-B3');

  clearActiveInvestigationSession();
});

// ---------------------------------------------------------------------------
// 5. Expandable Scientific Reasoning Breakdown & 5 Core Questions
// ---------------------------------------------------------------------------

test('every assessment answers all 5 required scientific reasoning questions', () => {
  const dossier = evaluateMockCompatibility('v838-mon-echo');
  const tasks = Object.values(dossier.assessments);

  for (const a of tasks) {
    // 1. Available info
    assert.ok(Array.isArray(a.availableInformation), `${a.task} must have availableInformation`);
    // 2. Missing info
    assert.ok(Array.isArray(a.missingInformation), `${a.task} must have missingInformation`);
    // 3. Why it matters
    assert.ok(typeof a.whyMissingMatters === 'string' && a.whyMissingMatters.length > 10, `${a.task} must explain why missing info matters`);
    // 4. Required validation
    assert.ok(typeof a.requiredValidation === 'string' && a.requiredValidation.length > 5, `${a.task} must specify required validation`);
    // 5. Safe conclusions
    assert.ok(typeof a.safeConclusions === 'string' && a.safeConclusions.length > 10, `${a.task} must specify safe conclusions`);
  }
});

// ---------------------------------------------------------------------------
// 6. Navigation with Preserved Investigation Context
// ---------------------------------------------------------------------------

test('buildInvestigationStageHref routes Stage 3 readiness to the Compatibility Inspector with query params', () => {
  const href = buildInvestigationStageHref(
    'readiness',
    'spherex-deep-field-south',
    'SPX-OBS-2025-0104-B3',
    'SPX-OBS-2025-0320-B3'
  );
  assert.equal(
    href,
    '/compatibility/spherex-deep-field-south?earlier=SPX-OBS-2025-0104-B3&later=SPX-OBS-2025-0320-B3'
  );
});

// ---------------------------------------------------------------------------
// 7. Service Fetch, Fallback & Error Handling
// ---------------------------------------------------------------------------

test('fetchCompatibilityAssessment provides deterministic dossier and falls back gracefully when offline', async () => {
  const result = await fetchCompatibilityAssessment(
    'spherex-deep-field-south',
    'SPX-OBS-2025-0104-B3',
    'SPX-OBS-2025-0320-B3'
  );

  assert.equal(result.isFallback, true);
  assert.equal(result.data.targetId, 'spherex-deep-field-south');
  assert.equal(result.data.overallStatus, 'CONDITIONALLY_READY');
  assert.equal(result.data.temporalBaselineDays, 185);
  assert.equal(result.data.wavelengthDeltaUm, 0.02);
});

// ---------------------------------------------------------------------------
// 8. Scientific Threshold Audit & Centralized Heuristics Configuration
// ---------------------------------------------------------------------------

test('centralized COMPATIBILITY_THRESHOLDS contains required scientific demonstration thresholds', () => {
  // 1. Resolution ratio
  assert.equal(COMPATIBILITY_THRESHOLDS.MAX_RESOLUTION_RATIO.value, 1.2);
  assert.equal(COMPATIBILITY_THRESHOLDS.MAX_RESOLUTION_RATIO.isDemonstrationAssumption, true);

  // 2. Minimum passband overlap %
  assert.equal(COMPATIBILITY_THRESHOLDS.MIN_PASSBAND_OVERLAP_PCT.value, 85.0);
  assert.equal(COMPATIBILITY_THRESHOLDS.MIN_PASSBAND_OVERLAP_PCT.isDemonstrationAssumption, true);

  // 3. Difference-image passband discrepancy gate %
  assert.equal(COMPATIBILITY_THRESHOLDS.MAX_PASSBAND_DISCREPANCY_PCT.value, 15.0);
  assert.equal(COMPATIBILITY_THRESHOLDS.MAX_PASSBAND_DISCREPANCY_PCT.isDemonstrationAssumption, true);

  // 4. Astrometric registration RMS limits
  assert.equal(COMPATIBILITY_THRESHOLDS.MAX_REGISTRATION_RMS_DIFF_ARCSEC.value, 0.20);
  assert.equal(COMPATIBILITY_THRESHOLDS.MAX_REGISTRATION_RMS_ASTRO_ARCSEC.value, 0.25);

  // 5. Wavelength delta thresholds
  assert.equal(COMPATIBILITY_THRESHOLDS.MAX_PASSBAND_DELTA_UM.value, 0.25);
  assert.equal(COMPATIBILITY_THRESHOLDS.MODERATE_BAND_DELTA_UM.value, 0.02);
});

// ---------------------------------------------------------------------------
// 9. Chronological Order Inversion Detection
// ---------------------------------------------------------------------------

test('evaluateMockCompatibility detects inverted chronological order when T0 is later than T1', () => {
  // Normal order: earlier is 2025-01-04, later is 2025-03-20
  const normal = evaluateMockCompatibility(
    'spherex-deep-field-south',
    'SPX-OBS-2025-0104-B3',
    'SPX-OBS-2025-0320-B3'
  );
  assert.equal(normal.isChronologicallyInverted, false);

  // Inverted order: earlier is 2025-03-20, later is 2025-01-04
  const inverted = evaluateMockCompatibility(
    'spherex-deep-field-south',
    'SPX-OBS-2025-0320-B3',
    'SPX-OBS-2025-0104-B3'
  );
  assert.equal(inverted.isChronologicallyInverted, true);
  assert.equal(inverted.temporalBaselineDays, 185);
});

// ---------------------------------------------------------------------------
// 10. Passband Overlap Percentage & Difference Gating
// ---------------------------------------------------------------------------

test('passband overlap percentage is accurately calculated and severe mismatch is gated', () => {
  // Close wavelength match (< 1% delta)
  const close = evaluateMockCompatibility(
    'v838-mon-echo',
    'SPX-OBS-2025-0115-B4',
    'SPX-OBS-2025-0720-B4'
  );
  assert.ok(close.passbandOverlapPct !== null && close.passbandOverlapPct >= 85.0);

  // Severe wavelength mismatch (> 15% delta)
  const severe = evaluateMockCompatibility(
    'v838-mon-echo',
    'SPX-OBS-2025-0082-B2',
    'SPX-OBS-2025-0720-B4'
  );
  assert.ok(severe.passbandOverlapPct !== null && severe.passbandOverlapPct < 85.0);
  assert.equal(severe.assessments.difference_image.status, 'INSUFFICIENT_METADATA');
});

// ---------------------------------------------------------------------------
// 11. Offline Fallback Safety: Never Reports Unverified READY_FOR_REVIEW
// ---------------------------------------------------------------------------

test('offline fallback mode caps overall status at CONDITIONALLY_READY', () => {
  const offlineDossier = evaluateMockCompatibility('spherex-deep-field-south', null, null, true);
  assert.equal(offlineDossier.isFallback, true);
  assert.notEqual(offlineDossier.overallStatus, 'READY_FOR_REVIEW');
  assert.equal(offlineDossier.overallStatus, 'CONDITIONALLY_READY');
  assert.ok(offlineDossier.offlineFallbackReason);
});

// ---------------------------------------------------------------------------
// 12. Unverified Scientific Parameters Remain Unsatisfied
// ---------------------------------------------------------------------------

test('unverified backend parameters are never silently marked as satisfied in mock mode', () => {
  const dossier = evaluateMockCompatibility('spherex-deep-field-south');

  // Backend processing provenance must be unsatisfied
  const diffProc = dossier.assessments.difference_image.requirements.find(
    (r) => r.id === 'diff-proc'
  );
  assert.equal(diffProc?.isSatisfied, false);

  // WCS live projection matrix must be unsatisfied
  const visWcs = dossier.assessments.visual.requirements.find((r) => r.id === 'vis-wcs');
  assert.equal(visWcs?.isSatisfied, false);

  // Photometric zero-point must be unsatisfied
  const photZero = dossier.assessments.photometric.requirements.find(
    (r) => r.id === 'phot-zero'
  );
  assert.equal(photZero?.isSatisfied, false);

  // Centroid positional uncertainty must be unsatisfied
  const astroUnc = dossier.assessments.astrometric.requirements.find(
    (r) => r.id === 'astro-unc'
  );
  assert.equal(astroUnc?.isSatisfied, false);
});
