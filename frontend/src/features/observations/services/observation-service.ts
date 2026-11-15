import { fetchTargetManifest, resolveImageUrl } from '../../explorer/services/explorer-service';
import type { TargetManifest } from '../../explorer/types/explorer.types';
import type { ObservationRecord, CatalogueSummaryMetrics } from '../types/observation.types';

export function getObsId(obs: ObservationRecord): string {
  return obs.observation_id || obs.id;
}

export function getObsDate(obs: ObservationRecord): string | null {
  return obs.obs_time_utc || obs.date || null;
}

export function getObsProduct(obs: ObservationRecord): string {
  return obs.product || obs.product_type || 'Not available';
}

export function getObsRelease(obs: ObservationRecord): string {
  return obs.release || obs.data_release || 'Not available';
}

export function getObsRole(obs: ObservationRecord): string {
  if (obs.role) return String(obs.role);
  return 'Not available';
}

export function getObsImageUrl(obs: ObservationRecord, fallbackTargetImage?: string | null): string | null {
  const imagePath = obs.image || fallbackTargetImage;
  return resolveImageUrl(imagePath);
}

/**
 * Calculates summary metrics across the target's available observation inventory.
 */
export function deriveCatalogueMetrics(manifest: TargetManifest): CatalogueSummaryMetrics {
  const observations = manifest.observations as ObservationRecord[];
  const total = observations.length;

  if (total === 0) {
    return {
      totalObservations: 0,
      earliestDate: null,
      latestDate: null,
      timeBaselineDays: null,
      pairGrade: null,
      isComparisonReady: false,
    };
  }

  // Sort timestamps chronologically to find earliest and latest
  const validDates = observations
    .map((o) => getObsDate(o))
    .filter((d): d is string => Boolean(d))
    .map((d) => new Date(d).getTime())
    .filter((t) => !Number.isNaN(t))
    .sort((a, b) => a - b);

  const earliestDate = validDates.length > 0 ? new Date(validDates[0]).toISOString() : null;
  const latestDate = validDates.length > 0 ? new Date(validDates[validDates.length - 1]).toISOString() : null;

  let timeBaselineDays = manifest.pair_quality?.time_baseline_days ?? null;
  if (timeBaselineDays === null && validDates.length >= 2) {
    const diffMs = validDates[validDates.length - 1] - validDates[0];
    timeBaselineDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  const pairGrade = manifest.pair_quality?.grade ?? null;
  // POOR is strictly NOT comparison-ready. GOOD and FAIR can be prepared (FAIR with caution).
  const isComparisonReady = pairGrade === 'GOOD' || pairGrade === 'FAIR';

  return {
    totalObservations: total,
    earliestDate,
    latestDate,
    timeBaselineDays,
    pairGrade,
    isComparisonReady,
  };
}

/**
 * Re-export manifest fetcher for observations feature.
 */
export { fetchTargetManifest };
