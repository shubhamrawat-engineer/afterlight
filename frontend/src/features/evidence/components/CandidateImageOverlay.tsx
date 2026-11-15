import { useState } from 'react';
import { Crosshair, Eye, Compass, ImageOff, AlertTriangle } from 'lucide-react';
import type { CandidateDetection } from '../types/evidence.types';
import type { RegionMetadata } from '../../explorer/types/explorer.types';
import { resolveImageUrl, isDemonstrationAsset } from '../../explorer/services/explorer-service';
import { LoadingIndicator } from '../../../components/common/LoadingIndicator';

export type OverlayImageState = 'idle' | 'loading' | 'loaded' | 'failed';

interface CandidateImageOverlayProps {
  imageUrl: string | null;
  region: RegionMetadata;
  candidate: CandidateDetection | null;
  targetTitle: string;
  className?: string;
}

export function CandidateImageOverlay({
  imageUrl,
  region,
  candidate,
  targetTitle,
  className,
}: CandidateImageOverlayProps) {
  const resolvedUrl = resolveImageUrl(imageUrl);
  const isDemoAsset = isDemonstrationAsset(resolvedUrl);

  const [prevUrl, setPrevUrl] = useState<string | null>(resolvedUrl);
  const [imageState, setImageState] = useState<OverlayImageState>(resolvedUrl ? 'loading' : 'idle');

  if (resolvedUrl !== prevUrl) {
    setPrevUrl(resolvedUrl);
    setImageState(resolvedUrl ? 'loading' : 'idle');
  }

  const imgWidth = region?.dimensions?.width || 145;
  const imgHeight = region?.dimensions?.height || 145;

  const posXPercent = candidate ? Math.min(Math.max((candidate.pixel_x / imgWidth) * 100, 5), 95) : 50;
  const posYPercent = candidate ? Math.min(Math.max((candidate.pixel_y / imgHeight) * 100, 5), 95) : 50;

  return (
    <div className={`relative flex flex-col rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.9)] overflow-hidden shadow-2xl ${className ?? ''}`}>
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-2.5 bg-slate-950/70">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-bold text-slate-200">
            {isDemoAsset
              ? 'Difference Map Schematic (Demonstration Placeholder)'
              : 'Residual Flux Difference Map'}
          </span>
          {isDemoAsset && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-950/90 border border-amber-500/40 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-300">
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              <span>MOCK FIXTURE</span>
            </span>
          )}
        </div>
        {candidate && (
          <span className="font-mono text-[10px] text-blue-300">
            Target Focus: ({candidate.pixel_x}, {candidate.pixel_y}) px
          </span>
        )}
      </div>

      {/* Main Image Container */}
      <div className="relative min-h-[340px] w-full flex items-center justify-center bg-black overflow-hidden select-none">
        {resolvedUrl && imageState !== 'failed' ? (
          <>
            {imageState === 'loading' && (
              <div
                role="status"
                aria-live="polite"
                className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 text-xs text-slate-400 font-mono"
              >
                <LoadingIndicator size="sm" message="Loading difference asset..." />
              </div>
            )}

            <img
              src={resolvedUrl}
              alt={
                isDemoAsset
                  ? `Schematic demonstration difference map for ${targetTitle} (not genuine SPHEREx data)`
                  : `Difference map for ${targetTitle}`
              }
              onLoad={() => setImageState('loaded')}
              onError={() => setImageState('failed')}
              className={`max-h-[460px] w-auto object-contain transition-opacity duration-300 ${
                imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center justify-center gap-2.5 p-8 text-center text-slate-400 max-w-sm"
          >
            {imageState === 'failed' ? (
              <ImageOff className="h-10 w-10 text-slate-500" />
            ) : (
              <Compass className="h-10 w-10 text-slate-600" />
            )}
            <p className="text-xs font-semibold text-slate-200">
              {imageState === 'failed'
                ? 'Genuine SPHEREx Difference Image Unavailable'
                : 'No Difference Image Asset Registered'}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {imageState === 'failed'
                ? 'The difference image asset could not be loaded from backend storage. Candidate pixel coordinates are plotted on the schematic frame.'
                : 'No subtraction asset is attached to this target manifest.'}
            </p>
          </div>
        )}

        {/* Candidate Marker Reticle Overlay */}
        {candidate && imageState === 'loaded' && (
          <div
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${posXPercent}%`,
              top: `${posYPercent}%`,
            }}
          >
            {/* Outer Pulsing Radar Ring */}
            <div className="relative flex items-center justify-center">
              <span className="absolute h-10 w-10 animate-ping rounded-full border border-blue-400/60 bg-blue-500/10" />
              <div className="h-7 w-7 rounded-full border-2 border-blue-400 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
              <Crosshair className="absolute h-9 w-9 text-blue-300" />

              {/* Floating Candidate Tag */}
              <div className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-950/90 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-300 border border-blue-500/50 shadow-md backdrop-blur-sm">
                {candidate.label}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Corner HUD */}
        <div className="absolute bottom-2.5 left-2.5 rounded bg-slate-950/80 px-2.5 py-1 text-[10px] font-mono text-slate-300 border border-slate-800 backdrop-blur-md">
          FOV: {region?.cutout_size ?? '0.25° × 0.25°'} • {region?.pixel_scale ?? '6.2 arcsec/pixel'}
        </div>
      </div>
    </div>
  );
}
