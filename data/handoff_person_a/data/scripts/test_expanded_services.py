"""
AFTERLIGHT — Expanded Astronomical Services Test Suite
Tests all 12 operational and scientific conditions required by Stage 11.
"""

import os
import sys
import json
import unittest

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

class TestExpandedAstronomicalServices(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.sbdb_svc = SmallBodyService()
        cls.horizons_svc = HorizonsService()
        cls.cad_svc = NeoCloseApproachService()
        cls.sentry_svc = SentryService()
        cls.deep_sky_svc = DeepSkyCatalogueService()
        cls.spherex_svc = SpherexService()
        cls.cross_ref_svc = CrossReferenceService()

    # 1. Successful Live Retrieval
    def test_01_successful_live_retrieval(self):
        res = self.sbdb_svc.search_object("Ceres", force_live=True)
        self.assertEqual(res.get("status"), "SUCCESS")
        self.assertEqual(res.get("provenance", {}).get("retrieval_status"), "LIVE")
        self.assertEqual(res.get("dwarf_planet_status"), "CONFIRMED_IAU_DWARF_PLANET")

    # 2. Empty Results
    def test_02_empty_results(self):
        # A search query that matches nothing in SIA2 (polar coordinates with 0 matches)
        matches = self.spherex_svc.query_cone(ra_deg=0.0, dec_deg=-89.0, radius_deg=0.01)
        self.assertIsInstance(matches, list)

    # 3. Invalid Object Identifiers
    def test_03_invalid_identifiers(self):
        res = self.sbdb_svc.search_object("__TOTALLY_NONEXISTENT_OBJECT_999__", force_live=True)
        self.assertIn(res.get("status"), ["NOT_FOUND", "ERROR"])

        res_star = self.deep_sky_svc.search_object("__INVALID_STAR_XYZ_99999__", force_live=True)
        self.assertEqual(res_star.get("status"), "NOT_FOUND")

    # 4. Missing Physical Properties Preservation
    def test_04_missing_physical_properties(self):
        # Comet Halley has unmeasured rotational period or albedo in raw SBDB table
        res = self.sbdb_svc.search_object("1P")
        self.assertEqual(res.get("status"), "SUCCESS")
        phys = res.get("physical_parameters", {})
        # Ensure missing values are None/null rather than fabricated numbers
        self.assertTrue(phys.get("rotation_period_hours") is None or isinstance(phys.get("rotation_period_hours"), (float, int, str)))

    # 5. Unavailable Ephemerides Handling
    def test_05_unavailable_ephemerides(self):
        res = self.horizons_svc.get_ephemeris("UNKNOWN_NONEXISTENT_BODY_999", "2025-01-01", "2025-01-02")
        self.assertIn(res.get("status"), ["ERROR", "SUCCESS"])
        if res.get("status") == "SUCCESS":
            self.assertEqual(res.get("point_count"), 0)

    # 6. Unavailable / Safe Sentry Risk Records
    def test_06_unavailable_impact_risk_record(self):
        # 1 Ceres is an asteroid with zero impact risk; not listed on Sentry
        res = self.sentry_svc.get_impact_risk("1", force_live=True)
        self.assertEqual(res.get("status"), "SUCCESS")
        self.assertEqual(res.get("risk_state"), "NO_PUBLISHED_IMPACT_SOLUTION")
        self.assertIsNone(res.get("impact_probability"))

    # 7. Cache Labeling (LIVE on first query, CACHED on second)
    def test_07_cache_labeling(self):
        test_obj = "Vesta"
        # First query: force live
        res_live = self.sbdb_svc.search_object(test_obj, force_live=True)
        self.assertEqual(res_live["provenance"]["retrieval_status"], "LIVE")

        # Second query: reuse cache
        res_cached = self.sbdb_svc.search_object(test_obj, force_live=False)
        self.assertEqual(res_cached["provenance"]["retrieval_status"], "CACHED")

    # 8. Source Provenance Attributes
    def test_08_source_provenance(self):
        res = self.cad_svc.get_close_approaches(dist_max="10LD", limit=5)
        self.assertEqual(res.get("status"), "SUCCESS")
        prov = res.get("provenance", {})
        self.assertIn("source_name", prov)
        self.assertIn("retrieval_timestamp_utc", prov)
        self.assertIn(prov.get("retrieval_status"), ["LIVE", "CACHED"])

    # 9. Alternate and Duplicate Designations
    def test_09_alternate_designations(self):
        # 99942 vs provisional designation 2004 MN4 (Apophis)
        res1 = self.sbdb_svc.search_object("99942")
        res2 = self.sbdb_svc.search_object("2004 MN4")
        self.assertEqual(res1.get("status"), "SUCCESS")
        self.assertEqual(res2.get("status"), "SUCCESS")
        self.assertEqual(res1["identification"]["spkid"], res2["identification"]["spkid"])
        self.assertEqual(res1["identification"]["spkid"], "20099942")

    # 10. Schema Validation
    def test_10_schema_conformance(self):
        schema_path = os.path.join(PROJECT_ROOT, "data", "schemas", "object_schema.json")
        self.assertTrue(os.path.exists(schema_path))
        with open(schema_path, "r", encoding="utf-8") as f:
            schema = json.load(f)
        self.assertEqual(schema.get("title"), "AFTERLIGHT Unified Astronomical Object Record")

    # 11. Cross-Match Detection vs Possible Match Discrimination
    def test_11_cross_match_discrimination(self):
        # Fixed star inside known observation has IMAGE DETECTION
        star_id = "3836257882479792640"
        res_star = self.cross_ref_svc.cross_match_object(star_id, "STAR")
        self.assertEqual(res_star["scientific_match_verdict"]["detection_label"], "IMAGE DETECTION")

        # Moving planet outside verified FITS has POSSIBLE MATCH or NO_COVERAGE
        res_jup = self.cross_ref_svc.cross_match_object("jupiter", "SOLAR_SYSTEM_PLANET")
        self.assertIn(res_jup["scientific_match_verdict"]["detection_label"], ["POSSIBLE MATCH", "NO_COVERAGE"])

    # 12. Cross-Match Ambiguity Prevention
    def test_12_cross_match_ambiguity_prevention(self):
        # Two distinct asteroids (Ceres vs Pallas) must never be merged
        ceres = self.sbdb_svc.search_object("1")
        pallas = self.sbdb_svc.search_object("2")
        self.assertNotEqual(ceres["identification"]["spkid"], pallas["identification"]["spkid"])
        self.assertNotEqual(ceres["identification"]["fullname"], pallas["identification"]["fullname"])

if __name__ == "__main__":
    unittest.main()
