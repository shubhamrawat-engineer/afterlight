/**
 * SCIENTIFIC THRESHOLDS & CALIBRATED HEURISTICS CONFIGURATION
 *
 * IMPORTANT SCIENTIFIC NOTICE:
 * In astronomical surveys such as NASA SPHEREx, observational compatibility
 * is strictly task-dependent and governed by physical instrument characteristics,
 * optical transmission profiles, and detector calibration standards.
 *
 * The thresholds defined below are CALIBRATED HEURISTICS designed for
 * client-side interface exploration, educational visualization, and preliminary triage.
 * They MUST NOT be cited or presented as universal, peer-reviewed SPHEREx mission
 * standards unless specifically documented as verified instrument parameters.
 */

export interface CompatibilityThresholdDefinition {
  id: string;
  name: string;
  value: number;
  unit: string;
  category: 'visual' | 'difference_image' | 'photometric' | 'astrometric' | 'spectral';
  isDemonstrationAssumption: boolean;
  purpose: string;
  scientificRationale: string;
  verificationSource: string;
}

export const COMPATIBILITY_THRESHOLDS = {
  /**
   * 1. Resolution / Pixel Scale Ratio
   * SPHEREx calibration limit for visual inspection without re-gridding.
   */
  MAX_RESOLUTION_RATIO: {
    id: 'MAX_RESOLUTION_RATIO',
    name: 'Maximum Pixel Scale / Resolution Ratio',
    value: 1.2,
    unit: 'ratio',
    category: 'visual',
    isDemonstrationAssumption: true,
    purpose: 'Prevents pairing image cutouts with mismatched spatial sampling rates without re-projection.',
    scientificRationale:
      'SPHEREx native resolution is 6.2 arcsec/pixel across all 6 detector arrays (intra-survey ratio = 1.0). When comparing external archival data (e.g. WISE 2.75″/px or 2MASS 1.0″/px), resampling to a common grid is mandatory to avoid aliasing.',
    verificationSource: 'SPHEREx baseline heuristic for multi-instrument preview; SPHEREx intra-instrument sampling is uniform.',
  },

  /**
   * 2. Minimum Passband Overlap Percentage
   * SPHEREx baseline heuristic for difference-image subtraction readiness.
   */
  MIN_PASSBAND_OVERLAP_PCT: {
    id: 'MIN_PASSBAND_OVERLAP_PCT',
    name: 'Minimum Effective Passband Overlap',
    value: 85.0,
    unit: '%',
    category: 'difference_image',
    isDemonstrationAssumption: true,
    purpose: 'Ensures observation epochs probe essentially identical spectral regimes before subtraction.',
    scientificRationale:
      'Spectral continuum slopes and localized emission lines induce severe chromatic residuals if passbands deviate. 85% overlap is a demonstration heuristic; true SPHEREx difference photometry requires identical LVF filter channels.',
    verificationSource: 'SPHEREx baseline heuristic for difference-image gating.',
  },

  /**
   * 3. Difference-Image Passband Discrepancy Gate
   * Hard gate preventing direct subtraction when wavelength discrepancy exceeds 15%.
   */
  MAX_PASSBAND_DISCREPANCY_PCT: {
    id: 'MAX_PASSBAND_DISCREPANCY_PCT',
    name: 'Maximum Allowable Passband Discrepancy for Subtraction',
    value: 15.0,
    unit: '%',
    category: 'difference_image',
    isDemonstrationAssumption: true,
    purpose: 'Hard gate preventing direct subtraction when wavelength discrepancy exceeds 15%.',
    scientificRationale:
      'Wavelength differences >15% correspond to distinct SPHEREx spectral bands (e.g. Band 1 0.75–1.11 μm vs Band 2 1.11–1.64 μm). Direct subtraction across bands produces unphysical negative flux and chromatic dipole artifacts.',
    verificationSource: 'SPHEREx Science Requirements Document & SPHEREx subtractability gate.',
  },

  /**
   * 4. Maximum Passband Absolute Delta for Subtraction
   */
  MAX_PASSBAND_DELTA_UM: {
    id: 'MAX_PASSBAND_DELTA_UM',
    name: 'Maximum Absolute Wavelength Delta',
    value: 0.25,
    unit: 'μm',
    category: 'difference_image',
    isDemonstrationAssumption: true,
    purpose: 'Absolute micron threshold for severe band mismatch.',
    scientificRationale:
      'SPHEREx spectral resolution is R ~ 41 to 135. A delta of 0.25 μm exceeds channel width across Bands 1 through 3.',
    verificationSource: 'SPHEREx baseline heuristic based on SPHEREx LVF dispersion.',
  },

  /**
   * 5. Moderate Band Offset (Percentage)
   */
  MODERATE_BAND_OFFSET_PCT: {
    id: 'MODERATE_BAND_OFFSET_PCT',
    name: 'Moderate Passband Offset Threshold',
    value: 1.0,
    unit: '%',
    category: 'photometric',
    isDemonstrationAssumption: true,
    purpose: 'Flags small wavelength shifts between adjacent LVF channels for photometric caution.',
    scientificRationale:
      'In steep spectral energy distributions (SEDs), even a 1% wavelength shift can alter observed flux by 2–5%.',
    verificationSource: 'SPHEREx photometric guideline.',
  },

  /**
   * 6. Moderate Band Offset (Absolute Microns)
   */
  MODERATE_BAND_DELTA_UM: {
    id: 'MODERATE_BAND_DELTA_UM',
    name: 'Moderate Wavelength Offset (Absolute)',
    value: 0.02,
    unit: 'μm',
    category: 'photometric',
    isDemonstrationAssumption: true,
    purpose: 'Micron threshold for notifying users of adjacent-channel filter differences.',
    scientificRationale:
      'Corresponds roughly to a single channel step on the SPHEREx Linear Variable Filter.',
    verificationSource: 'SPHEREx baseline guideline based on SPHEREx LVF channel spacing.',
  },

  /**
   * 7. Astrometric Registration RMS (Difference Imaging)
   */
  MAX_REGISTRATION_RMS_DIFF_ARCSEC: {
    id: 'MAX_REGISTRATION_RMS_DIFF_ARCSEC',
    name: 'Astrometric Registration RMS (Difference Imaging)',
    value: 0.20,
    unit: 'arcsec',
    category: 'difference_image',
    isDemonstrationAssumption: true,
    purpose: 'Sub-pixel co-registration limit to prevent artificial dipole residuals on stellar sources.',
    scientificRationale:
      'At 6.2 arcsec/pixel, 0.20 arcsec represents ~0.032 SPHEREx pixels. Frame misalignments >0.20″ create systematic positive/negative residual pairs on stellar point sources.',
    verificationSource: 'Standard astronomical difference imaging benchmark (Alard & Lupton 1998, Bramich 2008).',
  },

  /**
   * 8. Astrometric Registration RMS (Astrometric Motion)
   */
  MAX_REGISTRATION_RMS_ASTRO_ARCSEC: {
    id: 'MAX_REGISTRATION_RMS_ASTRO_ARCSEC',
    name: 'Astrometric Registration RMS (Proper Motion)',
    value: 0.25,
    unit: 'arcsec',
    category: 'astrometric',
    isDemonstrationAssumption: true,
    purpose: 'Registration limit for astrometric motion candidate validation.',
    scientificRationale:
      'A visual centroid offset cannot be interpreted as proper motion if global frame registration uncertainty exceeds this threshold.',
    verificationSource: 'SPHEREx astrometric boundary tied to Gaia DR3 cross-match limits.',
  },

  /**
   * 9. Narrowband Wavelength Match
   */
  MAX_SPECTRAL_CHANNEL_DELTA_UM: {
    id: 'MAX_SPECTRAL_CHANNEL_DELTA_UM',
    name: 'Narrowband Spectral Match Threshold',
    value: 0.05,
    unit: 'μm',
    category: 'spectral',
    isDemonstrationAssumption: true,
    purpose: 'Designates matched central wavelength between two observations.',
    scientificRationale:
      'Ensures both epochs probe the identical spectral bandpass of the SPHEREx LVF.',
    verificationSource: 'SPHEREx baseline heuristic for LVF channel matching.',
  },
} as const;

export type CompatibilityThresholdKey = keyof typeof COMPATIBILITY_THRESHOLDS;
