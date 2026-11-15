import { ObservationSelector, type ObservationSelectorProps } from './ObservationSelector';

/**
 * Dedicated interface for designating Earlier and Later observation epochs
 * to configure a multi-epoch temporal comparison pair.
 * Delegates to the consolidated ObservationSelector component.
 */
export function ObservationPairSelector(props: ObservationSelectorProps) {
  return <ObservationSelector {...props} />;
}
