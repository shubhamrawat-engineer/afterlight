import { useState, useCallback, useEffect, useRef } from 'react';
import type { SyncedViewportState } from '../types/temporal-analysis.types';

export function useSyncedViewport(initialScale = 1) {
  const [viewport, setViewport] = useState<SyncedViewportState>({
    scale: initialScale,
    position: { x: 0, y: 0 },
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const zoomIn = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.25, 8.0),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      scale: Math.max(prev.scale / 1.25, 0.4),
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setViewport({
      scale: 1,
      position: { x: 0, y: 0 },
    });
  }, []);

  const fitToScreen = useCallback(() => {
    setViewport({
      scale: 1.2,
      position: { x: 0, y: 0 },
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - viewport.position.x,
      y: e.clientY - viewport.position.y,
    };
  }, [viewport.position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setViewport((prev) => ({
      ...prev,
      position: {
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      },
    }));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setViewport((prev) => ({
      ...prev,
      scale: Math.min(Math.max(prev.scale * zoomFactor, 0.4), 8.0),
    }));
  }, []);

  return {
    scale: viewport.scale,
    position: viewport.position,
    isDragging,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    handleMouseDown,
    handleWheel,
  };
}
