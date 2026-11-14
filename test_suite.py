from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_and_targets():
    r = client.get("/api/health")
    assert r.status_code == 200 and r.json()["ok"] is True
    assert r.json()["api_version"] == "2.1.0"
    t = client.get("/api/targets")
    assert t.status_code == 200 and t.json()["targets"][0]["id"] == "demo-deepfield-01"


def test_manifest_spectra_and_images():
    m = client.get("/api/targets/demo-deepfield-01")
    assert m.status_code == 200 and m.json()["spectra_available"] is True
    s = client.get("/api/targets/demo-deepfield-01/spectra")
    assert s.status_code == 200 and "flux_mjy" in s.json()
    img = client.get("/static/demo-deepfield-01/earlier.png")
    assert img.status_code == 200


def test_task_specific_compatibility():
    """Verify task-specific compatibility returns machine-readable states and per-check evidence"""
    # 1. Visual blink task
    r_blink = client.get("/api/targets/demo-deepfield-01/compatibility?task=visual_blink")
    assert r_blink.status_code == 200
    data_blink = r_blink.json()
    assert data_blink["status"] in ("COMPARABLE", "COMPARABLE_WITH_WARNINGS")
    assert data_blink["permitted"] is True
    assert len(data_blink["checks"]) >= 2

    # 2. Difference image task
    r_diff = client.get("/api/targets/demo-deepfield-01/compatibility?task=difference_image")
    assert r_diff.status_code == 200
    data_diff = r_diff.json()
    assert data_diff["permitted"] is True
    check_names = [c["name"] for c in data_diff["checks"]]
    assert "wcs_alignment" in check_names
    assert "release_calibration" in check_names


def test_defensible_measurement_with_uncertainty():
    """Verify measurement returns named observable, units, uncertainty budget, and method"""
    r = client.get("/api/targets/demo-deepfield-01/measurement?observable=source_flux_difference")
    assert r.status_code == 200
    m = r.json()
    assert m["observable"] == "source_flux_difference"
    assert m["value"] == 0.32
    assert m["unit"] == "mJy"
    assert m["uncertainty"] == 0.07
    assert m["uncertainty_unit"] == "mJy"
    assert len(m["uncertainty_terms"]) >= 3
    assert "aperture photometry" in m["method"].lower()
    assert m["is_refused"] is False


def test_case_creation_and_evidence_ledger():
    """Verify case creation produces task compatibility, measurement, and structured evidence report"""
    # Create valid case
    payload = {
        "target_id": "demo-deepfield-01",
        "title": "Local flux enhancement in DR1 epoch comparison",
        "task": "difference_image",
        "observations": ["obs-spherex-2026-01", "obs-spherex-2026-06"],
        "what_i_observed": "Subtle localized flux increase in aligned difference image.",
        "possible_explanation": "Candidate transient or variable background source.",
        "uncertainty": "Two epochs only; requires follow-up cadence to rule out detector artefact.",
        "confidence": "low",
    }
    res = client.post("/api/cases", json=payload)
    assert res.status_code == 201
    case_data = res.json()
    case_id = case_data["id"]
    assert case_data["compatibility"]["permitted"] is True
    assert case_data["measurement"]["value"] == 0.32

    # Verify structured evidence report endpoint (Section 10 specification)
    ev_res = client.get(f"/api/cases/{case_id}/evidence")
    assert ev_res.status_code == 200
    ev = ev_res.json()
    assert ev["investigation_id"] == case_id
    assert len(ev["observations_used"]) >= 2
    assert "source_flux_difference" in ev["measurement"]["observable"]
    assert len(ev["plain_language_summary"]) > 20
    assert "candidate variations" in ev["plain_language_summary"]


def test_scientific_refusal_for_unverified_observations():
    """Verify observations not in manifest cause explicit scientific refusal (NOT_COMPARABLE)"""
    bad_payload = {
        "target_id": "demo-deepfield-01",
        "title": "Confirmed discovery of Planet X!",
        "task": "photometry",
        "observations": ["fake-obs-001", "fake-obs-002"],
        "what_i_observed": "Bright dot moved.",
        "possible_explanation": "This is 100% proof of Planet X.",
        "uncertainty": "None.",
        "confidence": "high",
    }
    res = client.post("/api/cases", json=bad_payload)
    assert res.status_code == 201
    bad_case = res.json()
    assert bad_case["compatibility"]["status"] == "NOT_COMPARABLE"
    assert bad_case["compatibility"]["permitted"] is False
    assert bad_case["measurement"]["is_refused"] is True
    assert any("guardrail" in w.lower() for w in bad_case["guardrail_warnings"])


def test_error_contract():
    err = client.get("/api/targets/unknown-target-xyz")
    assert err.status_code == 404 and err.json()["error"]["code"] == "NOT_FOUND"
