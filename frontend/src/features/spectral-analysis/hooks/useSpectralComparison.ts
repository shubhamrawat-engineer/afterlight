import { useState, useMemo, useCallback } from 'react';
import type { ComparisonMode, SpectralProfile } from '../types/spectral.types';

export function useSpectralComparison(profiles: SpectralProfile[]) {
  const [mode, setMode] = useState<ComparisonMode>('overlay');
  const [activeEpochIndex, setActiveEpochIndex] = useState<number>(0);
  const [hiddenEpochIds, setHiddenEpochIds] = useState<Set<string>>(new Set());

  // Check unit compatibility across profiles
  const isCompatible = useMemo(() => {
    if (profiles.length <= 1) return true;
    const baseUnit = profiles[0].flux_unit;
    return profiles.every((p) => p.flux_unit === baseUnit);
  }, [profiles]);

  const toggleEpochVisibility = useCallback((epochId: string) => {
    setHiddenEpochIds((prev) => {
      const next = new Set(prev);
      if (next.has(epochId)) {
        next.delete(epochId);
      } else {
        // Prevent hiding all profiles
        if (next.size < profiles.length - 1) {
          next.add(epochId);
        }
      }
      return next;
    });
  }, [profiles.length]);

  const activeProfiles = useMemo(() => {
    if (profiles.length === 0) return [];

    if (mode === 'single') {
      const target = profiles[activeEpochIndex] ?? profiles[0];
      return [target];
    }

    if (mode === 'toggle') {
      const target = profiles[activeEpochIndex] ?? profiles[0];
      return [target];
    }

    // mode === 'overlay'
    return profiles.filter((p) => !hiddenEpochIds.has(p.epoch_id));
  }, [profiles, mode, activeEpochIndex, hiddenEpochIds]);

  const toggleNextEpoch = useCallback(() => {
    setActiveEpochIndex((prev) => (prev + 1) % Math.max(profiles.length, 1));
  }, [profiles.length]);

  return {
    mode,
    setMode,
    activeEpochIndex,
    setActiveEpochIndex,
    activeProfiles,
    isCompatible,
    hiddenEpochIds,
    toggleEpochVisibility,
    toggleNextEpoch,
  };
}
