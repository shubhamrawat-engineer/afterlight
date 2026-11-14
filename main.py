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

from models import (
    CaseCreate,
    CaseRecord,
    CompatibilityReport,
    ConfidenceLevel,
    EvidenceReport,
    MeasurementResult,
    TaskType,
)
from science_engine import (
    BUNDLE_DIR,
    CASES_DIR,
    DeterministicExplainer,
    ScientificMeasurementEngine,
    TaskCompatibilityAuditor,
    nasa_client,
    raise_api_error,
    storage,
)

app = FastAPI(
    title="AFTERLIGHT Scientific API",
    description="Evidence-Based Investigation of Change in SPHEREx Observations (v2.1)",
    version="2.1.0",
)

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
        "api_version": "2.1.0",
        "compliance": "AFTERLIGHT Evidence-Based Investigation v2.1",
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


@app.get("/api/targets/{target_id}/compatibility", response_model=CompatibilityReport)
def get_target_compatibility(
    target_id: str,
    task: TaskType = Query(default=TaskType.DIFFERENCE_IMAGE, description="The intended operation"),
):
    """
    Task-Specific Compatibility Assessment (Section D / v2.1)
    Determines whether observations are compatible for visual_blink, difference_image, photometry, etc.
    Returns per-check status, evidence used, and permitted status.
    """
    manifest_path = storage.safe_path(BUNDLE_DIR, target_id, "manifest.json")
    if not manifest_path.exists():
        raise_api_error(404, "NOT_FOUND", f"Target {target_id} does not exist")
    manifest = storage.read_json(manifest_path, cache_key=f"manifest:{target_id}")

    # Extract observation IDs from manifest
    obs_meta = manifest.get("observations", [])
    obs_ids = []
    if isinstance(obs_meta, list):
        obs_ids = [str(o.get("id")) for o in obs_meta if isinstance(o, dict) and "id" in o]
    elif isinstance(obs_meta, dict):
        obs_ids = [str(o.get("observation_id")) for o in obs_meta.values() if isinstance(o, dict) and "observation_id" in o]

    return TaskCompatibilityAuditor.evaluate(manifest=manifest, selected_observation_ids=obs_ids, task=task)


@app.get("/api/targets/{target_id}/measurement", response_model=MeasurementResult)
def get_target_measurement(
    target_id: str,
    task: TaskType = Query(default=TaskType.PHOTOMETRY, description="The intended operation"),
    observable: str = Query(default="source_flux_difference", description="Observable to measure"),
):
    """
    Measurement Result with Complete Uncertainty Budget (Section C / 4.4 / v2.1)
    Returns explicit observable, units, uncertainty, uncertainty terms, quality flags, and method.
    """
    manifest_path = storage.safe_path(BUNDLE_DIR, target_id, "manifest.json")
    if not manifest_path.exists():
        raise_api_error(404, "NOT_FOUND", f"Target {target_id} does not exist")
    manifest = storage.read_json(manifest_path, cache_key=f"manifest:{target_id}")

    # Extract observation IDs
    obs_meta = manifest.get("observations", [])
    obs_ids = []
    if isinstance(obs_meta, list):
        obs_ids = [str(o.get("id")) for o in obs_meta if isinstance(o, dict) and "id" in o]
    elif isinstance(obs_meta, dict):
        obs_ids = [str(o.get("observation_id")) for o in obs_meta.values() if isinstance(o, dict) and "observation_id" in o]

    compat = TaskCompatibilityAuditor.evaluate(manifest=manifest, selected_observation_ids=obs_ids, task=task)
    return ScientificMeasurementEngine.compute(manifest=manifest, compatibility=compat, target_id=target_id, observable=observable)


app.mount("/static", StaticFiles(directory=str(BUNDLE_DIR)), name="static")


