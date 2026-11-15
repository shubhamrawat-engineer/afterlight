import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRaSexagesimal,
  formatDecSexagesimal,
  formatCategoryLabel,
} from '../../src/features/object-intelligence/services/object-service';
import {
  resolveImageUrl,
  isDemonstrationAsset,
  resolveGuidedTargetHref,
  fetchTargetIndex,
  fetchTargetManifest,
} from '../../src/features/explorer/services/explorer-service';
import { resolveContextFromParams } from '../../src/features/cosmos-ai/hooks/useConversationContext';
import { isValidInternalAppRoute } from '../../src/features/cosmos-ai/services/cosmos-ai-service';
import {
  isObservationInManifest,
  evaluatePreliminaryWavelengthCheck,
  buildTemporalComparisonHref,
} from '../../src/features/observations/hooks/useObservationSelection';
import { resolveObservationPair } from '../../src/features/temporal-analysis/services/temporal-analysis-service';
import { parseInvestigationNavState } from '../../src/features/investigations/hooks/useCreateInvestigation';
import {
  createInvestigation,
  fetchInvestigations,
  fetchInvestigationDetail,
  buildInvestigationExportPayload,
  formatInvestigationCategory,
} from '../../src/features/investigations/services/investigation-service';
import {
  getActiveInvestigationSession,
  saveActiveInvestigationSession,
  clearActiveInvestigationSession,
  resolveValidatedPairIds,
  swapObservationPair,
  inspectPairMetadataCompleteness,
  loadInvestigationDraft,
  saveInvestigationDraft,
  clearInvestigationDraft,
} from '../../src/services/investigation-session';
import { buildInvestigationStageHref } from '../../src/components/common/investigation-progress-utils';
import { MOCK_TARGET_MANIFESTS, MOCK_TARGET_INDEX } from '../../src/features/explorer/data/mock-targets';
import { MOCK_EVIDENCE_MAP } from '../../src/features/evidence/data/mock-evidence';
import { MOCK_SPECTRA_MAP } from '../../src/features/spectral-analysis/data/mock-spectra';
import { MOCK_CELESTIAL_OBJECTS } from '../../src/features/object-intelligence/data/mock-objects';
import { INITIAL_MOCK_INVESTIGATIONS } from '../../src/features/investigations/data/mock-investigations';

// Provide an in-memory localStorage shim for Node test environment if not present
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
// 1. Astrometric & Category Formatters
// ---------------------------------------------------------------------------

test('formatRaSexagesimal converts decimal degrees to hours, minutes, seconds', () => {
  const formatted = formatRaSexagesimal(61.2312);
  assert.equal(formatted, '04h 04m 55.49s');
});

test('formatDecSexagesimal converts negative declination to degrees, arcmin, arcsec', () => {
  const formatted = formatDecSexagesimal(-48.4095);
  assert.equal(formatted, '-48° 24\' 34.20"');
});

test('formatCategoryLabel maps machine categories to human scientific labels', () => {
  assert.equal(formatCategoryLabel('transient_candidate'), 'Transient / Supernova Candidate');
  assert.equal(formatCategoryLabel('variable_star'), 'Variable Star / Light Echo');
  assert.equal(formatCategoryLabel('moving_object'), 'Moving Solar System Object');
  assert.equal(formatCategoryLabel('calibration_standard'), 'Spectrophotometric Standard');
});

// ---------------------------------------------------------------------------
// 2. Context Type Resolution & Route Validation
// ---------------------------------------------------------------------------

