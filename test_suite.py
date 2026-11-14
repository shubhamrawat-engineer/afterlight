from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_and_targets():
    r = client.get("/api/health")
    assert r.status_code == 200 and r.json()["ok"] is True
    t = client.get("/api/targets")
    assert t.status_code == 200 and t.json()["targets"][0]["id"] == "demo-deepfield-01"


def test_manifest_spectra_and_images():
    m = client.get("/api/targets/demo-deepfield-01")
    assert m.status_code == 200 and m.json()["spectra_available"] is True
    s = client.get("/api/targets/demo-deepfield-01/spectra")
    assert s.status_code == 200 and "flux_mjy" in s.json()
    img = client.get("/static/demo-deepfield-01/earlier.png")
    assert img.status_code == 200


def test_scientific_audit_guardrails():
    good = client.post("/api/cases", json={
        "target_id": "demo-deepfield-01",
        "title": "Candidate IR brightness change in epoch pair",
        "observations": ["obs-spherex-2026-01", "obs-spherex-2026-06"],
        "what_i_observed": "Subtle localized flux increase in aligned difference image.",
        "possible_explanation": "Candidate transient or variable background source.",
        "uncertainty": "Two epochs only; requires follow-up cadence to rule out detector artefact.",
        "confidence": "low"
    })
    assert good.status_code == 201 and good.json()["scientific_audit"]["rigor_score"] == 100.0

    bad = client.post("/api/cases", json={
        "target_id": "demo-deepfield-01",
        "title": "Confirmed discovery of Planet X!",
        "observations": ["fake-1", "fake-2"],
        "what_i_observed": "Bright dot moved.",
        "possible_explanation": "This is 100% proof of Planet X.",
        "uncertainty": "None.",
        "confidence": "high"
    })
    assert bad.status_code == 201 and bad.json()["scientific_audit"]["rigor_score"] < 50.0


def test_error_contract():
    err = client.get("/api/targets/unknown-target-xyz")
    assert err.status_code == 404 and err.json()["error"]["code"] == "NOT_FOUND"
