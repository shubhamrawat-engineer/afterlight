import type { TargetSummary } from '../types/explorer.types';
import { TargetCard } from './TargetCard';
import type { GuidedFlowType } from '../services/explorer-service';

interface TargetGridProps {
  targets: TargetSummary[];
  flow?: GuidedFlowType;
}

/**
 * Responsive grid container for TargetCards.
 * Automatically scales from 1 column on mobile to 2 columns on tablet and 3 columns on desktop.
 */
export function TargetGrid({ targets, flow }: TargetGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {targets.map((target) => (
        <TargetCard key={target.id} target={target} flow={flow} />
      ))}
    </div>
  );
}
