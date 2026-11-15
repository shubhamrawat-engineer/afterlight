from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_all_routes():
    # 1. API Endpoints
    api_routes = [
        "/api/health",
        "/api/targets",
        "/api/targets/demo-deepfield-01",
        "/api/targets/demo-deepfield-01/spectra",
        "/api/targets/demo-deepfield-01/compatibility?task=visual_blink",
        "/api/targets/demo-deepfield-01/compatibility?task=difference_image",
        "/api/targets/demo-deepfield-01/measurement?observable=source_flux_difference",
        "/api/targets/demo-deepfield-01/evidence",
        "/api/objects",
        "/api/cases",
        "/api/ai/status",
        "/api/nasa/sync-status",
    ]
    for route in api_routes:
        res = client.get(route)
        assert res.status_code == 200, f"Route {route} failed with {res.status_code}: {res.text}"
        print(f"[API OK] {route} -> status 200")

    # 2. Frontend SPA Routes (HTML serving)
    frontend_routes = [
        "/",
        "/explore",
        "/explore/spherex-deep-field-north",
        "/observations/spherex-deep-field-north",
        "/compatibility/spherex-deep-field-north",
        "/temporal-analysis/spherex-deep-field-north",
        "/evidence/spherex-deep-field-north",
        "/spectral-lab/demo-deepfield-01",
        "/objects",
        "/objects/kbo-2024-xr1",
        "/investigations",
        "/investigations/new",
        "/ai",
    ]
    for route in frontend_routes:
        res = client.get(route)
        assert res.status_code == 200, f"Frontend route {route} failed with {res.status_code}"
        assert "<!doctype html>" in res.text.lower() or "<html" in res.text.lower(), f"Route {route} did not return HTML"
        print(f"[FRONTEND OK] {route} -> status 200")

    # 3. Static assets
    asset_routes = [
        "/assets/index-Caqz24Pb.js",
        "/assets/index-DENrO33d.css",
        "/favicon.svg",
    ]
    for route in asset_routes:
        res = client.get(route)
        assert res.status_code == 200, f"Asset {route} failed with {res.status_code}"
        print(f"[ASSET OK] {route} -> status 200")

if __name__ == "__main__":
    test_all_routes()
    print("\nAll routes and assets verified successfully!")
