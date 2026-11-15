import { ArrowRight, Compass, MapPin, Layers } from 'lucide-react';
import type { TargetSummary } from '../types/explorer.types';
import { StatusBadge } from './StatusBadge';
import { formatTargetKind, formatCoordinate } from '../utils/formatters';
import { TargetThumbnail } from './TargetThumbnail';
import { Button } from '../../../components/ui/Button';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';
import {
  resolveGuidedTargetHref,
  type GuidedFlowType,
} from '../services/explorer-service';
import { saveActiveInvestigationSession } from '../../../services/investigation-session';
import { MOCK_TARGET_MANIFESTS } from '../data/mock-targets';

export interface SkyRegionCardProps {
  target: TargetSummary;
  flow?: GuidedFlowType;
}

/**
 * Reusable SkyRegionCard component for Universe Explorer discovery grid.
 * Displays region preview, status, demonstration badge, title, description,
 * astrometric coordinates (RA/Dec), observation count, and guided CTA.
 */
export function SkyRegionCard({ target, flow }: SkyRegionCardProps) {
  const guidedAction = resolveGuidedTargetHref(target.id, flow);
  const fallbackRegion = MOCK_TARGET_MANIFESTS[target.id]?.region;
  const centerRa = target.center_ra ?? fallbackRegion?.center_ra;
  const centerDec = target.center_dec ?? fallbackRegion?.center_dec;
  const coordFrame = target.coordinate_frame ?? fallbackRegion?.coordinate_frame ?? 'ICRS';
  const obsCount =
    target.observation_count ??
    MOCK_TARGET_MANIFESTS[target.id]?.observations.length;

  const handleSelectRegion = () => {
    saveActiveInvestigationSession({
      targetId: target.id,
      targetTitle: target.title,
    });
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#24344D] bg-[#101A2B] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4388FF]/50 hover:bg-[#131F33] shadow-[0_4px_18px_rgba(3,6,14,0.38)] hover:shadow-[0_12px_30px_rgba(3,6,14,0.58)]">
      {/* Top Media Container */}
      <div className="relative h-44 w-full overflow-hidden border-b border-[#1A2940] bg-[#070B14]">
        <TargetThumbnail
          src={target.thumbnail}
          alt={target.title}
          targetId={target.id}
          className="h-full w-full"
        />

        {/* Floating status badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <StatusBadge status={target.status} />
          <DemonstrationDataBadge variant="compact" label="VERIFIED" />
        </div>

        {/* Kind badge */}
        <div className="absolute top-3 right-3 z-10 rounded-md border border-[#24344D] bg-[#070B14]/85 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-[#B5C2D6] backdrop-blur-md">
          {formatTargetKind(target.kind)}
        </div>
      </div>

      {/* Target Details */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div className="space-y-3">
          {/* Identifier & observation count */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 truncate font-mono text-[#45D5F2]">
              <Compass className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{target.id}</span>
            </div>
            {obsCount !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-md border border-[#24344D] bg-[#131F33] px-2 py-0.5 text-[11px] font-medium text-[#B5C2D6]">
                <Layers className="h-3 w-3 text-[#45D5F2]" />
                {obsCount} Epochs
              </span>
            )}
          </div>

          <h3 className="font-[family-name:var(--font-display)] text-[18px] font-semibold leading-snug tracking-[-0.01em] text-[#F4F7FF] transition-colors group-hover:text-[#45D5F2]">
            {target.title}
          </h3>

          {target.short_info && (
            <p className="text-[13px] leading-relaxed text-[#B5C2D6] line-clamp-2">
              {target.short_info}
            </p>
          )}

          {/* Hairline Coordinates Metadata Row */}
          {centerRa !== undefined && centerDec !== undefined && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#1A2940] pt-2.5 font-mono text-[11px] text-[#B5C2D6]">
              <span className="inline-flex items-center gap-1 font-sans font-medium text-[#8293AD]">
                <MapPin className="h-3 w-3 text-[#45D5F2] shrink-0" />
                {coordFrame}
              </span>
              <span>RA {formatCoordinate(centerRa)}</span>
              <span>Dec {formatCoordinate(centerDec, true)}</span>
            </div>
          )}
        </div>

        {/* Action Link Footer */}
        <div className="mt-5 border-t border-[#1A2940] pt-4">
          <Button
            to={guidedAction.href}
            onClick={handleSelectRegion}
            variant="secondary"
            size="sm"
            fullWidth
            className="justify-between group-hover:border-[#4388FF]/60 group-hover:bg-[#4388FF] group-hover:text-[#F4F7FF]"
            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            aria-label={`${guidedAction.ctaLabel} for ${target.title}`}
          >
            {guidedAction.ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