@app.post("/api/cases", response_model=CaseRecord, status_code=201)
def create_case(payload: CaseCreate):
    """
    Save an Investigation Case (Evidence Ledger v2.1)
    Evaluates task-specific compatibility, calculates defensible measurement with uncertainty budget,
    verifies scientific restraint guardrails, and stores atomic case record.
    """
    manifest_path = storage.safe_path(BUNDLE_DIR, payload.target_id, "manifest.json")
    if not manifest_path.exists():
        raise_api_error(404, "NOT_FOUND", f"Target {payload.target_id} does not exist")

    manifest = storage.read_json(manifest_path, cache_key=f"manifest:{payload.target_id}")

    # 1. Run Task-Specific Compatibility Assessment
    compatibility = TaskCompatibilityAuditor.evaluate(
        manifest=manifest,
        selected_observation_ids=payload.observations,
        task=payload.task,
    )

    # 2. Compute Defensible Measurement
    measurement = ScientificMeasurementEngine.compute(
        manifest=manifest,
        compatibility=compatibility,
        target_id=payload.target_id,
        observable="source_flux_difference",
    )

    # 3. Scientific Restraint Guardrail Scan
    guardrail_warnings: List[str] = []
    text_blob = f"{payload.title} {payload.what_i_observed} {payload.possible_explanation}".lower()
    for kw in TaskCompatibilityAuditor.OVERCLAIM_TERMS:
        if kw in text_blob:
            guardrail_warnings.append(
                f"Scientific guardrail notice ({kw}): Measured difference is a candidate change, not confirmation of an astrophysical object."
            )

    if payload.confidence == ConfidenceLevel.HIGH and compatibility.status != "COMPARABLE":
        guardrail_warnings.append("High confidence claimed on an observation pair with compatibility caveats.")

    # 4. Generate Case ID & Record
    count = len(list(CASES_DIR.glob("case-*.json"))) + 1
    case_id = f"case-{count:03d}-{uuid.uuid4().hex[:6]}"

    record = CaseRecord(
        id=case_id,
        created_at=datetime.now(timezone.utc).isoformat(),
        target_id=payload.target_id,
        title=payload.title,
        candidate_id=payload.candidate_id,
        task=payload.task,
        observations=payload.observations,
        what_i_observed=payload.what_i_observed,
        possible_explanation=payload.possible_explanation,
        uncertainty=payload.uncertainty,
        confidence=payload.confidence,
        pair_quality=manifest.get("pair_quality"),
        compatibility=compatibility,
        measurement=measurement,
        guardrail_warnings=guardrail_warnings,
        limitations=measurement.limitations,
        provenance={
            "pipeline_version": "AFTERLIGHT_v2.1",
            "archive_source": "NASA/IPAC Infrared Science Archive (IRSA)",
            "processing_standard": "AstroPy/WCS normalized difference v2.1",
        },
    )

    storage.atomic_write_json(CASES_DIR / f"{case_id}.json", record.model_dump())
    return record


@app.get("/api/cases")
def list_cases(
    target_id: Optional[str] = None,
    confidence: Optional[ConfidenceLevel] = None,
    task: Optional[TaskType] = None,
):
    results = []
    for f in sorted(CASES_DIR.glob("case-*.json"), reverse=True):
        item = storage.read_json(f)
        if target_id and item.get("target_id") != target_id:
            continue
        if confidence and item.get("confidence") != confidence.value:
            continue
        if task and item.get("task") != task.value:
            continue
        results.append(item)
    return {"cases": results, "count": len(results)}


@app.get("/api/cases/{case_id}")
def get_case(case_id: str):
    case_path = storage.safe_path(CASES_DIR, f"{case_id}.json")
    if not case_path.exists():
        raise_api_error(404, "NOT_FOUND", f"Case {case_id} does not exist")
    return storage.read_json(case_path)


@app.get("/api/cases/{case_id}/evidence", response_model=EvidenceReport)
def get_case_evidence_report(case_id: str):
    """
    Evidence Report Specification (Section 10 / v2.1)
    Returns structured, traceable evidence ledger linking observations, compatibility,
    measurements, uncertainty budget, warnings, limitations, and deterministic summary.
    """
    case_path = storage.safe_path(CASES_DIR, f"{case_id}.json")
    if not case_path.exists():
        raise_api_error(404, "NOT_FOUND", f"Case {case_id} does not exist")
    case_data = storage.read_json(case_path)

    target_id = case_data.get("target_id")
    manifest = storage.read_json(storage.safe_path(BUNDLE_DIR, target_id, "manifest.json"))

    obs_records = []
    known_obs = manifest.get("observations", [])
    if isinstance(known_obs, list):
        obs_records = known_obs
    elif isinstance(known_obs, dict):
        obs_records = list(known_obs.values())

    compatibility = CompatibilityReport(**case_data["compatibility"])
    measurement = MeasurementResult(**case_data["measurement"])
    guardrail_warnings = case_data.get("guardrail_warnings", [])

    plain_summary = DeterministicExplainer.generate(
        target_title=manifest.get("title", target_id),
        compatibility=compatibility,
        measurement=measurement,
        guardrail_warnings=guardrail_warnings,
    )

    return EvidenceReport(
        investigation_id=case_id,
        target_id=target_id,
        title=case_data.get("title", ""),
        created_at=case_data.get("created_at", ""),
        task=TaskType(case_data.get("task", "difference_image")),
        observations_used=obs_records,
        compatibility=compatibility,
        measurement=measurement,
        guardrail_warnings=guardrail_warnings,
        limitations=case_data.get("limitations", []),
        plain_language_summary=plain_summary,
        provenance=case_data.get("provenance", {}),
    )


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
    print("  AFTERLIGHT Backend API Server Starting (v2.1)...")
    print("  Documentation: http://localhost:8000/docs (or http://127.0.0.1:8000/docs)")
    print("=" * 60 + "\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
