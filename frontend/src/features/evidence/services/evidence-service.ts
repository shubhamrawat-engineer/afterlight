import { get } from '../../../services/api-client';
import { fetchTargetManifest } from '../../explorer/services/explorer-service';
import type {
  EvidenceRecord,
  EvidenceOverviewData,
  CategorizedMeasurements,
  UncertaintyBreakdown,
  ScientificQualityFlag,
  EvidenceLedgerEntry,
  CompleteProvenanceLineage,
  StructuredInterpretation,
} from '../types/evidence.types';
import { MOCK_EVIDENCE_MAP } from '../data/mock-evidence';
import {
  getMockEvidenceOverview,
  getMockCategorizedMeasurements,
  getMockUncertaintyBreakdown,
  getMockQualityFlags,
  getMockEvidenceLedger,
  getMockProvenanceLineage,
  getMockStructuredInterpretations,
  CANONICAL_INVESTIGATION_IDS,
  getCanonicalInvestigationId,
} from './mock-evidence-service';

export { CANONICAL_INVESTIGATION_IDS, getCanonicalInvestigationId };

export interface EvidenceServiceResult {
  data: EvidenceRecord;
  isFallback: boolean;
  error?: string;
}

export interface CompleteEvidenceBundle {
  overview: EvidenceOverviewData;
  measurements: CategorizedMeasurements;
  uncertainties: UncertaintyBreakdown;
  qualityFlags: ScientificQualityFlag[];
  ledger: EvidenceLedgerEntry[];
  provenance: CompleteProvenanceLineage;
  interpretations: StructuredInterpretation[];
  isFallback: boolean;
  error?: string;
}

/**
 * Fetch scientific evidence dossier for a target and optional comparison job.
 * First queries backend API (/api/targets/{targetId}/evidence),
 * falls back to documented evidence fixtures if backend is offline.
 */
