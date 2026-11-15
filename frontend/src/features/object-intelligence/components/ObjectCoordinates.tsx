import { Compass } from 'lucide-react';
import {
  formatRaSexagesimal,
  formatDecSexagesimal,
} from '../services/object-service';

interface ObjectCoordinatesProps {
  raDeg: number;
  decDeg: number;
  frame: string;
  astrometricRef: string;
  className?: string;
}

export function ObjectCoordinates({
  raDeg,
  decDeg,
  frame,
  astrometricRef,
  className,
}: ObjectCoordinatesProps) {
  return (
    <div className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5 backdrop-blur-xl shadow-lg space-y-4 ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Astrometric Coordinate Reference
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">{frame}</span>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 text-xs font-mono">
        {/* Right Ascension */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Right Ascension (α)
            </span>
            <span className="text-[10px] font-sans text-sky-400/90 font-medium">East-West Sky Longitude</span>
          </div>
          <div className="space-y-1">
            <div className="text-base font-extrabold text-sky-400">
              {formatRaSexagesimal(raDeg)}
            </div>
            <div className="text-xs text-slate-400">
              Decimal: <span className="text-slate-200">{raDeg.toFixed(6)}°</span>
            </div>
          </div>
        </div>

        {/* Declination */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Declination (δ)
            </span>
            <span className="text-[10px] font-sans text-sky-400/90 font-medium">North-South Sky Latitude</span>
          </div>
          <div className="space-y-1">
            <div className="text-base font-extrabold text-sky-400">
              {formatDecSexagesimal(decDeg)}
            </div>
            <div className="text-xs text-slate-400">
              Decimal: <span className="text-slate-200">{decDeg.toFixed(6)}°</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400 border-t border-slate-900 pt-3">
        <span>Calibration Provenance:</span>
        <span className="text-slate-300 font-semibold">{astrometricRef}</span>
      </div>
    </div>
  );
}