test('resolveContextFromParams preserves explicit contextType over generic targetId', () => {
  const temporalParams = new URLSearchParams(
    'contextType=temporal&targetId=spherex-deep-field-south&comparisonId=cmp-sdf-2025-0914'
  );
  const temporalCtx = resolveContextFromParams(temporalParams);
  assert.equal(temporalCtx.type, 'temporal');
  assert.equal(temporalCtx.targetId, 'spherex-deep-field-south');
  assert.equal(temporalCtx.comparisonId, 'cmp-sdf-2025-0914');

  const spectralParams = new URLSearchParams('contextType=spectral&targetId=v838-mon-echo');
  const spectralCtx = resolveContextFromParams(spectralParams);
  assert.equal(spectralCtx.type, 'spectral');
  assert.equal(spectralCtx.targetId, 'v838-mon-echo');

  const investigationParams = new URLSearchParams(
    'contextType=investigation&caseId=INV-2025-SDFS-001&targetId=spherex-deep-field-south'
  );
  const invCtx = resolveContextFromParams(investigationParams);
  assert.equal(invCtx.type, 'investigation');
  assert.equal(invCtx.caseId, 'INV-2025-SDFS-001');

  const objectParams = new URLSearchParams(
    'contextType=object&objectId=SPX-OBJ-SDFS-01&targetId=spherex-deep-field-south'
  );
  const objCtx = resolveContextFromParams(objectParams);
  assert.equal(objCtx.type, 'object');
  assert.equal(objCtx.objectId, 'SPX-OBJ-SDFS-01');
});

test('resolveContextFromParams falls back to stored context when navigating without query params', () => {
  const stored = resolveContextFromParams(
    new URLSearchParams('contextType=spectral&targetId=v838-mon-echo')
  );
  const afterNav = resolveContextFromParams(new URLSearchParams(''), stored);
  assert.equal(afterNav.type, 'spectral');
  assert.equal(afterNav.targetId, 'v838-mon-echo');

  const explicitGeneral = resolveContextFromParams(
    new URLSearchParams('contextType=general'),
    stored
  );
  assert.equal(explicitGeneral.type, 'general');
});

test('isValidInternalAppRoute rejects broken /docs/* links and accepts valid routes', () => {
  assert.equal(isValidInternalAppRoute('/docs/AI_BACKEND_REQUIREMENTS.md'), false);
  assert.equal(isValidInternalAppRoute('/unknown-route/123'), false);
  assert.equal(isValidInternalAppRoute('/explore/spherex-deep-field-south'), true);
  assert.equal(isValidInternalAppRoute('/temporal-analysis/v838-mon-echo'), true);
  assert.equal(isValidInternalAppRoute('/investigations/INV-2025-SDFS-001'), true);
});

// ---------------------------------------------------------------------------
// 3. STEP 1 & STEP 2: Sky Region Selection, Observation Selection & Switching
// ---------------------------------------------------------------------------

test('Sky region selection persists in active investigation session and provides coordinates', () => {
  clearActiveInvestigationSession();
  const sdfsSummary = MOCK_TARGET_INDEX.targets.find(
    (t) => t.id === 'spherex-deep-field-south'
  );
  assert.ok(sdfsSummary);
  assert.equal(sdfsSummary.center_ra, 61.2235);
  assert.equal(sdfsSummary.center_dec, -48.4121);
  assert.equal(sdfsSummary.coordinate_frame, 'ICRS J2000');

  const session = saveActiveInvestigationSession({
    targetId: sdfsSummary.id,
    targetTitle: sdfsSummary.title,
  });
  assert.equal(session.targetId, 'spherex-deep-field-south');
  assert.equal(getActiveInvestigationSession().targetTitle, 'SPHEREx Deep Field South (SDF-S)');
  clearActiveInvestigationSession();
});

test('isObservationInManifest validates observation IDs against target manifest', () => {
  const v838Obs = MOCK_TARGET_MANIFESTS['v838-mon-echo'].observations;
  assert.equal(isObservationInManifest(v838Obs, 'SPX-OBS-2025-0082-B2'), true);
  assert.equal(isObservationInManifest(v838Obs, 'SPX-OBS-2025-0720-B4'), true);
  assert.equal(isObservationInManifest(v838Obs, 'NON-EXISTENT-OBS-ID'), false);
  assert.equal(isObservationInManifest(v838Obs, null), false);
});

test('swapObservationPair switches earlier and later observation roles cleanly', () => {
  const swapped = swapObservationPair('SPX-OBS-2025-0082-B2', 'SPX-OBS-2025-0290-B2');
  assert.deepEqual(swapped, {
    earlierId: 'SPX-OBS-2025-0290-B2',
    laterId: 'SPX-OBS-2025-0082-B2',
  });
});

// ---------------------------------------------------------------------------
// 4. STEP 3: Preliminary Comparison Readiness & Metadata Completeness
// ---------------------------------------------------------------------------

