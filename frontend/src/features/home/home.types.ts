import type { ReactNode } from 'react';

/** Visual representation variant for the home feature cards */
export type FeatureVisualType = 'orbit' | 'temporal' | 'spectral' | 'intelligence';

/** Structured feature card definition */
export interface HomeFeatureItem {
  id: string;
  title: string;
  description: string;
  href: string;
  visualType: FeatureVisualType;
  customVisual?: ReactNode;
  ariaLabel: string;
}

/** Suggested query for Cosmos AI */
export interface SuggestedQuery {
  id: string;
  text: string;
}
