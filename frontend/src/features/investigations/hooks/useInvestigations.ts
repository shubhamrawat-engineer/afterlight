import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  InvestigationCase,
  InvestigationFiltersState,
  InvestigationMetrics,
} from '../types/investigation.types';
import { fetchInvestigations, deriveInvestigationMetrics } from '../services/investigation-service';

export function useInvestigations() {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const [filters, setFilters] = useState<InvestigationFiltersState>({
    search: '',
    status: 'all',
    sortBy: 'created_desc',
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchInvestigations();
      setCases(result.data);
      setIsFallback(result.isFallback);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load investigations';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchInvestigations()
      .then((res) => {
        if (!cancelled) {
          setCases(res.data);
          setIsFallback(res.isFallback);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to load investigations';
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const metrics: InvestigationMetrics = useMemo(() => {
    return deriveInvestigationMetrics(cases);
  }, [cases]);

  const filteredCases = useMemo(() => {
    return cases
      .filter((c) => {
        // Status filter
        if (filters.status === 'all') {
          return c.status !== 'archived';
        }
        if (filters.status === 'under_review') {
          return c.status === 'under_review' || c.status === 'submitted';
        }
        if (c.status !== filters.status) {
          return false;
        }

        // Search filter (title, ID, or target)
        if (filters.search.trim()) {
          const query = filters.search.toLowerCase().trim();
          const matchTitle = c.title.toLowerCase().includes(query);
          const matchId = c.id.toLowerCase().includes(query);
          const matchTarget = c.target_title.toLowerCase().includes(query) || c.target_id.toLowerCase().includes(query);
          return matchTitle || matchId || matchTarget;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'created_asc') {
          return new Date(a.created_at_utc).getTime() - new Date(b.created_at_utc).getTime();
        }
        if (filters.sortBy === 'updated_desc') {
          const timeA = a.updated_at_utc ? new Date(a.updated_at_utc).getTime() : new Date(a.created_at_utc).getTime();
          const timeB = b.updated_at_utc ? new Date(b.updated_at_utc).getTime() : new Date(b.created_at_utc).getTime();
          return timeB - timeA;
        }
        if (filters.sortBy === 'updated_asc') {
          const timeA = a.updated_at_utc ? new Date(a.updated_at_utc).getTime() : new Date(a.created_at_utc).getTime();
          const timeB = b.updated_at_utc ? new Date(b.updated_at_utc).getTime() : new Date(b.created_at_utc).getTime();
          return timeA - timeB;
        }
        // Default: created_desc
        return new Date(b.created_at_utc).getTime() - new Date(a.created_at_utc).getTime();
      });
  }, [cases, filters]);

  return {
    cases: filteredCases,
    rawCasesCount: cases.length,
    metrics,
    filters,
    setFilters,
    isLoading,
    error,
    isFallback,
    refetch: load,
  };
}
