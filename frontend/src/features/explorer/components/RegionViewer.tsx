import { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Crosshair, ImageOff, Compass, AlertTriangle } from 'lucide-react';
import { resolveImageUrl, isDemonstrationAsset } from '../services/explorer-service';
import { LoadingIndicator } from '../../../components/common/LoadingIndicator';

export type ImageLoadState = 'idle' | 'loading' | 'loaded' | 'failed';

interface RegionViewerProps {
  imageSrc: string | null | undefined;
  title: string;
  targetId: string;
  cutoutSize?: string | null;
  className?: string;
}

/**
 * Astronomical Region Viewer
 * Provides interactive pan-and-zoom inspection of astronomical cutouts,
 * maintaining strict aspect ratio, explicit loading/loaded/failed states,
 * and clear distinction between genuine astronomical data and demonstration placeholders.
 */
export function RegionViewer({
  imageSrc,
  title,
  targetId,
  cutoutSize,
  className,
}: RegionViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showReticle, setShowReticle] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedUrl = imageSrc ? resolveImageUrl(imageSrc) : null;
  const isDemoAsset = isDemonstrationAsset(resolvedUrl);

  const [prevUrl, setPrevUrl] = useState<string | null>(resolvedUrl);
  const [imageState, setImageState] = useState<ImageLoadState>(resolvedUrl ? 'loading' : 'idle');

  if (resolvedUrl !== prevUrl) {
    setPrevUrl(resolvedUrl);
    setImageState(resolvedUrl ? 'loading' : 'idle');
  }

  const handleZoomIn = () => setScale((s) => Math.min(s * 1.3, 8));
  const handleZoomOut = () => setScale((s) => Math.max(s / 1.3, 0.4));
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  const handleFitToScreen = () => {
    setScale(1.2);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Primary click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

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

  // Handle wheel zoom inside viewer
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 8));
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className={`relative flex h-[480px] w-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#04060c] select-none ${className ?? ''}`}
      aria-label={`Astronomical viewer for ${title}`}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Left Badge */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-lg border border-slate-800/90 bg-slate-900/85 px-3 py-1.5 backdrop-blur-md">
          <Compass className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-xs font-mono text-slate-200">{targetId}</span>
          {cutoutSize && (
            <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2">
              FOV: {cutoutSize}
            </span>
          )}
          {isDemoAsset && imageState === 'loaded' && (
            <span
              className="inline-flex items-center gap-1 rounded bg-amber-950/90 border border-amber-500/40 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-300"
              title="This visual is a schematic demonstration placeholder, not genuine NASA SPHEREx imagery."
            >
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              <span>SPHEREx HIGH-RES CUTOUT</span>
            </span>
          )}
        </div>

        {/* Right Toolbar Controls */}
        <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-slate-800/90 bg-slate-900/85 p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in"
            title="Zoom In"
            className="rounded p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            title="Zoom Out"
            className="rounded p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleFitToScreen}
            aria-label="Fit to screen"
            title="Fit to Screen"
            className="rounded p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            aria-label="Reset zoom and pan"
            title="Reset (1:1)"
            className="rounded p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <div className="mx-1 h-3.5 w-px bg-slate-700" />
          <button
            type="button"
            onClick={() => setShowReticle(!showReticle)}
            aria-label="Toggle celestial reticle"
            title={showReticle ? 'Hide Crosshairs' : 'Show Crosshairs'}
            className={`rounded p-1.5 transition-colors ${
              showReticle ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Crosshair className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Viewport Workspace */}
      <div
        className={`relative flex h-full w-full items-center justify-center overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
      >
        {resolvedUrl && imageState !== 'failed' ? (
          <>
            {imageState === 'loading' && (
              <div
                role="status"
                aria-live="polite"
                className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs"
              >
                <LoadingIndicator size="sm" message={`Loading region cutout for ${title}...`} />
              </div>
            )}
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
              className="relative will-change-transform"
            >
              <img
                src={resolvedUrl}
                alt={
                  isDemoAsset
                    ? `Schematic demonstration placeholder cutout for ${title} (not genuine SPHEREx data)`
                    : `SPHEREx astronomical cutout for ${title}`
                }
                onLoad={() => setImageState('loaded')}
                onError={() => setImageState('failed')}
                draggable={false}
                className="max-h-[380px] max-w-[380px] object-contain drop-shadow-[0_0_20px_rgba(30,58,138,0.3)] pointer-events-none"
              />
            </div>
          </>
        ) : (
          /* Empty / Failed Astronomical Cutout State */
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center justify-center gap-3 p-8 text-center max-w-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400">
              <ImageOff className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-200">
                {imageState === 'failed'
                  ? 'Genuine SPHEREx Cutout Asset Unavailable'
                  : 'No Cutout Preview Registered'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {imageState === 'failed'
                  ? 'The requested astronomical image asset could not be loaded from the archive server. Region coordinate metadata and observation records remain available below.'
                  : 'No static preview cutout has been attached to this target manifest.'}
              </p>
            </div>
          </div>
        )}

        {/* Celestial Crosshair Reticle Overlay */}
        {showReticle && imageState === 'loaded' && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            {/* Center target circle */}
            <div className="h-16 w-16 rounded-full border border-blue-400/40 border-dashed" />
            <div className="absolute h-2 w-2 rounded-full bg-blue-400/80 shadow-[0_0_8px_#38bdf8]" />
            {/* Axis reticles */}
            <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-400/30 to-transparent" />
            <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
          </div>
        )}
      </div>

      {/* Bottom Information Footer */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-[11px] text-slate-400 font-mono pointer-events-none">
        {/* Astronomical Compass (North / East) */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-md bg-slate-900/80 border border-slate-800 px-2 py-1 backdrop-blur-md">
          <div className="relative h-6 w-6">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[9px] font-bold text-sky-400">N↑</span>
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-300">←E</span>
          </div>
          <span className="text-[10px] text-slate-400">Equatorial</span>
        </div>

        {/* Zoom Factor & Pan readout */}
        <div className="pointer-events-auto rounded-md bg-slate-900/80 border border-slate-800 px-2.5 py-1 backdrop-blur-md">
          <span>Zoom: {Math.round(scale * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
