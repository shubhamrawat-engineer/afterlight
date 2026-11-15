/**
 * AFTERLIGHT Centralised API Configuration
 *
 * All frontend requests target the backend via VITE_API_BASE_URL.
 * The frontend NEVER contacts NASA/IRSA or SIAv2 archives directly.
 */

const API_BASE_URL = (import.meta as { env?: Record<string, string | undefined> }).env
  ?.VITE_API_BASE_URL;

export const config = {
  /** Base URL for the AFTERLIGHT backend FastAPI instance. Default: http://localhost:8000 */
  apiBaseUrl: API_BASE_URL || 'http://localhost:8000',
  /** Whether fallback mock fixtures are allowed when backend is unreachable. */
  allowMockFallback: true,
  /** Default timeout for API requests in milliseconds. */
  defaultTimeoutMs: 30000,
} as const;
