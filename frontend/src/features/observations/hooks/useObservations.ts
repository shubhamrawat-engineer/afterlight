import { useState, useMemo, useCallback } from 'react';
import { useTargetDetail } from '../../explorer/hooks/useTargetDetail';
import type { ObservationRecord, ObservationSortOrder } from '../types/observation.types';
import { deriveCatalogueMetrics, getObsDate, getObsId, getObsProduct, getObsRelease } from '../services/observation-service';

export function useObservations(targetId: string | undefined) {
  const { manifest, isLoading, error, isFallback, refetch } = useTargetDetail(targetId);

  const [sortOrder, setSortOrder] = useState<ObservationSortOrder>('chronological_asc');
  const [roleFilter, setRoleFilter] = useState<'all' | 'earlier' | 'later'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedObsId, setSelectedObsId] = useState<string | null>(null);

  const rawObservations = useMemo<ObservationRecord[]>(() => {
    return (manifest?.observations ?? []) as ObservationRecord[];
  }, [manifest]);

  // Derive metrics
  const metrics = useMemo(() => {
    if (!manifest) return null;
    return deriveCatalogueMetrics(manifest);
  }, [manifest]);

  // Apply sorting and filtering
  const processedObservations = useMemo(() => {
    let list = [...rawObservations];

    // Filter by role if requested
    if (roleFilter !== 'all') {
      list = list.filter((obs) => obs.role === roleFilter);
    }

    // Filter by search text
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((obs) => {
        const id = getObsId(obs).toLowerCase();
        const product = getObsProduct(obs).toLowerCase();
        const release = getObsRelease(obs).toLowerCase();
        const detector = (obs.detector ?? '').toLowerCase();
        return id.includes(q) || product.includes(q) || release.includes(q) || detector.includes(q);
      });
    }

    // Sort observations
    list.sort((a, b) => {
      const dateA = getObsDate(a) ? new Date(getObsDate(a)!).getTime() : 0;
      const dateB = getObsDate(b) ? new Date(getObsDate(b)!).getTime() : 0;

      if (sortOrder === 'chronological_asc') {
        return dateA - dateB;
      }
      if (sortOrder === 'chronological_desc') {
        return dateB - dateA;
      }
      if (sortOrder === 'wavelength_asc') {
        return (a.wavelength_um ?? 0) - (b.wavelength_um ?? 0);
      }
      return 0;
    });

    return list;
  }, [rawObservations, roleFilter, searchQuery, sortOrder]);

  // Determine currently active selected observation
  const activeObservation = useMemo(() => {
    if (selectedObsId) {
      const found = rawObservations.find((o) => getObsId(o) === selectedObsId);
      if (found) return found;
    }
    return rawObservations[0] ?? null;
  }, [rawObservations, selectedObsId]);

  const selectObservation = useCallback((id: string) => {
    setSelectedObsId(id);
  }, []);

  return {
    manifest,
    rawObservations,
    observations: processedObservations,
    metrics,
    activeObservation,
    selectedObsId: activeObservation ? getObsId(activeObservation) : null,
    selectObservation,
    sortOrder,
    setSortOrder,
    roleFilter,
    setRoleFilter,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    isFallback,
    refetch,
  };
}
