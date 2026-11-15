import type { HomeFeatureItem, SuggestedQuery } from '../home.types';

export const HOME_FEATURES: HomeFeatureItem[] = [
  {
    id: 'universe-explorer',
    title: 'Universe Explorer',
    description: 'Navigate celestial survey fields with interactive pan and zoom astronomical cutout viewers.',
    href: '/explore',
    visualType: 'orbit',
    ariaLabel: 'Open Universe Explorer interactive sky maps',
  },
  {
    id: 'temporal-analysis',
    title: 'Temporal Analysis & Blink',
    description: 'Compare multi-epoch SPHEREx observations with synchronized visual blink and difference imaging.',
    href: '/temporal-analysis/demo-deepfield-01',
    visualType: 'temporal',
    ariaLabel: 'Open Temporal Analysis observation comparison',
  },
  {
    id: 'spectral-lab',
    title: 'Spectral Lab (102 Bands)',
    description: 'Inspect 0.75 to 5.00 μm spectrophotometric continuum, emission lines, and absorption bands.',
    href: '/spectral-lab/demo-deepfield-01',
    visualType: 'spectral',
    ariaLabel: 'Open Spectral Lab wavelength explorer',
  },
  {
    id: 'object-intelligence',
    title: 'Autonomous Sifter & Objects',
    description: 'Browse comets, asteroids, variable stars, brown dwarfs, and candidate planetary bodies.',
    href: '/objects',
    visualType: 'intelligence',
    ariaLabel: 'Open Object Intelligence celestial dossiers and sifter',
  },
];

export const COSMOS_AI_SUGGESTIONS: SuggestedQuery[] = [
  {
    id: 'q1',
    text: 'How does SPHEREx detect moving asteroids and Planet X candidates?',
  },
  {
    id: 'q2',
    text: 'What caused the +0.32 mJy flux difference in COSMOS Deep Field?',
  },
  {
    id: 'q3',
    text: 'Why are brown dwarfs invisible to optical telescopes?',
  },
  {
    id: 'q4',
    text: 'Explain the 102 spectral passbands and difference imaging workflow.',
  },
];
