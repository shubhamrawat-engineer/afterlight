/**
 * AFTERLIGHT Centralised Error Handler
 *
 * Implements the standard error contract specified by the AFTERLIGHT backend:
 * {
 *   "error": {
 *     "code": "ERROR_CODE",
 *     "message": "Human-readable explanation"
 *   }
 * }
 *
 * Also provides robust fallbacks for FastAPI validation errors (422) and standard HTTP status errors.
 */

export interface BackendErrorPayload {
  error?: {
    code?: string;
    message?: string;
  };
  detail?: string | Array<{ loc?: string[]; msg?: string; type?: string }>;
  code?: string;
  message?: string;
}

export interface ApiError {
  /** HTTP status code (0 for network drop / timeout) */
  status: number;
  /** Human-readable message suitable for user display */
  message: string;
  /** Standard machine-readable error code */
  code?: string;
  /** Seconds to wait before retry, extracted from Retry-After header */
  retryAfter?: number;
  /** Original raw error details when available */
  details?: unknown;
}

/**
 * Type guard for ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  );
}

/**
 * Parses a backend response body and HTTP status into an ApiError.
 */
export function parseApiError(
  status: number,
  errorBody: unknown,
  statusText: string,
  retryAfterHeader?: string | null
): ApiError {
  let message = `HTTP ${status}: ${statusText || 'Request failed'}`;
  let code: string | undefined;
  let retryAfter: number | undefined;

  if (retryAfterHeader) {
    const parsed = parseInt(retryAfterHeader, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      retryAfter = parsed;
    }
  }

  if (typeof errorBody === 'object' && errorBody !== null) {
    const payload = errorBody as BackendErrorPayload;

    // 1. Standard AFTERLIGHT backend nested contract: { error: { code, message } }
    if (payload.error && typeof payload.error === 'object') {
      if (typeof payload.error.message === 'string') {
        message = payload.error.message;
      }
      if (typeof payload.error.code === 'string') {
        code = payload.error.code;
      }
    }
    // 2. Flat format: { code, message }
    else if (typeof payload.message === 'string') {
      message = payload.message;
      if (typeof payload.code === 'string') {
        code = payload.code;
      }
    }
    // 3. FastAPI default validation errors: { detail: ... }
    else if (payload.detail) {
      if (typeof payload.detail === 'string') {
        message = payload.detail;
      } else if (Array.isArray(payload.detail)) {
        const details = payload.detail
          .map((d) => (d.msg ? `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg}` : ''))
          .filter(Boolean)
          .join('; ');
        message = details || 'Validation error in request parameters.';
        code = 'UNPROCESSABLE_ENTITY';
      }
    }
  }

  // Fallback messages for standard HTTP status codes
  if (!code) {
    switch (status) {
      case 400:
        code = 'BAD_REQUEST';
        break;
      case 401:
        code = 'UNAUTHORIZED';
        message = message === `HTTP 401: ${statusText}` ? 'Authentication required.' : message;
        break;
      case 403:
        code = 'FORBIDDEN';
        message = message === `HTTP 403: ${statusText}` ? 'Access denied to this scientific resource.' : message;
        break;
      case 404:
        code = 'NOT_FOUND';
        message = message === `HTTP 404: ${statusText}` ? 'The requested target, observation, or resource was not found.' : message;
        break;
      case 409:
        code = 'CONFLICT';
        break;
      case 422:
        code = 'VALIDATION_ERROR';
        break;
      case 429:
        code = 'RATE_LIMITED';
        message = retryAfter
          ? `Rate limit exceeded. Please retry after ${retryAfter} seconds.`
          : 'Rate limit exceeded. Please slow down requests.';
        break;
      case 500:
        code = 'INTERNAL_SERVER_ERROR';
        message = 'The scientific backend encountered an internal error. Please try again later.';
        break;
      case 502:
      case 503:
      case 504:
        code = 'SERVICE_UNAVAILABLE';
        message = 'The scientific backend or archive service is currently unavailable.';
        break;
    }
  }

  return {
    status,
    message,
    code,
    retryAfter,
    details: errorBody,
  };
}
