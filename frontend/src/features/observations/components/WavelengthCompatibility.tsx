import {
  ComparisonStatusCard,
  type ComparisonStatusCardProps,
} from './ComparisonStatusCard';

/**
 * Preliminary Wavelength Proximity Check Panel.
 * Delegates to the consolidated ComparisonStatusCard component.
 */
export function WavelengthCompatibility(props: ComparisonStatusCardProps) {
  return <ComparisonStatusCard {...props} />;
}
