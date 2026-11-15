import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Crosshair } from 'lucide-react';

interface ViewerControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onResetZoom: () => void;
  showReticle: boolean;
  onToggleReticle: () => void;
  className?: string;
}

/**
 * Common viewport manipulation toolbar for astronomical comparison viewer.
 */
export function ViewerControls({
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onResetZoom,
  showReticle,
  onToggleReticle,
  className,
}: ViewerControlsProps) {
  return (
    <div className={`flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 p-1 backdrop-blur-md ${className ?? ''}`}>
      <button
        type="button"
        onClick={onZoomIn}
        aria-label="Zoom in"
        title="Zoom In"
        className="rounded p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
      >
        <ZoomIn className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onZoomOut}
        aria-label="Zoom out"
        title="Zoom Out"
        className="rounded p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
      >
        <ZoomOut className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onFitToScreen}
        aria-label="Fit to screen"
        title="Fit to Screen"
        className="rounded p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
      >
        <Maximize2 className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onResetZoom}
        aria-label="Reset zoom and pan"
        title="Reset Zoom (1:1)"
        className="rounded p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      <div className="mx-1 h-3.5 w-px bg-slate-700" />

      <button
        type="button"
        onClick={onToggleReticle}
        aria-label="Toggle celestial reticle"
        title={showReticle ? 'Hide Crosshairs' : 'Show Crosshairs'}
        className={`rounded p-1.5 transition-colors ${
          showReticle ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Crosshair className="h-4 w-4" />
      </button>
    </div>
  );
}
