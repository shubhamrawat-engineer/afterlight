import { useState, useEffect, useCallback, useRef } from 'react';
import type { ActiveEpoch } from '../types/temporal-analysis.types';

interface UseBlinkModeOptions {
  defaultIntervalMs?: number;
  onEpochChange?: (epoch: ActiveEpoch) => void;
}

export function useBlinkMode({
  defaultIntervalMs = 500,
  onEpochChange,
}: UseBlinkModeOptions = {}) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [intervalMs, setIntervalMs] = useState<number>(defaultIntervalMs);
  const [currentEpoch, setCurrentEpoch] = useState<ActiveEpoch>('then');

  const onEpochChangeRef = useRef(onEpochChange);
  useEffect(() => {
    onEpochChangeRef.current = onEpochChange;
  }, [onEpochChange]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const startBlink = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const stopBlink = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const changeInterval = useCallback((newMs: number) => {
    setIntervalMs(newMs);
  }, []);

  // Interval timer effect
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentEpoch((prev) => {
        const next = prev === 'then' ? 'now' : 'then';
        if (onEpochChangeRef.current) {
          onEpochChangeRef.current(next);
        }
        return next;
      });
    }, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [isPlaying, intervalMs]);

  return {
    isPlaying,
    intervalMs,
    currentEpoch,
    togglePlay,
    startBlink,
    stopBlink,
    changeInterval,
    setCurrentEpoch,
  };
}
