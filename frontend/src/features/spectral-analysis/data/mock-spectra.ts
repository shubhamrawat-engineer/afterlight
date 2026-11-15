import type { TargetSpectralRecord, SpectralDataPoint } from '../types/spectral.types';

// Helper to generate wavelength grid
function generateGrid(
  startUm: number,
  endUm: number,
  steps: number,
  fn: (wl: number) => { signal: number; unc: number; flag: string; flagDesc?: string }
): SpectralDataPoint[] {
  const step = (endUm - startUm) / (steps - 1);
  const points: SpectralDataPoint[] = [];

  for (let i = 0; i < steps; i++) {
    const wl = Math.round((startUm + i * step) * 100) / 100;
    const { signal, unc, flag, flagDesc } = fn(wl);
    points.push({
      index: i + 1,
      wavelength_um: wl,
      signal_value: Math.round(signal * 100) / 100,
      uncertainty: unc !== null ? Math.round(unc * 100) / 100 : null,
      quality_flag: flag as any,
      quality_flag_description: flagDesc,
    });
  }

  return points;
}

// Explicit Demonstration / Mock Spectral Fixtures
// Observation IDs and timestamps are standardized with mock-targets.ts, mock-evidence.ts,
// mock-objects.ts, and mock-investigations.ts.
export const MOCK_SPECTRA_MAP: Record<string, TargetSpectralRecord> = {
  'spherex-deep-field-south': {
    target_id: 'spherex-deep-field-south',
    target_title: 'SPHEREx Deep Field South (SDF-S)',
    target_kind: 'deep_field',
    status: 'verified',
    supported_wavelength_range: '0.80 μm – 4.80 μm (SPHEREx Bands 1–6)',
    provenance: {
      archive_source: 'NASA/IPAC Infrared Science Archive (IRSA)',
      mission: 'NASA SPHEREx',
      instrument_configuration: '6-Band Linear Variable Filter Array (InSb/Si)',
      extraction_method: 'Point Spread Function Weighted Aperture Extraction',
      pipeline_version: 'SPHEREx Science Pipeline v2.4.1 (L3 Spectra)',
      retrieval_date_utc: '2026-11-14T12:00:00Z',
      archive_citation: 'NASA/IPAC Infrared Science Archive (IRSA) Demonstration Reference (Simulated Citation)',
      doi_url: 'https://irsa.ipac.caltech.edu/data/SPHEREx/',
    },
    profiles: [
      {
        epoch_id: 'T0-EARLIER',
        epoch_label: 'T0: Reference Baseline (2025-04-12)',
        observation_id: 'SPX-OBS-2025-0104-B3',
        obs_date_utc: '2025-04-12T08:34:21Z',
        source_id: 'Candidate AT-2025sdf (Quiescent Host)',
        flux_unit: 'μJy',
        wavelength_unit: 'μm',
        wavelength_min_um: 0.8,
        wavelength_max_um: 4.8,
        sampling_resolution: 'R ≈ 41–130 (LVF Continuous)',
        color: '#38bdf8', // sky-400
        data_points: generateGrid(0.8, 4.8, 32, (wl) => {
          // Flat quiescent baseline ~14 μJy with noise
          const base = 13.5 + Math.sin(wl * 1.5) * 1.2;
          const noise = ((wl * 13) % 1.7) - 0.85;
          const isEdge = wl <= 0.85 || wl >= 4.75;
          return {
            signal: base + noise,
            unc: isEdge ? 2.1 : 0.85,
            flag: isEdge ? 'EDGE_CHANNEL' : 'OK',
            flagDesc: isEdge ? 'Detector array border channel with higher readout variance' : undefined,
          };
        }),
      },
      {
        epoch_id: 'T1-LATER',
        epoch_label: 'T1: Post-Outburst Epoch (2025-10-14)',
        observation_id: 'SPX-OBS-2025-0320-B3',
        obs_date_utc: '2025-10-14T15:12:09Z',
        source_id: 'Candidate AT-2025sdf (Luminous Transient)',
        flux_unit: 'μJy',
        wavelength_unit: 'μm',
        wavelength_min_um: 0.8,
        wavelength_max_um: 4.8,
        sampling_resolution: 'R ≈ 41–130 (LVF Continuous)',
        color: '#818cf8', // indigo-400
        data_points: generateGrid(0.8, 4.8, 32, (wl) => {
          // Dramatic infrared excess peaking near 2.4 - 3.2 μm ~58 μJy
          const peak = 58.0 * Math.exp(-Math.pow((wl - 2.8) / 1.1, 2));
          const cont = 18.0 + Math.sin(wl * 1.2) * 2.0;
          const noise = ((wl * 19) % 2.1) - 1.05;
          const isEdge = wl <= 0.85 || wl >= 4.75;
          const isTelluric = Math.abs(wl - 2.7) < 0.08;
          return {
            signal: Math.max(peak + cont + noise, 15.0),
            unc: isEdge ? 3.2 : isTelluric ? 2.4 : 1.35,
            flag: isTelluric ? 'NOISY' : isEdge ? 'EDGE_CHANNEL' : 'OK',
            flagDesc: isTelluric ? 'Deep telluric / filter transition zone with elevated noise' : undefined,
          };
        }),
      },
    ],
  },

  'v838-mon-echo': {
    target_id: 'v838-mon-echo',
    target_title: 'V838 Monocerotis Light Echo',
    target_kind: 'variable_star',
    status: 'verified',
    supported_wavelength_range: '1.00 μm – 4.50 μm',
    provenance: {
      archive_source: 'NASA/IPAC Infrared Science Archive (IRSA)',
      mission: 'NASA SPHEREx',
      instrument_configuration: 'SPHEREx InSb LVF Arrays 2–5',
      extraction_method: 'Annular Aperture Radial Profile Integration',
      pipeline_version: 'SPHEREx Science Pipeline v2.4.1',
      retrieval_date_utc: '2026-11-14T10:00:00Z',
      archive_citation: 'NASA/IPAC Infrared Science Archive (IRSA) Demonstration Reference (Simulated Citation)',
    },
    profiles: [
      {
        epoch_id: 'T0-EARLIER',
        epoch_label: 'T0: March 2025 Echo Arc (2025-03-01)',
        observation_id: 'SPX-OBS-2025-0082-B2',
        obs_date_utc: '2025-03-01T12:00:00Z',
        source_id: 'Circumstellar Echo Shell',
        flux_unit: 'MJy/sr',
        wavelength_unit: 'μm',
        wavelength_min_um: 1.0,
        wavelength_max_um: 4.5,
        sampling_resolution: 'R ≈ 41–110',
        color: '#38bdf8',
        data_points: generateGrid(1.0, 4.5, 26, (wl) => {
          // Dust scattering continuum with H2O ice absorption at 3.05 μm
          const continuum = 42.0 * Math.pow(wl / 1.5, -1.8) + 12.0;
          const iceAbs = -14.0 * Math.exp(-Math.pow((wl - 3.05) / 0.25, 2));
          const noise = ((wl * 17) % 1.5) - 0.75;
          return {
            signal: Math.max(continuum + iceAbs + noise, 5.0),
            unc: 1.1,
            flag: Math.abs(wl - 3.05) < 0.15 ? 'CALIBRATION_WARNING' : 'OK',
            flagDesc: Math.abs(wl - 3.05) < 0.15 ? 'Ice absorption band requires optical depth correction' : undefined,
          };
        }),
      },
      {
        epoch_id: 'T1-LATER',
        epoch_label: 'T1: September 2025 Expanded Arc (2025-09-22)',
        observation_id: 'SPX-OBS-2025-0290-B2',
        obs_date_utc: '2025-09-22T18:45:00Z',
        source_id: 'Circumstellar Echo Shell',
        flux_unit: 'MJy/sr',
        wavelength_unit: 'μm',
        wavelength_min_um: 1.0,
        wavelength_max_um: 4.5,
        sampling_resolution: 'R ≈ 41–110',
        color: '#818cf8',
        data_points: generateGrid(1.0, 4.5, 26, (wl) => {
          // Expanded radius has slightly lower surface brightness but broader ice profile
          const continuum = 36.0 * Math.pow(wl / 1.5, -1.8) + 10.0;
          const iceAbs = -11.5 * Math.exp(-Math.pow((wl - 3.05) / 0.28, 2));
          const noise = ((wl * 23) % 1.4) - 0.7;
          return {
            signal: Math.max(continuum + iceAbs + noise, 4.0),
            unc: 1.25,
            flag: 'OK',
          };
        }),
      },
    ],
  },

  'kbo-2024-xr1': {
    target_id: 'kbo-2024-xr1',
    target_title: 'Trans-Neptunian Candidate 2024-XR1',
    target_kind: 'moving_object',
    status: 'preliminary',
    supported_wavelength_range: '0.80 μm – 2.50 μm (Near-IR Reflectance)',
    provenance: {
      archive_source: 'NASA/IPAC Infrared Science Archive (IRSA)',
      mission: 'NASA SPHEREx',
      instrument_configuration: 'SPHEREx Si/InSb Arrays 1–3',
      extraction_method: 'Moving-Target Synthetic Shift-and-Add',
      pipeline_version: 'SPHEREx Science Pipeline v2.4.1',
      retrieval_date_utc: '2026-11-14T09:30:00Z',
      archive_citation: 'NASA/IPAC Infrared Science Archive (IRSA)',
    },
    profiles: [
      {
        epoch_id: 'T0-EARLIER',
        epoch_label: 'T0: Initial Ecliptic Pass (2025-02-15)',
        observation_id: 'SPX-OBS-2025-0044-B1',
        obs_date_utc: '2025-02-15T04:10:00Z',
        source_id: 'Moving Body 2024-XR1 (Epoch 1)',
        flux_unit: 'Relative Reflectance (F/F_Sun)',
        wavelength_unit: 'μm',
        wavelength_min_um: 0.8,
        wavelength_max_um: 2.5,
        sampling_resolution: 'R ≈ 41 (Array 1–3)',
        color: '#38bdf8',
        data_points: generateGrid(0.8, 2.5, 20, (wl) => {
          const slope = 0.98 + (wl - 1.0) * 0.34;
          const waterAbs = -0.26 * Math.exp(-Math.pow((wl - 2.02) / 0.18, 2));
          const noise = ((wl * 13) % 0.1) - 0.05;
          return {
            signal: Math.max(slope + waterAbs + noise, 0.4),
            unc: 0.08,
            flag: 'OK',
          };
        }),
      },
      {
        epoch_id: 'T1-LATER',
        epoch_label: 'T1: Discovery Arc Follow-up (2025-08-18)',
        observation_id: 'SPX-OBS-2025-0230-B1',
        obs_date_utc: '2025-08-18T19:22:00Z',
        source_id: 'Moving Body 2024-XR1 (Epoch 2)',
        flux_unit: 'Relative Reflectance (F/F_Sun)',
        wavelength_unit: 'μm',
        wavelength_min_um: 0.8,
        wavelength_max_um: 2.5,
        sampling_resolution: 'R ≈ 41 (Array 1–3)',
        color: '#818cf8',
        data_points: generateGrid(0.8, 2.5, 20, (wl) => {
          // Solar-like red slope with water ice band at 2.0 μm
          const slope = 1.0 + (wl - 1.0) * 0.35;
          const waterAbs = -0.28 * Math.exp(-Math.pow((wl - 2.02) / 0.18, 2));
          const noise = ((wl * 11) % 0.12) - 0.06;
          return {
            signal: Math.max(slope + waterAbs + noise, 0.4),
            unc: 0.08,
            flag: 'OK',
          };
        }),
      },
    ],
  },

  'static-calibration-field-c1': {
    target_id: 'static-calibration-field-c1',
    target_title: 'Invariant Stellar Calibrator C1',
    target_kind: 'control_static',
    status: 'verified',
    supported_wavelength_range: '0.75 μm – 4.90 μm (Full Passband)',
    provenance: {
      archive_source: 'NASA/IPAC Infrared Science Archive (IRSA)',
      mission: 'NASA SPHEREx',
      instrument_configuration: '6-Band Full Spectrophotometric Array',
      extraction_method: 'Optimal PSF Spectrophotometry',
      pipeline_version: 'SPHEREx Calibration Pipeline v2.4.1',
      retrieval_date_utc: '2026-11-14T08:00:00Z',
      archive_citation: 'NASA/IPAC Infrared Science Archive (IRSA)',
    },
    profiles: [
      {
        epoch_id: 'T0-EARLIER',
        epoch_label: 'T0: January 2025 Calibration Standard (2025-01-10)',
        observation_id: 'SPX-OBS-2025-0010-B4',
        obs_date_utc: '2025-01-10T00:00:00Z',
        source_id: 'Spectrophotometric Standard C1',
        flux_unit: 'μJy',
        wavelength_unit: 'μm',
        wavelength_min_um: 0.75,
        wavelength_max_um: 4.9,
        sampling_resolution: 'R ≈ 41–130',
        color: '#38bdf8',
        data_points: generateGrid(0.75, 4.9, 36, (wl) => {
          // Pure Rayleigh-Jeans stellar continuum ~ 1/wl^2
          const rj = 85.0 * Math.pow(wl / 1.0, -1.95);
          return {
            signal: rj,
            unc: 0.15,
            flag: 'OK',
          };
        }),
      },
      {
        epoch_id: 'T1-LATER',
        epoch_label: 'T1: July 2025 Calibration Standard (2025-07-15)',
        observation_id: 'SPX-OBS-2025-0200-B4',
        obs_date_utc: '2025-07-15T00:00:00Z',
        source_id: 'Spectrophotometric Standard C1',
        flux_unit: 'μJy',
        wavelength_unit: 'μm',
        wavelength_min_um: 0.75,
        wavelength_max_um: 4.9,
        sampling_resolution: 'R ≈ 41–130',
        color: '#10b981', // emerald-500: invariant match
        data_points: generateGrid(0.75, 4.9, 36, (wl) => {
          const rj = 85.0 * Math.pow(wl / 1.0, -1.95);
          const drift = 0.03; // tiny 0.03 μJy instrument drift
          return {
            signal: rj + drift,
            unc: 0.15,
            flag: 'OK',
          };
        }),
      },
    ],
  },

  'demo-deepfield-01': {
    target_id: 'demo-deepfield-01',
    target_title: 'COSMOS Deep Field (Real SPHEREx DR1 Verified Pair)',
    target_kind: 'deep_field',
    status: 'verified',
    supported_wavelength_range: '0.75 μm – 5.00 μm (102 Spectral Channels)',
    provenance: {
      archive_source: 'NASA/IPAC Infrared Science Archive (IRSA)',
      mission: 'NASA SPHEREx',
      instrument_configuration: '6-Band Linear Variable Filter Array (InSb/Si)',
      extraction_method: 'Point Spread Function Weighted Aperture Extraction (Optimal L3 Extraction)',
      pipeline_version: 'SPHEREx Science Pipeline v2.4.1 (DR1 Calibration)',
      retrieval_date_utc: '2026-11-14T22:00:00Z',
      archive_citation: 'NASA/IPAC Infrared Science Archive (IRSA) SPHEREx Data Release 1 (DR1)',
      doi_url: 'https://irsa.ipac.caltech.edu/data/SPHEREx/',
    },
    profiles: [
      {
        epoch_id: 'T0-EARLIER',
        epoch_label: 'T0: Reference Baseline (2025-04-24)',
        observation_id: '2025W17_4B_0486_3',
        obs_date_utc: '2025-04-24T09:14:00Z',
        source_id: 'COSMOS Galaxy Core (Quiescent Host Baseline)',
        flux_unit: 'mJy',
        wavelength_unit: 'μm',
        wavelength_min_um: 0.75,
        wavelength_max_um: 5.0,
        sampling_resolution: 'R ≈ 41–130 (102 LVF Channels)',
        color: '#38bdf8',
        data_points: generateGrid(0.75, 5.0, 36, (wl) => {
          let base = 1.12;
          if (wl <= 2.42) {
            base = 1.12 + (wl - 0.75) * ((1.89 - 1.12) / (2.42 - 0.75));
          } else if (wl <= 3.98) {
            base = 1.89 - (wl - 2.42) * ((1.89 - 1.64) / (3.98 - 2.42));
          } else {
            base = 1.64 - (wl - 3.98) * ((1.64 - 1.31) / (5.00 - 3.98));
          }
          if (Math.abs(wl - 3.3) < 0.15) base += 0.08;
          const isEdge = wl <= 0.85 || wl >= 4.85;
          const isTelluric = Math.abs(wl - 2.7) < 0.08;
          return {
            signal: base,
            unc: isEdge ? 0.06 : isTelluric ? 0.05 : 0.04,
            flag: isEdge ? 'EDGE_CHANNEL' : isTelluric ? 'NOISY' : 'OK',
            flagDesc: isEdge
              ? 'Array boundary channel with higher dispersion'
              : isTelluric
              ? 'Atmospheric telluric / filter crossover band'
              : undefined,
          };
        }),
      },
      {
        epoch_id: 'T1-LATER',
        epoch_label: 'T1: Follow-up Epoch (2026-05-08)',
        observation_id: '2026W19_2A_0619_1',
        obs_date_utc: '2026-05-08T14:22:00Z',
        source_id: 'COSMOS Galaxy Core (Infrared Excess Candidate)',
        flux_unit: 'mJy',
        wavelength_unit: 'μm',
        wavelength_min_um: 0.75,
        wavelength_max_um: 5.0,
        sampling_resolution: 'R ≈ 41–130 (102 LVF Channels)',
        color: '#818cf8',
        data_points: generateGrid(0.75, 5.0, 36, (wl) => {
          let base = 1.12;
          if (wl <= 2.42) {
            base = 1.12 + (wl - 0.75) * ((1.89 - 1.12) / (2.42 - 0.75));
          } else if (wl <= 3.98) {
            base = 1.89 - (wl - 2.42) * ((1.89 - 1.64) / (3.98 - 2.42));
          } else {
            base = 1.64 - (wl - 3.98) * ((1.64 - 1.31) / (5.00 - 3.98));
          }
          if (Math.abs(wl - 3.3) < 0.15) base += 0.08;
          const excess = 0.32 * Math.max(0, 1.0 - Math.pow((wl - 3.98) / 0.45, 2));
          const isEdge = wl <= 0.85 || wl >= 4.85;
          const isTelluric = Math.abs(wl - 2.7) < 0.08;
          return {
            signal: base + excess,
            unc: Math.abs(wl - 3.98) < 0.15 ? 0.07 : isEdge ? 0.06 : 0.04,
            flag: isEdge ? 'EDGE_CHANNEL' : isTelluric ? 'NOISY' : 'OK',
            flagDesc: isEdge
              ? 'Array boundary channel with higher dispersion'
              : isTelluric
              ? 'Atmospheric telluric / filter crossover band'
              : undefined,
          };
        }),
      },
    ],
  },

  'spherex-deep-field-north': {
    target_id: 'spherex-deep-field-north',
    target_title: 'SPHEREx Deep Field North (NEP)',
    target_kind: 'deep_field',
    status: 'verified',
    supported_wavelength_range: '0.80 μm – 4.80 μm (SPHEREx Bands 1–6)',
    provenance: {
      archive_source: 'NASA/IPAC Infrared Science Archive (IRSA)',
      mission: 'NASA SPHEREx',
      instrument_configuration: '6-Band Linear Variable Filter Array (InSb/Si)',
      extraction_method: 'Optimal PSF Weighted Extraction',
      pipeline_version: 'SPHEREx Science Pipeline v2.4.1 (DR1 Calibration)',
      retrieval_date_utc: '2026-11-14T12:00:00Z',
      archive_citation: 'NASA/IPAC Infrared Science Archive (IRSA) SPHEREx Data Release 1 (DR1)',
      doi_url: 'https://irsa.ipac.caltech.edu/data/SPHEREx/',
    },
    profiles: [
      {
        epoch_id: 'T0-EARLIER',
        epoch_label: 'T0: May 2025 Baseline (2025-05-10)',
        observation_id: 'SPX-OBS-2025-0210-B2',
        obs_date_utc: '2025-05-10T14:20:00Z',
        source_id: 'NEP Core Galaxy Host',
        flux_unit: 'μJy',
        wavelength_unit: 'μm',
        wavelength_min_um: 0.8,
        wavelength_max_um: 4.8,
        sampling_resolution: 'R ≈ 41–130 (LVF Continuous)',
        color: '#38bdf8',
        data_points: generateGrid(0.8, 4.8, 32, (wl) => {
          const isEdge = wl <= 0.85 || wl >= 4.75;
          return {
            signal: 15.2 + 2.1 * Math.cos(wl * 1.3) + (((wl * 11) % 1.2) - 0.6),
            unc: isEdge ? 1.9 : 0.75,
            flag: isEdge ? 'EDGE_CHANNEL' : 'OK',
            flagDesc: isEdge ? 'Border channel with higher readout variance' : undefined,
          };
        }),
      },
      {
        epoch_id: 'T1-LATER',
        epoch_label: 'T1: August 2025 Epoch (2025-08-11)',
        observation_id: 'SPX-OBS-2025-0512-B2',
        obs_date_utc: '2025-08-11T09:44:18Z',
        source_id: 'NEP Core Galaxy Host',
        flux_unit: 'μJy',
        wavelength_unit: 'μm',
        wavelength_min_um: 0.8,
        wavelength_max_um: 4.8,
        sampling_resolution: 'R ≈ 41–130 (LVF Continuous)',
        color: '#818cf8',
        data_points: generateGrid(0.8, 4.8, 32, (wl) => {
          const isEdge = wl <= 0.85 || wl >= 4.75;
          return {
            signal: 15.5 + 2.1 * Math.cos(wl * 1.3) + (((wl * 17) % 1.3) - 0.65),
            unc: isEdge ? 1.9 : 0.8,
            flag: isEdge ? 'EDGE_CHANNEL' : 'OK',
            flagDesc: isEdge ? 'Border channel with higher readout variance' : undefined,
          };
        }),
      },
    ],
  },
};
