import { useState, useEffect, useCallback } from 'react';
import type { InvestigationCase } from '../types/investigation.types';
import {
  fetchInvestigationDetail,
  submitInvestigation,
  triggerInvestigationJsonDownload,
} from '../services/investigation-service';

export function useInvestigationDetail(caseId: string | undefined) {
  const [investigation, setInvestigation] = useState<InvestigationCase | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const refetch = useCallback(() => {
    if (!caseId) return;
    setIsLoading(true);
    fetchInvestigationDetail(caseId)
      .then((res) => {
        setInvestigation(res.data);
        setIsFallback(res.isFallback);
        setError(null);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve investigation case.';
        setError(msg);
        setInvestigation(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [caseId]);

  useEffect(() => {
    let cancelled = false;

    if (!caseId) {
      return;
    }

    fetchInvestigationDetail(caseId)
      .then((res) => {
        if (!cancelled) {
          setInvestigation(res.data);
          setIsFallback(res.isFallback);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to retrieve investigation case.';
          setError(msg);
          setInvestigation(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const submit = useCallback(async () => {
    if (!caseId) return;
    setIsSubmitting(true);
    try {
      const result = await submitInvestigation(caseId);
      setInvestigation(result.data);
      return result.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit case for review.';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [caseId]);

  const exportJson = useCallback(() => {
    if (!investigation) return;
    triggerInvestigationJsonDownload(investigation);
  }, [investigation]);

  return {
    investigation,
    isLoading: Boolean(caseId && isLoading),
    isSubmitting,
    error: !caseId ? 'Investigation case ID not provided.' : error,
    isFallback,
    refetch,
    submit,
    exportJson,
  };
}
