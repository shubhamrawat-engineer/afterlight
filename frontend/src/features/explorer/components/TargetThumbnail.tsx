import { useState } from 'react';
import { Telescope, ImageOff } from 'lucide-react';
import { resolveImageUrl } from '../services/explorer-service';

interface TargetThumbnailProps {
  src: string | null | undefined;
  alt: string;
  targetId: string;
  className?: string;
}

/**
 * Astronomical Target Thumbnail with graceful fallback.
 * Resets load error state when src changes and displays a celestial reticle placeholder when missing or offline.
 */
export function TargetThumbnail({ src, alt, targetId, className }: TargetThumbnailProps) {
  const resolvedUrl = src ? resolveImageUrl(src) : null;
  const [prevUrl, setPrevUrl] = useState<string | null>(resolvedUrl);
  const [loadError, setLoadError] = useState(false);

  if (resolvedUrl !== prevUrl) {
    setPrevUrl(resolvedUrl);
    setLoadError(false);
  }

  if (!resolvedUrl || loadError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-[#070a14] border border-slate-800/80 p-4 text-center ${className ?? ''}`}
        aria-label={`Preview unavailable for ${alt}`}
      >
        {/* Astronomical Reticle Background */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full opacity-20 pointer-events-none"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="0.8"
        >
          <circle cx="50" cy="50" r="35" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="18" />
          <line x1="50" y1="5" x2="50" y2="95" strokeDasharray="2 2" />
          <line x1="5" y1="50" x2="95" y2="50" strokeDasharray="2 2" />
        </svg>

        <div className="z-10 flex flex-col items-center gap-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-400">
            {resolvedUrl ? <ImageOff className="h-4 w-4" /> : <Telescope className="h-4 w-4 text-blue-400" />}
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            {resolvedUrl ? 'Static Asset Offline' : 'Preview Pending'}
          </span>
          <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
            {targetId}
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={alt}
      loading="lazy"
      onError={() => setLoadError(true)}
      className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${className ?? ''}`}
    />
  );
}
