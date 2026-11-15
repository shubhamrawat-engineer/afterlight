# PROPOSED CONTRACT: COSMOS AI Backend Integration Requirements

**Platform**: AFTERLIGHT (NASA SPHEREx Exploration & Scientific Investigation Platform)  
**Team**: Team ASTRION  
**Document Type**: Proposed Backend API Architecture Specification  
**Status**: PROPOSED CONTRACT (Awaiting FastAPI Backend Implementation)  
**Target Backend Service**: FastAPI (`afterlight-backend`)  
**Frontend Consumption Layer**: React 19 + TypeScript + Vite (`frontend/src/features/cosmos-ai/`)  

---

## 1. Executive Summary & Architectural Separation

This document specifies the required FastAPI backend endpoints, data schemas, security boundaries, and streaming mechanisms to support **COSMOS AI**, the astronomical scientific research assistant in AFTERLIGHT.

### Core Architectural Mandates:
1. **Zero Client-Side LLM Connections**: The React frontend must NEVER communicate directly with OpenAI, Anthropic, Google Vertex AI, or any other commercial model provider.
2. **Zero Client Secrets**: No API keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.) may ever be placed in frontend `.env` or bundle assets.
3. **Authoritative Context Ingestion**: When the user asks a question about an observation, comparison, or investigation, the frontend transmits **resource identifiers** (e.g. `target_id`, `observation_id`, `comparison_job_id`). The backend is responsible for querying PostgreSQL/SQLite, retrieving verified FITS headers, astrometry, and flux measurements, and injecting authoritative context into the model prompt.
4. **Deterministic Separation**: COSMOS AI does NOT calculate orbital elements, invent light curve points, or override deterministic WCS or flux subtraction pipelines.

---

## 2. API Endpoint Specifications

### A. AI Health & Capability Probe

- **Method**: `GET`
- **Path**: `/api/ai/status` (fallback `/api/ai/health`)
- **Purpose**: Allows the frontend to check whether the LLM provider gateway is configured and operational before the user submits inquiries.
- **Authentication**: Optional / Public
- **Proposed Response Body (`200 OK`)**:
  ```json
  {
    "status": "healthy",
    "configured": true,
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "streaming_supported": true,
    "max_context_tokens": 16000,
    "rate_limit_rpm": 60
  }
  ```
- **Error Response (`503 Service Unavailable` or `404 Not Found`)**:
  ```json
  {
    "error": {
      "code": "AI_GATEWAY_NOT_CONFIGURED",
      "message": "AI inference gateway is installed but LLM provider credentials are not set."
    }
  }
  ```

---

### B. Contextual Query Ingestion (Non-Streaming)

- **Method**: `POST`
- **Path**: `/api/ai/query`
- **Purpose**: Ingest an astronomical research inquiry with verified context references, validate resource boundaries, retrieve ground-truth data from the database, and return a structured scientific response.
- **Headers**:
  - `Content-Type: application/json`
  - `X-Session-ID`: (Optional client session token for conversation continuity)
- **Proposed Request Body**:
  ```json
  {
    "prompt": "What does the measured flux delta between these two epochs suggest about this source?",
    "context": {
      "type": "temporal",
      "target_id": "SPX-TGT-SDFS-01",
      "comparison_id": "CMP-2026-0881",
      "observation_ids": ["OBS-SPX-2024-0012", "OBS-SPX-2024-0089"],
      "object_id": "SPX-OBJ-SDFS-01"
    },
    "conversation_id": "conv-8f7a-42c1"
  }
  ```

