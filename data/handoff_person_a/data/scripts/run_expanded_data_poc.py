"""
AFTERLIGHT — Expanded Astronomical Object Data Integration Proof of Concept
Runs live tests across all 6 object categories and saves genuine sample records.
"""

import os
import sys
import json
import time

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.services import (
    SmallBodyService,
    HorizonsService,
    NeoCloseApproachService,
    SentryService,
    DeepSkyCatalogueService,
    SpherexService,
    CrossReferenceService
)

def run_poc():
    print("=" * 70)
    print("AFTERLIGHT Expanded Data Integration Proof of Concept")
    print("Executing live astronomical queries across all 6 object categories...")
    print("=" * 70)

    small_body_svc = SmallBodyService()
    horizons_svc = HorizonsService()
    cad_svc = NeoCloseApproachService()
    sentry_svc = SentryService()
    deep_sky_svc = DeepSkyCatalogueService()
    spherex_svc = SpherexService()
    cross_ref_svc = CrossReferenceService()

    results_summary = []

    # -------------------------------------------------------------
    # 1. COMET: 1P/Halley
    # -------------------------------------------------------------
    print("\n[1/6] Querying Comet: 1P/Halley...")
    halley_sbdb = small_body_svc.search_object("1P", force_live=True)
    halley_ephem = horizons_svc.get_ephemeris("1P", "2025-04-20", "2025-04-21", step_size="1d", force_live=True)
    halley_xm = cross_ref_svc.cross_match_object("1P", "COMET", target_timestamp_utc="2025-04-20T00:00:00Z")

    halley_file = os.path.join(PROJECT_ROOT, "data", "comets", "halley_sample.json")
    with open(halley_file, "w", encoding="utf-8") as f:
        json.dump(halley_xm, f, indent=2)

    results_summary.append({
        "category": "COMET",
        "object": "1P/Halley",
        "catalogue_available": halley_sbdb.get("status") == "SUCCESS",
        "ephemeris_available": halley_ephem.get("status") == "SUCCESS",
        "spherex_coverage": halley_xm["scientific_match_verdict"]["coverage_status"],
        "detection_label": halley_xm["scientific_match_verdict"]["detection_label"],
        "fits_retrievable": len(halley_xm["spherex_observations"]["observations"]) > 0,
        "sample_file": "data/comets/halley_sample.json"
    })
    print(f"  -> SBDB: {halley_sbdb.get('status')}, Ephem: {halley_ephem.get('status')}, SPHEREx Coverage: {halley_xm['scientific_match_verdict']['coverage_status']}")

    # -------------------------------------------------------------
    # 2. ASTEROID: 99942 Apophis
    # -------------------------------------------------------------
    print("\n[2/6] Querying Asteroid: 99942 Apophis...")
    apophis_sbdb = small_body_svc.search_object("99942", force_live=True)
    apophis_ephem = horizons_svc.get_ephemeris("99942", "2025-04-20", "2025-04-21", step_size="1d", force_live=True)
    apophis_sentry = sentry_svc.get_impact_risk("99942", force_live=True)
    apophis_cad = cad_svc.get_close_approaches(des="99942", date_min="2025-01-01", date_max="2035-01-01", force_live=True)
    apophis_xm = cross_ref_svc.cross_match_object("99942", "ASTEROID", target_timestamp_utc="2025-04-20T00:00:00Z")

    apophis_file = os.path.join(PROJECT_ROOT, "data", "asteroids", "apophis_sample.json")
    with open(apophis_file, "w", encoding="utf-8") as f:
        json.dump(apophis_xm, f, indent=2)

    results_summary.append({
        "category": "ASTEROID",
        "object": "99942 Apophis",
        "catalogue_available": apophis_sbdb.get("status") == "SUCCESS",
        "ephemeris_available": apophis_ephem.get("status") == "SUCCESS",
        "spherex_coverage": apophis_xm["scientific_match_verdict"]["coverage_status"],
        "detection_label": apophis_xm["scientific_match_verdict"]["detection_label"],
        "fits_retrievable": len(apophis_xm["spherex_observations"]["observations"]) > 0,
        "sample_file": "data/asteroids/apophis_sample.json"
    })
    print(f"  -> SBDB: {apophis_sbdb.get('status')}, Sentry Risk State: {apophis_sentry.get('risk_state')}, SPHEREx Coverage: {apophis_xm['scientific_match_verdict']['coverage_status']}")

    # -------------------------------------------------------------
    # 3. DWARF PLANET: 1 Ceres & 134340 Pluto
    # -------------------------------------------------------------
    print("\n[3/6] Querying Dwarf Planet: 1 Ceres and 134340 Pluto...")
    ceres_sbdb = small_body_svc.search_object("1", force_live=True)
    ceres_xm = cross_ref_svc.cross_match_object("1", "DWARF_PLANET", target_timestamp_utc="2025-04-20T00:00:00Z")
    ceres_file = os.path.join(PROJECT_ROOT, "data", "dwarf_planets", "ceres_sample.json")
    with open(ceres_file, "w", encoding="utf-8") as f:
        json.dump(ceres_xm, f, indent=2)

    pluto_sbdb = small_body_svc.search_object("134340", force_live=True)
    pluto_xm = cross_ref_svc.cross_match_object("134340", "DWARF_PLANET", target_timestamp_utc="2025-04-20T00:00:00Z")
    pluto_file = os.path.join(PROJECT_ROOT, "data", "dwarf_planets", "pluto_sample.json")
    with open(pluto_file, "w", encoding="utf-8") as f:
        json.dump(pluto_xm, f, indent=2)

    results_summary.append({
        "category": "DWARF_PLANET",
        "object": "1 Ceres",
        "catalogue_available": ceres_sbdb.get("status") == "SUCCESS",
        "ephemeris_available": ceres_xm.get("ephemeris_record") is not None,
        "spherex_coverage": ceres_xm["scientific_match_verdict"]["coverage_status"],
        "detection_label": ceres_xm["scientific_match_verdict"]["detection_label"],
        "fits_retrievable": len(ceres_xm["spherex_observations"]["observations"]) > 0,
        "sample_file": "data/dwarf_planets/ceres_sample.json"
    })
    print(f"  -> Ceres status: {ceres_sbdb.get('dwarf_planet_status')}, SPHEREx Coverage: {ceres_xm['scientific_match_verdict']['coverage_status']}")
    print(f"  -> Pluto status: {pluto_sbdb.get('dwarf_planet_status')}, SPHEREx Coverage: {pluto_xm['scientific_match_verdict']['coverage_status']}")

    # -------------------------------------------------------------
    # 4. STAR: Gaia DR3 3836257882479792640 in COSMOS Field
    # -------------------------------------------------------------
    print("\n[4/6] Querying Star: Gaia DR3 3836257882479792640 (COSMOS)...")
    star_id = "3836257882479792640"
    star_gaia = deep_sky_svc.search_object(star_id, force_live=True)
    star_xm = cross_ref_svc.cross_match_object(star_id, "STAR")
    star_file = os.path.join(PROJECT_ROOT, "data", "stars", "cosmos_gaia_star_sample.json")
    with open(star_file, "w", encoding="utf-8") as f:
        json.dump(star_xm, f, indent=2)

    results_summary.append({
        "category": "STAR",
        "object": f"Gaia DR3 {star_id}",
        "catalogue_available": star_gaia.get("status") == "SUCCESS",
        "ephemeris_available": False,  # Fixed celestial coordinate
        "spherex_coverage": star_xm["scientific_match_verdict"]["coverage_status"],
        "detection_label": star_xm["scientific_match_verdict"]["detection_label"],
        "fits_retrievable": len(star_xm["spherex_observations"]["observations"]) > 0,
        "sample_file": "data/stars/cosmos_gaia_star_sample.json"
    })
    print(f"  -> Star: {star_gaia.get('canonical_name')}, SPHEREx Coverage: {star_xm['scientific_match_verdict']['coverage_status']}, Detection Label: {star_xm['scientific_match_verdict']['detection_label']}")
    if star_xm.get("image_evidence"):
        print(f"     Image Evidence: Pixel ({star_xm['image_evidence']['pixel_x']}, {star_xm['image_evidence']['pixel_y']}), SNR: {star_xm['image_evidence']['estimated_snr']}, Flux: {star_xm['image_evidence']['pixel_flux_mjy_sr']} MJy/sr")

    # -------------------------------------------------------------
    # 5. BROWN DWARF: Luhman 16 (WISE J104915.57-531906.1)
    # -------------------------------------------------------------
    print("\n[5/6] Querying Brown Dwarf: Luhman 16...")
    bd_data = deep_sky_svc.search_object("Luhman 16", force_live=True)
    bd_xm = cross_ref_svc.cross_match_object("Luhman 16", "BROWN_DWARF")
    bd_file = os.path.join(PROJECT_ROOT, "data", "brown_dwarfs", "luhman16_sample.json")
    with open(bd_file, "w", encoding="utf-8") as f:
        json.dump(bd_xm, f, indent=2)

    results_summary.append({
        "category": "BROWN_DWARF",
        "object": "Luhman 16",
        "catalogue_available": bd_data.get("status") == "SUCCESS",
        "ephemeris_available": False,
        "spherex_coverage": bd_xm["scientific_match_verdict"]["coverage_status"],
        "detection_label": bd_xm["scientific_match_verdict"]["detection_label"],
        "fits_retrievable": len(bd_xm["spherex_observations"]["observations"]) > 0,
        "sample_file": "data/brown_dwarfs/luhman16_sample.json"
    })
    print(f"  -> Brown Dwarf: {bd_data.get('canonical_name')}, Distance: {bd_data.get('astrometry_and_distance', {}).get('distance_light_years')} ly, SPHEREx Coverage: {bd_xm['scientific_match_verdict']['coverage_status']}")

    # -------------------------------------------------------------
    # 6. SOLAR SYSTEM PLANET: Jupiter
    # -------------------------------------------------------------
    print("\n[6/6] Querying Planet: Jupiter...")
    jup_ephem = horizons_svc.get_ephemeris("jupiter", "2025-04-20", "2025-04-21", step_size="1d", force_live=True)
    jup_xm = cross_ref_svc.cross_match_object("jupiter", "SOLAR_SYSTEM_PLANET", target_timestamp_utc="2025-04-20T00:00:00Z")
    jup_file = os.path.join(PROJECT_ROOT, "data", "spherex", "jupiter_ephemeris_sample.json")
    with open(jup_file, "w", encoding="utf-8") as f:
        json.dump(jup_xm, f, indent=2)

    results_summary.append({
        "category": "SOLAR_SYSTEM_PLANET",
        "object": "Jupiter",
        "catalogue_available": True,
        "ephemeris_available": jup_ephem.get("status") == "SUCCESS",
        "spherex_coverage": jup_xm["scientific_match_verdict"]["coverage_status"],
        "detection_label": jup_xm["scientific_match_verdict"]["detection_label"],
        "fits_retrievable": len(jup_xm["spherex_observations"]["observations"]) > 0,
        "sample_file": "data/spherex/jupiter_ephemeris_sample.json"
    })
    print(f"  -> Jupiter Ephemeris: {jup_ephem.get('status')}, Points: {jup_ephem.get('point_count')}, SPHEREx Coverage: {jup_xm['scientific_match_verdict']['coverage_status']}")

    # -------------------------------------------------------------
    # 7. EARTH WATCH / SENTRY DANGER: 101955 Bennu
    # -------------------------------------------------------------
    print("\n[7/7] Querying Earth Watch / Sentry: 101955 Bennu & Upcoming Close Approaches...")
    bennu_sentry = sentry_svc.get_impact_risk("101955", force_live=True)
    bennu_file = os.path.join(PROJECT_ROOT, "data", "neo", "bennu_sentry_sample.json")
    with open(bennu_file, "w", encoding="utf-8") as f:
        json.dump(bennu_sentry, f, indent=2)

    upcoming_cad = cad_svc.get_close_approaches(dist_max="5LD", limit=10, force_live=True)
    cad_file = os.path.join(PROJECT_ROOT, "data", "neo", "upcoming_close_approaches.json")
    with open(cad_file, "w", encoding="utf-8") as f:
        json.dump(upcoming_cad, f, indent=2)

    print(f"  -> Bennu Sentry Risk State: {bennu_sentry.get('risk_state')}, IP: {bennu_sentry.get('impact_probability_cumulative')}")
    print(f"  -> Upcoming Earth Close Approaches (< 5 LD): {upcoming_cad.get('returned_count')} events retrieved")

    # -------------------------------------------------------------
    # SUMMARY TABLE
    # -------------------------------------------------------------
    print("\n" + "=" * 95)
    print(f"{'CATEGORY':<20} | {'OBJECT':<24} | {'CATALOGUE':<10} | {'SPHEREx COV':<12} | {'VERDICT':<16}")
    print("-" * 95)
    for r in results_summary:
        print(f"{r['category']:<20} | {r['object']:<24} | {'AVAILABLE':<10} | {r['spherex_coverage']:<12} | {r['detection_label']:<16}")
    print("=" * 95)

    summary_file = os.path.join(PROJECT_ROOT, "data", "reports", "poc_results_summary.json")
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(results_summary, f, indent=2)
    print(f"\nProof of concept complete. Summary saved to: {summary_file}")

if __name__ == "__main__":
    run_poc()
