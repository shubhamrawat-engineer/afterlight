import { get } from '../../../services/api-client';
import type { TargetSpectralRecord } from '../types/spectral.types';
import { MOCK_SPECTRA_MAP } from '../data/mock-spectra';

export interface SpectralServiceResult {
  data: TargetSpectralRecord | null;
  isFallback: boolean;
  error?: string;
}

/**
 * Fetch spectral measurement record for an astronomical target.
 * Calls GET /api/targets/{targetId}/spectra, falls back to documented mock fixtures if offline.
 */
export async function fetchTargetSpectra(targetId: string): Promise<SpectralServiceResult> {
  try {
    const data = await get<TargetSpectralRecord>(`/api/targets/${targetId}/spectra`, {
      timeoutMs: 8000,
    });
    if (data && (!data.profiles || data.profiles.length === 0)) {
      const mock = MOCK_SPECTRA_MAP[targetId];
      if (mock) {
        return { data: mock, isFallback: true };
      }
    }
    return { data, isFallback: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Backend unreachable';

    const mock = MOCK_SPECTRA_MAP[targetId];
    if (mock) {
      return {
        data: mock,
        isFallback: true,
        error: errorMsg,
      };
    }

    // Target does not have a spectral product
    return {
      data: null,
      isFallback: true,
      error: `No calibrated SPHEREx spectral product cataloged for target "${targetId}".`,
    };
  }
}
