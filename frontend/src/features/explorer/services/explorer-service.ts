import { get } from '../../../services/api-client';
import { config } from '../../../services/config';
import type { TargetIndexResponse, TargetManifest } from '../types/explorer.types';
import { MOCK_TARGET_INDEX, MOCK_TARGET_MANIFESTS } from '../data/mock-targets';

export interface ServiceResult<T> {
  data: T;
  isFallback: boolean;
  error?: string;
}

/**
 * Check backend health status
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    await get<{ status: string }>('/api/health');
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch the target index list (GET /api/targets)
 * Falls back to validated mock fixtures if the backend is unreachable.
 */
export async function fetchTargetIndex(): Promise<ServiceResult<TargetIndexResponse>> {
  try {
    const data = await get<TargetIndexResponse>('/api/targets');
    return { data, isFallback: false };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Backend unreachable';
    console.warn(`[AFTERLIGHT Explorer] GET /api/targets failed (${errorMsg}). Falling back to documented mock fixtures.`);
    return {
      data: MOCK_TARGET_INDEX,
      isFallback: true,
      error: errorMsg,
    };
  }
}

/**
 * Fetch an individual target's manifest (GET /api/targets/{id})
 * Falls back to documented mock manifest if the backend is unreachable.
 */
export async function fetchTargetManifest(id: string): Promise<ServiceResult<TargetManifest>> {
  try {
    const data = await get<TargetManifest>(`/api/targets/${id}`);
    return { data, isFallback: false };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Target manifest fetch failed';
    console.warn(`[AFTERLIGHT Explorer] GET /api/targets/${id} failed (${errorMsg}). Checking mock manifests.`);

    const mock = MOCK_TARGET_MANIFESTS[id];
    if (mock) {
      return {
        data: mock,
        isFallback: true,
        error: errorMsg,
      };
    }

    throw new Error(`Target "${id}" not found in remote archive or local fixtures.`);
  }
}

/**
 * Resolve an image/thumbnail path to a full URL.
 * - Preserves absolute URLs (http/https/data/blob).
 * - Resolves local frontend public assets (/assets/*, /demo-assets/*) directly without prepending backend base URL.
 * - In production (Render, Vercel, Docker) or when served by FastAPI, backend and frontend share the origin,
 *   so root-relative paths (/static/*) resolve directly against the current domain, preventing Mixed Content errors.
 * - Only prepends config.apiBaseUrl when developing on a separate local dev server port (e.g. Vite on :5173).
 */
export function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path || !path.trim()) return null;
  const trimmed = path.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  // Local public assets (including demonstration placeholders) resolve relative to frontend origin
  if (cleanPath.startsWith('/assets/') || cleanPath.startsWith('/demo-assets/')) {
    return cleanPath;
  }

  // If in browser and NOT running on a separate local dev port (e.g. 5173),
  // root-relative /static paths are 100% reliable and avoid ERR_CONNECTION_REFUSED to localhost:8000
  if (typeof window !== 'undefined' && window.location) {
    const isDevDifferentPort =
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
      window.location.port !== '8000' &&
      window.location.port !== '';

    if (!isDevDifferentPort) {
      return cleanPath;
    }
  }

  const base = config.apiBaseUrl.replace(/\/+$/, '');
  return `${base}${cleanPath}`;
}

export type GuidedFlowType = 'temporal' | 'spectral' | 'objects' | string | null | undefined;

export interface GuidedTargetAction {
  href: string;
  ctaLabel: string;
  listCtaLabel: string;
}

/**
 * Resolves the target destination URL and CTA label based on the active guided workflow
 * query parameter (`?flow=temporal`, `?flow=spectral`, `?flow=objects`).
 */
export function resolveGuidedTargetHref(
  targetId: string,
  flow?: GuidedFlowType
): GuidedTargetAction {
  switch (flow) {
    case 'temporal':
      return {
        href: `/temporal-analysis/${targetId}`,
        ctaLabel: 'Open Temporal Lab',
        listCtaLabel: 'Temporal Lab',
      };
    case 'spectral':
      return {
        href: `/spectral-lab/${targetId}`,
        ctaLabel: 'Open Spectral Lab',
        listCtaLabel: 'Spectral Lab',
      };
    case 'objects':
      return {
        href: `/objects?targetId=${encodeURIComponent(targetId)}`,
        ctaLabel: 'Inspect Objects',
        listCtaLabel: 'Objects',
      };
    default:
      return {
        href: `/explore/${targetId}`,
        ctaLabel: 'Inspect Region',
        listCtaLabel: 'Inspect',
      };
  }
}

/**
 * Determines whether an asset URL represents a local demonstration placeholder
 * rather than a genuine NASA SPHEREx archive product.
 */
export function isDemonstrationAsset(path: string | null | undefined): boolean {
  if (!path) return false;
  return (
    path.includes('/assets/demo/') ||
    path.includes('/demo-assets/') ||
    path.includes('placeholder')
  );
}