- **Proposed Response Body (`200 OK`)**:
  ```json
  {
    "conversation_id": "conv-8f7a-42c1",
    "message_id": "msg-992a-001",
    "direct_answer": "The 1.87 μJy flux enhancement observed in passband 3.25 μm over a 184-day baseline indicates potential photometric variability consistent with an infrared transient candidate.",
    "observational_evidence": [
      "Target SPX-TGT-SDFS-01 observed in Passband 3.25 μm on 2024-03-12 (T0) and 2024-09-12 (T1).",
      "Point-spread function photometry exhibits a 4.2-sigma excess above background noise.",
      "No spatial displacement detected within the 1.5 arcsec astrometric error circle."
    ],
    "measurements": [
      {
        "parameter": "Flux Delta (ΔS_ν)",
        "value": 1.87,
        "unit": "μJy",
        "uncertainty": 0.22
      },
      {
        "parameter": "Time Baseline (Δt)",
        "value": 184,
        "unit": "days",
        "uncertainty": null
      },
      {
        "parameter": "Astrometric Shift (Δθ)",
        "value": 0.08,
        "unit": "arcsec",
        "uncertainty": 0.15
      }
    ],
    "interpretation": "The data is consistent with either an obscured core-collapse supernova in a background galaxy or a long-period stellar variable (e.g., Mira or asymptotic giant branch star).",
    "limitations": [
      "Two photometric epochs are insufficient to determine a characteristic light-curve periodicity.",
      "Infrared spectrophotometric data across all 96 SPHEREx channels is required to distinguish continuum dust emission from line emission."
    ],
    "source_references": [
      {
        "id": "OBS-SPX-2024-0012",
        "title": "SPHEREx SDFS Primary Scan (Band 3)",
        "type": "observation",
        "internal_route": "/observations/SPX-TGT-SDFS-01"
      },
      {
        "id": "CMP-2026-0881",
        "title": "Dual-Epoch Difference Frame Analysis",
        "type": "comparison",
        "internal_route": "/temporal-analysis/SPX-TGT-SDFS-01"
      },
      {
        "id": "DOC-IRSA-SPX-V1",
        "title": "NASA/IPAC Infrared Science Archive SPHEREx Explanatory Supplement",
        "type": "documentation",
        "reference_url": "https://irsa.ipac.caltech.edu/Missions/spherex.html"
      }
    ]
  }
  ```

---

### C. Server-Sent Events (SSE) Streaming Query Endpoint

- **Method**: `POST`
- **Path**: `/api/ai/query/stream`
- **Purpose**: Provides token-by-token streaming for responsive conversational experiences.
- **Headers**:
  - `Accept: text/event-stream`
- **Streaming Event Structure**:
  ```
  event: metadata
  data: {"conversation_id": "conv-8f7a-42c1", "message_id": "msg-992a-001"}

  event: delta
  data: {"content": "The 1.87 μJy flux enhancement "}

  event: delta
  data: {"content": "indicates potential photometric variability..."}

  event: structured_summary
  data: {"observational_evidence": [...], "measurements": [...], "limitations": [...], "source_references": [...]}

  event: done
  data: {"finish_reason": "stop"}
  ```

---

## 3. Context Reference & Ingestion Rules

When the backend receives an `AIContextReference`, it must execute the following validation pipeline:

```
[Incoming Request]
       │
       ▼
[Validate Resource IDs (target_id, comparison_id, case_id)]
       │
       ├── ID Invalid ──> 404 Entity Not Found
       │
       ▼
[Query Authoritative Database & Pipeline Manifests]
       │
       ├── Extract verified WCS coordinates
       ├── Extract verified UTC epoch timestamps
       ├── Extract calibrated flux metrics and error margins
       │
       ▼
[Assemble Grounded Scientific Prompt with Strict Caveats]
       │
       ▼
[Dispatch to Private LLM Provider Gateway via HTTPS]
```

### Prompt Framing Constraints (Backend Prompt Template):
1. **Never Invent Astronomy**: The system prompt must explicitly state: *"You are COSMOS AI, a scientific assistant assisting professional and student researchers analyzing NASA SPHEREx data. You must never invent physical properties, distances, temperatures, or orbital solutions not present in the verified context."*
2. **State Epistemic Limits**: *"If asked to extrapolate an orbit from two epochs, explicitly clarify that two observations provide only apparent displacement and cannot yield orbital Keplerian elements."*
3. **Cite Real Provenance**: Only cite the actual observation IDs and pipeline algorithms supplied in the context payload.

---

## 4. Rate Limiting & Resource Throttling

To prevent resource exhaustion and manage model API expenditure:
- **Per-IP Rate Limit**: 20 requests per minute for standard queries.
- **Per-Session Rate Limit**: Maximum 50 queries per hour without researcher key authentication.
- **Sliding-Window HTTP Response Codes**:
  - `429 Too Many Requests`:
    ```json
    {
      "error": {
        "code": "AI_RATE_LIMIT_EXCEEDED",
        "message": "Scientific inquiry frequency exceeded. Please pause before dispatching further analysis requests.",
        "retry_after_seconds": 30
      }
    }
    ```

---

## 5. Security & Privacy Audit

1. **Authentication Token Isolation**: The backend stores provider API tokens in server-side environment variables (`LLM_API_KEY`, `LLM_PROVIDER_URL`). They are never returned in JSON responses or headers.
2. **Context Minimization**: Only resource IDs and curated summary telemetry are passed into model context windows. Bulk binary FITS arrays are never serialized into LLM prompts.
3. **Input Sanitization**: User prompt strings are checked for injection attempts and size-capped at 2,000 characters.
