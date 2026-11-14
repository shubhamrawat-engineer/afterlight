import time
import uuid
from collections import defaultdict, deque
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from models import CaseCreate, CaseRecord, ConfidenceLevel
from science_engine import BUNDLE_DIR, CASES_DIR, ScientificAuditor, nasa_client, raise_api_error, storage

app = FastAPI(title="AFTERLIGHT Scientific API", version="2.0.0")

app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_rate_hits: dict[str, deque[float]] = defaultdict(deque)


@app.middleware("http")
async def telemetry_and_rate_limit(request: Request, call_next):
    req_id = uuid.uuid4().hex[:8]
    t0 = time.perf_counter()

    if request.method == "POST" and request.url.path.startswith("/api/cases"):
        ip = request.client.host if request.client else "unknown"
        now = time.time()
        hits = _rate_hits[ip]
        while hits and hits[0] < now - 60:
            hits.popleft()
        if len(hits) >= 25:
            return JSONResponse(
                status_code=429,
                content={"error": {"code": "RATE_LIMITED", "message": "Too many case submissions; wait 60s."}},
                headers={"X-Request-ID": req_id},
            )
        hits.append(now)

    response = await call_next(request)
    response.headers["X-Request-ID"] = req_id
    response.headers["X-Process-Time-Ms"] = f"{(time.perf_counter() - t0) * 1000:.2f}"
    return response


@app.exception_handler(HTTPException)
async def http_err_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})
    return JSONResponse(status_code=exc.status_code, content={"error": {"code": "ERROR", "message": str(exc.detail)}})


@app.exception_handler(RequestValidationError)
async def val_err_handler(request: Request, exc: RequestValidationError):
    msgs = [f"{'.'.join(str(x) for x in e['loc'])}: {e['msg']}" for e in exc.errors()]
    return JSONResponse(
        status_code=422,
        content={"error": {"code": "VALIDATION_ERROR", "message": "Invalid input", "details": msgs}},
    )


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "mode": "hybrid_live_and_cached",
        "stored_cases": len(list(CASES_DIR.glob("case-*.json"))),
        "server_time_utc": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/targets")
def list_targets(kind: Optional[str] = None, status: Optional[str] = None):
    data = storage.read_json(storage.safe_path(BUNDLE_DIR, "index.json"), cache_key="index")
    targets = data.get("targets", [])
    if kind:
        targets = [t for t in targets if str(t.get("kind", "")).lower() == kind.lower()]
    if status:
        targets = [t for t in targets if str(t.get("status", "")).lower() == status.lower()]
    return {"targets": targets, "count": len(targets)}


@app.get("/api/targets/{target_id}")
def get_target_detail(target_id: str):
    manifest_path = storage.safe_path(BUNDLE_DIR, target_id, "manifest.json")
    if not manifest_path.exists():
        raise_api_error(404, "NOT_FOUND", f"Target {target_id} does not exist")
    manifest = storage.read_json(manifest_path, cache_key=f"manifest:{target_id}")
    return {
        **manifest,
        "spectra_available": (BUNDLE_DIR / target_id / "spectra.json").exists(),
        "asset_checksums": storage.image_checksums(target_id),
    }


@app.get("/api/targets/{target_id}/spectra")
def get_target_spectra(target_id: str):
    spectra_path = storage.safe_path(BUNDLE_DIR, target_id, "spectra.json")
    if not spectra_path.exists():
        raise_api_error(404, "NOT_FOUND", f"Spectra for target {target_id} does not exist")
    return storage.read_json(spectra_path, cache_key=f"spectra:{target_id}")


app.mount("/static", StaticFiles(directory=str(BUNDLE_DIR)), name="static")


@app.post("/api/cases", response_model=CaseRecord, status_code=201)
def create_case(payload: CaseCreate):
    manifest_path = storage.safe_path(BUNDLE_DIR, payload.target_id, "manifest.json")
    if not manifest_path.exists():
        raise_api_error(404, "NOT_FOUND", f"Target {payload.target_id} does not exist")

    manifest = storage.read_json(manifest_path, cache_key=f"manifest:{payload.target_id}")
    audit = ScientificAuditor.audit(payload, manifest)

    count = len(list(CASES_DIR.glob("case-*.json"))) + 1
    case_id = f"case-{count:03d}-{uuid.uuid4().hex[:6]}"

    record = CaseRecord(
        id=case_id,
        created_at=datetime.now(timezone.utc).isoformat(),
        target_id=payload.target_id,
        title=payload.title,
        candidate_id=payload.candidate_id,
        observations=payload.observations,
        what_i_observed=payload.what_i_observed,
        possible_explanation=payload.possible_explanation,
        uncertainty=payload.uncertainty,
        confidence=payload.confidence,
        pair_quality=manifest.get("pair_quality"),
        scientific_audit=audit,
    )

    storage.atomic_write_json(CASES_DIR / f"{case_id}.json", record.model_dump())
    return record


@app.get("/api/cases")
def list_cases(
    target_id: Optional[str] = None,
    confidence: Optional[ConfidenceLevel] = None,
    min_rigor: Optional[float] = Query(default=None, ge=0.0, le=100.0),
):
    results = []
    for f in sorted(CASES_DIR.glob("case-*.json"), reverse=True):
        item = storage.read_json(f)
        if target_id and item.get("target_id") != target_id:
            continue
        if confidence and item.get("confidence") != confidence.value:
            continue
        if min_rigor is not None and float(item.get("scientific_audit", {}).get("rigor_score", 0)) < min_rigor:
            continue
        results.append(item)
    return {"cases": results, "count": len(results)}


@app.get("/api/cases/{case_id}")
def get_case(case_id: str):
    case_path = storage.safe_path(CASES_DIR, f"{case_id}.json")
    if not case_path.exists():
        raise_api_error(404, "NOT_FOUND", f"Case {case_id} does not exist")
    return storage.read_json(case_path)


@app.get("/api/cases/{case_id}/export")
def export_case(case_id: str):
    case_path = storage.safe_path(CASES_DIR, f"{case_id}.json")
    if not case_path.exists():
        raise_api_error(404, "NOT_FOUND", f"Case {case_id} does not exist")
    return FileResponse(path=str(case_path), media_type="application/json", filename=f"{case_id}.json")


@app.get("/api/observations")
async def search_nasa_observations(
    ra: float = Query(..., ge=0.0, lt=360.0),
    dec: float = Query(..., ge=-90.0, le=90.0),
    radius: float = Query(default=0.25, gt=0.0, le=5.0),
):
    return await nasa_client.search_spherex(ra=ra, dec=dec, radius=radius)


@app.get("/api/live/sky-cutout")
async def get_live_sky_cutout(
    ra: float = Query(..., ge=0.0, lt=360.0),
    dec: float = Query(..., ge=-90.0, le=90.0),
    survey: str = Query(default="2MASS-K"),
):
    img_path = await nasa_client.fetch_sky_cutout(ra=ra, dec=dec, survey=survey)
    if img_path and img_path.exists():
        return FileResponse(path=str(img_path), media_type="image/png")
    fallback = BUNDLE_DIR / "demo-deepfield-01" / "earlier.png"
    return FileResponse(path=str(fallback), media_type="image/png")


if __name__ == "__main__":
    import uvicorn

    print("\n" + "=" * 60)
    print("  AFTERLIGHT Backend API Server Starting...")
    print("  Documentation: http://localhost:8000/docs (or http://127.0.0.1:8000/docs)")
    print("=" * 60 + "\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

