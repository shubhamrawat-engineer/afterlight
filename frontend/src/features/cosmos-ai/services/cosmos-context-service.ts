import type { AIContextReference, AIContextType } from '../types/cosmos-ai.types';
import { MOCK_TARGET_MANIFESTS, MOCK_TARGET_INDEX } from '../../explorer/data/mock-targets';
import { INITIAL_MOCK_INVESTIGATIONS } from '../../investigations/data/mock-investigations';
import {
  getMockCategorizedMeasurements,
  getMockQualityFlags,
  getMockProvenanceLineage,
} from '../../evidence/services/mock-evidence-service';

export interface EnrichedContextMetadata {
  contextType: AIContextType;
  title: string;
  subtitle: string;
  dataClassification: 'VERIFIED_BACKEND' | 'DEMONSTRATION_FIXTURE';
  targetId?: string;
  targetTitle?: string;
  objectId?: string;
  coordinates?: { raDeg: number | null; decDeg: number | null; frame: string };
  observations?: {
    earlierObsId?: string | null;
    laterObsId?: string | null;
    epochCount: number;
    selectedEpochIds: string[];
    wavelengthUm?: number | null;
  };
  investigation?: {
    caseId: string;
    title: string;
    status: string;
    objective?: string;
    observed?: string;
    explanation?: string;
    uncertainty?: string;
  };
  evidenceSummary?: {
    photometricCount: number;
    astrometricCount: number;
    qualityFlagsCount: number;
    provenanceAudit: string;
  };
  summaryBadgeText: string;
}

