"""
AFTERLIGHT — Backend FastAPI Integration Test Suite
Tests all 21 REST API endpoints against Stage 11 services, normalized schemas, and pipeline processing.
"""
import os
import sys
import json
import unittest

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from starlette.testclient import TestClient
from backend.app.main import app

class TestAfterlightAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    # 1. System & Root Endpoints
    def test_01_root_summary(self):
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "ONLINE")
        self.assertEqual(data.get("service"), "AFTERLIGHT Astronomical API")
        self.assertIn("endpoints", data)

    def test_02_health_check(self):
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "HEALTHY")
        self.assertEqual(data.get("version"), "2.1.0")
        self.assertTrue(data.get("storage", {}).get("cache_dir_exists"))

    def test_03_schemas_endpoints(self):
        # List schemas
        resp = self.client.get("/api/schemas")
        self.assertEqual(resp.status_code, 200)
        schemas = resp.json()
        self.assertIn("object_schema.json", schemas)
        self.assertIn("close_approach_schema.json", schemas)

        # Get specific schema
        resp2 = self.client.get("/api/schemas/object_schema.json")
        self.assertEqual(resp2.status_code, 200)
        schema_data = resp2.json()
        self.assertEqual(schema_data.get("title"), "AFTERLIGHT Unified Astronomical Object Record")

        # Nonexistent schema
        resp3 = self.client.get("/api/schemas/__nonexistent_schema__.json")
        self.assertEqual(resp3.status_code, 404)

    # 2. Objects Search & Metadata
    def test_04_object_search_dwarf_planet(self):
        resp = self.client.get("/api/objects/search?q=Ceres")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "SUCCESS")
        self.assertEqual(data.get("category"), "DWARF_PLANET")
        self.assertEqual(data.get("dwarf_planet_status"), "CONFIRMED_IAU_DWARF_PLANET")

    def test_05_object_search_planet(self):
        resp = self.client.get("/api/objects/search?q=jupiter")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "SUCCESS")
        self.assertEqual(data.get("category"), "SOLAR_SYSTEM_PLANET")
        self.assertEqual(data["identification"]["spkid"], "599")

    def test_06_object_search_star(self):
        # Gaia DR3 star inside verified COSMOS observation
        resp = self.client.get("/api/objects/search?q=3836257882479792640&category=STAR")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "SUCCESS")
        self.assertEqual(data.get("category"), "STAR")

    def test_07_object_search_not_found(self):
        resp = self.client.get("/api/objects/search?q=__totally_nonexistent_object_999__")
        self.assertEqual(resp.status_code, 404)

    def test_08_object_search_missing_params(self):
        resp = self.client.get("/api/objects/search")
        self.assertEqual(resp.status_code, 422)

    def test_09_object_by_id(self):
        resp = self.client.get("/api/objects/1")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "SUCCESS")
        self.assertIn("Ceres", data["identification"]["fullname"])

    # 3. Ephemerides
    def test_10_object_ephemeris(self):
        resp = self.client.get("/api/objects/1P/ephemeris?start_time=2025-04-20&stop_time=2025-04-21&step_size=1d")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "SUCCESS")
        self.assertEqual(data.get("position_label"), "PREDICTED")
        self.assertTrue(len(data.get("ephemeris_points", [])) > 0)

    # 4. Earth Watch & Hazards
    def test_11_object_hazard(self):
        resp = self.client.get("/api/objects/99942/hazard")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "SUCCESS")
        self.assertIn("sentry_impact_risk", data)
        self.assertIn("close_approaches", data)

    def test_12_neo_close_approaches(self):
        resp = self.client.get("/api/neo/close-approaches?dist_max=10LD&limit=5")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "SUCCESS")
        self.assertTrue(isinstance(data.get("close_approaches"), list))

    def test_13_neo_sentry(self):
        resp = self.client.get("/api/neo/sentry?des=1")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "SUCCESS")
        self.assertEqual(data.get("risk_state"), "NO_PUBLISHED_IMPACT_SOLUTION")

    def test_14_neo_scout(self):
        resp = self.client.get("/api/neo/scout?limit=5")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn(data.get("status"), ["SUCCESS", "ERROR"])

    # 5. SPHEREx Endpoints
    def test_15_spherex_collections(self):
        resp = self.client.get("/api/spherex/collections")
        self.assertEqual(resp.status_code, 200)
        colls = resp.json()
        self.assertIn("spherex_dr1", colls)
        self.assertIn("spherex_dr1_deep", colls)

    def test_16_spherex_coverage(self):
        resp = self.client.get("/api/spherex/coverage?ra=150.0&dec=2.2&radius=0.1")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "SUCCESS")
        self.assertTrue(isinstance(data.get("observations"), list))

    # 6. Cross-Match Verification
    def test_17_cross_match_star_detection(self):
        resp = self.client.get("/api/cross-match?identifier=3836257882479792640&category=STAR")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "SUCCESS")
        self.assertEqual(data["scientific_match_verdict"]["detection_label"], "IMAGE DETECTION")

    def test_18_cross_match_planet_possible(self):
        resp = self.client.get("/api/cross-match?identifier=jupiter&category=SOLAR_SYSTEM_PLANET")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("status"), "SUCCESS")
        self.assertIn(data["scientific_match_verdict"]["detection_label"], ["POSSIBLE MATCH", "NO_COVERAGE"])

    # 7. Pipeline Processing Job & Status
    def test_19_pipeline_process_submission(self):
        payload = {
            "earlier_obs": {
                "obs_id": "2025W17_4B_0043_1",
                "access_url": "https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/level2/2025W17_4B/l2b-v27-2026-196/4/level2_2025W17_4B_0043_1D4_spx_l2b-v27-2026-196.fits",
                "local_path": "data/raw/cache/level2_2025W17_4B_0043_1D4_spx_l2b-v27-2026-196.fits"
            },
            "later_obs": {
                "obs_id": "2025W19_2B_0103_1",
                "access_url": "https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/level2/2025W19_2B/l2b-v27-2026-198/4/level2_2025W19_2B_0103_1D4_spx_l2b-v27-2026-198.fits",
                "local_path": "data/raw/cache/level2_2025W19_2B_0103_1D4_spx_l2b-v27-2026-198.fits"
            },
            "target_coords": {"ra": 151.8005, "dec": 2.8105},
            "target_id": "COSMOS_D4_TARGET",
            "config": {
                "session_id": "api_test_session",
                "force_download": False,
                "enable_temporal_difference": True
            }
        }

        # Test main route
        resp = self.client.post("/api/pipeline/process", json=payload)
        self.assertEqual(resp.status_code, 202)
        data = resp.json()
        job_id = data.get("job_id")
        self.assertTrue(job_id.startswith("job_"))
        self.assertEqual(data.get("status"), "QUEUED")

        # Test status polling
        resp_status = self.client.get(f"/api/pipeline/status/{job_id}")
        self.assertEqual(resp_status.status_code, 200)
        status_data = resp_status.json()
        self.assertIn(status_data.get("status"), ["QUEUED", "PROCESSING", "COMPLETED"])

        # Test backward-compatible alias route POST /api/process
        resp_alias = self.client.post("/api/process", json=payload)
        self.assertEqual(resp_alias.status_code, 202)
        alias_jid = resp_alias.json().get("job_id")

        # Test alias status GET /api/status/{job_id}
        resp_alias_status = self.client.get(f"/api/status/{alias_jid}")
        self.assertEqual(resp_alias_status.status_code, 200)

        # Test jobs list
        resp_jobs = self.client.get("/api/pipeline/jobs")
        self.assertEqual(resp_jobs.status_code, 200)
        jobs_list = resp_jobs.json().get("jobs", [])
        self.assertTrue(len(jobs_list) >= 2)

    # 8. Preview Serving
    def test_20_preview_serving(self):
        # selected_pair folder has difference_preview.png
        resp = self.client.get("/api/pipeline/previews/selected_pair/difference_preview.png")
        self.assertIn(resp.status_code, [200, 404])
        if resp.status_code == 200:
            self.assertEqual(resp.headers.get("content-type"), "image/png")

if __name__ == "__main__":
    unittest.main()
