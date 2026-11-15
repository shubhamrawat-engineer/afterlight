/**
 * Shared type definitions for the AFTERLIGHT application.
 *
 * Future modules will add domain-specific types here or in their own
 * feature-level type files. This file holds types used across multiple features.
 */

/** Generic paginated response envelope from the backend. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Coordinate pair used across astronomical features. */
export interface Coordinates {
  ra: number;
  dec: number;
}

/** Common metadata attached to astronomical objects. */
export interface AstronomicalObject {
  id: string;
  name: string;
  coordinates: Coordinates;
  objectType?: string;
}
