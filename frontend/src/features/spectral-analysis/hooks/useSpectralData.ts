import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  TargetSpectralRecord,
  SpectralProfile,
  SpectralDataPoint,
} from '../types/spectral.types';
import { fetchTargetSpectra } from '../services/spectral-service';

export function useSpectralData(targetId: string | undefined) {
  const [record, setRecord] = useState<TargetSpectralRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const [selectedPoint, setSelectedPoint] = useState<{
    profile: SpectralProfile;
    point: SpectralDataPoint;
  } | null>(null);

  const refetch = useCallback(() => {
    if (!targetId) return;
    setIsLoading(true);
    fetchTargetSpectra(targetId)
      .then((res) => {
        setRecord(res.data);
        setIsFallback(res.isFallback);
        if (!res.data && res.error) {
          setError(res.error);
        } else {
          setError(null);
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve spectral profiles';
        setError(msg);
        setRecord(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [targetId]);

  useEffect(() => {
    let cancelled = false;

    if (!targetId) {
      return;
    }

    fetchTargetSpectra(targetId)
      .then((res) => {
        if (!cancelled) {
          setRecord(res.data);
          setIsFallback(res.isFallback);
          if (!res.data && res.error) {
            setError(res.error);
          } else {
            setError(null);
          }
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to retrieve spectral profiles';
          setError(msg);
          setRecord(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [targetId]);

  const hasMultipleEpochs = useMemo(() => {
    return (record?.profiles?.length ?? 0) > 1;
  }, [record]);

  return {
    record,
    hasMultipleEpochs,
    selectedPoint,
    setSelectedPoint,
    isLoading: Boolean(targetId && isLoading),
    error: !targetId ? 'Target identifier not specified.' : error,
    isFallback,
    refetch,
  };
}