test('evaluatePreliminaryWavelengthCheck recalculates wavelength delta when pair changes', () => {
  const v838Manifest = MOCK_TARGET_MANIFESTS['v838-mon-echo'];
  const obsB2Earlier = v838Manifest.observations[0]; // 1.65 μm (2025-03-01)
  const obsB2Later = v838Manifest.observations[1];   // 1.67 μm (2025-09-22)
  const obsB4Earlier = v838Manifest.observations[2]; // 3.55 μm (2025-04-20)
  const obsB4Later = v838Manifest.observations[3];   // 3.56 μm (2025-10-25)

  const checkB2 = evaluatePreliminaryWavelengthCheck(
    obsB2Earlier,
    obsB2Later,
    v838Manifest.pair_quality,
    { earlierId: obsB2Earlier.id, laterId: obsB2Later.id }
  );
  assert.equal(checkB2.wavelengthDiffUm, 0.02);
  assert.equal(checkB2.preliminaryGrade, 'FAIR');
  assert.equal(checkB2.timeBaselineDays, 205);

  const checkB4 = evaluatePreliminaryWavelengthCheck(
    obsB4Earlier,
    obsB4Later,
    v838Manifest.pair_quality,
    { earlierId: obsB2Earlier.id, laterId: obsB2Later.id }
  );
  assert.equal(checkB4.wavelengthDiffUm, 0.01);
  assert.equal(checkB4.preliminaryGrade, 'GOOD');
  assert.equal(checkB4.timeBaselineDays, 188);

  const checkCrossBand = evaluatePreliminaryWavelengthCheck(
    obsB2Earlier,
    obsB4Later,
    v838Manifest.pair_quality,
    { earlierId: obsB2Earlier.id, laterId: obsB2Later.id }
  );
  assert.equal(checkCrossBand.wavelengthDiffUm, 1.91);
  assert.equal(checkCrossBand.preliminaryGrade, 'POOR');
});

test('inspectPairMetadataCompleteness lists available and missing scientific metadata for Step 3', () => {
  const v838Manifest = MOCK_TARGET_MANIFESTS['v838-mon-echo'];
  const completeness = inspectPairMetadataCompleteness(
    v838Manifest.observations[0],
    v838Manifest.observations[1]
  );
  assert.ok(completeness.availableMetadata.includes('Observation IDs (T0 & T1)'));
  assert.ok(completeness.availableMetadata.includes('Acquisition UTC Timestamps'));
  assert.ok(completeness.availableMetadata.includes('Central Wavelengths (λ₀, λ₁)'));
  assert.ok(
    completeness.missingMetadata.some((m) =>
      m.includes('Validated WCS Sub-Pixel Co-Registration Matrix')
    )
  );
});

// ---------------------------------------------------------------------------
// 5. Stage Navigation & Observation Pair Preservation Across Stages
// ---------------------------------------------------------------------------

test('buildInvestigationStageHref and resolveValidatedPairIds preserve selected observations across stages', () => {
  clearActiveInvestigationSession();
  const v838Manifest = MOCK_TARGET_MANIFESTS['v838-mon-echo'];

  // User selects Band 4 pair on Step 2 and saves to session
  saveActiveInvestigationSession({
    targetId: 'v838-mon-echo',
    targetTitle: v838Manifest.title,
    earlierObsId: 'SPX-OBS-2025-0115-B4',
    laterObsId: 'SPX-OBS-2025-0720-B4',
  });

  // Stage navigation links carry query params
  const investigateHref = buildInvestigationStageHref(
    'investigate',
    'v838-mon-echo',
    'SPX-OBS-2025-0115-B4',
    'SPX-OBS-2025-0720-B4'
  );
  assert.equal(
    investigateHref,
    '/temporal-analysis/v838-mon-echo?earlier=SPX-OBS-2025-0115-B4&later=SPX-OBS-2025-0720-B4'
  );

  const evidenceHref = buildInvestigationStageHref(
    'evidence',
    'v838-mon-echo',
    'SPX-OBS-2025-0115-B4',
    'SPX-OBS-2025-0720-B4'
  );
  assert.equal(
    evidenceHref,
    '/evidence/v838-mon-echo?earlier=SPX-OBS-2025-0115-B4&later=SPX-OBS-2025-0720-B4'
  );

  // Even if URL params are omitted on reload/direct navigation, resolveValidatedPairIds restores from session
  const restored = resolveValidatedPairIds(
    v838Manifest.observations,
    null,
    null,
    'v838-mon-echo'
  );
  assert.equal(restored.earlierId, 'SPX-OBS-2025-0115-B4');
  assert.equal(restored.laterId, 'SPX-OBS-2025-0720-B4');
  assert.equal(restored.hasInvalidUrlSelection, false);

  // Invalid URL parameters are rejected and flagged
  const rejected = resolveValidatedPairIds(
    v838Manifest.observations,
    'INVALID-OBS-999',
    'SPX-OBS-2025-0720-B4',
    'v838-mon-echo'
  );
  assert.equal(rejected.hasInvalidUrlSelection, true);
  assert.equal(rejected.earlierId, 'SPX-OBS-2025-0115-B4');
  clearActiveInvestigationSession();
});

