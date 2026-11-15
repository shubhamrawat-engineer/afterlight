import { useState, useEffect, useCallback } from 'react';
import { checkBackendHealth, type BackendHealthResult } from '../services/health-service';

export function useBackendHealth(autoPoll: boolean = false, pollIntervalMs: number = 30000) {
  const [health, setHealth] = useState<BackendHealthResult>({
    isAvailable: false,
    statusText: 'checking',
  });
  const [isLoading, setIsLoading] = useState(true);

  const check = useCallback(async () => {
    const result = await checkBackendHealth();
    setHealth(result);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    checkBackendHealth().then((result) => {
      if (!cancelled) {
        setHealth(result);
        setIsLoading(false);
      }
    });

    if (!autoPoll) {
      return () => {
        cancelled = true;
      };
    }

    const interval = setInterval(async () => {
      const result = await checkBackendHealth();
      if (!cancelled) {
        setHealth(result);
      }
    }, pollIntervalMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [autoPoll, pollIntervalMs]);

  return {
    ...health,
    isLoading,
    recheck: check,
  };
}
