import { useState, useEffect, useCallback } from 'react';
import type { TargetManifest } from '../types/explorer.types';
import { fetchTargetManifest } from '../services/explorer-service';

export function useTargetDetail(targetId: string | undefined) {
  const [manifest, setManifest] = useState<TargetManifest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(targetId));
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    if (!targetId) return;

    let isCancelled = false;

    async function load() {
      try {
        const result = await fetchTargetManifest(targetId!);
        if (isCancelled) return;
        setManifest(result.data);
        setIsFallback(result.isFallback);
      } catch (err) {
        if (isCancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to retrieve target manifest');
        setManifest(null);
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
  }, [targetId, reloadTrigger]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setReloadTrigger((n) => n + 1);
  }, []);

  return {
    manifest,
    isLoading: targetId ? isLoading : false,
    error: targetId ? error : 'Target identifier is missing.',
    isFallback,
    refetch,
  };
}
