import { HOME_FEATURES } from '../data/homeFeatures';
import { FeatureCard } from './FeatureCard';

interface FeatureGridProps {
  className?: string;
}

/**
 * Responsive 4-card feature grid.
 * Desktop: 4 columns
 * Tablet: 2 columns
 * Mobile: 1 column
 */
export function FeatureGrid({ className }: FeatureGridProps) {
  return (
    <section
      aria-label="Core AFTERLIGHT Features"
      className={className}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {HOME_FEATURES.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </section>
  );
}
