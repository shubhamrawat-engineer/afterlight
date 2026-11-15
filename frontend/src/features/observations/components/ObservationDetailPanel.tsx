import type { ObservationRecord } from '../types/observation.types';
import { ObservationPreview } from './ObservationPreview';
import { ObservationMetadata } from './ObservationMetadata';

interface ObservationDetailPanelProps {
  observation: ObservationRecord | null;
  targetId: string;
  fallbackImage?: string | null;
  className?: string;
}

/**
 * Inspection workspace for the currently selected observation epoch.
 * Integrates visual cutout preview with complete astrometric and instrument metadata.
 */
export function ObservationDetailPanel({
  observation,
  targetId,
  fallbackImage,
  className,
}: ObservationDetailPanelProps) {
  return (
    <div className={`grid grid-cols-1 gap-6 lg:grid-cols-12 ${className ?? ''}`}>
      {/* Left: Cutout Image Preview (5 cols) */}
      <div className="lg:col-span-5">
        <ObservationPreview
          observation={observation}
          targetId={targetId}
          fallbackImage={fallbackImage}
        />
      </div>

      {/* Right: Technical Specs Table (7 cols) */}
      <div className="lg:col-span-7">
        <ObservationMetadata observation={observation} />
      </div>
    </div>
  );
}
