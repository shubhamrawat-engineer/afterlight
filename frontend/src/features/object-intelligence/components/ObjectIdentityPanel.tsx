import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Layers, Bot } from 'lucide-react';
import type { CelestialObject } from '../types/object.types';
import { formatCategoryLabel } from '../services/object-service';
import { resolveImageUrl } from '../../explorer/services/explorer-service';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

interface ObjectIdentityPanelProps {
  object: CelestialObject;
}

export function ObjectIdentityPanel({ object }: ObjectIdentityPanelProps) {
  const {
    id,
    target_id,
    name,
    designation,
    category,
    status,
    preview_image,
    description,
    associated_region,
    observations,
  } = object;

  const resolvedThumb = resolveImageUrl(preview_image);

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-[#24344D] bg-[#101A2B] p-6 shadow-[0_4px_18px_rgba(3,6,14,0.38)]">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A2940] pb-4">
        <Link
          to="/objects"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#45D5F2] hover:text-[#8BB6FF] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Celestial Object Directory</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            to={`/ai?contextType=object&objectId=${id}&targetId=${target_id}&targetName=${encodeURIComponent(name)}`}
            variant="secondary"
            size="sm"
            leftIcon={<Bot className="h-3.5 w-3.5 text-[#45D5F2]" />}
          >
            Explain this object information
          </Button>
          <Badge variant="primary">
            {formatCategoryLabel(category)}
          </Badge>
          <Badge variant="outline" mono>
            {status}
          </Badge>
        </div>
      </div>

      {/* Main Info with Cutout Preview */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        {resolvedThumb && (
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#24344D] bg-[#070B14] shadow-md">
            <img
              src={resolvedThumb}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs text-[#8293AD]">
            <span className="font-medium text-[#45D5F2]">{id}</span>
            <span>&bull;</span>
            <span>{designation}</span>
          </div>

          <h1 className="text-page-heading text-[#F4F7FF]">
            {name}
          </h1>

          <p className="max-w-3xl text-[14px] leading-relaxed text-[#B5C2D6]">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#8293AD]">
            <div className="flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-[#45D5F2]" />
              <span>Sky Region: </span>
              <Link to={`/explore/${target_id}`} className="text-[#45D5F2] hover:underline">
                {associated_region}
              </Link>
            </div>

            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-[#8293AD]" />
              <span>{observations.length} Registered Observation Passes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