test('resolveObservationPair honors valid URL overrides and rejects invalid or duplicate IDs', () => {
  const v838Manifest = MOCK_TARGET_MANIFESTS['v838-mon-echo'];

  const overridden = resolveObservationPair(
    v838Manifest,
    'SPX-OBS-2025-0115-B4',
    'SPX-OBS-2025-0720-B4'
  );
  assert.equal(overridden.earlier?.id, 'SPX-OBS-2025-0115-B4');
  assert.equal(overridden.later?.id, 'SPX-OBS-2025-0720-B4');

  const fallbackOnInvalid = resolveObservationPair(
    v838Manifest,
    'INVALID-OBS-1',
    'SPX-OBS-2025-0720-B4'
  );
  assert.equal(fallbackOnInvalid.earlier?.id, 'SPX-OBS-2025-0082-B2');
  assert.equal(fallbackOnInvalid.later?.id, 'SPX-OBS-2025-0290-B2');

  const fallbackOnDuplicate = resolveObservationPair(
    v838Manifest,
    'SPX-OBS-2025-0115-B4',
    'SPX-OBS-2025-0115-B4'
  );
  assert.notEqual(fallbackOnDuplicate.earlier?.id, fallbackOnDuplicate.later?.id);
});

test('buildTemporalComparisonHref and resolveGuidedTargetHref preserve workflow routing', () => {
  const href = buildTemporalComparisonHref(
    'v838-mon-echo',
    'SPX-OBS-2025-0115-B4',
    'SPX-OBS-2025-0720-B4'
  );
  assert.equal(
    href,
    '/temporal-analysis/v838-mon-echo?earlier=SPX-OBS-2025-0115-B4&later=SPX-OBS-2025-0720-B4'
  );

  assert.deepEqual(resolveGuidedTargetHref('spherex-deep-field-south', 'temporal'), {
    href: '/temporal-analysis/spherex-deep-field-south',
    ctaLabel: 'Open Temporal Lab',
    listCtaLabel: 'Temporal Lab',
  });
});

// ---------------------------------------------------------------------------
// 6. Image URL Resolution & Demonstration Asset Handling
// ---------------------------------------------------------------------------

test('resolveImageUrl resolves local fallback assets locally and handles missing/broken URLs safely', () => {
  assert.equal(
    resolveImageUrl('/assets/demo/thumbnail-placeholder.svg'),
    '/assets/demo/thumbnail-placeholder.svg'
  );
  assert.equal(
    resolveImageUrl('/assets/demo/difference-placeholder.svg'),
    '/assets/demo/difference-placeholder.svg'
  );
  assert.equal(
    resolveImageUrl('/static/spherex-deep-field-south/preview.png'),
    'http://localhost:8000/static/spherex-deep-field-south/preview.png'
  );
  assert.equal(resolveImageUrl(null), null);
  assert.equal(resolveImageUrl(undefined), null);
  assert.equal(resolveImageUrl('   '), null);

  assert.equal(isDemonstrationAsset('/assets/demo/epoch-earlier-placeholder.svg'), true);
  assert.equal(isDemonstrationAsset('https://irsa.ipac.caltech.edu/data/SPHEREx/img.fits'), false);
});

