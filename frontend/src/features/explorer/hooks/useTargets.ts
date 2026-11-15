import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TargetSummary, ExplorerFilters, TargetKind, TargetStatus } from '../types/explorer.types';
import { fetchTargetIndex } from '../services/explorer-service';

export function useTargets() {
  const [targets, setTargets] = useState<TargetSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [filters, setFilters] = useState<ExplorerFilters>({
    search: '',
    kind: 'all',
    status: 'all',
  });

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      try {
        const result = await fetchTargetIndex();
        if (isCancelled) return;
        setTargets(result.data.targets);
        setIsFallback(result.isFallback);
        if (result.error && result.isFallback) {
          setError(result.error);
        }
      } catch (err) {
        if (isCancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to retrieve targets');
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isCancelled = true;
    };
  }, [reloadTrigger]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setReloadTrigger((n) => n + 1);
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setKind = useCallback((kind: TargetKind | 'all') => {
    setFilters((prev) => ({ ...prev, kind }));
  }, []);

  const setStatus = useCallback((status: TargetStatus | 'all') => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      kind: 'all',
      status: 'all',
    });
  }, []);

  const filteredTargets = useMemo(() => {
    return targets.filter((target) => {
      // 1. Kind filter
      if (filters.kind !== 'all' && target.kind !== filters.kind) {
        return false;
      }

      // 2. Status filter
      if (filters.status !== 'all' && target.status !== filters.status) {
        return false;
      }

      // 3. Search query filter
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchesTitle = target.title.toLowerCase().includes(query);
        const matchesId = target.id.toLowerCase().includes(query);
        const matchesKind = target.kind.toLowerCase().replace('_', ' ').includes(query);
        const matchesInfo = target.short_info?.toLowerCase().includes(query) ?? false;

        if (!matchesTitle && !matchesId && !matchesKind && !matchesInfo) {
          return false;
        }
      }

      return true;
    });
  }, [targets, filters]);

  return {
    targets,
    filteredTargets,
    totalCount: targets.length,
    filteredCount: filteredTargets.length,
    filters,
    isLoading,
    error,
    isFallback,
    setSearch,
    setKind,
    setStatus,
    resetFilters,
    refetch,
  };
}
