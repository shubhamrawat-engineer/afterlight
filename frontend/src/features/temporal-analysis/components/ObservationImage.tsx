import { useState } from 'react';
import { ImageOff, AlertTriangle } from 'lucide-react';
import { LoadingIndicator } from '../../../components/common/LoadingIndicator';
import { isDemonstrationAsset } from '../../explorer/services/explorer-service';

export type ObservationImageState = 'idle' | 'loading' | 'loaded' | 'failed';

interface ObservationImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

/**
 * High-precision astronomical cutout image element.
 * Tracks explicit idle / loading / loaded / failed states, resets cleanly when src changes,
 * never displays an infinite loading indicator on broken assets, and explicitly labels demonstration placeholders.
 */
export function ObservationImage({ src, alt, className }: ObservationImageProps) {
  const [prevSrc, setPrevSrc] = useState<string | null | undefined>(src);
  const [imageState, setImageState] = useState<ObservationImageState>(src ? 'loading' : 'idle');

  if (src !== prevSrc) {
    setPrevSrc(src);
    setImageState(src ? 'loading' : 'idle');
  }

  const isDemoAsset = isDemonstrationAsset(src);

  if (!src || imageState === 'failed') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`flex flex-col items-center justify-center gap-2.5 p-6 text-center text-slate-400 select-none ${className ?? ''}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <ImageOff className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-200">
            {imageState === 'failed'
              ? 'Genuine SPHEREx Observation Asset Unavailable'
              : 'No Observation Image Registered'}
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
            {imageState === 'failed'
              ? 'Static image asset could not be loaded from archive storage. Observation metadata and preliminary wavelength metrics remain available.'
              : 'No observation cutout URL is attached to this epoch record.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center justify-center ${className ?? ''}`}>
      {imageState === 'loading' && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs"
        >
          <LoadingIndicator size="sm" message="Loading observation asset..." />
        </div>
      )}
      {isDemoAsset && imageState === 'loaded' && (
        <div
          className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-950/85 px-2.5 py-1 text-[10px] font-mono font-semibold text-amber-300 shadow-sm"
          title="Schematic demonstration placeholder (not genuine NASA SPHEREx observation imagery)"
        >
          <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
          <span>SPHEREx DR1 LEVEL-2 CALIBRATED OBSERVATION</span>
        </div>
      )}
      <img
        src={src}
        alt={isDemoAsset ? `${alt} (Demonstration Placeholder)` : alt}
        onLoad={() => setImageState('loaded')}
        onError={() => setImageState('failed')}
        draggable={false}
        className="max-h-[440px] max-w-[440px] object-contain drop-shadow-[0_0_25px_rgba(30,58,138,0.35)] pointer-events-none select-none"
      />
    </div>
  );
}
