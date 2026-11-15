import { fetchTargetManifest, resolveImageUrl } from '../../explorer/services/explorer-service';
import type { TargetManifest } from '../../explorer/types/explorer.types';
import type { ObservationRecord } from '../../observations/types/observation.types';
import type { DifferenceMetadata, ComparisonStatusInfo } from '../types/temporal-analysis.types';
import { getObsId, getObsDate } from '../../observations/services/observation-service';

/**
 * Identify Earlier (T0) and Later (T1) observation records from manifest.
 * Supports optional override IDs (e.g. from query parameters).
 */
export function resolveObservationPair(
  manifest: TargetManifest,
  overrideEarlierId?: string | null,
  overrideLaterId?: string | null
): {
  earlier: ObservationRecord | null;
  later: ObservationRecord | null;
} {
  const observations = (manifest.observations ?? []) as ObservationRecord[];
  if (observations.length === 0) {
    return { earlier: null, later: null };
  }

  // 1. Explicit override IDs if supplied
  if (overrideEarlierId && overrideLaterId) {
    const foundEarlier = observations.find((o) => getObsId(o) === overrideEarlierId);
    const foundLater = observations.find((o) => getObsId(o) === overrideLaterId);
    if (foundEarlier && foundLater && getObsId(foundEarlier) !== getObsId(foundLater)) {
      return { earlier: foundEarlier, later: foundLater };
    }
  }

  // 2. Pair defined by canonical role assignment
  const earlierByRole = observations.find((o) => o.role === 'earlier');
  const laterByRole = observations.find((o) => o.role === 'later');

  if (earlierByRole && laterByRole && getObsId(earlierByRole) !== getObsId(laterByRole)) {
    return { earlier: earlierByRole, later: laterByRole };
  }

  // 3. Fallback to chronological ordering
  const sorted = [...observations].sort((a, b) => {
    const dateA = getObsDate(a) ? new Date(getObsDate(a)!).getTime() : 0;
    const dateB = getObsDate(b) ? new Date(getObsDate(b)!).getTime() : 0;
    return dateA - dateB;
  });

  return {
    earlier: sorted[0] ?? null,
    later: sorted.length > 1 ? sorted[1] : null,
  };
}

/**
 * Extracts difference metadata safely from manifest.
 */
export function resolveDifferenceMetadata(manifest: TargetManifest): DifferenceMetadata | null {
  if (!manifest.difference) return null;
  return {
    image: manifest.difference.image ?? null,
    method: manifest.difference.method ?? null,
    method_description: manifest.difference.method_description ?? null,
    masked_flags_applied: manifest.difference.masked_flags_applied ?? null,
    limitations: manifest.difference.limitations ?? null,
  };
}

/**
 * Derive status breakdown distinguishing target verification from observation compatibility.
 */
export function deriveComparisonStatus(manifest: TargetManifest): ComparisonStatusInfo {
  const grade = manifest.pair_quality?.grade ?? null;
  const hasDifference = Boolean(manifest.difference?.image);

  return {
    targetStatus: manifest.status,
    pairGrade: grade,
    isComparisonReady: grade === 'GOOD' || grade === 'FAIR',
    compatibilityEstablished: grade !== null,
    hasDifferenceAsset: hasDifference,
  };
}

export { fetchTargetManifest, resolveImageUrl };
