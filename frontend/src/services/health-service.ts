import { get } from './api-client';

export interface BackendHealthResponse {
  status: 'healthy' | 'ok' | 'degraded' | string;
  database?: 'connected' | 'disconnected' | string;
  storage?: 'local' | 's3' | string;
  version?: string;
  uptime_seconds?: number;
}

export interface BackendHealthResult {
  isAvailable: boolean;
  statusText: string;
  details?: BackendHealthResponse;
  error?: string;
}

/**
 * Probes the backend health endpoint.
 * Tries /api/health, then falls back to /health if /api/health returns 404.
 */
export async function checkBackendHealth(): Promise<BackendHealthResult> {
  try {
    const res = await get<BackendHealthResponse>('/api/health', { timeoutMs: 5000 });
    return {
      isAvailable: true,
      statusText: res.status ?? 'healthy',
      details: res,
    };
  } catch (err: unknown) {
    // Attempt /health fallback
    try {
      const res = await get<BackendHealthResponse>('/health', { timeoutMs: 5000 });
      return {
        isAvailable: true,
        statusText: res.status ?? 'healthy',
        details: res,
      };
    } catch {
      // Backend offline
      const msg = err instanceof Error ? err.message : 'Backend unreachable';
      return {
        isAvailable: false,
        statusText: 'offline',
        error: msg,
      };
    }
  }
}
