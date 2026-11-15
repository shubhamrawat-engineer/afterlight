import type { CelestialObject } from '../types/object.types';

// Explicit Demonstration / Mock Celestial Object Fixtures
// Standardized across AFTERLIGHT with real SPHEREx DR1 coordinates and candidate classifications.
export const MOCK_CELESTIAL_OBJECTS: CelestialObject[] = [
  {
    "id": "SPX-OBJ-KBO-XR1",
    "target_id": "kbo-2024-xr1",
    "name": "Trans-Neptunian Candidate 2024-XR1",
    "designation": "MPC Provisional TNO-2024-XR1",
    "category": "moving_object",
    "status": "PROVISIONAL",
    "ra_deg": 348.1125,
    "dec_deg": -12.456,
    "coordinate_frame": "ICRS (J2000)",
    "preview_image": "/static/objects_media/SPX-OBJ-KBO-XR1/difference.png",
    "description": "Outer Solar System trans-Neptunian candidate identified via rapid angular shift across multi-epoch SPHEREx observations. Displaced by 3.4 arcsec over 185 days along an ecliptic retrograde orbital path.",
    "associated_region": "Trans-Neptunian Candidate 2024-XR1",
    "observations": [
      {
        "observation_id": "SPX-OBS-2025-0044-B1",
        "date_utc": "2025-03-01T04:12:00Z",
        "wavelength_um": 1.15,
        "product_type": "SPHEREx L2 Spectral Image",
        "data_release": "DR1-Public",
        "detector": "Detector-1 (0.75-1.25 \u03bcm)"
      },
      {
        "observation_id": "SPX-OBS-2025-0230-B1",
        "date_utc": "2025-09-02T16:45:00Z",
        "wavelength_um": 1.15,
        "product_type": "SPHEREx L2 Spectral Image",
        "data_release": "DR1-Public",
        "detector": "Detector-1 (0.75-1.25 \u03bcm)"
      }
    ],
    "temporal_behaviour": {
      "has_motion_data": true,
      "motion_type": "proper_motion",
      "measured_displacement_arcsec": 3.41,
      "motion_rate_mas_per_day": 18.43,
      "position_angle_deg": 248.5,
      "flux_delta_value": null,
      "flux_unit": "\u03bcJy",
      "uncertainty": 0.08,
      "time_baseline_days": 185,
      "scientific_notes": "Distinct positive/negative bipolar residual signature in difference image confirms non-stationary Keplerian motion across epochs. Position angle aligns with Kuiper Belt retrograde drift.",
      "warnings": [
        "Keplerian motion candidate: orbit requires minimum 3-epoch follow-up to constrain semi-major axis.",
        "Candidate designation remains provisional pending Minor Planet Center (MPC) orbit linkage."
      ]
    },
    "has_spectral_data": true,
    "spectral_wavelength_range": "0.75 \u03bcm \u2013 2.40 \u03bcm",
    "catalogue_matches": [
      {
        "catalogue_name": "Minor Planet Center (MPC)",
        "catalogue_id": "MPC Provisional TNO-2024-XR1",
        "ra_deg": 348.1124,
        "dec_deg": -12.4561,
        "angular_separation_arcsec": 0.12,
        "match_quality": "CONFIRMED",
        "reference_url": "https://minorplanetcenter.net/"
      }
    ],
    "related_investigations": [
      {
        "case_id": "INV-2025-KBO-003",
        "title": "Outer Solar System Orbital Linkage",
        "status": "provisional",
        "confidence": "high"
      }
    ],
    "provenance": {
      "catalogue_source": "SPHEREx Multi-Epoch Solar System Moving Object Pipeline",
      "last_updated_utc": "2026-11-14T19:00:00Z",
      "pipeline_version": "v2.4.1-astrometric",
      "curator": "ASTRION / AFTERLIGHT Team"
    },
    "images": {
      "epoch1": "/static/objects_media/SPX-OBJ-KBO-XR1/epoch1.png",
      "epoch2": "/static/objects_media/SPX-OBJ-KBO-XR1/epoch2.png",
      "difference": "/static/objects_media/SPX-OBJ-KBO-XR1/difference.png"
    },
    "simple_title": "Outer Solar System Ice World",
    "simple_explanation": "An icy space rock floating in the deep freeze beyond Neptune. It slowly circles our Sun along the outer rim of the solar system.",
    "how_to_spot_the_shift": "When you blink between Picture 1 and Picture 2, watch the green target circle! While all background stars stay frozen, this little dot jumps 3.4 arcseconds! That jump proves it is orbiting our Sun!",
    "plain_stats": {
      "speed": "Approx. 4.5 km/sec through the Kuiper Belt",
      "distance": "44 times farther than Earth is from the Sun (~6.6 billion km)",
      "temperature": "-230\u00b0C (Near absolute zero)",
      "visibility": "Invisible to human eyes; detected by SPHEREx telescope"
    },
    "fun_fact": "It takes over 290 Earth years for this icy body to complete just one single orbit around our Sun!"
  },
  {
    "id": "SPX-OBJ-NEO-2025",
    "target_id": "kbo-2024-xr1",
    "name": "Near-Earth Asteroid Candidate 2025-SPX1",
    "designation": "SPHEREx NEO-2025-081",
    "category": "moving_object",
    "status": "PROVISIONAL",
    "ra_deg": 150.245,
    "dec_deg": 2.314,
    "coordinate_frame": "ICRS (J2000)",
    "preview_image": "/static/objects_media/SPX-OBJ-NEO-2025/difference.png",
    "description": "Fast-moving near-Earth asteroid candidate detected by automated multi-epoch centroid tracking. Displaces 85.2 mas/day with trailing elongation indicative of orbital velocity relative to geocentric survey frame.",
    "associated_region": "COSMOS Deep Field",
    "observations": [
      {
        "observation_id": "2025W17_4B_0486_3",
        "date_utc": "2025-04-24T09:14:00Z",
        "wavelength_um": 3.98,
        "product_type": "SPHEREx Level-2 Spectral Image",
        "data_release": "DR1",
        "detector": "Detector-5"
      },
      {
        "observation_id": "2026W19_2A_0619_1",
        "date_utc": "2026-05-08T14:22:00Z",
        "wavelength_um": 3.98,
        "product_type": "SPHEREx Level-2 Spectral Image",
        "data_release": "DR1",
        "detector": "Detector-5"
      }
    ],
    "temporal_behaviour": {
      "has_motion_data": true,
      "motion_type": "proper_motion",
      "measured_displacement_arcsec": 5.12,
      "motion_rate_mas_per_day": 85.2,
      "position_angle_deg": 112.4,
      "flux_delta_value": null,
      "flux_unit": "\u03bcJy",
      "uncertainty": 0.15,
      "time_baseline_days": 379,
      "scientific_notes": "Automated pixel sifter isolated non-zero centroid shift. High apparent motion relative to background star field confirms Solar System proximity.",
      "warnings": [
        "Requires MPC cross-match to rule out known main-belt interloper."
      ]
    },
    "has_spectral_data": true,
    "spectral_wavelength_range": "1.0 \u03bcm \u2013 4.5 \u03bcm",
    "catalogue_matches": [
      {
        "catalogue_name": "JPL Small-Body Database",
        "catalogue_id": "JPL-NEO-SPX-CANDIDATE",
        "ra_deg": 150.2452,
        "dec_deg": 2.3138,
        "angular_separation_arcsec": 0.21,
        "match_quality": "TENTATIVE",
        "reference_url": "https://ssd.jpl.nasa.gov/"
      }
    ],
    "related_investigations": [],
    "provenance": {
      "catalogue_source": "SPHEREx Automated Motion Sifter",
      "last_updated_utc": "2026-11-14T20:00:00Z",
      "pipeline_version": "v2.4.1",
      "curator": "ASTRION / AFTERLIGHT Team"
    },
    "images": {
      "epoch1": "/static/objects_media/SPX-OBJ-NEO-2025/epoch1.png",
      "epoch2": "/static/objects_media/SPX-OBJ-NEO-2025/epoch2.png",
      "difference": "/static/objects_media/SPX-OBJ-NEO-2025/difference.png"
    },
    "simple_title": "Speeding Near-Earth Asteroid",
    "simple_explanation": "A cosmic boulder racing through space. Because it is much closer to Earth than distant stars, it appears to streak quickly across the telescope's camera between visits.",
    "how_to_spot_the_shift": "Blink between the two pictures: you will see this dot make a HUGE diagonal jump across the frame! Close-by space rocks jump much farther than distant stars!",
    "plain_stats": {
      "speed": "Blazing fast: ~25 km/sec relative to Earth",
      "distance": "Within our inner solar system (~15 million km)",
      "temperature": "Warmer (+10\u00b0C on sunlit side)",
      "visibility": "Reflects sunlight; tracked by planetary defense teams"
    },
    "fun_fact": "Asteroids like this are leftover building blocks from when our Earth and planets first formed 4.6 billion years ago!"
  },
  {
    "id": "SPX-OBJ-COMET-C2",
    "target_id": "spherex-deep-field-north",
    "name": "Cometary Outburst Candidate C/2026-SP1",
    "designation": "SPHEREx J180012.3+663345",
    "category": "moving_object",
    "status": "PROVISIONAL",
    "ra_deg": 270.0512,
    "dec_deg": 66.562,
    "coordinate_frame": "ICRS (J2000)",
    "preview_image": "/static/objects_media/SPX-OBJ-COMET-C2/difference.png",
    "description": "Distant cometary activity showing both angular displacement and diffuse coma expansion in 3.0-4.0 \u03bcm SPHEREx channels, indicative of volatile gas outgassing and water-ice sublimation.",
    "associated_region": "SPHEREx Deep Field North (NEP)",
    "observations": [
      {
        "observation_id": "SPX-OBS-2025-0210-B2",
        "date_utc": "2025-02-10T12:00:00Z",
        "wavelength_um": 3.1,
        "product_type": "SPHEREx L2 Spectral Image",
        "data_release": "DR1",
        "detector": "Detector-4"
      },
      {
        "observation_id": "SPX-OBS-2025-0512-B2",
        "date_utc": "2025-05-12T18:30:00Z",
        "wavelength_um": 3.1,
        "product_type": "SPHEREx L2 Spectral Image",
        "data_release": "DR1",
        "detector": "Detector-4"
      }
    ],
    "temporal_behaviour": {
      "has_motion_data": true,
      "motion_type": "proper_motion",
      "measured_displacement_arcsec": 4.2,
      "motion_rate_mas_per_day": 45.65,
      "position_angle_deg": 195.0,
      "flux_delta_value": 78.5,
      "flux_unit": "\u03bcJy",
      "uncertainty": 4.1,
      "time_baseline_days": 92,
      "scientific_notes": "Morphological expansion observed: FWHM grew from 6.2 arcsec to 14.8 arcsec indicating diffuse coma formation.",
      "warnings": [
        "Diffuse coma profile introduces centroid measurement uncertainty of \u00b10.3 arcsec."
      ]
    },
    "has_spectral_data": true,
    "spectral_wavelength_range": "2.5 \u03bcm \u2013 4.8 \u03bcm",
    "catalogue_matches": [],
    "related_investigations": [],
    "provenance": {
      "catalogue_source": "SPHEREx Cometary Survey Pipeline",
      "last_updated_utc": "2026-11-14T20:15:00Z",
      "pipeline_version": "v2.4.1",
      "curator": "ASTRION / AFTERLIGHT Team"
    },
    "images": {
      "epoch1": "/static/objects_media/SPX-OBJ-COMET-C2/epoch1.png",
      "epoch2": "/static/objects_media/SPX-OBJ-COMET-C2/epoch2.png",
      "difference": "/static/objects_media/SPX-OBJ-COMET-C2/difference.png"
    },
    "simple_title": "Awakening Dirty Snowball Comet",
    "simple_explanation": "A giant frozen ball of dust, water ice, and frozen gases. As it gets closer to the warmth of the Sun, the ice turns to vapor, forming a glowing cosmic cloud (coma).",
    "how_to_spot_the_shift": "In Picture 1 it was a sharp small point. In Picture 2 it moved AND grew into a fuzzy, hazy glow! That fuzziness is water vapor exploding into space!",
    "plain_stats": {
      "speed": "~15 km/sec on an elliptical orbit",
      "distance": "Outer asteroid belt boundary (~450 million km)",
      "temperature": "-100\u00b0C (Ice is actively sublimating into gas)",
      "visibility": "Glowing vapor cloud detected in SPHEREx 3-micron water band"
    },
    "fun_fact": "Comets brought much of the original water to early Earth billions of years ago!"
  },
  {
    "id": "SPX-OBJ-BD-01",
    "target_id": "demo-deepfield-01",
    "name": "Cold Y-Dwarf / Planet X Candidate SPX-0404-BD",
    "designation": "SPHEREx J100024.12+021208.5",
    "category": "brown_dwarf",
    "status": "PROVISIONAL",
    "ra_deg": 150.1005,
    "dec_deg": 2.2024,
    "coordinate_frame": "ICRS (J2000)",
    "preview_image": "/static/objects_media/SPX-OBJ-BD-01/difference.png",
    "description": "Ultra-cold sub-stellar brown dwarf / outer Solar System candidate discovered by automated multi-epoch sifting. Exhibits extreme infrared excess (glowing intensely at 3.98 \u03bcm while undetectable in optical Gaia DR3), coupled with distinct proper motion (\u03bc = 320 mas/yr), consistent with a sub-stellar body within 15 parsecs or trans-Neptunian gravitational perturber.",
    "associated_region": "COSMOS Deep Field (Real SPHEREx DR1 Verified Pair)",
    "observations": [
      {
        "observation_id": "2025W17_4B_0486_3",
        "date_utc": "2025-04-24T09:14:00Z",
        "wavelength_um": 3.98,
        "product_type": "SPHEREx Level-2 Spectral Image",
        "data_release": "DR1",
        "detector": "Detector-5"
      },
      {
        "observation_id": "2026W19_2A_0619_1",
        "date_utc": "2026-05-08T14:22:00Z",
        "wavelength_um": 3.98,
        "product_type": "SPHEREx Level-2 Spectral Image",
        "data_release": "DR1",
        "detector": "Detector-5"
      }
    ],
    "temporal_behaviour": {
      "has_motion_data": true,
      "motion_type": "proper_motion",
      "measured_displacement_arcsec": 0.332,
      "motion_rate_mas_per_day": 0.876,
      "position_angle_deg": 142.1,
      "flux_delta_value": 320.0,
      "flux_unit": "\u03bcJy",
      "uncertainty": 70.0,
      "time_baseline_days": 379,
      "scientific_notes": "Backyard Worlds citizen-science archetype: strong 3.98 \u03bcm CH4/H2O absorption window transparency creates high signal-to-noise detection in SPHEREx while completely absent in visible sky surveys. Measurable proper motion \u03bc = 320 \u00b1 25 mas/yr demonstrates physical proximity.",
      "warnings": [
        "SCIENTIFIC RESTRAINT: Requires trigonometric parallax measurement across 3 epochs before confirming planetary or sub-stellar mass.",
        "Must be framed as 'candidate brown dwarf / moving infrared source', not confirmed Planet X discovery."
      ]
    },
    "has_spectral_data": true,
    "spectral_wavelength_range": "1.5 \u03bcm \u2013 4.8 \u03bcm",
    "catalogue_matches": [
      {
        "catalogue_name": "Backyard Worlds: Planet 9",
        "catalogue_id": "BYW-J100024+021208",
        "ra_deg": 150.1004,
        "dec_deg": 2.2023,
        "angular_separation_arcsec": 0.18,
        "match_quality": "CONFIRMED",
        "reference_url": "https://www.zooniverse.org/projects/marckuchner/backyard-worlds-planet-9"
      },
      {
        "catalogue_name": "AllWISE",
        "catalogue_id": "WISE J100024.1+021208",
        "ra_deg": 150.1006,
        "dec_deg": 2.2025,
        "angular_separation_arcsec": 0.22,
        "match_quality": "CONFIRMED",
        "reference_url": "https://irsa.ipac.caltech.edu/"
      }
    ],
    "related_investigations": [
      {
        "case_id": "case-001-cosmos-dr1",
        "title": "COSMOS Field DR1 Multi-Epoch Flux Verification",
        "status": "scientifically_verified",
        "confidence": "high"
      }
    ],
    "provenance": {
      "catalogue_source": "SPHEREx Autonomous Discovery Sifter & Ingestion Engine",
      "last_updated_utc": "2026-11-14T20:30:00Z",
      "pipeline_version": "SPHEREx Science Pipeline v2.4.1",
      "curator": "ASTRION Challenge 12 Research Team"
    },
    "images": {
      "epoch1": "/static/objects_media/SPX-OBJ-BD-01/epoch1.png",
      "epoch2": "/static/objects_media/SPX-OBJ-BD-01/epoch2.png",
      "difference": "/static/objects_media/SPX-OBJ-BD-01/difference.png"
    },
    "simple_title": "Cold Hidden World / Planet X Candidate",
    "simple_explanation": "A mysterious sub-stellar world 4 times heavier than Jupiter, but too small to ignite as a star. It produces almost no normal visible light, but glows intensely in thermal heat vision!",
    "how_to_spot_the_shift": "Optical telescopes see pitch black darkness here! But when you switch to SPHEREx 3.98-micron heat vision, a brilliant dot appears and drifts steadily across the sky!",
    "plain_stats": {
      "speed": "Drifting at ~80 km/sec through our galactic neighborhood",
      "distance": "Only ~14 light-years away (In our cosmic backyard!)",
      "temperature": "Lukewarm: ~25\u00b0C (Room temperature in space!)",
      "visibility": "100% invisible to human eyes; glowing hot in SPHEREx infrared"
    },
    "fun_fact": "You could stand in the upper clouds of this brown dwarf and experience room-temperature air, but with gravity 30 times stronger than Earth!"
  },
  {
    "id": "SPX-OBJ-T-DWARF",
    "target_id": "spherex-deep-field-south",
    "name": "Sub-stellar T8 Dwarf Candidate SPX-1501-T8",
    "designation": "SPHEREx J040448.2-482410",
    "category": "brown_dwarf",
    "status": "VERIFIED",
    "ra_deg": 61.2008,
    "dec_deg": -48.4028,
    "coordinate_frame": "ICRS (J2000)",
    "preview_image": "/static/objects_media/SPX-OBJ-T-DWARF/difference.png",
    "description": "Late-T sub-stellar dwarf identified via distinctive methane (CH4) absorption band dip at 1.6 \u03bcm and 3.3 \u03bcm, coupled with steady proper motion of 185 mas/yr in South Ecliptic Pole survey.",
    "associated_region": "SPHEREx Deep Field South (SDF-S)",
    "observations": [
      {
        "observation_id": "SPX-OBS-2025-0104-B3",
        "date_utc": "2025-04-12T08:34:21Z",
        "wavelength_um": 2.42,
        "product_type": "SPHEREx L2 Mosaic",
        "data_release": "DR1-Early",
        "detector": "Array-3 (InSb 2.4 - 3.8 \u03bcm)"
      },
      {
        "observation_id": "SPX-OBS-2025-0320-B3",
        "date_utc": "2025-10-14T15:12:09Z",
        "wavelength_um": 2.44,
        "product_type": "SPHEREx L2 Mosaic",
        "data_release": "DR1-Public",
        "detector": "Detector-3"
      }
    ],
    "temporal_behaviour": {
      "has_motion_data": true,
      "motion_type": "proper_motion",
      "measured_displacement_arcsec": 0.094,
      "motion_rate_mas_per_day": 0.508,
      "position_angle_deg": 88.4,
      "flux_delta_value": 15.2,
      "flux_unit": "\u03bcJy",
      "uncertainty": 1.8,
      "time_baseline_days": 185,
      "scientific_notes": "Proper motion detected over 6-month survey cadence. Color ratio [2.42\u03bcm / 1.65\u03bcm] matches benchmark T8 dwarf spectral models.",
      "warnings": []
    },
    "has_spectral_data": true,
    "spectral_wavelength_range": "1.0 \u03bcm \u2013 5.0 \u03bcm",
    "catalogue_matches": [
      {
        "catalogue_name": "2MASS PSC",
        "catalogue_id": "2MASS J04044820-4824100",
        "ra_deg": 61.2009,
        "dec_deg": -48.4027,
        "angular_separation_arcsec": 0.15,
        "match_quality": "CONFIRMED",
        "reference_url": "https://irsa.ipac.caltech.edu/"
      }
    ],
    "related_investigations": [],
    "provenance": {
      "catalogue_source": "SPHEREx Sub-Stellar Cross-Identification Engine",
      "last_updated_utc": "2026-11-14T20:30:00Z",
      "pipeline_version": "v2.4.1",
      "curator": "ASTRION / AFTERLIGHT Team"
    },
    "images": {
      "epoch1": "/static/objects_media/SPX-OBJ-T-DWARF/epoch1.png",
      "epoch2": "/static/objects_media/SPX-OBJ-T-DWARF/epoch2.png",
      "difference": "/static/objects_media/SPX-OBJ-T-DWARF/difference.png"
    },
    "simple_title": "Methane-Rich Sub-Stellar Dwarf",
    "simple_explanation": "A failed star with an atmosphere filled with methane and water vapor gas, similar to giant gas planets like Jupiter and Saturn.",
    "how_to_spot_the_shift": "Watch the subtle astrometric shift: while background galaxies stay motionless, this cool dwarf drifts steadily eastward due to its orbital journey around the Milky Way.",
    "plain_stats": {
      "speed": "Steady drift of 185 milli-arcseconds per year",
      "distance": "Approximately 28 light-years away",
      "temperature": "Cool glow: ~500\u00b0C",
      "visibility": "Strong methane absorption fingerprints at 1.6 & 3.3 microns"
    },
    "fun_fact": "Methane gas in its atmosphere absorbs certain wavelengths of infrared light, creating natural cosmic barcodes that tell us what it is made of!"
  },
  {
    "id": "SPX-OBJ-V838",
    "target_id": "v838-mon-echo",
    "name": "V838 Monocerotis Light Echo Complex",
    "designation": "SPHEREx J070404.8-035051",
    "category": "variable_star",
    "status": "VERIFIED",
    "ra_deg": 106.0125,
    "dec_deg": -3.8461,
    "coordinate_frame": "ICRS (J2000)",
    "preview_image": "/static/objects_media/SPX-OBJ-V838/difference.png",
    "description": "Famous eruptive variable star surrounded by expanding circumstellar dust light echo. Astrometrically stationary central source with extensive multi-epoch infrared flux variability across 2.0 to 4.5 \u03bcm.",
    "associated_region": "V838 Monocerotis Light Echo",
    "observations": [
      {
        "observation_id": "SPX-OBS-2025-0082-B2",
        "date_utc": "2025-03-23T11:14:00Z",
        "wavelength_um": 2.05,
        "product_type": "SPHEREx Spectral Mosaic L2",
        "data_release": "DR1",
        "detector": "Detector-2"
      },
      {
        "observation_id": "SPX-OBS-2025-0290-B2",
        "date_utc": "2025-10-17T20:45:00Z",
        "wavelength_um": 2.05,
        "product_type": "SPHEREx Spectral Mosaic L2",
        "data_release": "DR1",
        "detector": "Detector-2"
      }
    ],
    "temporal_behaviour": {
      "has_motion_data": true,
      "motion_type": "flux_variability",
      "measured_displacement_arcsec": 0.03,
      "motion_rate_mas_per_day": null,
      "position_angle_deg": null,
      "flux_delta_value": 128.4,
      "flux_unit": "\u03bcJy",
      "uncertainty": 6.8,
      "time_baseline_days": 208,
      "scientific_notes": "Central star remains stationary within 0.03 arcsec RMS. Significant flux change (+128.4 \u03bcJy, 18.9\u03c3) due to evolving dust scattering illumination.",
      "warnings": [
        "Circumstellar dust echo introduces extended spatial structure; aperture photometry requires background annulus correction."
      ]
    },
    "has_spectral_data": true,
    "spectral_wavelength_range": "0.75 \u03bcm \u2013 5.00 \u03bcm",
    "catalogue_matches": [
      {
        "catalogue_name": "SIMBAD",
        "catalogue_id": "V* V838 Mon",
        "ra_deg": 106.0125,
        "dec_deg": -3.8461,
        "angular_separation_arcsec": 0.02,
        "match_quality": "CONFIRMED",
        "reference_url": "https://simbad.cds.unistra.fr/"
      },
      {
        "catalogue_name": "GAIA DR3",
        "catalogue_id": "GAIA DR3 308182939218201",
        "ra_deg": 106.01252,
        "dec_deg": -3.84612,
        "angular_separation_arcsec": 0.04,
        "match_quality": "CONFIRMED",
        "reference_url": "https://gea.esac.esa.int/"
      }
    ],
    "related_investigations": [
      {
        "case_id": "INV-2025-V838-002",
        "title": "Circumstellar Dust Light Echo Photometry",
        "status": "verified",
        "confidence": "high"
      }
    ],
    "provenance": {
      "catalogue_source": "SPHEREx Variable Star Monitoring",
      "last_updated_utc": "2026-11-14T20:30:00Z",
      "pipeline_version": "v2.4.1",
      "curator": "ASTRION / AFTERLIGHT Team"
    },
    "images": {
      "epoch1": "/static/objects_media/SPX-OBJ-V838/epoch1.png",
      "epoch2": "/static/objects_media/SPX-OBJ-V838/epoch2.png",
      "difference": "/static/objects_media/SPX-OBJ-V838/difference.png"
    },
    "simple_title": "Erupting Star & Expanding Light Echo",
    "simple_explanation": "A supergiant star that suddenly erupted in a blinding flash. The light flash travels outward through space, illuminating surrounding dust clouds like ripples in a pond.",
    "how_to_spot_the_shift": "The central star did NOT move, but look at the brightness: it dramatically flares up, illuminating huge rings of dust that were previously pitch black!",
    "plain_stats": {
      "speed": "Star is stationary; the illuminated dust rings expand at the speed of light!",
      "distance": "20,000 light-years away in the constellation Monoceros",
      "temperature": "Hot central star surrounded by cold interstellar dust",
      "visibility": "One of the most famous cosmic fireworks displays ever photographed"
    },
    "fun_fact": "What looks like a giant fireball expanding is actually an optical illusion called a 'Light Echo' \u2014 light from the original flash reflecting off clouds at different distances!"
  },
  {
    "id": "SPX-OBJ-MIRA-01",
    "target_id": "demo-deepfield-01",
    "name": "Pulsating AGB Variable Star SPX-Mira-01",
    "designation": "SPHEREx J100030.5+021140",
    "category": "variable_star",
    "status": "VERIFIED",
    "ra_deg": 150.127,
    "dec_deg": 2.1945,
    "coordinate_frame": "ICRS (J2000)",
    "preview_image": "/static/objects_media/SPX-OBJ-MIRA-01/difference.png",
    "description": "Long-period pulsating red giant star (Asymptotic Giant Branch) displaying high-amplitude infrared flux variability (+0.32 mJy) between 2025 and 2026 SPHEREx DR1 epochs while remaining perfectly fixed on the sky.",
    "associated_region": "COSMOS Deep Field (Real SPHEREx DR1 Verified Pair)",
    "observations": [
      {
        "observation_id": "2025W17_4B_0486_3",
        "date_utc": "2025-04-24T09:14:00Z",
        "wavelength_um": 3.98,
        "product_type": "SPHEREx Level-2 Spectral Image",
        "data_release": "DR1",
        "detector": "Detector-5"
      },
      {
        "observation_id": "2026W19_2A_0619_1",
        "date_utc": "2026-05-08T14:22:00Z",
        "wavelength_um": 3.98,
        "product_type": "SPHEREx Level-2 Spectral Image",
        "data_release": "DR1",
        "detector": "Detector-5"
      }
    ],
    "temporal_behaviour": {
      "has_motion_data": true,
      "motion_type": "flux_variability",
      "measured_displacement_arcsec": 0.04,
      "motion_rate_mas_per_day": null,
      "position_angle_deg": null,
      "flux_delta_value": 320.0,
      "flux_unit": "\u03bcJy",
      "uncertainty": 70.0,
      "time_baseline_days": 379,
      "scientific_notes": "Point source is stationary within 0.04 arcsec astrometric precision. Robust 4.5\u03c3 flux increase measured in 3.98 \u03bcm band.",
      "warnings": [
        "Multi-band monitoring required to determine exact pulsation period."
      ]
    },
    "has_spectral_data": true,
    "spectral_wavelength_range": "0.75 \u03bcm \u2013 5.00 \u03bcm",
    "catalogue_matches": [
      {
        "catalogue_name": "GAIA DR3",
        "catalogue_id": "GAIA DR3 3819281029102",
        "ra_deg": 150.1271,
        "dec_deg": 2.1944,
        "angular_separation_arcsec": 0.06,
        "match_quality": "CONFIRMED",
        "reference_url": "https://gea.esac.esa.int/"
      }
    ],
    "related_investigations": [],
    "provenance": {
      "catalogue_source": "SPHEREx Variable Star Pipeline",
      "last_updated_utc": "2026-11-14T20:30:00Z",
      "pipeline_version": "v2.4.1",
      "curator": "ASTRION / AFTERLIGHT Team"
    },
    "images": {
      "epoch1": "/static/objects_media/SPX-OBJ-MIRA-01/epoch1.png",
      "epoch2": "/static/objects_media/SPX-OBJ-MIRA-01/epoch2.png",
      "difference": "/static/objects_media/SPX-OBJ-MIRA-01/difference.png"
    },
    "simple_title": "Cosmic Breathing Star (Pulsating Giant)",
    "simple_explanation": "A giant red star near the end of its life that rhythmically expands and contracts like a beating heart over hundreds of days.",
    "how_to_spot_the_shift": "Notice how the coordinates stay locked in place, but the star swells to over triple its brightness between the two visits! It is breathing in and out!",
    "plain_stats": {
      "speed": "Fixed celestial position (Zero motion)",
      "distance": "Approximately 1,200 light-years away",
      "temperature": "Varies rhythmically as it expands and shrinks",
      "visibility": "Huge infrared flux change (+0.32 mJy / 4.5\u03c3 detection)"
    },
    "fun_fact": "When this star swells to its maximum size, it would swallow the orbits of Mercury, Venus, Earth, and Mars if it were at the center of our solar system!"
  },
  {
    "id": "SPX-OBJ-SDFS-01",
    "target_id": "spherex-deep-field-south",
    "name": "Candidate Transient AT-2025sdf",
    "designation": "SPHEREx J040455.49-482434.2",
    "category": "transient_candidate",
    "status": "PROVISIONAL",
    "ra_deg": 61.2312,
    "dec_deg": -48.4095,
    "coordinate_frame": "ICRS (J2000)",
    "preview_image": "/static/objects_media/SPX-OBJ-SDFS-01/difference.png",
    "description": "Luminous point-source infrared transient identified via optimal PSF convolution difference imaging in the South Ecliptic Pole survey field. Displays a 1.54 magnitude brightening (5.1\u03c3) over 185 days in distant host galaxy.",
    "associated_region": "SPHEREx Deep Field South (SDF-S)",
    "observations": [
      {
        "observation_id": "SPX-OBS-2025-0104-B3",
        "date_utc": "2025-04-12T08:34:21Z",
        "wavelength_um": 2.42,
        "product_type": "SPHEREx L2 Mosaic",
        "data_release": "DR1-Early",
        "detector": "Array-3 (InSb 2.4 - 3.8 \u03bcm)"
      },
      {
        "observation_id": "SPX-OBS-2025-0320-B3",
        "date_utc": "2025-10-14T15:12:09Z",
        "wavelength_um": 2.44,
        "product_type": "SPHEREx L2 Mosaic",
        "data_release": "DR1-Public",
        "detector": "Array-3 (InSb 2.4 - 3.8 \u03bcm)"
      }
    ],
    "temporal_behaviour": {
      "has_motion_data": true,
      "motion_type": "flux_variability",
      "measured_displacement_arcsec": 0.04,
      "motion_rate_mas_per_day": null,
      "position_angle_deg": null,
      "flux_delta_value": 44.4,
      "flux_unit": "\u03bcJy",
      "uncertainty": 1.44,
      "time_baseline_days": 185,
      "scientific_notes": "Point source is astrometrically stationary within SPHEREx 0.12 arcsec RMS registration precision. Significant temporal variability observed exclusively in flux density (+44.4 \u03bcJy, 5.1\u03c3).",
      "warnings": [
        "Stationary point source: apparent astrometric residual is within instrument alignment uncertainty.",
        "Two observation epochs alone cannot construct a complete bolometric light curve."
      ]
    },
    "has_spectral_data": true,
    "spectral_wavelength_range": "0.80 \u03bcm \u2013 4.80 \u03bcm",
    "catalogue_matches": [
      {
        "catalogue_name": "GAIA DR3",
        "catalogue_id": "GAIA DR3 467291028491029",
        "ra_deg": 61.23122,
        "dec_deg": -48.40951,
        "angular_separation_arcsec": 0.08,
        "match_quality": "CONFIRMED",
        "reference_url": "https://gea.esac.esa.int/archive/"
      },
      {
        "catalogue_name": "2MASS PSC",
        "catalogue_id": "2MASS J04045549-4824342",
        "ra_deg": 61.2312,
        "dec_deg": -48.4095,
        "angular_separation_arcsec": 0.05,
        "match_quality": "CONFIRMED",
        "reference_url": "https://irsa.ipac.caltech.edu/"
      }
    ],
    "related_investigations": [
      {
        "case_id": "INV-2025-SDFS-001",
        "title": "Supernova Candidate Investigation",
        "status": "provisional",
        "confidence": "medium"
      }
    ],
    "provenance": {
      "catalogue_source": "SPHEREx Transient Identification Engine",
      "last_updated_utc": "2026-11-14T20:30:00Z",
      "pipeline_version": "v2.4.1",
      "curator": "ASTRION / AFTERLIGHT Team"
    },
    "images": {
      "epoch1": "/static/objects_media/SPX-OBJ-SDFS-01/epoch1.png",
      "epoch2": "/static/objects_media/SPX-OBJ-SDFS-01/epoch2.png",
      "difference": "/static/objects_media/SPX-OBJ-SDFS-01/difference.png"
    },
    "simple_title": "Supernova Explosion in a Distant Galaxy",
    "simple_explanation": "The violent death explosion of a massive star in a galaxy billions of light-years away. For a few brief weeks, this single exploding star shines brighter than 10 billion ordinary stars combined!",
    "how_to_spot_the_shift": "In Picture 1 from 2025: completely empty black sky. In Picture 2 from 2026: BAM! A blazing white-hot point of light suddenly appears! That is a supernova explosion!",
    "plain_stats": {
      "speed": "Explosion debris blasting outward at 10,000 km/second",
      "distance": "3.5 billion light-years away (Its light traveled when Earth was young!)",
      "temperature": "Millions of degrees at the core",
      "visibility": "5.1\u03c3 statistical significance flare in SPHEREx Deep Field"
    },
    "fun_fact": "Supernovae create all the heavy elements in the universe, including the calcium in our bones and the iron in our blood!"
  },
  {
    "id": "SPX-OBJ-CAL-C1",
    "target_id": "static-calibration-field-c1",
    "name": "Invariant Stellar Calibrator C1",
    "designation": "Landolt SA 107-684 (SPHEREx Reference)",
    "category": "calibration_standard",
    "status": "CALIBRATION",
    "ra_deg": 180.0,
    "dec_deg": 0.0,
    "coordinate_frame": "ICRS (J2000)",
    "preview_image": "/static/objects_media/SPX-OBJ-CAL-C1/difference.png",
    "description": "Isolated spectrophotometric standard star used for zero-point baseline stability and PSF verification. Exhibits zero astrometric motion (<0.01 arcsec) and photometric invariance (<0.8%) across all epochs.",
    "associated_region": "Invariant Stellar Calibrator C1",
    "observations": [
      {
        "observation_id": "SPX-OBS-2025-0010-B4",
        "date_utc": "2025-01-15T00:00:00Z",
        "wavelength_um": 3.5,
        "product_type": "SPHEREx L2 Calibration Image",
        "data_release": "DR1-Cal",
        "detector": "Detector-5"
      },
      {
        "observation_id": "SPX-OBS-2025-0200-B4",
        "date_utc": "2025-07-20T00:00:00Z",
        "wavelength_um": 3.5,
        "product_type": "SPHEREx L2 Calibration Image",
        "data_release": "DR1-Cal",
        "detector": "Detector-5"
      }
    ],
    "temporal_behaviour": {
      "has_motion_data": true,
      "motion_type": "static_invariant",
      "measured_displacement_arcsec": 0.008,
      "motion_rate_mas_per_day": 0.04,
      "position_angle_deg": null,
      "flux_delta_value": 0.42,
      "flux_unit": "\u03bcJy",
      "uncertainty": 0.5,
      "time_baseline_days": 186,
      "scientific_notes": "Photometrically invariant control standard. Flux residual is consistent with zero within 1\u03c3 instrument uncertainty.",
      "warnings": [
        "Calibration reference standard: not an astrophysical variable source."
      ]
    },
    "has_spectral_data": true,
    "spectral_wavelength_range": "0.75 \u03bcm \u2013 5.00 \u03bcm",
    "catalogue_matches": [
      {
        "catalogue_name": "Landolt Selected Areas",
        "catalogue_id": "Landolt SA 107-684",
        "ra_deg": 180.0,
        "dec_deg": 0.0,
        "angular_separation_arcsec": 0.01,
        "match_quality": "CONFIRMED",
        "reference_url": "https://irsa.ipac.caltech.edu/"
      },
      {
        "catalogue_name": "GAIA DR3",
        "catalogue_id": "GAIA DR3 372918291028301",
        "ra_deg": 180.00001,
        "dec_deg": -1e-05,
        "angular_separation_arcsec": 0.02,
        "match_quality": "CONFIRMED",
        "reference_url": "https://gea.esac.esa.int/"
      }
    ],
    "related_investigations": [],
    "provenance": {
      "catalogue_source": "SPHEREx Instrument Calibration Subsystem",
      "last_updated_utc": "2026-11-14T20:30:00Z",
      "pipeline_version": "v2.4.1",
      "curator": "ASTRION / AFTERLIGHT Team"
    },
    "images": {
      "epoch1": "/static/objects_media/SPX-OBJ-CAL-C1/epoch1.png",
      "epoch2": "/static/objects_media/SPX-OBJ-CAL-C1/epoch2.png",
      "difference": "/static/objects_media/SPX-OBJ-CAL-C1/difference.png"
    },
    "simple_title": "The Cosmic Lighthouse (Calibration Anchor)",
    "simple_explanation": "An ultra-stable, unchanging star. Astronomers use it as an unvarying benchmark to calibrate and focus satellite cameras.",
    "how_to_spot_the_shift": "Compare Picture 1, Picture 2, and the Difference Map: NOTHING changes! Zero movement and zero flicker! That perfect rock-solid stability proves the telescope camera is working accurately!",
    "plain_stats": {
      "speed": "Rock-steady anchor (<0.01 arcseconds drift)",
      "distance": "Approximately 450 light-years away",
      "temperature": "Stable surface temperature of ~5,800 K (Like our Sun)",
      "visibility": "Standard reference fixture used by NASA and ESA observatories"
    },
    "fun_fact": "Without anchor calibrator stars like this, scientists wouldn't know if a star got brighter or if the telescope camera just got a little warmer!"
  }
];
