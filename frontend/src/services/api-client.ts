/**
 * AFTERLIGHT Centralised API Client
 *
 * Reusable HTTP client for communicating with the AFTERLIGHT backend.
 * All API requests are routed through this module to ensure:
 *  - Consistent error handling per backend standard { error: { code, message } }
 *  - Centralised base URL configuration via VITE_API_BASE_URL
 *  - Typed responses and request payloads
 *  - Rate-limit (429) & Retry-After awareness
 *  - Request timeout and cancellation support
 *  - Strict rule: The frontend NEVER communicates directly with NASA/IRSA services.
 */

import { config } from './config';
import { parseApiError, type ApiError } from './error-handler';

export { type ApiError, isApiError } from './error-handler';

// ---------------------------------------------------------------------------
// Request options & types
// ---------------------------------------------------------------------------

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  /** Query parameters appended to the URL. */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Additional headers merged with defaults. */
  headers?: Record<string, string>;
  /** AbortSignal for request cancellation. */
  signal?: AbortSignal;
  /** Timeout in milliseconds before automatically aborting (default: 30000ms). */
  timeoutMs?: number;
}

export interface BodyRequestOptions extends RequestOptions {
  /** JSON-serialisable request body. */
  body?: unknown;
}

/**
 * Build the full URL for an API endpoint with query parameters.
 */
function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  const base = config.apiBaseUrl.replace(/\/+$/, '');
  const normalised = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${normalised}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

/**
 * Parse the response from the API, handling both success and error cases.
 */
async function parseResponse<T>(response: Response): Promise<T> {
  const retryAfter = response.headers.get('Retry-After');

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      // Body is not JSON
    }

    const error = parseApiError(response.status, errorBody, response.statusText, retryAfter);
    throw error;
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Core request function used by all HTTP method helpers.
 */
async function request<T>(
  method: RequestMethod,
  path: string,
  options: BodyRequestOptions = {}
): Promise<T> {
  const { params, headers, body, signal, timeoutMs = 30000 } = options;
  const url = buildUrl(path, params);

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  // Setup abort controller for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);

  // Link external signal if provided
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(signal.reason));
  }

  const init: RequestInit = {
    method,
    headers: requestHeaders,
    signal: controller.signal,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, init);
    clearTimeout(timeoutId);
    return parseResponse<T>(response);
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    // Re-throw structured ApiError as-is
    if (typeof error === 'object' && error !== null && 'status' in error && 'message' in error) {
      throw error;
    }

    // Network failure, timeout, or abort
    const isTimeout =
      error instanceof Error &&
      (error.name === 'AbortError' || error.message.includes('timed out'));

    const apiError: ApiError = {
      status: 0,
      code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
      message: isTimeout
        ? `Request timed out after ${timeoutMs}ms. Backend server may be offline or overloaded.`
        : error instanceof Error
        ? error.message
        : 'An unexpected network error occurred while connecting to AFTERLIGHT backend.',
    };

    throw apiError;
  }
}

// ---------------------------------------------------------------------------
// Public HTTP Methods
// ---------------------------------------------------------------------------

/** Perform a GET request to the AFTERLIGHT backend. */
export function get<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>('GET', path, options);
}

/** Perform a POST request to the AFTERLIGHT backend. */
export function post<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T> {
  return request<T>('POST', path, { ...options, body });
}

/** Perform a PUT request to the AFTERLIGHT backend. */
export function put<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T> {
  return request<T>('PUT', path, { ...options, body });
}

/** Perform a PATCH request to the AFTERLIGHT backend. */
export function patch<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T> {
  return request<T>('PATCH', path, { ...options, body });
}

/** Perform a DELETE request to the AFTERLIGHT backend. */
export function del<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>('DELETE', path, options);
}
