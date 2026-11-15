import { get } from '../../../services/api-client';
import type {
  CompatibilityAssessment,
  CompatibilityDossier,
  CompatibilityRequirement,
  CompatibilityStatus,
  CompatibilityTask,
} from '../types/compatibility.types';
import { COMPATIBILITY_THRESHOLDS } from '../config/compatibility-thresholds';
import { MOCK_TARGET_MANIFESTS } from '../../explorer/data/mock-targets';
import { getObsId, getObsDate } from '../../observations/services/observation-service';
import { resolveValidatedPairIds } from '../../../services/investigation-session';

export interface ServiceResult<T> {
  data: T;
  isFallback: boolean;
  error?: string;
}

/**
 * Pure evaluation function generating a scientifically reasoned CompatibilityDossier
 * based on selected observation metadata, calibration heuristics, and astronomical target manifests.
 */
export function evaluateMockCompatibility(
  targetId: string,
  earlierId?: string | null,
  laterId?: string | null,
  isFallbackEvaluation = true
): CompatibilityDossier {
  const manifest = MOCK_TARGET_MANIFESTS[targetId];
  const targetTitle = manifest?.title ?? targetId;
  const observations = manifest?.observations ?? [];

  // Check if caller explicitly provided identical observation IDs
  const isExplicitlyIdentical = Boolean(
    earlierId && laterId && earlierId.trim() === laterId.trim()
  );

  let resolvedEarlierId: string | null = null;
  let resolvedLaterId: string | null = null;

  if (isExplicitlyIdentical) {
    resolvedEarlierId = earlierId!;
    resolvedLaterId = laterId!;
  } else {
    const validatedIds = resolveValidatedPairIds(
      observations,
      earlierId,
      laterId,
      targetId
    );
    resolvedEarlierId = validatedIds.earlierId;
    resolvedLaterId = validatedIds.laterId;
  }

  const earlierObs =
    observations.find((o) => getObsId(o) === resolvedEarlierId) ?? null;
  const laterObs =
    observations.find((o) => getObsId(o) === resolvedLaterId) ?? null;

  // Check if incomplete, missing, or identical pair
  if (
    !earlierObs ||
    !laterObs ||
    getObsId(earlierObs) === getObsId(laterObs) ||
    isExplicitlyIdentical
  ) {
    const unassessedAssessments: Record<CompatibilityTask, CompatibilityAssessment> = {
      visual: createUnassessedTask('visual', 'Visual Comparability'),
      difference_image: createUnassessedTask('difference_image', 'Difference-Image Readiness'),
      photometric: createUnassessedTask('photometric', 'Photometric Comparability'),
      astrometric: createUnassessedTask('astrometric', 'Astrometric Comparability'),
      spectral: createUnassessedTask('spectral', 'Spectral Comparability'),
    };

    const isIdentical =
      isExplicitlyIdentical ||
      Boolean(earlierObs && laterObs && getObsId(earlierObs) === getObsId(laterObs));

    return {
      targetId,
      targetTitle,
      earlierObs,
      laterObs,
      earlierId: resolvedEarlierId,
      laterId: resolvedLaterId,
      temporalBaselineDays: null,
      wavelengthDeltaUm: null,
      wavelengthDeltaPct: null,
      passbandOverlapPct: null,
      resolutionRatio: null,
      isChronologicallyInverted: false,
      overallStatus: 'NOT_ASSESSED',
      overallSummary: isIdentical
        ? `Identical observation epochs designated (${resolvedEarlierId}). Multi-epoch comparison requires two distinct observation epochs.`
        : 'Two distinct observation epochs must be designated before scientific compatibility can be evaluated.',
      missingMetadataSummary: [
        'Complete Earlier (T0) observation epoch selection',
        'Complete Later (T1) observation epoch selection',
      ],
      outstandingValidationSummary: [
        'Designate a valid earlier and later observation pair from the catalogue.',
      ],
      assessments: unassessedAssessments,
      evaluatedAtUtc: new Date().toISOString(),
      isFallback: isFallbackEvaluation,
      offlineFallbackReason: isFallbackEvaluation
        ? 'SPHEREx mission evaluation: Local heuristics applied in offline mode.'
        : undefined,
    };
  }

  // Calculate wavelength delta
  const earlierWl = earlierObs.wavelength_um;
  const laterWl = laterObs.wavelength_um;
  const wavelengthDeltaUm =
    earlierWl !== null && laterWl !== null
      ? Number(Math.abs(laterWl - earlierWl).toFixed(3))
      : null;
  const baseWl = earlierWl && earlierWl > 0 ? earlierWl : laterWl;
  const wavelengthDeltaPct =
    wavelengthDeltaUm !== null && baseWl && baseWl > 0
      ? Number(((wavelengthDeltaUm / baseWl) * 100).toFixed(1))
      : null;

  // Passband overlap percentage heuristic
  const passbandOverlapPct =
    wavelengthDeltaPct !== null
      ? Math.max(0, Number((100 - wavelengthDeltaPct).toFixed(1)))
      : null;

  // Calculate temporal baseline and check chronological ordering
  let temporalBaselineDays: number | null = null;
  let isChronologicallyInverted = false;
  const dateEarlier = getObsDate(earlierObs);
  const dateLater = getObsDate(laterObs);
  if (dateEarlier && dateLater) {
    const t0 = new Date(dateEarlier).getTime();
    const t1 = new Date(dateLater).getTime();
    if (!Number.isNaN(t0) && !Number.isNaN(t1)) {
      temporalBaselineDays = Math.round(Math.abs(t1 - t0) / (1000 * 60 * 60 * 24));
      if (t0 > t1) {
        isChronologicallyInverted = true;
      }
    }
  }

  const pairQuality = manifest?.pair_quality;
  const diffMeta = manifest?.difference;
  const region = manifest?.region;

  // Demonstration thresholds from central configuration
  const maxWlDeltaUm = COMPATIBILITY_THRESHOLDS.MAX_PASSBAND_DELTA_UM.value;
  const maxWlDiscrepancyPct = COMPATIBILITY_THRESHOLDS.MAX_PASSBAND_DISCREPANCY_PCT.value;
  const moderateWlDeltaUm = COMPATIBILITY_THRESHOLDS.MODERATE_BAND_DELTA_UM.value;
  const moderateWlOffsetPct = COMPATIBILITY_THRESHOLDS.MODERATE_BAND_OFFSET_PCT.value;
  const maxRegDiffArcsec = COMPATIBILITY_THRESHOLDS.MAX_REGISTRATION_RMS_DIFF_ARCSEC.value;
  const maxRegAstroArcsec = COMPATIBILITY_THRESHOLDS.MAX_REGISTRATION_RMS_ASTRO_ARCSEC.value;
  const maxSpectralDeltaUm = COMPATIBILITY_THRESHOLDS.MAX_SPECTRAL_CHANNEL_DELTA_UM.value;
  const maxResRatio = COMPATIBILITY_THRESHOLDS.MAX_RESOLUTION_RATIO.value;

  const isSevereBandMismatch =
    wavelengthDeltaUm !== null &&
    (wavelengthDeltaUm > maxWlDeltaUm ||
      (wavelengthDeltaPct !== null && wavelengthDeltaPct > maxWlDiscrepancyPct));
  const isModerateBandOffset =
    wavelengthDeltaUm !== null &&
    (wavelengthDeltaUm >= moderateWlDeltaUm ||
      (wavelengthDeltaPct !== null && wavelengthDeltaPct >= moderateWlOffsetPct));

  // Pixel scale ratio check
  const resolutionRatio = 1.0; // Native intra-SPHEREx comparison is 1:1 (6.2″/px)
  const isResolutionSatisfied = resolutionRatio <= maxResRatio;

  // -------------------------------------------------------------------------
  // A. VISUAL COMPARABILITY
  // -------------------------------------------------------------------------
  const visualReqs: CompatibilityRequirement[] = [
    {
      id: 'vis-img',
      name: 'SPHEREx Calibrated Image Asset Availability',
      isSatisfied: Boolean(earlierObs.image && laterObs.image),
      importance: 'essential',
      description: 'Calibrated cutout image arrays present for both observation epochs.',
      availableDetail:
        earlierObs.image && laterObs.image
          ? 'Image cutout assets registered for both T0 and T1.'
          : undefined,
      missingImpact: 'Visual inspection cannot proceed without visual image cutouts.',
    },
    {
      id: 'vis-coord',
      name: 'Coordinate Reference Frame Metadata',
      isSatisfied: Boolean(region?.coordinate_frame),
      importance: 'essential',
      description: 'Shared astrometric celestial reference frame (e.g. ICRS J2000).',
      availableDetail: region?.coordinate_frame ? `Frame: ${region.coordinate_frame}` : undefined,
      missingImpact: 'Field orientation and celestial boundaries are unconstrained.',
    },
    {
      id: 'vis-scale',
      name: 'Pixel Scale & Dimension Parity',
      isSatisfied: Boolean(region?.pixel_scale && region.dimensions && isResolutionSatisfied),
      importance: 'essential',
      description: `Sampling parity within SPHEREx calibrated ratio threshold (< ${maxResRatio}).`,
      availableDetail:
        region?.pixel_scale && region.dimensions
          ? `Sampling: ${region.pixel_scale} (${region.dimensions.width}×${region.dimensions.height} px, ratio: 1.00 ≤ ${maxResRatio})`
          : undefined,
      missingImpact: 'Zoom and pan alignment cannot guarantee 1:1 pixel correspondence.',
    },
    {
      id: 'vis-wcs',
      name: 'WCS Astrometric Projection Matrix',
      isSatisfied: false,
      importance: 'conditional',
      description: 'Live FITS header WCS projection parameters (CRVAL, CRPIX, CDELT).',
      missingImpact:
        'Live pixel-to-sky mapping is currently awaiting server-side FITS header ingestion.',
    },
    {
      id: 'vis-mask',
      name: 'Artifact & Saturated Pixel Quality Masks',
      isSatisfied: Boolean(diffMeta?.masked_flags_applied),
      importance: 'recommended',
      description: 'Detector bad-pixel, cosmic ray, and saturation bitmask layers.',
      availableDetail: Array.isArray(diffMeta?.masked_flags_applied)
        ? `Quality masks: ${diffMeta.masked_flags_applied.join(', ')}`
        : undefined,
      missingImpact: 'Artifacts or detector flaws may be visually mistaken for real changes.',
    },
  ];

  const visualStatus: CompatibilityStatus =
    earlierObs.image && laterObs.image && region?.pixel_scale && isResolutionSatisfied
      ? 'READY_FOR_REVIEW'
      : 'INSUFFICIENT_METADATA';

  const visualAssessment: CompatibilityAssessment = {
    task: 'visual',
    title: 'Visual Comparability',
    taskDescription:
      'Evaluates whether earlier and later epochs have the necessary image assets, coordinate definitions, and geometry for synchronized side-by-side or blink comparison.',
    status: visualStatus,
    statusSummary:
      visualStatus === 'READY_FOR_REVIEW'
        ? 'Observations satisfy SPHEREx DR1 requirements for synchronized visual comparison.'
        : 'Missing required image assets or pixel geometry prevents direct visual alignment.',
    availableInformation: [
      `Epoch T0 Asset: ${earlierObs.id} (${dateEarlier ? dateEarlier.slice(0, 10) : 'Date unrecorded'})`,
      `Epoch T1 Asset: ${laterObs.id} (${dateLater ? dateLater.slice(0, 10) : 'Date unrecorded'})`,
      `Coordinate Frame: ${region?.coordinate_frame ?? 'ICRS J2000'}`,
      `Pixel Scale: ${region?.pixel_scale ?? '6.2 arcsec/pixel'} (Resolution ratio: 1.00 ≤ ${maxResRatio} [SPHEREx Threshold])`,
      `Field Dimensions: ${region?.dimensions?.width ?? 145} × ${region?.dimensions?.height ?? 145} pixels`,
    ],
    missingInformation: [
      'Live WCS projection matrices (CRVAL1/2, CD matrix) from raw FITS headers.',
      'Per-pixel error arrays and empirical background variance maps.',
    ],
    whyMissingMatters:
      'Without verified FITS WCS headers, visual alignment relies on coarse raster scaling rather than sub-pixel astrometric solutions.',
    requiredValidation:
      'Backend WCS astrometric co-registration and coordinate grid verification.',
    safeConclusions:
      'The researcher can safely inspect large-scale morphological patterns and apparent brightness differences. Fine sub-pixel astrometric shifts must NOT be inferred.',
    requirements: visualReqs,
  };

  // -------------------------------------------------------------------------
  // B. DIFFERENCE-IMAGE READINESS
  // -------------------------------------------------------------------------
  const hasDiffAsset = Boolean(diffMeta?.image);
  const diffReqs: CompatibilityRequirement[] = [
    {
      id: 'diff-band',
      name: 'Passband Proximity for Image Subtraction',
      isSatisfied: !isSevereBandMismatch,
      importance: 'essential',
      description: `Wavelength discrepancy must not exceed ${maxWlDiscrepancyPct}% (SPHEREx Threshold).`,
      availableDetail:
        wavelengthDeltaUm !== null
          ? `Δλ = ${wavelengthDeltaUm} μm (${wavelengthDeltaPct}%), Overlap: ~${passbandOverlapPct}%`
          : undefined,
      missingImpact:
        'Large passband delta produces spectral continuum residuals that mimic transient flux changes.',
    },
    {
      id: 'diff-wcs',
      name: 'Verified Astrometric Co-Registration',
      isSatisfied: Boolean(
        pairQuality?.registration_rms_arcsec &&
          pairQuality.registration_rms_arcsec < maxRegDiffArcsec
      ),
      importance: 'essential',
      description: `Sub-pixel coordinate registration solution (RMS < ${maxRegDiffArcsec} arcsec [SPHEREx Threshold]).`,
      availableDetail: pairQuality?.registration_rms_arcsec
        ? `Manifest registration RMS: ${pairQuality.registration_rms_arcsec} arcsec`
        : undefined,
      missingImpact: 'Astrometric misalignment produces dipole residual artifacts across bright sources.',
    },
    {
      id: 'diff-psf',
      name: 'Point-Spread Function (PSF) Homogenisation',
      isSatisfied: Boolean(diffMeta?.method),
      importance: 'essential',
      description: 'Convolutive kernel matching between epochs to match point source profiles.',
      availableDetail: diffMeta?.method ? `Kernel method: ${diffMeta.method}` : undefined,
      missingImpact: 'PSF mismatches create false annular or core flux residuals on all stellar objects.',
    },
    {
      id: 'diff-bkg',
      name: 'Background Matching & Zero-Point Scaling',
      isSatisfied: Boolean(diffMeta?.method_description),
      importance: 'conditional',
      description: 'Local background equalization and linear flux zero-point normalization.',
      availableDetail: diffMeta?.method_description ?? undefined,
      missingImpact: 'Global background level gradients obscure low-significance candidate residuals.',
    },
    {
      id: 'diff-proc',
      name: 'Verified Backend Processing Provenance',
      isSatisfied: false,
      importance: 'essential',
      description: 'Confirmed execution and automated quality QA signoff from backend processing pipeline.',
      missingImpact:
        'A difference image must NOT be described as scientifically valid until verified by backend pipeline.',
    },
  ];

  let diffStatus: CompatibilityStatus = 'INSUFFICIENT_METADATA';
  if (isSevereBandMismatch) {
    diffStatus = 'INSUFFICIENT_METADATA';
  } else if (hasDiffAsset && pairQuality?.grade === 'GOOD') {
    diffStatus = 'CONDITIONALLY_READY';
  } else if (hasDiffAsset && pairQuality?.grade === 'FAIR') {
    diffStatus = 'CONDITIONALLY_READY';
  }

  const diffAssessment: CompatibilityAssessment = {
    task: 'difference_image',
    title: 'Difference-Image Readiness',
    taskDescription:
      'Inspects whether the prerequisites for scientifically interpretable difference imaging (PSF matching, WCS alignment, background leveling) have been satisfied.',
    status: diffStatus,
    statusSummary:
      diffStatus === 'CONDITIONALLY_READY'
        ? 'Preliminary difference assets exist, but full scientific validity requires backend pipeline verification.'
        : 'Difference image comparison is locked: large passband delta or missing calibration prevents valid subtraction.',
    availableInformation: [
      hasDiffAsset
        ? `Subtraction Method: ${diffMeta?.method ?? 'Optimal PSF matching'}`
        : 'Difference asset: Not yet generated for this pair',
      `Passband Difference: Δλ = ${wavelengthDeltaUm ?? 'N/A'} μm (${wavelengthDeltaPct ?? 'N/A'}%), Overlap: ~${passbandOverlapPct ?? 'N/A'}%`,
      `Reported Registration RMS: ${pairQuality?.registration_rms_arcsec ?? 'Unmeasured'} arcsec (Threshold: < ${maxRegDiffArcsec}″)`,
      `Quality Flags Applied: ${Array.isArray(diffMeta?.masked_flags_applied) ? diffMeta.masked_flags_applied.join(', ') : 'None'}`,
    ],
    missingInformation: [
      'Backend pipeline execution log and convergence audit.',
      'Live PSF spatial variation map across the detector plane.',
      'Subtracted pixel variance map for signal-to-noise calculation.',
    ],
    whyMissingMatters:
      'A difference image cannot be described as scientifically valid unless PSF homogenisation, background leveling, and astrometric registration have actually been completed and verified by the scientific pipeline.',
    requiredValidation:
      'Full Alard-Lupton or Bramich kernel convolution verification and residual variance check.',
    safeConclusions:
      'Difference images in AFTERLIGHT are calibrated SPHEREx LVF difference visualisations. Visual residuals must be verified against detector artifacts before candidate classification.',
    requirements: diffReqs,
  };

  // -------------------------------------------------------------------------
  // C. PHOTOMETRIC COMPARABILITY
  // -------------------------------------------------------------------------
  const hasCalibratedUnits = Boolean(earlierObs.units && laterObs.units);
  const photoReqs: CompatibilityRequirement[] = [
    {
      id: 'phot-units',
      name: 'Calibrated Surface Brightness / Flux Units',
      isSatisfied: hasCalibratedUnits,
      importance: 'essential',
      description: 'Physical units calibrated consistently (e.g. MJy/sr or nJy/beam).',
      availableDetail: hasCalibratedUnits ? `T0: ${earlierObs.units} | T1: ${laterObs.units}` : undefined,
      missingImpact: 'Raw counts (DN/s) cannot be compared directly across different detector states.',
    },
    {
      id: 'phot-wave',
      name: 'Spectral Passband Equivalence',
      isSatisfied: !isSevereBandMismatch && !isModerateBandOffset,
      importance: 'essential',
      description: `Identical filter passbands (Δλ < ${moderateWlDeltaUm} μm / < ${moderateWlOffsetPct}% [SPHEREx Threshold]).`,
      availableDetail:
        wavelengthDeltaUm !== null
          ? `Passband delta: ${wavelengthDeltaUm} μm (${wavelengthDeltaPct}%)`
          : undefined,
      missingImpact:
        'Sources with steep spectral slopes (e.g. red dust or blue continuum) exhibit apparent flux changes purely due to filter offsets.',
    },
    {
      id: 'phot-zero',
      name: 'Absolute Photometric Zero-Point Calibration',
      isSatisfied: false,
      importance: 'essential',
      description: 'Standard star tied photometric zero-point solution per observation pass.',
      missingImpact: 'Absolute magnitude and flux density calculations retain uncalibrated offsets.',
    },
    {
      id: 'phot-unc',
      name: 'Pixel Photometric Uncertainties (1-sigma error planes)',
      isSatisfied: false,
      importance: 'essential',
      description: 'Calibrated per-pixel noise variance maps for error propagation.',
      missingImpact: 'Statistical significance of candidate flux changes cannot be rigorously established.',
    },
  ];

  let photoStatus: CompatibilityStatus = 'INSUFFICIENT_METADATA';
  if (isSevereBandMismatch) {
    photoStatus = 'INSUFFICIENT_METADATA';
  } else if (!isModerateBandOffset && hasCalibratedUnits) {
    photoStatus = 'CONDITIONALLY_READY';
  } else if (hasCalibratedUnits) {
    photoStatus = 'CONDITIONALLY_READY';
  }

  const photoAssessment: CompatibilityAssessment = {
    task: 'photometric',
    title: 'Photometric Comparability',
    taskDescription:
      'Evaluates whether flux measurements and surface brightness values can be compared quantitatively without passband or calibration distortions.',
    status: photoStatus,
    statusSummary:
      photoStatus === 'CONDITIONALLY_READY'
        ? 'Calibrated units are present, but absolute flux comparison requires zero-point calibration.'
        : 'Photometric comparison is blocked: passband mismatch or missing units prevent direct comparison.',
    availableInformation: [
      `Earlier Epoch Units: ${earlierObs.units ?? 'Uncalibrated DN'}`,
      `Later Epoch Units: ${laterObs.units ?? 'Uncalibrated DN'}`,
      `Passband Range T0: ${earlierObs.wavelength_range_um ?? 'N/A'}`,
      `Passband Range T1: ${laterObs.wavelength_range_um ?? 'N/A'}`,
      `Data Release: ${earlierObs.data_release ?? 'DR1-Early'}`,
    ],
    missingInformation: [
      'Empirical photometric zero-point calibration table.',
      'Per-pixel flux uncertainty array (RMS / 1-sigma error plane).',
      'Atmospheric / zodiacal light background subtraction provenance.',
    ],
    whyMissingMatters:
      'Without verified zero-point solutions and uncertainty arrays, measured brightness deltas cannot be proved to exceed instrumental calibration jitter.',
    requiredValidation:
      'Standard star cross-calibration against spectrophotometric standards (e.g. CALSPEC).',
    safeConclusions:
      'Qualitative relative brightness trends can be noted. Formal flux measurements and magnitude light curves cannot be cited as final scientific findings.',
    requirements: photoReqs,
  };

  // -------------------------------------------------------------------------
  // D. ASTROMETRIC COMPARABILITY
  // -------------------------------------------------------------------------
  const astroReqs: CompatibilityRequirement[] = [
    {
      id: 'astro-frame',
      name: 'Standard Celestial Reference System',
      isSatisfied: Boolean(region?.coordinate_frame),
      importance: 'essential',
      description: 'Standard coordinate system (e.g. ICRS J2000 / Gaia-tied).',
      availableDetail: region?.coordinate_frame ?? undefined,
      missingImpact: 'Positional comparisons without a reference frame are meaningless.',
    },
    {
      id: 'astro-reg',
      name: 'Multi-Epoch Astrometric Registration',
      isSatisfied: Boolean(
        pairQuality?.registration_rms_arcsec &&
          pairQuality.registration_rms_arcsec < maxRegAstroArcsec
      ),
      importance: 'essential',
      description: `Relative frame alignment verified (RMS < ${maxRegAstroArcsec}″ [SPHEREx Threshold]).`,
      availableDetail: pairQuality?.registration_rms_arcsec
        ? `Registration RMS: ${pairQuality.registration_rms_arcsec}″`
        : undefined,
      missingImpact: 'Global frame rotations or shifts mimic proper motion across the entire field.',
    },
    {
      id: 'astro-unc',
      name: 'Centroid Positional Uncertainty Estimates',
      isSatisfied: false,
      importance: 'essential',
      description: 'Calculated 1-sigma RA/Dec centroiding uncertainties for target sources.',
      missingImpact:
        'A visual offset must NEVER be interpreted as proof of proper motion without quantified positional uncertainties.',
    },
    {
      id: 'astro-epoch',
      name: 'Precise Mid-Exposure Observation Timestamps',
      isSatisfied: Boolean(dateEarlier && dateLater),
      importance: 'essential',
      description: 'Exact mid-exposure UTC timestamps for proper motion baseline calculation.',
      availableDetail:
        temporalBaselineDays !== null
          ? `Baseline: ${temporalBaselineDays} days (${dateEarlier?.slice(0, 10)} → ${dateLater?.slice(0, 10)})${
              isChronologicallyInverted ? ' [Inverted Chronological Order: T0 > T1]' : ''
            }`
          : undefined,
      missingImpact: 'Motion velocity vectors cannot be computed without precise epoch timing.',
    },
  ];

  const astroStatus: CompatibilityStatus =
    region?.coordinate_frame && dateEarlier && dateLater
      ? 'CONDITIONALLY_READY'
      : 'INSUFFICIENT_METADATA';

  const astroAssessment: CompatibilityAssessment = {
    task: 'astrometric',
    title: 'Astrometric Comparability',
    taskDescription:
      'Evaluates whether coordinate metadata permits reliable position verification without confusing frame shifts for physical proper motion.',
    status: astroStatus,
    statusSummary:
      astroStatus === 'CONDITIONALLY_READY'
        ? 'Coordinate frame and epoch dates are recorded; centroid uncertainty requires verification before motion can be proven.'
        : 'Missing coordinate frame or timestamps prevents astrometric evaluation.',
    availableInformation: [
      `Astrometric Reference Frame: ${region?.coordinate_frame ?? 'ICRS J2000'}`,
      `Central Coordinates: RA ${region?.center_ra}° | Dec ${region?.center_dec}°`,
      `Observation Baseline: ${temporalBaselineDays !== null ? `${temporalBaselineDays} days` : 'Indeterminate'}${
        isChronologicallyInverted ? ' (Warning: Chronological order inverted)' : ''
      }`,
      `Reported Registration RMS: ${
        pairQuality?.registration_rms_arcsec !== undefined
          ? `${pairQuality.registration_rms_arcsec} arcsec (Limit: < ${maxRegAstroArcsec}″)`
          : 'Pending verification'
      }`,
    ],
    missingInformation: [
      'Sub-pixel centroid error ellipses for point sources.',
      'Field distortion polynomial coefficients (SIP convention).',
      'Parallax and proper motion correction vectors for field reference stars.',
    ],
    whyMissingMatters:
      'A visual spatial offset between epochs must NEVER be interpreted as proof of astrophysical proper motion without verified WCS solutions and centroid uncertainties.',
    requiredValidation:
      'Cross-matching of background star centroids against Gaia DR3 astrometric catalog.',
    safeConclusions:
      'Gross displacements (>1 pixel / >6.2″) can be flagged as candidate moving bodies. Small offsets (<0.5 pixel) must be treated as potential registration artifacts.',
    requirements: astroReqs,
  };

  // -------------------------------------------------------------------------
  // E. SPECTRAL COMPARABILITY
  // -------------------------------------------------------------------------
  const isCloseWavelength =
    wavelengthDeltaUm !== null && wavelengthDeltaUm <= maxSpectralDeltaUm;
  const isSameDetector = Boolean(
    earlierObs.detector && earlierObs.detector === laterObs.detector
  );

  const spectralReqs: CompatibilityRequirement[] = [
    {
      id: 'spec-wl',
      name: 'Wavelength Passband Center Overlap',
      isSatisfied: isCloseWavelength,
      importance: 'essential',
      description: `Effective wavelength difference must be small (Δλ ≤ ${maxSpectralDeltaUm} μm [SPHEREx Threshold]).`,
      availableDetail:
        earlierWl && laterWl
          ? `T0: ${earlierWl} μm | T1: ${laterWl} μm (Δλ = ${wavelengthDeltaUm} μm, Overlap: ~${passbandOverlapPct}%)`
          : undefined,
      missingImpact:
        'SPHEREx LVF passband varies with focal plane position; different channels cannot be directly compared.',
    },
    {
      id: 'spec-lvf',
      name: 'Linear Variable Filter (LVF) Position Metadata',
      isSatisfied: isSameDetector,
      importance: 'essential',
      description: 'Detector focal plane location and filter transmission curve metadata.',
      availableDetail:
        earlierObs.detector && laterObs.detector
          ? `T0 Detector: ${earlierObs.detector} | T1 Detector: ${laterObs.detector}`
          : undefined,
      missingImpact:
        'SPHEREx spectral channels are wavelength steps across the linear variable filters (SPHEREx spectral-channel metadata — pending mission-documentation verification), not independent temporal observations.',
    },
    {
      id: 'spec-resp',
      name: 'Instrument Spectral Response Function',
      isSatisfied: false,
      importance: 'conditional',
      description: 'End-to-end optical throughput and quantum efficiency curve.',
      missingImpact: 'Transmission profile differences alter apparent flux for emission-line objects.',
    },
    {
      id: 'spec-cal',
      name: 'In-Flight Wavelength Dispersion Calibration',
      isSatisfied: false,
      importance: 'recommended',
      description: 'Wavelength dispersion solution verified against known atmospheric/stellar spectral lines.',
      missingImpact: 'Fine spectral features may suffer from slight passband calibration shifts.',
    },
  ];

  let spectralStatus: CompatibilityStatus = 'INSUFFICIENT_METADATA';
  if (isSevereBandMismatch) {
    spectralStatus = 'INSUFFICIENT_METADATA';
  } else if (isCloseWavelength && isSameDetector) {
    spectralStatus = 'READY_FOR_REVIEW';
  } else {
    spectralStatus = 'CONDITIONALLY_READY';
  }

  const spectralAssessment: CompatibilityAssessment = {
    task: 'spectral',
    title: 'Spectral Comparability',
    taskDescription:
      'Evaluates passband compatibility, detector filter positions, and instrument transmission to prevent treating arbitrary LVF wavelength channels as temporal observations.',
    status: spectralStatus,
    statusSummary:
      spectralStatus === 'READY_FOR_REVIEW'
        ? 'Observation channels share matched central wavelengths and identical detector arrays.'
        : spectralStatus === 'CONDITIONALLY_READY'
        ? 'Moderate wavelength offset or different detector arrays require spectral profile verification.'
        : 'Incompatible spectral passbands: Large wavelength delta prevents direct comparison.',
    availableInformation: [
      `Earlier Central Wavelength (λ₀): ${earlierWl !== null ? `${earlierWl} μm` : 'Not recorded'}`,
      `Later Central Wavelength (λ₁): ${laterWl !== null ? `${laterWl} μm` : 'Not recorded'}`,
      `Passband Range T0: ${earlierObs.wavelength_range_um ?? 'N/A'}`,
      `Passband Range T1: ${laterObs.wavelength_range_um ?? 'N/A'}`,
      `Detector Array T0: ${earlierObs.detector ?? 'Unknown'}`,
      `Detector Array T1: ${laterObs.detector ?? 'Unknown'}`,
      `Estimated Passband Overlap: ~${passbandOverlapPct !== null ? `${passbandOverlapPct}%` : 'N/A'}`,
    ],
    missingInformation: [
      'Empirical spectral response curves (SRFs) for exact LVF column positions.',
      'Spectral uncertainty covariance matrices.',
      'Out-of-band light leakage verification.',
    ],
    whyMissingMatters:
      'SPHEREx disperses infrared light through linear variable filters across its detector arrays (SPHEREx spectral-channel metadata — pending mission-documentation verification). The LVF wavelength varies continuously with position on the detector. These are spectral channels, not independent temporal observations. Comparing different channels without dispersion calibration produces artificial flux steps.',
    requiredValidation:
      'Cross-dispersion calibration against spectrophotometric standard models.',
    safeConclusions:
      isSevereBandMismatch
        ? 'These two epochs cannot be directly subtracted. They probe distinct infrared spectral regimes and should be analyzed in the Spectral Lab rather than Temporal Analysis.'
        : 'Narrow-band spectral proximity is sufficient for demonstration comparison. Full line-flux ratio analysis requires calibrated spectral cubes.',
    requirements: spectralReqs,
  };

  // -------------------------------------------------------------------------
  // OVERALL ASSESSMENT DETERMINATION
  // -------------------------------------------------------------------------
  const assessments: Record<CompatibilityTask, CompatibilityAssessment> = {
    visual: visualAssessment,
    difference_image: diffAssessment,
    photometric: photoAssessment,
    astrometric: astroAssessment,
    spectral: spectralAssessment,
  };

  const statuses = Object.values(assessments).map((a) => a.status);
  let overallStatus: CompatibilityStatus = 'CONDITIONALLY_READY';

  // Scientific Safety Gating:
  // 1. If any task is NOT_ASSESSED, overall is NOT_ASSESSED.
  // 2. If severe band mismatch or missing visual assets, overall is INSUFFICIENT_METADATA.
  // 3. In offline fallback mode, overall can NEVER be READY_FOR_REVIEW because backend WCS/PSF/zero-point
  //    pipeline validation has not been performed. Overall is capped at CONDITIONALLY_READY.
  if (statuses.some((s) => s === 'NOT_ASSESSED')) {
    overallStatus = 'NOT_ASSESSED';
  } else if (
    isSevereBandMismatch ||
    !earlierObs.image ||
    !laterObs.image ||
    !region?.coordinate_frame
  ) {
    overallStatus = 'INSUFFICIENT_METADATA';
  } else if (statuses.every((s) => s === 'READY_FOR_REVIEW') && !isFallbackEvaluation) {
    overallStatus = 'READY_FOR_REVIEW';
  } else {
    overallStatus = 'CONDITIONALLY_READY';
  }

  const overallSummary =
    overallStatus === 'CONDITIONALLY_READY'
      ? isFallbackEvaluation
        ? 'SPHEREx Quality Evaluation: The selected observation pair is conditionally ready for multi-epoch visual and temporal inspection. Full scientific validity requires backend astrometric WCS co-registration, PSF homogenisation, and zero-point calibration.'
        : 'The selected observation pair is conditionally ready for review, with outstanding astrometric and zero-point calibrations pending.'
      : overallStatus === 'INSUFFICIENT_METADATA'
      ? 'The selected pair exhibits significant passband or metadata discrepancies. Scientific comparison is gated pending additional calibration or matching epochs.'
      : overallStatus === 'READY_FOR_REVIEW'
      ? 'The selected observation epochs satisfy verified scientific requirements for multi-epoch comparison.'
      : 'Two distinct observation epochs must be designated before scientific compatibility can be evaluated.';

  const missingMetadataSummary = Array.from(
    new Set(Object.values(assessments).flatMap((a) => a.missingInformation))
  );

  const outstandingValidationSummary = Array.from(
    new Set(Object.values(assessments).map((a) => a.requiredValidation))
  );

  return {
    targetId,
    targetTitle,
    earlierObs,
    laterObs,
    earlierId: resolvedEarlierId,
    laterId: resolvedLaterId,
    temporalBaselineDays,
    wavelengthDeltaUm,
    wavelengthDeltaPct,
    passbandOverlapPct,
    resolutionRatio,
    isChronologicallyInverted,
    overallStatus,
    overallSummary,
    missingMetadataSummary,
    outstandingValidationSummary,
    assessments,
    evaluatedAtUtc: new Date().toISOString(),
    isFallback: isFallbackEvaluation,
    offlineFallbackReason: isFallbackEvaluation
      ? 'Backend pipeline offline: SPHEREx baseline heuristics applied.'
      : undefined,
  };
}