export function enrichContextMetadata(
  context: AIContextReference
): EnrichedContextMetadata {
  const { type, targetId, caseId, comparisonId, observationIds, spectralSourceId, objectId } = context;

  // 1. Investigation Context
  if (type === 'investigation' || caseId) {
    let storedCases = INITIAL_MOCK_INVESTIGATIONS;
    try {
      const raw = localStorage.getItem('afterlight_investigations_cache');
      if (raw) storedCases = JSON.parse(raw);
    } catch {
      // fallback
    }

    const foundCase = storedCases.find((c) => c.id === caseId) || storedCases[0];
    const manifest = foundCase ? MOCK_TARGET_MANIFESTS[foundCase.target_id] : undefined;

    return {
      contextType: 'investigation',
      title: foundCase?.title || 'Astronomical Investigation Dossier',
      subtitle: `Case ${foundCase?.id || caseId} • Status: ${foundCase?.status.toUpperCase() || 'DRAFT'}`,
      dataClassification: 'DEMONSTRATION_FIXTURE',
      targetId: foundCase?.target_id,
      targetTitle: foundCase?.target_title,
      coordinates: {
        raDeg: manifest?.region?.center_ra ?? null,
        decDeg: manifest?.region?.center_dec ?? null,
        frame: manifest?.region?.coordinate_frame ?? 'ICRS J2000',
      },
      observations: {
        earlierObsId: foundCase?.earlier_obs_id,
        laterObsId: foundCase?.later_obs_id,
        epochCount: foundCase?.associated_epochs_count ?? (foundCase?.earlier_obs_id ? 2 : 0),
        selectedEpochIds: foundCase?.selected_epoch_ids ?? (foundCase?.earlier_obs_id && foundCase?.later_obs_id ? [foundCase.earlier_obs_id, foundCase.later_obs_id] : []),
        wavelengthUm: foundCase?.wavelength_um,
      },
      investigation: {
        caseId: foundCase?.id || caseId || 'INV-2025-SDFS-001',
        title: foundCase?.title || 'Supernova Candidate Investigation',
        status: foundCase?.status || 'draft',
        objective: foundCase?.research_objective || 'Conduct photometric & astrometric flux residual analysis.',
        observed: foundCase?.what_was_observed,
        explanation: foundCase?.possible_explanation,
        uncertainty: foundCase?.uncertainty,
      },
      summaryBadgeText: `INV: ${foundCase?.id || caseId}`,
    };
  }

  // 2. Evidence Context
  if (type === 'evidence') {
    const activeTargetId = targetId || 'spherex-deep-field-south';
    const manifest = MOCK_TARGET_MANIFESTS[activeTargetId];
    const measurements = getMockCategorizedMeasurements(activeTargetId);
    const flags = getMockQualityFlags(activeTargetId);
    const provenance = getMockProvenanceLineage(activeTargetId);

    return {
      contextType: 'evidence',
      title: `Scientific Evidence Ledger: ${manifest?.title || activeTargetId}`,
      subtitle: 'Photometric, Astrometric & Quality Flag Provenance',
      dataClassification: 'DEMONSTRATION_FIXTURE',
      targetId: activeTargetId,
      targetTitle: manifest?.title || activeTargetId,
      coordinates: {
        raDeg: manifest?.region?.center_ra ?? null,
        decDeg: manifest?.region?.center_dec ?? null,
        frame: manifest?.region?.coordinate_frame ?? 'ICRS J2000',
      },
      evidenceSummary: {
        photometricCount: measurements.photometric.length,
        astrometricCount: measurements.astrometric.length,
        qualityFlagsCount: flags.length,
        provenanceAudit: provenance.overallValidationState,
      },
      summaryBadgeText: `EVIDENCE: ${manifest?.title || activeTargetId}`,
    };
  }

  // 3. Temporal Analysis & Multi-Epoch Context
  if (type === 'temporal' || type === 'multi_epoch' || comparisonId) {
    const activeTargetId = targetId || 'spherex-deep-field-south';
    const manifest = MOCK_TARGET_MANIFESTS[activeTargetId];

    return {
      contextType: 'temporal',
      title: `Temporal Subtraction: ${manifest?.title || activeTargetId}`,
      subtitle: comparisonId ? `Job ${comparisonId} • Pair Subtraction` : 'Multi-Epoch Survey Stack',
      dataClassification: 'DEMONSTRATION_FIXTURE',
      targetId: activeTargetId,
      targetTitle: manifest?.title || activeTargetId,
      coordinates: {
        raDeg: manifest?.region?.center_ra ?? null,
        decDeg: manifest?.region?.center_dec ?? null,
        frame: manifest?.region?.coordinate_frame ?? 'ICRS J2000',
      },
      observations: {
        earlierObsId: manifest?.observations[0]?.id || 'SPX-OBS-2025-0104-B3',
        laterObsId: manifest?.observations[1]?.id || 'SPX-OBS-2025-0320-B3',
        epochCount: manifest?.observations.length || 2,
        selectedEpochIds: observationIds ?? ['E1', 'E2'],
        wavelengthUm: manifest?.observations[0]?.wavelength_um || 2.42,
      },
      summaryBadgeText: `TEMPORAL: ${manifest?.title || activeTargetId}`,
    };
  }

  // 3. Spectral Context
  if (type === 'spectral' || spectralSourceId) {
    const activeTargetId = targetId || 'spherex-deep-field-south';
    const manifest = MOCK_TARGET_MANIFESTS[activeTargetId];

    return {
      contextType: 'spectral',
      title: `Spectral Energy Distribution: ${spectralSourceId || manifest?.title || activeTargetId}`,
      subtitle: '0.75 – 5.00 μm Spectrophotometric Continuum',
      dataClassification: 'DEMONSTRATION_FIXTURE',
      targetId: activeTargetId,
      targetTitle: manifest?.title || activeTargetId,
      summaryBadgeText: `SPECTRAL: ${spectralSourceId || '0.75-5.00μm'}`,
    };
  }

  // 5. Target / Observations Context
  if (type === 'target' || type === 'observations' || type === 'observation' || targetId) {
    const activeTargetId = targetId || 'spherex-deep-field-south';
    const manifest = MOCK_TARGET_MANIFESTS[activeTargetId];
    const indexEntry = MOCK_TARGET_INDEX.targets.find((t) => t.id === activeTargetId);

    const measurements = getMockCategorizedMeasurements(activeTargetId);
    const flags = getMockQualityFlags(activeTargetId);
    const provenance = getMockProvenanceLineage(activeTargetId);

    const isObs = type === 'observations' || type === 'observation';
    return {
      contextType: isObs ? 'observations' : 'target',
      title: manifest?.title || indexEntry?.title || activeTargetId,
      subtitle: indexEntry?.short_info || 'SPHEREx Survey Field',
      dataClassification: 'DEMONSTRATION_FIXTURE',
      targetId: activeTargetId,
      targetTitle: manifest?.title || indexEntry?.title || activeTargetId,
      coordinates: {
        raDeg: manifest?.region?.center_ra ?? indexEntry?.center_ra ?? null,
        decDeg: manifest?.region?.center_dec ?? indexEntry?.center_dec ?? null,
        frame: manifest?.region?.coordinate_frame ?? indexEntry?.coordinate_frame ?? 'ICRS J2000',
      },
      observations: {
        epochCount: manifest?.observations.length || indexEntry?.observation_count || 0,
        selectedEpochIds: manifest?.observations.map((o) => o.id) || [],
      },
      evidenceSummary: {
        photometricCount: measurements.photometric.length,
        astrometricCount: measurements.astrometric.length,
        qualityFlagsCount: flags.length,
        provenanceAudit: provenance.overallValidationState,
      },
      summaryBadgeText: `TARGET: ${manifest?.title || activeTargetId}`,
    };
  }

  // 5. Object Intelligence Context
  if (type === 'object' || objectId) {
    return {
      contextType: 'object',
      title: `Catalogued Source: ${objectId || 'SPX-OBJ-01'}`,
      subtitle: 'Cross-Match Intelligence & Gaia Proper Motion',
      dataClassification: 'SPHEREx_VERIFIED_ARCHIVE',
      objectId,
      summaryBadgeText: `OBJECT: ${objectId || 'Source'}`,
    };
  }

  // 6. Global Context (Default)
  return {
    contextType: 'general',
    title: 'Global Astronomical Intelligence',
    subtitle: 'NASA SPHEREx Mission, Instruments & General Inquiries',
    dataClassification: 'SPHEREx_VERIFIED_ARCHIVE',
    summaryBadgeText: 'GLOBAL ASTRONOMY',
  };
}
