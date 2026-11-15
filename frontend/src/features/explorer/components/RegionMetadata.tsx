import { MapPin, Box, Eye, Layers } from 'lucide-react';
import type { RegionMetadata as RegionMetadataType } from '../types/explorer.types';

interface RegionMetadataProps {
  region: RegionMetadataType | null | undefined;
  className?: string;
}

/** Convert decimal RA degrees to standard astronomical Hours, Minutes, Seconds format */
function formatRA(raDeg: number): string {
  const hoursTotal = (raDeg % 360) / 15;
  const h = Math.floor(hoursTotal);
  const mTotal = (hoursTotal - h) * 60;
  const m = Math.floor(mTotal);
  const s = ((mTotal - m) * 60).toFixed(2);
  return `${h}h ${m}m ${s}s`;
}

/** Convert decimal Dec degrees to Degrees, Arcminutes, Arcseconds format */
function formatDec(decDeg: number): string {
  const sign = decDeg >= 0 ? '+' : '-';
  const abs = Math.abs(decDeg);
  const d = Math.floor(abs);
  const mTotal = (abs - d) * 60;
  const m = Math.floor(mTotal);
  const s = ((mTotal - m) * 60).toFixed(1);
  return `${sign}${d}° ${m}′ ${s}″`;
}

/**
 * Region Metadata Panel displaying scientific coordinate frame,
 * field-of-view, pixel sampling, and cutout dimensions.
 */
export function RegionMetadata({ region, className }: RegionMetadataProps) {
  if (!region) {
    return (
      <div className={`rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-xs text-slate-400 ${className ?? ''}`}>
        No celestial coordinate metadata available for this region.
      </div>
    );
  }

  const { center_ra, center_dec, coordinate_frame, cutout_size, pixel_scale, dimensions } = region;

  return (
    <div className={`rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md ${className ?? ''}`}>
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <MapPin className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
          Region Coordinates &amp; Geometry
        </h3>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Right Ascension */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Centre RA (α)</span>
            <span className="text-[10px] text-blue-400 font-mono">ICRS</span>
          </div>
          <p className="mt-1 text-base font-mono font-medium text-slate-100">
            {center_ra !== null ? `${center_ra.toFixed(4)}°` : '—'}
          </p>
          {center_ra !== null && (
            <p className="text-[11px] font-mono text-slate-400">
              {formatRA(center_ra)}
            </p>
          )}
        </div>

        {/* Declination */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Centre Dec (δ)</span>
            <span className="text-[10px] text-blue-400 font-mono">ICRS</span>
          </div>
          <p className="mt-1 text-base font-mono font-medium text-slate-100">
            {center_dec !== null ? `${center_dec >= 0 ? '+' : ''}${center_dec.toFixed(4)}°` : '—'}
          </p>
          {center_dec !== null && (
            <p className="text-[11px] font-mono text-slate-400">
              {formatDec(center_dec)}
            </p>
          )}
        </div>

        {/* Coordinate Frame */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            <span>Coordinate Frame</span>
          </div>
          <p className="mt-1 text-base font-mono font-medium text-slate-100">
            {coordinate_frame ?? '—'}
          </p>
          <p className="text-[11px] text-slate-400">Standard Astrometric Reference</p>
        </div>

        {/* Cutout Size / Field of View */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Box className="h-3.5 w-3.5 text-slate-400" />
            <span>Cutout Size (FOV)</span>
          </div>
          <p className="mt-1 text-base font-mono font-medium text-slate-100">
            {cutout_size ?? '—'}
          </p>
          <p className="text-[11px] text-slate-400">Spatial Extent</p>
        </div>

        {/* Pixel Scale */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            <span>Pixel Scale</span>
          </div>
          <p className="mt-1 text-base font-mono font-medium text-slate-100">
            {pixel_scale ?? '—'}
          </p>
          <p className="text-[11px] text-slate-400">Spatial Sampling</p>
        </div>

        {/* Dimensions */}
        <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-400">Cutout Dimensions</span>
          <p className="mt-1 text-base font-mono font-medium text-slate-100">
            {dimensions ? `${dimensions.width} × ${dimensions.height} px` : '—'}
          </p>
          <p className="text-[11px] text-slate-400">Array Matrix Resolution</p>
        </div>
      </div>
    </div>
  );
}