// ---------------------------------------------------------------------------
// 7. STEP 6: Investigation Creation, Draft Persistence, History Retrieval & Export
// ---------------------------------------------------------------------------

test('parseInvestigationNavState and draft persistence preserve active investigation across page refreshes', () => {
  clearActiveInvestigationSession();
  clearInvestigationDraft();

  saveActiveInvestigationSession({
    targetId: 'v838-mon-echo',
    targetTitle: 'V838 Monocerotis Light Echo',
    earlierObsId: 'SPX-OBS-2025-0115-B4',
    laterObsId: 'SPX-OBS-2025-0720-B4',
  });

  // When location.state is null (e.g. after browser refresh), parseInvestigationNavState restores from session
  const restoredNav = parseInvestigationNavState(null);
  assert.equal(restoredNav.targetId, 'v838-mon-echo');
  assert.equal(restoredNav.targetTitle, 'V838 Monocerotis Light Echo');
  assert.equal(restoredNav.earlierObsId, 'SPX-OBS-2025-0115-B4');
  assert.equal(restoredNav.laterObsId, 'SPX-OBS-2025-0720-B4');

  // Draft form auto-save and reload
  saveInvestigationDraft({
    title: 'Draft V838 Band 4 Echo Expansion',
    summary: 'Inspecting 3.55 um dust scattering front.',
    category: 'stellar_variability',
    target_id: 'v838-mon-echo',
  });
  const loadedDraft = loadInvestigationDraft();
  assert.equal(loadedDraft?.title, 'Draft V838 Band 4 Echo Expansion');
  assert.equal(loadedDraft?.category, 'stellar_variability');

  clearInvestigationDraft();
  assert.equal(loadInvestigationDraft(), null);
  clearActiveInvestigationSession();
});

test('createInvestigation, fetchInvestigations, fetchInvestigationDetail, and buildInvestigationExportPayload complete Step 6 lifecycle', async () => {
  const createdRes = await createInvestigation({
    title: 'V838 Monocerotis Band 4 Outer Shell Expansion Study',
    summary: 'Multi-epoch comparison of Band 4 (3.55 vs 3.56 um) cutouts showing dust echo expansion.',
    category: 'stellar_variability',
    target_id: 'v838-mon-echo',
    target_title: 'V838 Monocerotis Light Echo',
    confidence: 'HIGH',
    what_was_observed: 'Symmetric annular brightening in outer circumstellar dust shell.',
    possible_explanation: 'Scattered light echo propagating through circumstellar dust.',
    uncertainty: 'Requires multi-band SED modelling to constrain grain size distribution.',
    earlier_obs_id: 'SPX-OBS-2025-0115-B4',
    later_obs_id: 'SPX-OBS-2025-0720-B4',
    pair_grade: 'GOOD',
    difference_image: '/assets/demo/difference-placeholder.svg',
  });

  assert.ok(createdRes.data.id.startsWith('INV-2026-SPX-'));
  assert.equal(createdRes.data.category, 'stellar_variability');
  assert.equal(
    formatInvestigationCategory(createdRes.data.category),
    'Stellar Variability'
  );
  assert.equal(createdRes.data.earlier_obs_id, 'SPX-OBS-2025-0115-B4');
  assert.equal(createdRes.data.later_obs_id, 'SPX-OBS-2025-0720-B4');
  assert.equal(createdRes.data.wavelength_um, 3.55);

  // Retrieve from Investigation History
  const listRes = await fetchInvestigations();
  assert.ok(listRes.data.some((c) => c.id === createdRes.data.id));

  // Open specific case from Investigation History
  const detailRes = await fetchInvestigationDetail(createdRes.data.id);
  assert.equal(detailRes.data.title, 'V838 Monocerotis Band 4 Outer Shell Expansion Study');
  assert.equal(detailRes.data.earlier_obs_id, 'SPX-OBS-2025-0115-B4');

  // Export investigation payload
  const exportPayload = buildInvestigationExportPayload(detailRes.data);
  assert.equal(exportPayload.schema_version, 'AFTERLIGHT-CASE-V1');
  assert.equal(exportPayload.investigation.id, createdRes.data.id);
  assert.equal(exportPayload.investigation.category, 'stellar_variability');
  assert.equal(exportPayload.investigation.archive_metadata.mission, 'NASA SPHEREx');
});

