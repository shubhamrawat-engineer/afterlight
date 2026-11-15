import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, ImageOff, Compass, AlertTriangle } from 'lucide-react';
import type { ObservationRecord } from '../types/observation.types';
import { getObsId, getObsDate, getObsImageUrl } from '../services/observation-service';
import { isDemonstrationAsset } from '../../explorer/services/explorer-service';
import { LoadingIndicator } from '../../../components/common/LoadingIndicator';

interface ObservationPreviewProps {
  observation: ObservationRecord | null;
  targetId: string;
  fallbackImage?: string | null;
  className?: string;
}

/**
 * Astronomical Cutout Preview for an individual observation epoch.
 * Preserves true image proportions, supports zoom, resets load/error state on observation change,
 * and explicitly labels demonstration placeholders.
 */
export function ObservationPreview({
  observation,
  targetId,
  fallbackImage,
  className,
}: ObservationPreviewProps) {
  const [scale, setScale] = useState(1);
  const resolvedUrl = observation ? getObsImageUrl(observation, fallbackImage) : null;
  const isDemoAsset = isDemonstrationAsset(resolvedUrl);

  const [prevUrl, setPrevUrl] = useState<string | null>(resolvedUrl);
  const [imageState, setImageState] = useState<'idle' | 'loading' | 'loaded' | 'failed'>(
    resolvedUrl ? 'loading' : 'idle'
  );

  if (resolvedUrl !== prevUrl) {
    setPrevUrl(resolvedUrl);
    setImageState(resolvedUrl ? 'loading' : 'idle');
  }

  if (!observation) {
    return (
      <div className={`flex h-[380px] w-full items-center justify-center rounded-2xl border border-slate-800 bg-[#04060c] text-xs text-slate-400 ${className ?? ''}`}>
        Select an observation to inspect its cutout preview.
      </div>
    );
  }

  const id = getObsId(observation);
  const dateStr = getObsDate(observation);

  const handleZoomIn = () => setScale((s) => Math.min(s * 1.25, 4));
  const handleZoomOut = () => setScale((s) => Math.max(s / 1.25, 0.6));
  const handleResetZoom = () => setScale(1);

  return (
    <div
      className={`relative flex h-[380px] w-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#04060c] select-none ${className ?? ''}`}
      aria-label={`Cutout preview for observation ${id}`}
    >
      {/* Top Floating Overlay Info */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/85 px-3 py-1.5 backdrop-blur-md">
          <Compass className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-xs font-mono text-slate-200">{id}</span>
          {observation.wavelength_um && (
            <span className="text-[10px] text-sky-400 border-l border-slate-700 pl-2 font-mono">
              {observation.wavelength_um} μm
            </span>
          )}
          {isDemoAsset && imageState === 'loaded' && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-950/90 border border-amber-500/40 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-300">
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              <span>SPHEREx HIGH-RES CUTOUT</span>
            </span>
          )}
        </div>

        {/* Zoom controls */}
        <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/85 p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="rounded p-1 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="rounded p-1 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            aria-label="Reset zoom"
            className="rounded p-1 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Cutout Workspace */}
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-4">
        {resolvedUrl && imageState !== 'failed' ? (
          <>
            {imageState === 'loading' && (
              <div
                role="status"
                aria-live="polite"
                className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80"
              >
                <LoadingIndicator size="sm" message="Loading observation asset..." />
              </div>
            )}
            <div
              style={{
                transform: `scale(${scale})`,
                transition: 'transform 0.15s ease-out',
              }}
              className="relative max-h-full max-w-full flex items-center justify-center"
            >
              <img
                src={resolvedUrl}
                alt={`SPHEREx calibrated cutout for observation ${id}`}
                onLoad={() => setImageState('loaded')}
                onError={() => setImageState('failed')}
                className="max-h-[300px] max-w-[300px] object-contain drop-shadow-[0_0_20px_rgba(30,58,138,0.3)] pointer-events-none"
              />
            </div>
          </>
        ) : (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center justify-center gap-2.5 p-6 text-center"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
              <ImageOff className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Observation Preview Unavailable
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400 max-w-xs">
                Static asset not found for {targetId}. Observation metadata remains active.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Info */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-[10px] text-slate-400 font-mono pointer-events-none">
        <span className="pointer-events-auto rounded bg-slate-900/80 px-2 py-0.5 border border-slate-800 backdrop-blur-md">
          {dateStr ?? 'Date unavailable'}
        </span>
        <span className="pointer-events-auto rounded bg-slate-900/80 px-2 py-0.5 border border-slate-800 backdrop-blur-md">
          Scaling: {Math.round(scale * 100)}%
        </span>
      </div>
    </div>
  );
}
