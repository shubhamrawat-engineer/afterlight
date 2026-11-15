import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchCompleteEvidenceBundle,
  generateInvestigationDossierExport,
  getCanonicalInvestigationId,
  CANONICAL_INVESTIGATION_IDS,
} from '../../src/features/evidence/services/evidence-service';
import {
  getMockEvidenceOverview,
  getMockCategorizedMeasurements,
  getMockUncertaintyBreakdown,
  getMockQualityFlags,
  getMockEvidenceLedger,
  getMockProvenanceLineage,
} from '../../src/features/evidence/services/mock-evidence-service';
import {
  saveActiveInvestigationSession,
  getActiveInvestigationSession,
  clearActiveInvestigationSession,
} from '../../src/services/investigation-session';
import { evaluateMockCompatibility } from '../../src/features/compatibility/services/compatibility-service';
import { MOCK_TARGET_MANIFESTS } from '../../src/features/explorer/data/mock-targets';

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
// 1. Provenance Integrity: Never Claim Completed Verified Backend Processing
// ---------------------------------------------------------------------------

test('Mock provenance lineage is never represented as verified backend processing', () => {
  const lineage = getMockProvenanceLineage('spherex-deep-field-south');
  assert.equal(lineage.stages.length, 7, 'Must have exactly 7 pipeline stages');

  // Overall state must reflect demonstration environment
  assert.match(lineage.overallValidationState, /Demonstration Environment/i);

  // No stage in mock lineage may claim to be backend confirmed
  for (const stage of lineage.stages) {
    assert.equal(
      stage.isBackendConfirmed,
      false,
      `Stage ${stage.stageName} must NOT be marked isBackendConfirmed in mock mode`
    );
    assert.notEqual(
      stage.status,
      'Completed',
      `Stage ${stage.stageName} must NOT be marked Completed in demo environment`
    );
    assert.ok(
      stage.status === 'Demonstration only' || stage.status === 'Pending' || stage.status === 'Not available',
      `Stage ${stage.stageName} must have honest status, found ${stage.status}`
    );
    // Never claim SHA-256 verification or genuine flight telemetry
    assert.doesNotMatch(stage.validationState, /SHA-256 verified/i);
    assert.doesNotMatch(stage.validationState, /Verified nominal telemetry/i);
  }
});

// ---------------------------------------------------------------------------
// 2. Quality Flags Audit: Zero Synthetic Flags Marked as Backend-Confirmed
// ---------------------------------------------------------------------------

test('Mock quality flags are strictly marked DEMONSTRATION_ONLY; zero synthetic flags are backend-confirmed', () => {
  const flags = getMockQualityFlags('spherex-deep-field-south');
  assert.ok(flags.length >= 7, 'Must have quality flags');

  const backendConfirmed = flags.filter((f) => f.source === 'BACKEND_CONFIRMED');
  assert.equal(
    backendConfirmed.length,
    0,
    'Synthetic mock flags must NEVER be marked BACKEND_CONFIRMED'
  );

  for (const flag of flags) {
    assert.equal(
      flag.source,
      'DEMONSTRATION_ONLY',
      `Flag ${flag.flag} must have source DEMONSTRATION_ONLY`
    );
  }
});

// ---------------------------------------------------------------------------
// 3. Measurement Integrity: Missing Values Remain Null or Unavailable
// ---------------------------------------------------------------------------

test('Missing measurements remain null or explicitly unavailable without fabricated numbers', () => {
  const measurements = getMockCategorizedMeasurements('spherex-deep-field-south');

  // Differential flux excess uncertainty is null when pending validation
  const diffFlux = measurements.photometric.find((m) => m.id === 'm-photo-03');
  assert.ok(diffFlux);
  assert.equal(diffFlux.fluxUncertainty, null, 'Pending uncertainty must be strictly null');
  assert.equal(diffFlux.validationStatus, 'PENDING_VALIDATION');
  assert.match(diffFlux.notes ?? '', /backend validation required/i);

  // Spectral slope is strictly unavailable
  const specSlope = measurements.spectral.find((m) => m.id === 'm-spec-02');
  assert.ok(specSlope);
  assert.equal(specSlope.wavelengthUm, null, 'Wavelength must be strictly null');
  assert.equal(specSlope.spectralFluxDensity, null, 'Spectral flux density must be null');
  assert.equal(specSlope.fluxUncertainty, null, 'Flux uncertainty must be null');
  assert.equal(specSlope.validationStatus, 'NOT_AVAILABLE');
});

// ---------------------------------------------------------------------------
// 4. Demonstration Values Carry Explicit Demonstration Labels
// ---------------------------------------------------------------------------

test('Demonstration measurements carry DEMONSTRATION_ONLY validation status and demo labels', () => {
  const measurements = getMockCategorizedMeasurements('spherex-deep-field-south');

  const photo01 = measurements.photometric[0];
  assert.equal(photo01.validationStatus, 'DEMONSTRATION_ONLY');
  assert.match(photo01.notes ?? '', /demonstration photometric flux/i);

  const astro01 = measurements.astrometric[0];
  assert.equal(astro01.validationStatus, 'DEMONSTRATION_ONLY');
  assert.match(astro01.notes ?? '', /demonstration coordinate centroid/i);

  const uncertainties = getMockUncertaintyBreakdown('spherex-deep-field-south');
  assert.equal(uncertainties.statistical.status, 'DEMONSTRATION_ONLY');
  assert.equal(uncertainties.statistical.isDemonstrationOnly, true);
  assert.match(uncertainties.statistical.notes, /not a validated statistical confidence interval/i);
});

// ---------------------------------------------------------------------------
// 5. Canonical Investigation Identifier Consistency
// ---------------------------------------------------------------------------