function createUnassessedTask(task: CompatibilityTask, title: string): CompatibilityAssessment {
  return {
    task,
    title,
    taskDescription: `Assessment for ${title.toLowerCase()} across designated observations.`,
    status: 'NOT_ASSESSED',
    statusSummary: 'Assessment cannot be performed until two distinct observation epochs are designated.',
    availableInformation: [],
    missingInformation: ['Observation epoch assignments (T0 & T1).'],
    whyMissingMatters: 'Compatibility is evaluated on pairwise observation metadata.',
    requiredValidation: 'Select valid earlier and later observations.',
    safeConclusions: 'No scientific comparison can be performed.',
    requirements: [],
  };
}

/**
 * Retrieves the scientific compatibility assessment for an observation pair.
 * Queries GET /api/compatibility/{targetId}?earlier=...&later=..., falling back to
 * the deterministic mock evaluation if the backend is unreachable.
 */
export async function fetchCompatibilityAssessment(
  targetId: string,
  earlierId?: string | null,
  laterId?: string | null
): Promise<ServiceResult<CompatibilityDossier>> {
  const query = new URLSearchParams();
  if (earlierId) query.set('earlier', earlierId);
  if (laterId) query.set('later', laterId);
  const qStr = query.toString();
  const endpoint = `/api/compatibility/${targetId}${qStr ? `?${qStr}` : ''}`;

  try {
    const data = await get<CompatibilityDossier>(endpoint, { timeoutMs: 5000 });
    return { data, isFallback: false };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'Backend compatibility service offline';
    const fallbackDossier = evaluateMockCompatibility(targetId, earlierId, laterId, true);
    fallbackDossier.offlineFallbackReason = `Backend pipeline offline (${errorMsg}): SPHEREx baseline heuristics applied.`;
    return {
      data: fallbackDossier,
      isFallback: true,
      error: errorMsg,
    };
  }
}
