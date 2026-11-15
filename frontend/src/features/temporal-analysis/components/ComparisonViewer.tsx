import { useState, useRef } from 'react';
import { Sparkles, Calendar, Layers, Columns2 } from 'lucide-react';
import type { ComparisonMode, ActiveEpoch, ObservationRecord, DifferenceMetadata } from '../types/temporal-analysis.types';
import { useSyncedViewport } from '../hooks/useSyncedViewport';
import { ObservationImage } from './ObservationImage';
import { ViewerControls } from './ViewerControls';
import { getObsId, getObsDate, getObsProduct } from '../../observations/services/observation-service';
import { resolveImageUrl } from '../services/temporal-analysis-service';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';

interface ComparisonViewerProps {
  mode: ComparisonMode;
  activeEpoch: ActiveEpoch;
  currentImageUrl: string | null;
  earlierObs: ObservationRecord | null;
  laterObs: ObservationRecord | null;
  differenceMeta: DifferenceMetadata | null;
  targetId: string;
  targetTitle: string;
  fallbackImage?: string | null;
  className?: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Not available';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return iso;
  }
}

/**
 * Flagship Astronomical Comparison Viewer for the Temporal Analysis Lab.
 * Houses the synchronized viewport, maintaining absolute pixel alignment across
 * THEN, NOW, SIDE-BY-SIDE, automated BLINK, and DIFFERENCE map visualisations.
 */
