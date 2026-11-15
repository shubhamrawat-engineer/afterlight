# AFTERLIGHT — API Integration Map & Contract Inventory

**Project**: AFTERLIGHT (NASA SPHEREx Exploration Platform)  
**Team**: Team ASTRION  
**Document Type**: Architectural API Inventory & Integration Blueprint  
**Status**: DRAFT / INTEGRATION AUDIT IN PROGRESS  
**Target Backend**: FastAPI Python Service (`afterlight-backend`)  
**Frontend Consumption Layer**: React 19 + TypeScript + Vite (`frontend`)  

---

## 1. Architectural Overview & Integration Model

The AFTERLIGHT platform strictly segregates astronomical data ingestion, WCS registration, FITS header processing, and flux subtraction (FastAPI scientific backend) from presentation and interactive investigation (React frontend).

```
   ┌─────────────────────────────────────────────────────────┐
   │                    USER BROWSER / CLIENT                │
   │           AFTERLIGHT React + TypeScript Application     │
   └───────────────────────────▲─────────────────────────────┘
                               │ JSON / REST (VITE_API_BASE_URL)
   ┌───────────────────────────▼─────────────────────────────┐
   │                 AFTERLIGHT FASTAPI BACKEND              │
   │  ┌────────────────────┐   ┌──────────────────────────┐  │
   │  │   FastAPI Router   │   │  Sliding-Window Rate Lim │  │
   │  └─────────▲──────────┘   └────────────▲─────────────┘  │
   │            │                           │                │
   │  ┌─────────▼──────────┐   ┌────────────▼─────────────┐  │
   │  │ SQL Database Model │   │   Science Engine         │  │
   │  │ (Postgres/SQLite)  │   │   (WCS, Flux Δ, Scoring) │  │
   │  └─────────▲──────────┘   └────────────▲─────────────┘  │
   │            │                           │                │
   │  ┌─────────▼──────────┐   ┌────────────▼─────────────┐  │
   │  │ IRSA SIAv2 Client  │   │  Hybrid Storage          │  │
   │  │ (Async FITS Fetch) │   │  (Atomic Local / AWS S3) │  │
   │  └────────────────────┘   └──────────────────────────┘  │
   └─────────────────────────────────────────────────────────┘
```

### Strict Architectural Boundaries
1. **Zero Direct External Calls**: The frontend NEVER connects directly to NASA, IPAC, IRSA, or SIAv2 endpoints.
2. **Zero FITS Processing in Browser**: The frontend never parses binary FITS files; the backend delivers derived scientific assets (PNG/JPEG/WebP) and JSON telemetry.
3. **Canonical Error Structure**:
   ```json
   {
     "error": {
       "code": "ERROR_CODE_STRING",
       "message": "Human-readable description of scientific or request failure"
     }
   }
   ```

---

## 2. API Endpoint Inventory

### Category A: System Health & Configuration

#### A.1 Service Health Probe
- **HTTP Method**: `GET`
- **URL Path**: `/api/health` (fallback: `/health`)
- **Status**: `CONTRACT-DEFINED (AUDIT PENDING LIVE BACKEND REPO)`
- **Purpose**: Verify backend API responsiveness, database connectivity, and storage layer status.
- **Request Parameters**: None
- **Request Body**: None
- **Authentication**: None (Public)
- **Response Structure**:
  ```json
  {
    "status": "healthy",
    "database": "connected",
    "storage": "local",
    "version": "1.0.0",
    "uptime_seconds": 1420
  }
  ```
- **Error Responses**:
  - `503 Service Unavailable`: Database or critical storage subsystem failure.
- **Frontend Module**: `src/hooks/useBackendHealth.ts`, `src/components/layout/Navbar.tsx`

---

### Category B: Sky Region & Target Discovery

#### B.1 Target Index Listing
- **HTTP Method**: `GET`
- **URL Path**: `/api/targets`
- **Status**: `CONTRACT-DEFINED (AUDIT PENDING LIVE BACKEND REPO)`
- **Purpose**: Retrieve the curated catalog of SPHEREx observation targets with summary metadata.
- **Request Parameters**:
  - `kind` (optional, query): `galaxy | deep_field | high_proper_motion | nebula | calibration | test`
  - `status` (optional, query): `VERIFIED | PROVISIONAL | ARCHIVED`
  - `limit` (optional, query, default: 50)
  - `offset` (optional, query, default: 0)
