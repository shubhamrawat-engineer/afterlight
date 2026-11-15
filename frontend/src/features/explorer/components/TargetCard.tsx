import type { TargetSummary } from '../types/explorer.types';
import type { GuidedFlowType } from '../services/explorer-service';
import { SkyRegionCard } from './SkyRegionCard';

interface TargetCardProps {
  target: TargetSummary;
  flow?: GuidedFlowType;
}

/**
 * Standardized Astronomical Target Card for Universe Explorer discovery grid.
 * Delegates to the consolidated SkyRegionCard component.
 */
export function TargetCard({ target, flow }: TargetCardProps) {
  return <SkyRegionCard target={target} flow={flow} />;
}