// ---------------------------------------------------------------------------
// 8. Loading, Error & Fallback States Verification
// ---------------------------------------------------------------------------

test('Explorer and Investigation services provide deterministic fallback and error states when backend is offline', async () => {
  const indexResult = await fetchTargetIndex();
  assert.equal(indexResult.isFallback, true);
  assert.ok(indexResult.data.targets.length >= 6);

  const manifestResult = await fetchTargetManifest('spherex-deep-field-south');
  assert.equal(manifestResult.isFallback, true);
  assert.equal(manifestResult.data.id, 'spherex-deep-field-south');

  await assert.rejects(
    async () => {
      await fetchTargetManifest('non-existent-sky-region-id');
    },
    /not found/i
  );

  await assert.rejects(
    async () => {
      await fetchInvestigationDetail('INV-NON-EXISTENT-9999');
    },
    /could not be found/i
  );
});

// ---------------------------------------------------------------------------
// 9. Cross-File Mock Data Consistency Verification
// ---------------------------------------------------------------------------

test('all 5 mock data files share reconciled observation IDs, coordinates, and valid demo asset paths', () => {
  for (const summary of MOCK_TARGET_INDEX.targets) {
    assert.equal(summary.thumbnail?.startsWith('/static/'), false);
    assert.equal(typeof summary.center_ra, 'number');
    assert.equal(typeof summary.center_dec, 'number');
  }

  for (const [targetId, evidence] of Object.entries(MOCK_EVIDENCE_MAP)) {
    const manifest = MOCK_TARGET_MANIFESTS[targetId];
    assert.ok(manifest, `Target ${targetId} must exist in MOCK_TARGET_MANIFESTS`);
    assert.equal(
      isObservationInManifest(manifest.observations, evidence.earlierObs?.id),
      true,
      `Earlier observation ${evidence.earlierObs?.id} for ${targetId} must exist in MOCK_TARGET_MANIFESTS`
    );
    assert.equal(
      isObservationInManifest(manifest.observations, evidence.laterObs?.id),
      true,
      `Later observation ${evidence.laterObs?.id} for ${targetId} must exist in MOCK_TARGET_MANIFESTS`
    );
    assert.equal(manifest.region.center_ra, evidence.region?.center_ra);
    assert.equal(manifest.region.center_dec, evidence.region?.center_dec);
  }

  for (const [targetId, spectra] of Object.entries(MOCK_SPECTRA_MAP)) {
    const manifest = MOCK_TARGET_MANIFESTS[targetId];
    assert.ok(manifest, `Target ${targetId} must exist in MOCK_TARGET_MANIFESTS`);
    for (const profile of spectra.profiles) {
      assert.equal(
        isObservationInManifest(manifest.observations, profile.observation_id),
        true,
        `Spectral profile observation ${profile.observation_id} for ${targetId} must exist in MOCK_TARGET_MANIFESTS`
      );
    }
  }

  for (const obj of MOCK_CELESTIAL_OBJECTS) {
    const manifest = MOCK_TARGET_MANIFESTS[obj.target_id];
    assert.ok(manifest, `Object target ${obj.target_id} must exist in MOCK_TARGET_MANIFESTS`);
    assert.equal(obj.preview_image?.startsWith('/static/'), false);
    for (const obs of obj.observations) {
      assert.equal(
        isObservationInManifest(manifest.observations, obs.observation_id),
        true,
        `Object observation ${obs.observation_id} for ${obj.id} must exist in MOCK_TARGET_MANIFESTS`
      );
    }
  }

  for (const inv of INITIAL_MOCK_INVESTIGATIONS) {
    const manifest = MOCK_TARGET_MANIFESTS[inv.target_id];
    assert.ok(manifest, `Investigation target ${inv.target_id} must exist in MOCK_TARGET_MANIFESTS`);
    assert.equal(inv.difference_image?.startsWith('/static/'), false);
    assert.equal(isObservationInManifest(manifest.observations, inv.earlier_obs_id), true);
    assert.equal(isObservationInManifest(manifest.observations, inv.later_obs_id), true);
  }
});
