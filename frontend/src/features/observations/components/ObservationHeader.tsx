import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Database, MapPin } from 'lucide-react';
import type { TargetStatus, TargetKind, RegionMetadata } from '../types/observation.types';
import { StatusBadge } from '../../explorer/components/StatusBadge';
import { formatTargetKind } from '../../explorer/utils/formatters';
import { Badge } from '../../../components/ui/Badge';

interface ObservationHeaderProps {
  targetId: string;
  targetTitle: string;
  targetKind: TargetKind;
  targetStatus: TargetStatus;
  region: RegionMetadata;
  observationCount: number;
}

/**
 * Top command header for the Observation Catalogue.
 * Uses refined medium-weight page heading and standardized badges.
 */
export function ObservationHeader({
  targetId,
  targetTitle,
  targetKind,
  targetStatus,
  region,
  observationCount,
}: ObservationHeaderProps) {
  const coordText = region.center_ra !== null && region.center_dec !== null
    ? `α: ${region.center_ra.toFixed(4)}°, δ: ${region.center_dec >= 0 ? '+' : ''}${region.center_dec.toFixed(4)}° (${region.coordinate_frame ?? 'ICRS'})`
    : 'Coordinates unavailable';

  return (
    <div className="flex flex-col gap-5 border-b border-[rgba(148,163,184,0.13)] pb-6">
      {/* Navigation Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400">
        <Link
          to={`/explore/${targetId}`}
          className="inline-flex items-center gap-1.5 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Region Inspection ({targetId})</span>
        </Link>
        <span>/</span>
        <span className="font-mono text-slate-200">Observation Catalogue</span>
      </nav>

      {/* Main Title Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-page-heading text-slate-100">
              Observation Catalogue
            </h1>
            <StatusBadge status={targetStatus} />
            <Badge variant="default">
              {formatTargetKind(targetKind)}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span className="font-medium text-slate-200">{targetTitle}</span>
            <div className="flex items-center gap-1.5 font-mono text-blue-400">
              <Compass className="h-3.5 w-3.5" />
              <span>{targetId}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>{coordText}</span>
            </div>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="flex shrink-0 items-center">
          <Badge
            variant="primary"
            icon={<Database className="h-3.5 w-3.5 text-blue-400" />}
            className="px-3.5 py-1.5 text-xs"
          >
            {observationCount} Available {observationCount === 1 ? 'Epoch' : 'Epochs'}
          </Badge>
        </div>
      </div>
    </div>
  );
}
