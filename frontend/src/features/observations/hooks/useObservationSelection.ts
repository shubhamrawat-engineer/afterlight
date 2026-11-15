import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ObservationRecord, PairGrade, PairQualitySummary } from '../types/observation.types';
import { getObsId, getObsDate } from '../services/observation-service';
import {
  resolveValidatedPairIds,
  saveActiveInvestigationSession,
  swapObservationPair,
} from '../../../services/investigation-session';

interface UseObservationSelectionProps {
  targetId?: string;
  targetTitle?: string;
  observations: ObservationRecord[];
  pairGrade: PairGrade | null | undefined;
  pairQuality?: PairQualitySummary | null;
}

export interface PreliminaryWavelengthAssessment {
  earlierWavelengthUm: number | null;
  laterWavelengthUm: number | null;
  wavelengthDiffUm: number | null;
  wavelengthDiffPct: number | null;
  timeBaselineDays: number | null;
  preliminaryGrade: PairGrade | null;
  isDefaultManifestPair: boolean;
}

/**
 * Builds the Temporal Analysis URL preserving the selected earlier and later observation IDs.
 */
export function buildTemporalComparisonHref(
  targetId: string,
  earlierId?: string | null,
  laterId?: string | null
): string {
  const params = new URLSearchParams();
  if (earlierId) params.set('earlier', earlierId);
  if (laterId) params.set('later', laterId);
  const query = params.toString();
  return query ? `/temporal-analysis/${targetId}?${query}` : `/temporal-analysis/${targetId}`;
}

/**
 * Validates whether an observation ID exists within the target's observation manifest.
 */
export function isObservationInManifest(
  observations: ObservationRecord[],
  obsId: string | null | undefined
): boolean {
  if (!obsId) return false;
  return observations.some((o) => getObsId(o) === obsId);
}

/**
 * Dynamically calculates preliminary wavelength proximity and temporal baseline
 * for any selected observation pair.
 *
 * NOTE: This is a preliminary frontend wavelength check, NOT a validated scientific
 * compatibility engine. Full compatibility requires backend WCS co-registration,
 * PSF matching, and photometric zero-point calibration.
 */
export function evaluatePreliminaryWavelengthCheck(
  earlierObs: ObservationRecord | null,
  laterObs: ObservationRecord | null,
  manifestPairQuality?: Partial<PairQualitySummary> | null,
  defaultPairIds?: { earlierId: string | null; laterId: string | null }
): PreliminaryWavelengthAssessment {
  const earlierWl = earlierObs?.wavelength_um ?? null;
  const laterWl = laterObs?.wavelength_um ?? null;

  const isDefaultManifestPair = Boolean(
    earlierObs &&
      laterObs &&
      defaultPairIds?.earlierId &&
      defaultPairIds?.laterId &&
      getObsId(earlierObs) === defaultPairIds.earlierId &&
      getObsId(laterObs) === defaultPairIds.laterId
  );

  const wavelengthDiffUm =
    earlierWl !== null && laterWl !== null
      ? Number(Math.abs(laterWl - earlierWl).toFixed(3))
      : isDefaultManifestPair
      ? (manifestPairQuality?.wavelength_diff_um ?? null)
      : null;

  const referenceWl = earlierWl && earlierWl > 0 ? earlierWl : laterWl && laterWl > 0 ? laterWl : null;
  const wavelengthDiffPct =
    wavelengthDiffUm !== null && referenceWl !== null
      ? Number(((wavelengthDiffUm / referenceWl) * 100).toFixed(1))
      : isDefaultManifestPair
      ? (manifestPairQuality?.wavelength_diff_pct ?? null)
      : null;

  let timeBaselineDays: number | null = null;
  const earlierDateStr = earlierObs ? getObsDate(earlierObs) : null;
  const laterDateStr = laterObs ? getObsDate(laterObs) : null;
  if (earlierDateStr && laterDateStr) {
    const t0 = new Date(earlierDateStr).getTime();
    const t1 = new Date(laterDateStr).getTime();
    if (!Number.isNaN(t0) && !Number.isNaN(t1)) {
      timeBaselineDays = Math.round(Math.abs(t1 - t0) / (1000 * 60 * 60 * 24));
    }
  }
  if (timeBaselineDays === null && isDefaultManifestPair) {
    timeBaselineDays = manifestPairQuality?.time_baseline_days ?? null;
  }

  let preliminaryGrade: PairGrade | null = null;
  if (!earlierObs || !laterObs || getObsId(earlierObs) === getObsId(laterObs)) {
    preliminaryGrade = null;
  } else if (wavelengthDiffUm !== null) {
    if (wavelengthDiffUm > 0.25 || (wavelengthDiffPct !== null && wavelengthDiffPct > 15)) {
      preliminaryGrade = 'POOR';
    } else if (wavelengthDiffUm >= 0.02 || (wavelengthDiffPct !== null && wavelengthDiffPct >= 1.0)) {
      preliminaryGrade = 'FAIR';
    } else {
      if (
        isDefaultManifestPair &&
        manifestPairQuality?.grade &&
        manifestPairQuality.grade !== 'GOOD'
      ) {
        preliminaryGrade = manifestPairQuality.grade;
      } else {
        preliminaryGrade = 'GOOD';
      }
    }
  } else if (isDefaultManifestPair) {
    preliminaryGrade = manifestPairQuality?.grade ?? null;
  }

  return {
    earlierWavelengthUm: earlierWl,
    laterWavelengthUm: laterWl,
    wavelengthDiffUm,
    wavelengthDiffPct,
    timeBaselineDays,
    preliminaryGrade,
    isDefaultManifestPair,
  };
}

