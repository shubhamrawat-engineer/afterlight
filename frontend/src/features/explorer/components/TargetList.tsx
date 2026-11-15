import { Link } from 'react-router-dom';
import { ArrowRight, Compass, MapPin } from 'lucide-react';
import type { TargetSummary } from '../types/explorer.types';
import { StatusBadge } from './StatusBadge';
import { formatTargetKind, formatCoordinate } from '../utils/formatters';
import { TargetThumbnail } from './TargetThumbnail';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';
import { resolveGuidedTargetHref, type GuidedFlowType } from '../services/explorer-service';
import { saveActiveInvestigationSession } from '../../../services/investigation-session';
import { MOCK_TARGET_MANIFESTS } from '../data/mock-targets';

interface TargetListProps {
  targets: TargetSummary[];
  flow?: GuidedFlowType;
}

/**
 * Compact tabular list view for astronomical targets in Universe Explorer.
 */
export function TargetList({ targets, flow }: TargetListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#24344D] bg-[#101A2B]">
      <div className="divide-y divide-[#1A2940]">
        {targets.map((target) => {
          const guidedAction = resolveGuidedTargetHref(target.id, flow);
          const fallbackRegion = MOCK_TARGET_MANIFESTS[target.id]?.region;
          const centerRa = target.center_ra ?? fallbackRegion?.center_ra;
          const centerDec = target.center_dec ?? fallbackRegion?.center_dec;
          const coordFrame = target.coordinate_frame ?? fallbackRegion?.coordinate_frame ?? 'ICRS';

          return (
            <div
              key={target.id}
              className="group flex flex-col gap-4 p-4 transition-colors hover:bg-[#131F33] sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Left: Thumbnail & Info */}
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-[#24344D] bg-[#070B14]">
                  <TargetThumbnail
                    src={target.thumbnail}
                    alt={target.title}
                    targetId={target.id}
                    className="h-full w-full"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-[family-name:var(--font-display)] text-sm font-semibold text-[#F4F7FF] group-hover:text-[#45D5F2]">
                      {target.title}
                    </h4>
                    <StatusBadge status={target.status} />
                    <DemonstrationDataBadge variant="compact" label="VERIFIED" />
                    <span className="rounded bg-[#131F33] border border-[#24344D] px-2 py-0.5 text-[10px] font-medium text-[#B5C2D6]">
                      {formatTargetKind(target.kind)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#8293AD] font-mono">
                    <span className="inline-flex items-center gap-1.5 text-[#45D5F2]">
                      <Compass className="h-3 w-3" />
                      <span>{target.id}</span>
                    </span>
                    {centerRa !== undefined && centerDec !== undefined && (
                      <span className="inline-flex items-center gap-1.5 text-[#B5C2D6]">
                        <MapPin className="h-3 w-3 text-[#45D5F2]" />
                        <span>
                          {coordFrame}: RA {formatCoordinate(centerRa)} | Dec {formatCoordinate(centerDec, true)}
                        </span>
                      </span>
                    )}
                  </div>

                  {target.short_info && (
                    <p className="text-xs text-[#B5C2D6] line-clamp-1 max-w-xl">
                      {target.short_info}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: CTA */}
              <div className="flex shrink-0 items-center justify-end">
                <Link
                  to={guidedAction.href}
                  onClick={() =>
                    saveActiveInvestigationSession({
                      targetId: target.id,
                      targetTitle: target.title,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#24344D] bg-[#131F33] px-3.5 py-1.5 text-xs font-medium text-[#F4F7FF] transition-colors hover:border-[#4388FF]/60 hover:bg-[#4388FF] hover:text-white"
                >
                  <span>{guidedAction.listCtaLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