test('Canonical investigation ID is reconciled and consistent across all modules', () => {
  const targetId = 'spherex-deep-field-south';
  const canonicalId = getCanonicalInvestigationId(targetId);

  assert.equal(canonicalId, 'INV-2025-SDFS-001');
  assert.equal(CANONICAL_INVESTIGATION_IDS[targetId], 'INV-2025-SDFS-001');

  // Verify Evidence Overview uses canonical ID
  const overview = getMockEvidenceOverview(targetId);
  assert.equal(overview.investigationId, 'INV-2025-SDFS-001');

  // Check KBO and V838 Mon canonical IDs
  assert.equal(getCanonicalInvestigationId('kbo-2024-xr1'), 'INV-2025-KBO-003');
  assert.equal(getCanonicalInvestigationId('v838-mon-echo'), 'INV-2025-V838-002');
});

// ---------------------------------------------------------------------------
// 6. Spectral-Channel Terminology Neutrality
// ---------------------------------------------------------------------------

test('No unsupported spectral-channel counts appear in user-facing text', () => {
  const target = MOCK_TARGET_MANIFESTS['spherex-deep-field-south'];
  assert.ok(target);
  const assessment = evaluateMockCompatibility(target.observations[0], target.observations[1]);

  // Check compatibility text
  const textBlob = JSON.stringify(assessment);
  assert.doesNotMatch(
    textBlob,
    /102 SPHEREx spectral channels/i,
    'Must not state 102 channels without documentation verification'
  );
  assert.doesNotMatch(
    textBlob,
    /96-channel/i,
    'Must not state 96-channel without documentation verification'
  );

  // Check measurement metadata
  const measurements = getMockCategorizedMeasurements('spherex-deep-field-south');
  const specText = JSON.stringify(measurements.spectral);
  assert.doesNotMatch(specText, /96 Channels/);
  assert.match(specText, /pending mission-documentation verification/);
});

// ---------------------------------------------------------------------------
// 7. Export Disclaimers and Integrity
// ---------------------------------------------------------------------------

test('generateInvestigationDossierExport creates formatted JSON and Markdown with canonical ID and disclaimers', async () => {
  const bundle = await fetchCompleteEvidenceBundle('spherex-deep-field-south');
  const exportData = generateInvestigationDossierExport(bundle, 'SPX-SDFS-C1');

  assert.ok(exportData.json, 'Must return JSON string');
  assert.ok(exportData.markdown, 'Must return Markdown string');

  const parsedJson = JSON.parse(exportData.json);
  assert.equal(parsedJson.isDemonstrationExport, true);
  assert.match(parsedJson.disclaimer, /DEMONSTRATION EXPORT ONLY/);
  assert.equal(parsedJson.overview.investigationId, 'INV-2025-SDFS-001');

  // Verify null and unavailable values survive JSON export without fabrication
  const jsonDiff = parsedJson.measurements.photometric.find((m: any) => m.id === 'm-photo-03');
  assert.equal(jsonDiff.fluxUncertainty, null, 'Null uncertainty must survive in exported JSON');

  const jsonSpec = parsedJson.measurements.spectral.find((m: any) => m.id === 'm-spec-02');
  assert.equal(jsonSpec.wavelengthUm, null, 'Null wavelength must survive in exported JSON');

  // Verify Markdown formatting and provenance preservation
  assert.match(exportData.markdown, /# AFTERLIGHT Scientific Investigation Dossier/);
  assert.match(exportData.markdown, /Investigation ID:\*\* INV-2025-SDFS-001/);
  assert.match(exportData.markdown, /DEMONSTRATION EXPORT ONLY/);
  assert.match(exportData.markdown, /Demonstration only/);
  assert.doesNotMatch(exportData.markdown, /DOI: 10\.26131\/IRSA542/);
});

// ---------------------------------------------------------------------------
// 8. Evidence Ledger Integrity & No Fabricated DOIs
// ---------------------------------------------------------------------------

test('Evidence Ledger entries do not contain fabricated DOIs and are labeled DEMONSTRATION_ONLY', () => {
  const ledger = getMockEvidenceLedger('spherex-deep-field-south');
  assert.ok(ledger.length >= 5);

  for (const entry of ledger) {
    assert.doesNotMatch(
      entry.provenanceReference ?? '',
      /10\.26131\/IRSA542/,
      'Must not contain fabricated IRSA DOI'
    );
    assert.ok(
      entry.validationStatus === 'DEMONSTRATION_ONLY' || entry.validationStatus === 'PENDING_VALIDATION',
      `Ledger entry ${entry.id} must be marked DEMONSTRATION_ONLY or PENDING_VALIDATION`
    );
  }
});

// ---------------------------------------------------------------------------
// 9. Investigation Session State Preservation
// ---------------------------------------------------------------------------

test('Investigation session state persists multi-epoch context and earlier/later selection', () => {
  clearActiveInvestigationSession();

  saveActiveInvestigationSession({
    targetId: 'spherex-deep-field-south',
    targetTitle: 'SPHEREx Deep Field South (SDF-S)',
    earlierObsId: 'SPX-OBS-2025-0104-B3',
    laterObsId: 'SPX-OBS-2025-0722-B3',
    selectedEpochIds: ['SPX-OBS-2025-0104-B3', 'SPX-OBS-2025-0320-B3', 'SPX-OBS-2025-0722-B3'],
  });

  const session = getActiveInvestigationSession();
  assert.ok(session);
  assert.equal(session.targetId, 'spherex-deep-field-south');
  assert.equal(session.earlierObsId, 'SPX-OBS-2025-0104-B3');
  assert.equal(session.laterObsId, 'SPX-OBS-2025-0722-B3');
  assert.equal(session.selectedEpochIds?.length, 3);
});