- **Request Body**: None
- **Authentication**: None
- **Response Structure**:
  ```json
  {
    "total": 6,
    "targets": [
      {
        "id": "spherex-deep-field-south",
        "title": "SPHEREx Deep Field South (SDFS)",
        "kind": "deep_field",
        "status": "VERIFIED",
        "preview_image": "/assets/targets/sdfs-preview.png",
        "ra_deg": 64.95,
        "dec_deg": -64.15,
        "observation_count": 2,
        "pair_quality_grade": "GOOD",
        "epoch_baseline_days": 182.4
      }
    ]
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid filter parameter.
  - `429 Rate Limited`: Excessive discovery requests.
- **Frontend Module**: `src/features/explorer/services/explorer-service.ts`, `UniverseExplorer` (`/explore`)

#### B.2 Individual Target Manifest
- **HTTP Method**: `GET`
- **URL Path**: `/api/targets/{id}`
- **Status**: `CONTRACT-DEFINED (AUDIT PENDING LIVE BACKEND REPO)`
- **Purpose**: Retrieve full astrometric, geometrical, multi-epoch observation records, and difference metadata for a single target.
- **Request Parameters**:
  - `id` (path, string): Unique slug/identifier of target (e.g., `spherex-deep-field-south`).
- **Request Body**: None
- **Authentication**: None
- **Response Structure**:
  ```json
  {
    "id": "spherex-deep-field-south",
    "title": "SPHEREx Deep Field South (SDFS)",
    "kind": "deep_field",
    "status": "VERIFIED",
    "preview_image": "/assets/targets/sdfs-preview.png",
    "thumbnail": "/assets/targets/sdfs-thumb.png",
    "region": {
      "ra_center_deg": 64.95,
      "dec_center_deg": -64.15,
      "radius_deg": 0.5,
      "fov_deg_x": 0.5,
      "fov_deg_y": 0.5,
      "coordinate_frame": "ICRS (J2000)"
    },
    "observations": [
      {
        "observation_id": "SPHEREX-L3-DFS-2025-06-A",
        "obs_time_utc": "2025-06-15T08:22:14Z",
        "central_wavelength_um": 2.42,
        "wavelength_range_um": "2.40 - 2.44",
        "product_type": "SPHEREx L3 Spectral Mosaic",
        "data_release": "SPHEREx Early Release 1",
        "units": "MJy/sr",
        "detector": "Band 2 Array",
        "role": "earlier",
        "image": "/assets/observations/sdfs-2025-06.png"
      },
      {
        "observation_id": "SPHEREX-L3-DFS-2025-12-B",
        "obs_time_utc": "2025-12-14T19:40:02Z",
        "central_wavelength_um": 2.43,
        "wavelength_range_um": "2.41 - 2.45",
        "product_type": "SPHEREx L3 Spectral Mosaic",
        "data_release": "SPHEREx Public Data Release 1",
        "units": "MJy/sr",
        "detector": "Band 2 Array",
        "role": "later",
        "image": "/assets/observations/sdfs-2025-12.png"
      }
    ],
    "pair_quality": {
      "grade": "GOOD",
      "wavelength_diff_um": 0.01,
      "wavelength_diff_pct": 0.41,
      "time_baseline_days": 182.47,
      "registration_rms_arcsec": 0.04,
      "notes": "Optimal multi-epoch comparison pair."
    },
    "difference": {
      "image": "/assets/differences/sdfs-diff.png",
      "method": "OPTIMAL_PSF_CONVOLUTION_SUBTRACTION",
      "method_description": "Cross-epoch point-spread function matched convolution with spatial flux scaling.",
      "masked_flags_applied": ["EDGE_FLAGS", "SATURATION_SPIKES"],
      "limitations": "Edge boundaries masked due to dither coverage roll-off."
    }
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Target ID does not exist in the scientific archive.
- **Frontend Module**: `src/features/explorer/pages/TargetDetailPage.tsx`, `src/features/observations/pages/ObservationCataloguePage.tsx`, `src/features/temporal-analysis/pages/TemporalAnalysisPage.tsx`

---

### Category C: Observation Discovery & Metadata

#### C.1 Observation Catalogue Query
- **HTTP Method**: `GET`
- **URL Path**: `/api/targets/{id}/observations`
- **Status**: `PLANNED / EMBEDDED IN TARGET MANIFEST`
- **Purpose**: Explicit sub-resource query for observation passes of a specific sky region.
- **Request Parameters**:
  - `id` (path): Target identifier.
  - `band` (optional, query): Filter by SPHEREx spectral band (`1` to `6`).
- **Response Structure**: Array of `ObservationRecord`.
- **Frontend Module**: `src/features/observations/services/observation-service.ts`

---

### Category D: Comparison Creation & Status

#### D.1 Submit Comparison Job
- **HTTP Method**: `POST`
- **URL Path**: `/api/comparisons`
- **Status**: `CONTRACT-DEFINED (AUDIT PENDING LIVE BACKEND REPO)`
- **Purpose**: Request asynchronous PSF convolution, WCS alignment, and flux difference map generation between two observation epochs.
- **Request Body**:
  ```json
  {
    "target_id": "spherex-deep-field-south",
    "earlier_observation_id": "SPHEREX-L3-DFS-2025-06-A",
    "later_observation_id": "SPHEREX-L3-DFS-2025-12-B",
    "subtraction_algorithm": "OPTIMAL_PSF_CONVOLUTION",
    "apply_quality_mask": true
  }
  ```
- **Response Structure (202 Accepted)**:
  ```json
  {
    "job_id": "cmp-8f92a10c",
    "target_id": "spherex-deep-field-south",
    "status": "QUEUED",
    "created_at_utc": "2026-11-14T14:00:00Z",
    "estimated_seconds": 12
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Incompatible observations (e.g. invalid IDs).
  - `422 Unprocessable Entity`: Passband mismatch unacceptable for comparison.
- **Frontend Module**: `src/features/temporal-analysis/services/temporal-analysis-service.ts`

#### D.2 Query Comparison Job Status
- **HTTP Method**: `GET`
- **URL Path**: `/api/comparisons/{job_id}`
- **Status**: `CONTRACT-DEFINED (AUDIT PENDING LIVE BACKEND REPO)`
- **Purpose**: Poll asynchronous processing state of a temporal comparison.
- **Response Structure**:
  ```json
  {
    "job_id": "cmp-8f92a10c",
    "status": "COMPLETED | RUNNING | QUEUED | FAILED",
    "progress_pct": 100,
    "result": {
      "difference_image_url": "/api/storage/assets/diff-8f92a10c.png",
      "pair_quality_grade": "GOOD",
      "registration_rms_arcsec": 0.04,
      "method": "OPTIMAL_PSF_CONVOLUTION_SUBTRACTION",
      "completed_at_utc": "2026-11-14T14:00:11Z"
    },
    "error": null
  }
  ```
- **Frontend Module**: `src/features/temporal-analysis/hooks/useTemporalAnalysis.ts`

---

### Category E: Scientific Comparison Results

#### E.1 Direct Target Comparison Metadata
- **HTTP Method**: `GET`
- **URL Path**: `/api/targets/{id}/comparison`
- **Status**: `AVAILABLE / SYNCHRONOUSLY DELIVERED IN MANIFEST`
- **Purpose**: Retrieve the pre-computed canonical comparison pair and difference assets.
- **Frontend Module**: `src/features/temporal-analysis/pages/TemporalAnalysisPage.tsx`

---

### Category F: Derived Images & Storage Assets

#### F.1 Asset Delivery
- **HTTP Method**: `GET`
- **URL Path**: `/static/{path}` or `/api/storage/assets/{id}` (or S3 Presigned URLs)
- **Status**: `CONTRACT-DEFINED`
- **Purpose**: Serve derived preview images, observation frames, and difference maps.
- **Frontend Module**: `resolveImageUrl()` in `src/features/explorer/services/explorer-service.ts`

---

### Category G: Investigation & Case Management

#### G.1 List Investigation Cases
- **HTTP Method**: `GET`
- **URL Path**: `/api/investigations`
- **Status**: `PLANNED (PHASE 7)`
- **Purpose**: Retrieve open and closed scientific investigation dossiers.

#### G.2 Create Investigation Case
- **HTTP Method**: `POST`
- **URL Path**: `/api/investigations`
- **Status**: `PLANNED (PHASE 7)`
- **Purpose**: Save temporal analysis observations, candidate transients, and notes into a persistent research case.

---

### Category H: Additional Capabilities (Cosmos AI & Spectral Lab)

#### H.1 Cosmos AI Query
- **HTTP Method**: `POST`
- **URL Path**: `/api/ai/query`
- **Status**: `PLANNED (PHASE 8)`
- **Purpose**: Natural-language astronomical querying over SPHEREx targets and astrophysical metadata.

---

## 3. Integration Audit Status

| Subsystem | Audit Status | Blocking Reason | Action Required |
|---|---|---|---|
| **Frontend HTTP Client** | **COMPLIANT** | None | Full support for GET/POST/PUT/PATCH/DELETE, timeouts, rate-limiting, and error schemas. |
| **Error Handling Layer** | **COMPLIANT** | None | Standard `{ error: { code, message } }` parser with 422, 429 Retry-After, and 500 mapping. |
| **Explorer Services** | **COMPLIANT** | Backend server offline | Gracefully falls back to documented mock fixtures until live backend is reachable. |
| **Temporal Services** | **COMPLIANT** | Backend server offline | Consumes verified difference metadata and locks Phase 5 for POOR pairs. |
| **Live FastAPI Repo Audit** | **BLOCKED** | Directory `afterlight-backend/` not present in workspace | Backend repository must be added to workspace or hosted endpoint provided. |
| **Runtime OpenAPI Validation** | **BLOCKED** | FastAPI process not running | Backend must be launched (`uvicorn app.main:app --port 8000`) to retrieve `/openapi.json`. |