export function useObservationSelection({
  targetId,
  targetTitle,
  observations,
  pairGrade,
  pairQuality,
}: UseObservationSelectionProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Find explicit role designations or chronological defaults
  const defaultPair = useMemo(() => {
    if (observations.length === 0) return { earlierId: null, laterId: null };

    const earlierByRole = observations.find((o) => o.role === 'earlier');
    const laterByRole = observations.find((o) => o.role === 'later');

    if (earlierByRole && laterByRole && getObsId(earlierByRole) !== getObsId(laterByRole)) {
      return {
        earlierId: getObsId(earlierByRole),
        laterId: getObsId(laterByRole),
      };
    }

    const sorted = [...observations].sort((a, b) => {
      const dateA = getObsDate(a) ? new Date(getObsDate(a)!).getTime() : 0;
      const dateB = getObsDate(b) ? new Date(getObsDate(b)!).getTime() : 0;
      return dateA - dateB;
    });

    return {
      earlierId: getObsId(sorted[0]),
      laterId: sorted.length > 1 ? getObsId(sorted[1]) : null,
    };
  }, [observations]);

  const paramEarlier = searchParams.get('earlier');
  const paramLater = searchParams.get('later');

  const [overrideEarlier, setOverrideEarlier] = useState<string | null>(null);
  const [overrideLater, setOverrideLater] = useState<string | null>(null);
  const [cautionAcknowledged, setCautionAcknowledged] = useState<boolean>(false);

  const validOverrideEarlier = isObservationInManifest(observations, overrideEarlier)
    ? overrideEarlier
    : null;
  const validOverrideLater = isObservationInManifest(observations, overrideLater)
    ? overrideLater
    : null;

  const resolvedPair = useMemo(() => {
    return resolveValidatedPairIds(
      observations,
      paramEarlier || validOverrideEarlier,
      paramLater || validOverrideLater,
      targetId
    );
  }, [observations, paramEarlier, paramLater, validOverrideEarlier, validOverrideLater, targetId]);

  const earlierId = resolvedPair.earlierId;
  const laterId = resolvedPair.laterId;
  const hasInvalidUrlSelection = resolvedPair.hasInvalidUrlSelection;

  // Persist active investigation session whenever targetId / pair changes
  useEffect(() => {
    if (targetId && earlierId && laterId) {
      saveActiveInvestigationSession({
        targetId,
        targetTitle: targetTitle ?? undefined,
        earlierObsId: earlierId,
        laterObsId: laterId,
      });
    }
  }, [targetId, targetTitle, earlierId, laterId]);

  const setEarlierId = useCallback(
    (id: string | null) => {
      setOverrideEarlier(id);
      setCautionAcknowledged(false);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id) next.set('earlier', id);
          else next.delete('earlier');
          if (laterId) next.set('later', laterId);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams, laterId]
  );

  const setLaterId = useCallback(
    (id: string | null) => {
      setOverrideLater(id);
      setCautionAcknowledged(false);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (earlierId) next.set('earlier', earlierId);
          if (id) next.set('later', id);
          else next.delete('later');
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams, earlierId]
  );

  const swapPair = useCallback(() => {
    const swapped = swapObservationPair(earlierId, laterId);
    setOverrideEarlier(swapped.earlierId);
    setOverrideLater(swapped.laterId);
    setCautionAcknowledged(false);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (swapped.earlierId) next.set('earlier', swapped.earlierId);
        if (swapped.laterId) next.set('later', swapped.laterId);
        return next;
      },
      { replace: true }
    );
  }, [earlierId, laterId, setSearchParams]);

  const earlierObs = useMemo(() => {
    return observations.find((o) => getObsId(o) === earlierId) ?? null;
  }, [observations, earlierId]);

  const laterObs = useMemo(() => {
    return observations.find((o) => getObsId(o) === laterId) ?? null;
  }, [observations, laterId]);

  const preliminaryCheck = useMemo(() => {
    return evaluatePreliminaryWavelengthCheck(
      earlierObs,
      laterObs,
      pairQuality ?? (pairGrade ? { grade: pairGrade } : null),
      defaultPair
    );
  }, [earlierObs, laterObs, pairQuality, pairGrade, defaultPair]);

  const effectiveGrade = preliminaryCheck.preliminaryGrade ?? pairGrade ?? null;

  const isComparisonReady = useMemo(() => {
    if (!earlierObs || !laterObs) return false;
    if (getObsId(earlierObs) === getObsId(laterObs)) return false;
    if (effectiveGrade === 'POOR') return false;
    if (effectiveGrade === 'FAIR') return cautionAcknowledged;
    return true;
  }, [earlierObs, laterObs, effectiveGrade, cautionAcknowledged]);

  return {
    earlierId,
    laterId,
    earlierObs,
    laterObs,
    setEarlierId,
    setLaterId,
    swapPair,
    cautionAcknowledged,
    setCautionAcknowledged,
    isComparisonReady,
    preliminaryCheck,
    effectiveGrade,
    hasInvalidUrlSelection,
  };
}
