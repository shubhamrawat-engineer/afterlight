import { Sparkles, Orbit, Activity, ShieldCheck } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

interface ObjectHeaderProps {
  totalCount: number;
}

export function ObjectHeader({ totalCount }: ObjectHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-[#1A2940] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="primary">Astrometric Object Directory</Badge>
            <Badge variant="success">SPHEREx DR1 DISCOVERY DOSSIER</Badge>
          </div>

          <h1 className="text-page-heading text-[#F4F7FF]">
            Celestial Object Directory
          </h1>

          <p className="max-w-2xl text-[14px] leading-relaxed text-[#B5C2D6]">
            Browse calibrated SPHEREx astronomical sources, variable stars, transient candidates,
            and moving solar system bodies. Review multi-epoch coordinate tracks, calibrated spectrophotometric
            indicators, and cross-catalogue associations.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 self-start sm:self-end">
          <div className="flex items-baseline gap-2 rounded-lg border border-[#24344D] bg-[#101A2B] px-3.5 py-2">
            <span className="font-mono text-base font-semibold text-[#45D5F2]">{totalCount}</span>
            <span className="text-xs font-medium text-[#B5C2D6]">
              Cataloged {totalCount === 1 ? 'Object' : 'Objects'}
            </span>
          </div>
        </div>
      </div>

      {/* Editorial Classification Index (Hairline-divided, non-boxed) */}
      <div className="grid grid-cols-2 gap-4 border-b border-[#1A2940] pb-6 sm:grid-cols-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div>
            <div className="text-xs font-medium text-[#F4F7FF]">Transients</div>
            <div className="mt-0.5 text-xs text-[#8293AD]">Supernovae &amp; flares</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Activity className="mt-0.5 h-4 w-4 shrink-0 text-[#45D5F2]" />
          <div>
            <div className="text-xs font-medium text-[#F4F7FF]">Variable Stars</div>
            <div className="mt-0.5 text-xs text-[#8293AD]">Light echoes &amp; pulsars</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Orbit className="mt-0.5 h-4 w-4 shrink-0 text-[#9B8CFF]" />
          <div>
            <div className="text-xs font-medium text-[#F4F7FF]">Moving Bodies</div>
            <div className="mt-0.5 text-xs text-[#8293AD]">Trans-Neptunian &amp; KBO</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <div>
            <div className="text-xs font-medium text-[#F4F7FF]">Calibrators</div>
            <div className="mt-0.5 text-xs text-[#8293AD]">Reference fixtures</div>
          </div>
        </div>
      </div>
    </div>
  );
}
