import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CompatibilityDossier } from '../types/compatibility.types';
import { fetchCompatibilityAssessment } from '../services/compatibility-service';
import {
  saveActiveInvestigationSession,
  swapObservationPair,
} from '../../../services/investigation-session';
import { MOCK_TARGET_MANIFESTS } from '../../explorer/data/mock-targets';

interface UseCompatibilityProps {
  targetId: string | undefined;
  initialEarlierId?: string | null;
  initialLaterId?: string | null;
}

export function useCompatibility({
  targetId,
  initialEarlierId,
  initialLaterId,
}: UseCompatibilityProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlEarlier = searchParams.get('earlier') || initialEarlierId || null;
  const urlLater = searchParams.get('later') || initialLaterId || null;

  const [dossier, setDossier] = useState<CompatibilityDossier | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const manifest = useMemo(() => {
    return targetId ? MOCK_TARGET_MANIFESTS[targetId] ?? null : null;
  }, [targetId]);

  useEffect(() => {
    let cancelled = false;

    if (!targetId) {
      return;
    }

    fetchCompatibilityAssessment(targetId, urlEarlier, urlLater)
      .then((result) => {
        if (!cancelled) {
          setDossier(result.data);
          setIsFallback(result.isFallback);
          setError(null);
          setIsLoading(false);

          // Synchronize session storage
          if (result.data.earlierId && result.data.laterId) {
            saveActiveInvestigationSession({
              targetId,
              targetTitle: result.data.targetTitle,
              earlierObsId: result.data.earlierId,
              laterObsId: result.data.laterId,
            });
          }
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : 'Failed to assess scientific compatibility';
          setError(msg);
          setDossier(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [targetId, urlEarlier, urlLater]);

  const setEarlierId = useCallback(
    (id: string | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id) next.set('earlier', id);
          else next.delete('earlier');
          if (!next.has('later') && dossier?.laterId) {
            next.set('later', dossier.laterId);
          }
          return next;
        },
        { replace: true }
      );
    },
    [dossier, setSearchParams]
  );

  const setLaterId = useCallback(
    (id: string | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id) next.set('later', id);
          else next.delete('later');
          if (!next.has('earlier') && dossier?.earlierId) {
            next.set('earlier', dossier.earlierId);
          }
          return next;
        },
        { replace: true }
      );
    },
    [dossier, setSearchParams]
  );

  const swapPair = useCallback(() => {
    if (!dossier?.earlierId || !dossier?.laterId) return;
    const swapped = swapObservationPair(dossier.earlierId, dossier.laterId);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (swapped.earlierId) next.set('earlier', swapped.earlierId);
        if (swapped.laterId) next.set('later', swapped.laterId);
        return next;
      },
      { replace: true }
    );
  }, [dossier, setSearchParams]);

  const refetch = useCallback(() => {
    if (!targetId) return;
    setIsLoading(true);
    fetchCompatibilityAssessment(targetId, urlEarlier, urlLater)
      .then((result) => {
        setDossier(result.data);
        setIsFallback(result.isFallback);
        setError(null);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : 'Failed to assess scientific compatibility';
        setError(msg);
        setDossier(null);
        setIsLoading(false);
      });
  }, [targetId, urlEarlier, urlLater]);

  return {
    dossier,
    manifest,
    rawObservations: manifest?.observations ?? [],
    earlierId: urlEarlier ?? dossier?.earlierId ?? null,
    laterId: urlLater ?? dossier?.laterId ?? null,
    setEarlierId,
    setLaterId,
    swapPair,
    isLoading,
    error,
    isFallback,
    refetch,
  };
}
