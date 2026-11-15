import { get } from '../../../services/api-client';
import type { CelestialObject, ObjectCategory } from '../types/object.types';
import { MOCK_CELESTIAL_OBJECTS } from '../data/mock-objects';

export interface ObjectServiceResult<T> {
  data: T;
  isFallback: boolean;
  error?: string;
}

/**
 * Fetch catalog of supported celestial objects.
 * Calls GET /api/objects, falls back to documented mock fixtures if backend is offline.
 */
export async function fetchObjects(): Promise<ObjectServiceResult<CelestialObject[]>> {
  try {
    const data = await get<CelestialObject[]>('/api/objects', { timeoutMs: 5000 });
    return { data, isFallback: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Backend unreachable';
    return {
      data: MOCK_CELESTIAL_OBJECTS,
      isFallback: true,
      error: errorMsg,
    };
  }
}

/**
 * Fetch single celestial object profile by ID.
 * Calls GET /api/objects/{objectId}.
 */
export async function fetchObjectDetail(objectId: string): Promise<ObjectServiceResult<CelestialObject>> {
  try {
    const data = await get<CelestialObject>(`/api/objects/${objectId}`, { timeoutMs: 5000 });
    return { data, isFallback: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Object profile fetch failed';
    const found = MOCK_CELESTIAL_OBJECTS.find((o) => o.id === objectId || o.target_id === objectId);

    if (found) {
      return {
        data: found,
        isFallback: true,
        error: errorMsg,
      };
    }

    throw new Error(`Celestial object "${objectId}" was not found in the scientific registry.`);
  }
}

/**
 * Format decimal degrees into sexagesimal Right Ascension (HH:MM:SS.ss).
 */
export function formatRaSexagesimal(raDeg: number): string {
  const hoursTotal = (raDeg / 360) * 24;
  const hours = Math.floor(hoursTotal);
  const minutesTotal = (hoursTotal - hours) * 60;
  const minutes = Math.floor(minutesTotal);
  const seconds = (minutesTotal - minutes) * 60;

  const hStr = String(hours).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');
  const sStr = seconds.toFixed(2).padStart(5, '0');

  return `${hStr}h ${mStr}m ${sStr}s`;
}

/**
 * Format decimal degrees into sexagesimal Declination (±DD:MM:SS.s).
 */
export function formatDecSexagesimal(decDeg: number): string {
  const sign = decDeg >= 0 ? '+' : '-';
  const absDec = Math.abs(decDeg);
  const degrees = Math.floor(absDec);
  const minutesTotal = (absDec - degrees) * 60;
  const minutes = Math.floor(minutesTotal);
  const seconds = (minutesTotal - minutes) * 60;

  const dStr = String(degrees).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');
  const sStr = seconds.toFixed(2).padStart(5, '0');

  return `${sign}${dStr}° ${mStr}' ${sStr}"`;
}

/**
 * Format category enum into user-friendly scientific label.
 */
export function formatCategoryLabel(category: ObjectCategory): string {
  switch (category) {
    case 'transient_candidate':
      return 'Transient / Supernova Candidate';
    case 'variable_star':
      return 'Variable Star / Light Echo';
    case 'moving_object':
      return 'Moving Solar System Object';
    case 'deep_field_source':
      return 'Deep Field Galaxy / AGN';
    case 'calibration_standard':
      return 'Spectrophotometric Standard';
    default:
      return category;
  }
}
