import {
  FileText,
  Calendar,
  Sparkles,
  Cpu,
  Layers,
  Compass,
  Maximize2,
} from 'lucide-react';
import type { MultiEpochRecord } from '../types/multi-epoch.types';
import { getObsId, getObsDate } from '../../observations/services/observation-service';

interface EpochMetadataPanelProps {
  epoch: MultiEpochRecord | null;
  coordinateFrame?: string | null;
  pixelScale?: string | null;
  dimensions?: { width: number; height: number } | null;
  className?: string;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'Not recorded';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
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

export function EpochMetadataPanel({
  epoch,
  coordinateFrame = 'ICRS J2000',
  pixelScale = '6.2 arcsec/pixel',
  dimensions = { width: 145, height: 145 },
  className,
}: EpochMetadataPanelProps) {
  if (!epoch) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-center text-xs text-slate-400">
        Select an observation epoch to inspect scientific calibration parameters.
      </div>
    );
  }

  const id = getObsId(epoch);
  const date = getObsDate(epoch);

  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5.5 backdrop-blur-xl shadow-lg space-y-4 ${className ?? ''}`}
      aria-label="Multi-Epoch Scientific Metadata Inspection"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-950/50 text-blue-400">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Observational Provenance
            </span>
            <h3 className="text-base font-bold text-slate-100">
              {epoch.epochLabel} Metadata ({id})
            </h3>
          </div>
        </div>

        <span className="rounded border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-300">
          SPHEREx DR1 RECORD
        </span>
      </div>

      {/* Primary Astronomical Attributes Grid */}
      <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
        <div className="rounded-lg bg-slate-950/60 border border-slate-800/60 p-2.5 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-sans uppercase">Acquisition Timestamp</span>
          <div className="text-slate-200 font-bold flex items-center gap-1">
            <Calendar className="h-3 w-3 text-sky-400" />
            <span>{formatDate(date)}</span>
          </div>
        </div>

        <div className="rounded-lg bg-slate-950/60 border border-slate-800/60 p-2.5 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-sans uppercase">Central Wavelength</span>
          <div className="text-sky-300 font-bold flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>{epoch.wavelength_um !== null ? `${epoch.wavelength_um} μm` : 'N/A'}</span>
          </div>
        </div>

        <div className="rounded-lg bg-slate-950/60 border border-slate-800/60 p-2.5 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-sans uppercase">Detector Channel</span>
          <div className="text-slate-300 font-bold flex items-center gap-1">
            <Cpu className="h-3 w-3 text-slate-400" />
            <span className="truncate">{epoch.detector ?? 'Not specified'}</span>
          </div>
        </div>

        <div className="rounded-lg bg-slate-950/60 border border-slate-800/60 p-2.5 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-sans uppercase">Physical Units</span>
          <div className="text-slate-300 font-bold flex items-center gap-1">
            <Layers className="h-3 w-3 text-slate-400" />
            <span>{epoch.units ?? 'DN / s'}</span>
          </div>
        </div>

        <div className="rounded-lg bg-slate-950/60 border border-slate-800/60 p-2.5 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-sans uppercase">Astrometric Frame</span>
          <div className="text-slate-300 font-bold flex items-center gap-1">
            <Compass className="h-3 w-3 text-indigo-400" />
            <span className="truncate">{coordinateFrame ?? 'ICRS J2000'}</span>
          </div>
        </div>

        <div className="rounded-lg bg-slate-950/60 border border-slate-800/60 p-2.5 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-sans uppercase">Spatial Sampling</span>
          <div className="text-slate-300 font-bold flex items-center gap-1">
            <Maximize2 className="h-3 w-3 text-emerald-400" />
            <span className="truncate">{pixelScale ?? '6.2″/px'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
