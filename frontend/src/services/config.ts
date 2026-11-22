/**
 * AFTERLIGHT Centralised API Configuration
 *
 * All frontend requests target the backend via VITE_API_BASE_URL.
 * The frontend NEVER contacts NASA/IRSA or SIAv2 archives directly.
 */

const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim();
  }
  if (typeof window !== 'undefined' && window.location) {
    const { hostname, port, origin } = window.location;
    // When deployed on remote hosts (Render, Vercel, production domains), use same-origin
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '0.0.0.0') {
      return origin;
    }
    // When running on localhost on port 8000 (FastAPI serving frontend), use same-origin
    if (port === '8000') {
      return origin;
    }
  }
  return 'http://localhost:8000';
};

export const config = {
  /** Base URL for the AFTERLIGHT backend FastAPI instance. Dynamically defaults to same-origin on Render/remote hosts. */
  apiBaseUrl: getApiBaseUrl(),
  /** Whether fallback mock fixtures are allowed when backend is unreachable. */
  allowMockFallback: true,
  /** Default timeout for API requests in milliseconds. */
  defaultTimeoutMs: 30000,
} as const;