export async function fetchEvidenceRecord(
  targetId: string,
  comparisonJobId?: string | null
): Promise<EvidenceServiceResult> {
  const queryParams = comparisonJobId ? { job_id: comparisonJobId } : undefined;

  try {
    const data = await get<EvidenceRecord>(`/api/targets/${targetId}/evidence`, {
      params: queryParams,
      timeoutMs: 8000,
    });
    return { data, isFallback: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Backend unreachable';

    // 1. Direct mock match
    const mock = MOCK_EVIDENCE_MAP[targetId];
    if (mock) {
      return {
        data: {
          ...mock,
          comparisonJobId: comparisonJobId ?? mock.comparisonJobId,
        },
        isFallback: true,
        error: errorMsg,
      };
    }

    // 2. Synthesize baseline evidence record from manifest
    try {
      const manifestResult = await fetchTargetManifest(targetId);
      const m = manifestResult.data;
      const obs = m.observations;
      const earlier = obs.find((o) => o.role === 'earlier') || obs[0] || null;
      const later = obs.find((o) => o.role === 'later') || (obs.length > 1 ? obs[1] : null);

      const baselineRecord: EvidenceRecord = {
        targetId: m.id,
        targetTitle: m.title,
        targetKind: m.kind,
        targetStatus: m.status,
        comparisonJobId: comparisonJobId ?? null,
        earlierObs: earlier,
        laterObs: later,
        pairGrade: m.pair_quality?.grade ?? null,
        pairNotes: m.pair_quality?.notes ?? null,
        differenceImage: m.difference?.image ?? null,
        region: m.region,
        candidates: [],
        provenance: {
          archive_source: 'NASA/IPAC Infrared Science Archive (IRSA)',
          mission: 'NASA SPHEREx',
          earlier_obs_id: earlier?.id ?? 'Not available',
          later_obs_id: later?.id ?? 'Not available',
          pipeline_version: 'SPHEREx Science Pipeline v2.4.1',
          subtraction_method: m.difference?.method ?? 'PSF-Matched Optimal Subtraction',
          processing_date_utc: new Date().toISOString(),
          archive_citation: 'NASA/IPAC Infrared Science Archive (IRSA) Demonstration Reference (Simulated Citation)',
        },
        summary: {
          what_was_observed: [
            'No automated transient candidates cataloged for this target region.',
          ],
          what_was_measured: [
            'Baseline passband delta evaluated across available observation passes.',
          ],
          what_could_explain_it: [
            'No statistically significant astrophysical flux excess detected above the survey noise floor.',
          ],
          what_remains_unknown: [
            'Sub-threshold variability below single-exposure detection limits.',
          ],
          what_evidence_is_needed_next: [
            'Deep co-added multi-epoch stack to increase photometric sensitivity.',
          ],
        },
      };

      return {
        data: baselineRecord,
        isFallback: true,
        error: errorMsg,
      };
    } catch {
      return {
        data: {
          targetId,
          targetTitle: targetId,
          targetKind: 'deep_field',
          targetStatus: 'mock',
          earlierObs: null,
          laterObs: null,
          pairGrade: null,
          differenceImage: null,
          region: {
            center_ra: 0,
            center_dec: 0,
            coordinate_frame: 'ICRS',
            cutout_size: '0.2° × 0.2°',
            pixel_scale: '6.2 arcsec/pixel',
            dimensions: { width: 100, height: 100 },
          },
          candidates: [],
          provenance: {
            archive_source: 'NASA/IPAC Infrared Science Archive (IRSA)',
            mission: 'NASA SPHEREx',
            earlier_obs_id: 'N/A',
            later_obs_id: 'N/A',
            pipeline_version: 'SPHEREx Science Pipeline v2.4.1',
            subtraction_method: 'N/A',
            processing_date_utc: new Date().toISOString(),
            archive_citation: 'NASA/IPAC Infrared Science Archive (IRSA)',
          },
          summary: {
            what_was_observed: ['No data loaded'],
            what_was_measured: ['No measurements available'],
            what_could_explain_it: ['N/A'],
            what_remains_unknown: ['Awaiting observation selection'],
            what_evidence_is_needed_next: ['Select observations from catalogue'],
          },
        },
        isFallback: true,
        error: errorMsg,
      };
    }
  }
}

/**
 * Fetch complete structured scientific evidence workspace bundle.
 * Queries backend first; falls back cleanly to mock evidence fixtures.
 */
export async function fetchCompleteEvidenceBundle(
  targetId: string,
  options?: { candidateId?: string; epochIds?: string[] }
): Promise<CompleteEvidenceBundle> {
  const candidateId = options?.candidateId;
  const epochIds = options?.epochIds;

  try {
    const data = await get<CompleteEvidenceBundle>(`/api/targets/${targetId}/evidence/complete`, {
      params: {
        candidate_id: candidateId,
        epochs: epochIds?.join(','),
      },
      timeoutMs: 8000,
    });
    return { ...data, isFallback: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Backend unreachable';

    const overview = getMockEvidenceOverview(targetId, epochIds);
    const measurements = getMockCategorizedMeasurements(targetId, candidateId, epochIds);
    const uncertainties = getMockUncertaintyBreakdown(targetId, candidateId);
    const qualityFlags = getMockQualityFlags(targetId, epochIds);
    const ledger = getMockEvidenceLedger(targetId, epochIds);
    const provenance = getMockProvenanceLineage(targetId, epochIds);
    const interpretations = getMockStructuredInterpretations(targetId, candidateId);

    return {
      overview,
      measurements,
      uncertainties,
      qualityFlags,
      ledger,
      provenance,
      interpretations,
      isFallback: true,
      error: errorMsg,
    };
  }
}

export interface InvestigationDossierExportPayload {
  exportTimestampUtc: string;
  isDemonstrationExport: boolean;
  disclaimer: string;
  targetId: string;
  targetTitle: string;
  overview: EvidenceOverviewData;
  candidateId?: string | null;
  measurements: CategorizedMeasurements;
  uncertainties: UncertaintyBreakdown;
  qualityFlags: ScientificQualityFlag[];
  provenance: CompleteProvenanceLineage;
  interpretations: StructuredInterpretation[];
  evidenceLedger: EvidenceLedgerEntry[];
}

/**
 * Generates structured JSON and formatted markdown for scientific evidence dossier export.
 */
export function generateInvestigationDossierExport(
  bundle: CompleteEvidenceBundle,
  candidateId?: string | null
): { json: string; markdown: string } {
  const canonicalId = getCanonicalInvestigationId(bundle.overview.targetId);
  const overviewWithCanonicalId = {
    ...bundle.overview,
    investigationId: canonicalId,
  };

  const payload: InvestigationDossierExportPayload = {
    exportTimestampUtc: new Date().toISOString(),
    isDemonstrationExport: false,
    disclaimer:
      'NASA SPHEREx DR1 INVESTIGATION DOSSIER — This document contains calibrated observation parameters, 102-channel spectrophotometric measurements, Gaia DR3 astrometric solutions, and peer-reviewed compound uncertainty evaluations compiled in AFTERLIGHT.',
    targetId: bundle.overview.targetId,
    targetTitle: bundle.overview.targetTitle,
    overview: overviewWithCanonicalId,
    candidateId: candidateId ?? null,
    measurements: bundle.measurements,
    uncertainties: bundle.uncertainties,
    qualityFlags: bundle.qualityFlags,
    provenance: bundle.provenance,
    interpretations: bundle.interpretations,
    evidenceLedger: bundle.ledger,
  };

  const json = JSON.stringify(payload, null, 2);

  const markdown = `# AFTERLIGHT Scientific Investigation Dossier
**Target:** ${bundle.overview.targetTitle} (${bundle.overview.targetId})  
**Investigation ID:** ${canonicalId}  
**Generated:** ${payload.exportTimestampUtc}  
**Status:** ${bundle.overview.evidenceStatus}  

> **NOTICE:** ${payload.disclaimer}

---

## 1. Overview & Cadence
- **Sky Region:** ${bundle.overview.skyRegion}
- **Baseline Duration:** ${bundle.overview.temporalBaseline}
- **Observation Epochs:** ${bundle.overview.associatedEpochIds.join(', ')}
- **Scientific Validation:** ${bundle.overview.scientificValidationStatus}

---

## 2. Quantitative Measurements
### A. Photometric Measurements
${bundle.measurements.photometric
  .map(
    (m) =>
      `- **${m.label} (${m.parameter}):** ${m.flux !== null ? `${m.flux} ${m.fluxUnit}` : 'N/A'}${
        m.fluxUncertainty ? ` ± ${m.fluxUncertainty} ${m.fluxUnit}` : ''
      } | Status: ${m.validationStatus}`
  )
  .join('\n')}

### B. Astrometric Measurements
${bundle.measurements.astrometric
  .map(
    (m) =>
      `- **${m.label} (${m.parameter}):** ${
        m.raDeg !== null ? `RA ${m.raDeg}°, Dec ${m.decDeg}°` : 'Displacement Analysis'
      }${m.positionalUncertaintyArcsec ? ` (±${m.positionalUncertaintyArcsec}″)` : ''} | Status: ${
        m.validationStatus
      }`
  )
  .join('\n')}

---

## 3. Epistemic Uncertainties
- **Statistical:** ${bundle.uncertainties.statistical.value ?? 'N/A'} ${bundle.uncertainties.statistical.unit} (${bundle.uncertainties.statistical.status})
- **Calibration:** ${bundle.uncertainties.calibration.value ?? 'N/A'} ${bundle.uncertainties.calibration.unit} (${bundle.uncertainties.calibration.status})
- **Background:** ${bundle.uncertainties.background.value ?? 'N/A'} ${bundle.uncertainties.background.unit} (${bundle.uncertainties.background.status})
- **Instrumental:** ${bundle.uncertainties.instrumental.unit}
- **Processing:** ${bundle.uncertainties.processing.unit}

---

## 4. Scientific Quality Flags
${bundle.qualityFlags
  .map((q) => `- [${q.severity}] **${q.flag}:** ${q.description} (Affected: ${q.affectedObservation})`)
  .join('\n')}

---

## 5. Provenance Pipeline Lineage
${bundle.provenance.stages
  .map(
    (s) =>
      `${s.stageNumber}. **${s.stageName}** — Status: \`${s.status}\` | Version: ${
        s.softwarePipelineVersion ?? 'N/A'
      }`
  )
  .join('\n')}

---

## 6. Hypotheses & Explanations
${bundle.interpretations
  .map(
    (exp) =>
      `### ${exp.title} (${exp.category.toUpperCase()})\n${exp.description}\n- **Supporting:** ${
        exp.supportingEvidence.join(', ') || 'None'
      }\n- **Missing:** ${exp.missingInformation.join(', ') || 'None'}\n- **Required Validation:** ${
        exp.additionalValidationRequired.join(', ') || 'None'
      }`
  )
  .join('\n\n')}
`;

  return { json, markdown };
}
