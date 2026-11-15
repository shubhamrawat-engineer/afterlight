import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CelestialObject, ObjectFiltersState, ObjectCategory } from '../types/object.types';
import { fetchObjects } from '../services/object-service';

export function useObjects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTargetFilter = searchParams.get('targetId') ?? '';

  const [allObjects, setAllObjects] = useState<CelestialObject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const [filters, setFilters] = useState<ObjectFiltersState>({
    search: initialTargetFilter,
    category: 'all',
    sortBy: 'name_asc',
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchObjects();
      setAllObjects(res.data);
      setIsFallback(res.isFallback);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve object directory';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchObjects()
      .then((res) => {
        if (!cancelled) {
          setAllObjects(res.data);
          setIsFallback(res.isFallback);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to retrieve object directory';
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allObjects.length,
      transient_candidate: 0,
      variable_star: 0,
      moving_object: 0,
      deep_field_source: 0,
      calibration_standard: 0,
    };
    allObjects.forEach((obj) => {
      if (counts[obj.category] !== undefined) {
        counts[obj.category]++;
      }
    });
    return counts;
  }, [allObjects]);

  const filteredObjects = useMemo(() => {
    return allObjects
      .filter((obj) => {
        if (filters.category !== 'all' && obj.category !== filters.category) {
          return false;
        }

        if (filters.search.trim()) {
          const query = filters.search.toLowerCase().trim();
          const matchName = obj.name.toLowerCase().includes(query);
          const matchId = obj.id.toLowerCase().includes(query);
          const matchTargetId = obj.target_id.toLowerCase().includes(query);
          const matchDesig = obj.designation.toLowerCase().includes(query);
          const matchRegion = obj.associated_region.toLowerCase().includes(query);
          return matchName || matchId || matchTargetId || matchDesig || matchRegion;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'ra_asc') {
          return a.ra_deg - b.ra_deg;
        }
        if (filters.sortBy === 'obs_count_desc') {
          return b.observations.length - a.observations.length;
        }
        return a.name.localeCompare(b.name);
      });
  }, [allObjects, filters]);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setCategory = useCallback((category: ObjectCategory | 'all') => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const setSortBy = useCallback((sortBy: 'name_asc' | 'ra_asc' | 'obs_count_desc') => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      category: 'all',
      sortBy: 'name_asc',
    });
    if (searchParams.has('targetId')) {
      const next = new URLSearchParams(searchParams);
      next.delete('targetId');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return {
    objects: filteredObjects,
    totalCount: allObjects.length,
    filteredCount: filteredObjects.length,
    categoryCounts,
    filters,
    setFilters,
    setSearch,
    setCategory,
    setSortBy,
    resetFilters,
    isLoading,
    error,
    isFallback,
    refetch: load,
  };
}
