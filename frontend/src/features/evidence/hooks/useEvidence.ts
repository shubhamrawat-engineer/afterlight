import { useState, useEffect, useCallback } from 'react';
import type { EvidenceRecord } from '../types/evidence.types';
import type { CompleteEvidenceBundle } from '../services/evidence-service';
import {
  fetchEvidenceRecord,
  fetchCompleteEvidenceBundle,
} from '../services/evidence-service';

export function useEvidence(
  targetId: string | undefined,
  comparisonJobId?: string | null,
  options?: { candidateId?: string; epochIds?: string[] }
) {
  const [evidence, setEvidence] = useState<EvidenceRecord | null>(null);
  const [completeBundle, setCompleteBundle] = useState<CompleteEvidenceBundle | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const candidateId = options?.candidateId;
  const epochIdsKey = options?.epochIds?.join(',');

  const refetch = useCallback(() => {
    if (!targetId) return;
    setIsLoading(true);

    Promise.all([
      fetchEvidenceRecord(targetId, comparisonJobId),
      fetchCompleteEvidenceBundle(targetId, {
        candidateId,
        epochIds: epochIdsKey ? epochIdsKey.split(',') : undefined,
      }),
    ])
      .then(([recordRes, bundleRes]) => {
        setEvidence(recordRes.data);
        setCompleteBundle(bundleRes);
        setIsFallback(recordRes.isFallback || bundleRes.isFallback);
        setError(null);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to load evidence record';
        setError(msg);
        setEvidence(null);
        setCompleteBundle(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [targetId, comparisonJobId, candidateId, epochIdsKey]);

  useEffect(() => {
    let cancelled = false;

    if (!targetId) {
      return;
    }

    Promise.all([
      fetchEvidenceRecord(targetId, comparisonJobId),
      fetchCompleteEvidenceBundle(targetId, {
        candidateId,
        epochIds: epochIdsKey ? epochIdsKey.split(',') : undefined,
      }),
    ])
      .then(([recordRes, bundleRes]) => {
        if (!cancelled) {
          setEvidence(recordRes.data);
          setCompleteBundle(bundleRes);
          setIsFallback(recordRes.isFallback || bundleRes.isFallback);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to load evidence record';
          setError(msg);
          setEvidence(null);
          setCompleteBundle(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [targetId, comparisonJobId, candidateId, epochIdsKey]);

  return {
    evidence,
    completeBundle,
    isLoading,
    error,
    isFallback,
    refetch,
  };
}
