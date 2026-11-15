import { useState, useEffect, useCallback } from 'react';
import type { CelestialObject } from '../types/object.types';
import { fetchObjectDetail } from '../services/object-service';

export function useObjectDetail(objectId: string | undefined) {
  const [object, setObject] = useState<CelestialObject | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const refetch = useCallback(() => {
    if (!objectId) return;
    setIsLoading(true);
    fetchObjectDetail(objectId)
      .then((res) => {
        setObject(res.data);
        setIsFallback(res.isFallback);
        setError(null);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve celestial object profile.';
        setError(msg);
        setObject(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [objectId]);

  useEffect(() => {
    let cancelled = false;

    if (!objectId) {
      return;
    }

    fetchObjectDetail(objectId)
      .then((res) => {
        if (!cancelled) {
          setObject(res.data);
          setIsFallback(res.isFallback);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to retrieve celestial object profile.';
          setError(msg);
          setObject(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [objectId]);

  return {
    object,
    isLoading: Boolean(objectId && isLoading),
    error: !objectId ? 'Object identifier not provided.' : error,
    isFallback,
    refetch,
  };
}