export function ComparisonViewer({
  mode,
  activeEpoch,
  currentImageUrl,
  earlierObs,
  laterObs,
  differenceMeta,
  targetId,
  targetTitle,
  fallbackImage,
  className,
}: ComparisonViewerProps) {
  const [showReticle, setShowReticle] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    scale,
    position,
    isDragging,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    handleMouseDown,
    handleWheel,
  } = useSyncedViewport(1);

  // Active observation metadata
  const currentObs = activeEpoch === 'then' ? earlierObs : laterObs;
  const obsId = currentObs ? getObsId(currentObs) : 'DIFF-SUBTRACTION';
  const obsDate = currentObs ? getObsDate(currentObs) : null;
  const wavelength = currentObs?.wavelength_um ?? null;
  const product = currentObs ? getObsProduct(currentObs) : (differenceMeta?.method ?? 'Difference Map');

  const earlierImageUrl = resolveImageUrl(earlierObs?.image || fallbackImage || null);
  const laterImageUrl = resolveImageUrl(laterObs?.image || fallbackImage || null);
  const earlierId = earlierObs ? getObsId(earlierObs) : 'EARLIER';
  const laterId = laterObs ? getObsId(laterObs) : 'LATER';
  const earlierDate = earlierObs ? getObsDate(earlierObs) : null;
  const laterDate = laterObs ? getObsDate(laterObs) : null;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className={`relative flex h-[540px] w-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#04060c] select-none shadow-[0_12px_36px_rgba(2,4,10,0.9)] ${className ?? ''}`}
      aria-label={`Comparison viewer for ${targetTitle}`}
    >
      {/* Top Floating Overlay Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Active Mode & Epoch Badge */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 backdrop-blur-md">
          {mode === 'difference' ? (
            <div className="flex items-center gap-2 text-xs text-indigo-300 font-bold">
              <Layers className="h-3.5 w-3.5" />
              <span>DIFFERENCE SUBTRACTION PLACEHOLDER</span>
              <DemonstrationDataBadge variant="compact" label="PLACEHOLDER ASSET" />
            </div>
          ) : mode === 'side_by_side' ? (
            <div className="flex items-center gap-2 text-xs text-sky-300 font-bold">
              <Columns2 className="h-3.5 w-3.5" />
              <span>SIDE-BY-SIDE SYNCHRONIZED COMPARISON</span>
              <DemonstrationDataBadge variant="compact" label="SPHEREx ASSETS" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider ${
                  activeEpoch === 'then'
                    ? 'bg-sky-950 text-sky-300 border border-sky-500/40'
                    : 'bg-indigo-950 text-indigo-300 border border-indigo-500/40'
                }`}
              >
                {activeEpoch === 'then' ? 'THEN (Earlier)' : 'NOW (Later)'}
              </span>
              <span className="font-mono text-xs text-slate-200 truncate max-w-[140px]">{obsId}</span>
              {wavelength && (
                <div className="flex items-center gap-1 text-[11px] font-mono text-sky-400 border-l border-slate-700 pl-2">
                  <Sparkles className="h-3 w-3" />
                  <span>{wavelength} μm</span>
                </div>
              )}
              <DemonstrationDataBadge variant="compact" label="SPHEREx ASSET" />
            </div>
          )}
        </div>

        {/* Right: Viewport Controls */}
        <div className="pointer-events-auto">
          <ViewerControls
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onFitToScreen={fitToScreen}
            onResetZoom={resetZoom}
            showReticle={showReticle}
            onToggleReticle={() => setShowReticle(!showReticle)}
          />
        </div>
      </div>

      {/* Main Viewport Workspace */}
      {mode === 'side_by_side' ? (
        <div
          className={`relative grid h-full w-full grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
        >
          {/* Left Pane: Earlier (T0) */}
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#04060c]">
            <div className="absolute top-14 left-3 z-20 flex flex-wrap items-center gap-1.5 rounded-lg border border-sky-500/40 bg-slate-950/90 px-2.5 py-1 text-[11px] font-mono text-sky-300 pointer-events-none">
              <span className="font-bold">THEN (T0):</span>
              <span>{earlierId}</span>
              {earlierObs?.wavelength_um && <span>• {earlierObs.wavelength_um} μm</span>}
              {earlierDate && <span>• {formatDate(earlierDate)}</span>}
            </div>
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.12s ease-out',
              }}
              className="relative will-change-transform flex items-center justify-center"
            >
              <ObservationImage
                src={earlierImageUrl}
                alt={`Earlier observation ${earlierId} for ${targetTitle}`}
              />
            </div>
            {showReticle && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full border border-sky-400/35 border-dashed" />
                <div className="absolute h-2 w-2 rounded-full bg-sky-400/80 shadow-[0_0_8px_#38bdf8]" />
              </div>
            )}
          </div>

          {/* Right Pane: Later (T1) */}
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#04060c]">
            <div className="absolute top-14 left-3 z-20 flex flex-wrap items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-slate-950/90 px-2.5 py-1 text-[11px] font-mono text-indigo-300 pointer-events-none">
              <span className="font-bold">NOW (T1):</span>
              <span>{laterId}</span>
              {laterObs?.wavelength_um && <span>• {laterObs.wavelength_um} μm</span>}
              {laterDate && <span>• {formatDate(laterDate)}</span>}
            </div>
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.12s ease-out',
              }}
              className="relative will-change-transform flex items-center justify-center"
            >
              <ObservationImage
                src={laterImageUrl}
                alt={`Later observation ${laterId} for ${targetTitle}`}
              />
            </div>
            {showReticle && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full border border-indigo-400/35 border-dashed" />
                <div className="absolute h-2 w-2 rounded-full bg-indigo-400/80 shadow-[0_0_8px_#818cf8]" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`relative flex h-full w-full items-center justify-center overflow-hidden ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
        >
          {mode === 'difference' && (
            <div className="pointer-events-none absolute top-14 left-3 z-20 max-w-md rounded-lg border border-amber-500/40 bg-amber-950/85 px-3 py-1.5 text-[11px] text-amber-200 backdrop-blur-md">
              <strong>Demonstration Placeholder Notice:</strong> Visual difference preview is a static demonstration asset, not a live archive FITS subtraction.
            </div>
          )}

          <div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.12s ease-out',
            }}
            className="relative will-change-transform flex items-center justify-center"
          >
            <ObservationImage
              src={currentImageUrl}
              alt={
                mode === 'difference'
                  ? `Demonstration difference subtraction placeholder for ${targetTitle}`
                  : `SPHEREx demonstration observation ${obsId} (${activeEpoch}) for ${targetTitle}`
              }
            />
          </div>

          {/* Celestial Crosshairs Overlay */}
          {showReticle && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full border border-blue-400/35 border-dashed" />
              <div className="absolute h-2.5 w-2.5 rounded-full bg-blue-400/80 shadow-[0_0_10px_#38bdf8]" />
              <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-400/25 to-transparent" />
              <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/25 to-transparent" />
            </div>
          )}
        </div>
      )}

      {/* Bottom Floating Info Overlays */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-[11px] text-slate-400 font-mono pointer-events-none">
        {/* Left: Astronomical Orientation */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-lg bg-slate-900/85 border border-slate-800 px-2.5 py-1 backdrop-blur-md">
          <div className="relative h-6 w-6">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[9px] font-bold text-sky-400">N↑</span>
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-300">←E</span>
          </div>
          <div className="flex flex-col text-[10px]">
            <span className="text-slate-300 font-semibold">{targetId}</span>
            <span className="text-slate-400 truncate max-w-[180px]">{product}</span>
          </div>
        </div>

        {/* Right: Date & Scale */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-lg bg-slate-900/85 border border-slate-800 px-3 py-1 backdrop-blur-md">
          {mode !== 'difference' && mode !== 'side_by_side' && obsDate && (
            <div className="flex items-center gap-1 text-slate-300">
              <Calendar className="h-3 w-3 text-sky-400" />
              <span>{formatDate(obsDate)}</span>
            </div>
          )}
          <span className={mode !== 'difference' && mode !== 'side_by_side' && obsDate ? 'border-l border-slate-700 pl-2' : ''}>
            Synced Zoom: {Math.round(scale * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
