# AFTERLIGHT — Pipeline Engine Integration Guide for Backend (Person B)

**Document**: `data/scripts/PIPELINE_INTEGRATION_GUIDE.md`  
**Author**: Person A (SPHEREx Astronomical Data Pipeline)  
**Module**: `data/scripts/pipeline_processor.py`  
**Target Audience**: Person B (Backend Engineer)  
**Date**: 2026-11-14  
**Pipeline Version**: `2.0-modular`  

---

## 1. Overview & Purpose

The `pipeline_processor.py` module encapsulates the end-to-end scientific validation, background treatment, and astrometric reprojection workflow for SPHEREx Level-2b observation pairs. It is designed to be directly imported and invoked by Person B's backend service (e.g. inside a FastAPI background task or worker queue) when a user triggers temporal analysis via `POST /api/process`.

### Key Capabilities
- **On-Demand & Cached FITS Retrieval**: Downloads FITS products from IRSA URLs on-demand, or reuses local cached files if already verified.
- **Scientific Header Compatibility**: Verifies detector matching, wavelength concordance ($\Delta \lambda < 5\%$ of bandpass), roll angle difference, and ePSF model identicalness before attempting numerical operations.
- **2D Zodiacal Background Subtraction**: Subtracts the 2D spatially varying zodiacal light model from HDU 4 (`ZODI`), eliminating seasonal interplanetary foreground gradients.
- **WCS Reprojection**: Registers the later observation onto the earlier observation's reference WCS grid using `reproject.reproject_interp`.
- **Integrity Preservation**: Quality flags (HDU 2 `FLAGS`) are preserved through nearest-neighbor interpolation to prevent fractional bit-corruption; NaN/uncovered pixels are tracked via boolean footprint masks rather than replaced with zeroes.

---

## 2. Dependencies & Environment

The module executes in the AFTERLIGHT Python virtual environment (`.venv`). Ensure the following packages are installed:

```bash
astropy>=8.0.0
numpy>=2.0.0
scipy>=1.15.0
matplotlib>=3.10.0
reproject>=0.21.0
requests>=2.32.0
certifi>=2025.0.0
```

---

## 3. Function Signature & Parameters

```python
from data.scripts.pipeline_processor import process_observation_pair

result = process_observation_pair(
    earlier_obs_id: str,
    later_obs_id: str,
    earlier_access_url: str,
    later_access_url: str,
    target_id: str = "COSMOS",
    target_coords: Optional[Dict[str, float]] = None,
    config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]
```

### Parameter Specification

| Parameter | Type | Required? | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `earlier_obs_id` | `str` | **Yes** | — | Unique observation ID of the earlier epoch (e.g., `'2025W17_4B_0486_3'`). |
| `later_obs_id` | `str` | **Yes** | — | Unique observation ID of the later epoch (e.g., `'2026W19_2A_0619_1'`). |
| `earlier_access_url` | `str` | **Yes** | — | Official IRSA archive direct download URL for the earlier Level-2b FITS product. |
| `later_access_url` | `str` | **Yes** | — | Official IRSA archive direct download URL for the later Level-2b FITS product. |
| `target_id` | `str` | No | `"COSMOS"` | Identifier or name of the target field or source. |
| `target_coords` | `dict` | No | `{"ra": 150.1, "dec": 2.2}` | Target coordinates in ICRS degrees: `{"ra": float, "dec": float}`. Used for cutout centering and wavelength calibration lookup. |
| `config` | `dict` | No | `{}` | Optional execution overrides (see below). |

### Optional Configuration Keys (`config`)
- `session_id` (`str`): Unique identifier for the user session (defaults to `session_{timestamp}`).
- `output_dir` (`str`): Destination directory for processed files (defaults to `data/processed/sessions/{session_id}`).
- `cache_dirs` (`list[str]`): List of folders to check for cached raw FITS before downloading (defaults to `["data/raw/cache", "data/raw/selected_pair"]`).
- `force_download` (`bool`): Set to `True` to bypass cache and re-download from IRSA (defaults to `False`).

---

## 4. Return Data Contract

The function returns a Python dictionary with consistent schema across all executions.

### Successful Return Schema (`status == "SUCCESS"`)

```json
{
  "status": "SUCCESS",
  "session_id": "session_1731576200",
  "earlier_obs_id": "2025W17_4B_0486_3",
  "later_obs_id": "2026W19_2A_0619_1",
  "input_checksums": {
    "earlier_sha256": "988e5ac51809ddeeb9325ee339500c02fa912ed60aa3932bbdcc8d8532eda4cf",
    "later_sha256": "32a37705195e6809a56c4976c2473a26e2d0b15fee401ef36c1f78c435407f1e",
    "earlier_source": "CACHED",
    "later_source": "LIVE_ARCHIVE"
  },
  "validation_results": {
    "validation_verdict": "SCIENTIFICALLY_VERIFIED",
    "all_criteria_passed": true,
    "detector": {
      "f1_detector": 5,
      "f2_detector": 5,
      "pass": true
    },
    "wavelength": {
      "f1_wavelength_um": 3.9839,
      "f2_wavelength_um": 3.98351,
      "f1_fwhm_um": 0.03651,
      "f2_fwhm_um": 0.0365,
      "delta_nm": 0.392,
      "percent_of_bandpass": 1.07,
      "pass": true
    },
    "roll_angle": {
      "f1_roll_deg": 243.321,
      "f2_roll_deg": 243.298,
      "delta_deg": 0.023,
      "pass": true
    },
    "psf_model": {
      "max_epsf_diff": 0.0,
      "identical": true,
      "convolution_required": false
    },
    "target_alignment": {
      "f1_pixel": [1821.093, 1442.241],
      "f2_pixel": [1817.123, 1443.224],
      "pixel_separation": 4.09
    }
  },
  "output_file_paths": {
    "earlier_reference_fits": "/abs/path/to/data/processed/sessions/session_id/earlier_reference.fits",
    "later_reprojected_fits": "/abs/path/to/data/processed/sessions/session_id/later_reprojected.fits",
    "earlier_aligned_preview_png": "/abs/path/to/data/processed/sessions/session_id/earlier_aligned.png",
    "later_aligned_preview_png": "/abs/path/to/data/processed/sessions/session_id/later_aligned.png",
    "alignment_preview_diagnostic_png": "/abs/path/to/data/processed/sessions/session_id/alignment_preview.png",
    "temporal_difference_fits": "/abs/path/to/data/processed/sessions/session_id/temporal_difference.fits",
    "difference_preview_png": "/abs/path/to/data/processed/sessions/session_id/difference_preview.png",
    "difference_statistics_json": "/abs/path/to/data/processed/sessions/session_id/difference_statistics.json",
    "difference_processing_report_md": "/abs/path/to/data/processed/sessions/session_id/difference_processing_report.md"
  },
  "image_dimensions": [2040, 2040],
  "wcs_info": {
    "projection": "RA---TAN-SIP",
    "reference_epoch": "earlier",
    "target_ra": 150.1,
    "target_dec": 2.2
  },
  "units": {
    "surface_brightness": "MJy / sr",
    "variance": "MJy2 / sr2"
  },
  "valid_overlap_statistics": {
    "total_pixels": 4161600,
    "full_overlap_pixels": 4145656,
    "full_overlap_percent": 99.616878,
    "uncovered_pixels": 15944,
    "target_in_overlap": true
  },
  "difference_statistics": {
    "units": "MJy / sr",
    "valid_pixels": 4144192,
    "invalid_pixels": 17408,
    "median": -0.009128,
    "mean": -0.207409,
    "nmad_robust_sigma": 0.051417,
    "snr_nmad": 1.046,
    "target_snr": -1.811
  },
  "processing_report_path": "/abs/path/to/data/processed/sessions/session_id/processing_report.json",
  "difference_report_path": "/abs/path/to/data/processed/sessions/session_id/difference_processing_report.md",
  "warnings": [],
  "errors": [],
  "elapsed_seconds": 34.03
}
```

---

## 5. Processing Status Values & Error Handling

The returned dictionary always contains a top-level `"status"` field with one of the following values:

| Status Value | Meaning | Action for Person B / API Response |
| :--- | :--- | :--- |
| `"SUCCESS"` | Full retrieval, validation, 2D zodi subtraction, and reprojection succeeded. | Return HTTP 200 with result payload and output preview links. |
| `"FAILED"` | Operation halted due to scientific incompatibility, network retrieval timeout, or corrupted FITS. | Return HTTP 400 or 502 with the contents of the `"errors"` list. |
| `"INCOMPLETE"` | Background task cancelled or partial files written. | Check task logs and clean up temporary scratch directory. |

### Error Recovery
If `status == "FAILED"`, the function guarantees that:
- It **never crashes with an unhandled exception**; errors are caught and returned in the structured `"errors"` list.
- Incompatible images (e.g. mismatched detectors) are **never subtracted or reprojected**.
- Partially downloaded files (`.downloading`) are automatically unlinked and cleaned up.

---

## 6. Output Files & Extensions

The multi-extension FITS products generated in `output_file_paths` contain standard HDU layouts:

- `earlier_reference.fits`:
  - `HDU 0`: Primary Header
  - `HDU 1 (IMAGE)`: Calibrated total surface brightness ($\text{MJy/sr}$)
  - `HDU 2 (IMAGE_SUB)`: Background-subtracted science image ($\text{MJy/sr}$)
  - `HDU 3 (FLAGS)`: Discrete integer bitmask flags
  - `HDU 4 (VARIANCE)`: Propagated variance array ($(\text{MJy/sr})^2$)
  - `HDU 5 (ZODI)`: 2D zodiacal background model ($\text{MJy/sr}$)
  - `HDU 6 (FOOTPRINT)`: Binary valid overlap mask ($1.0$ valid, $0.0$ invalid)

- `later_reprojected.fits`:
  - Contains identical HDU structure resampled onto the earlier epoch's WCS grid.

- `temporal_difference.fits`:
  - `HDU 0`: Primary Header
  - `HDU 1 (DIFF)`: Background-subtracted surface brightness difference $\Delta I = I_{\text{later, sub}} - I_{\text{earlier, sub}}$ ($\text{MJy / sr}$)
  - `HDU 2 (VARIANCE)`: Propagated uncertainty variance $\text{Var}_{\text{diff}} = \text{Var}_{\text{later}} + \text{Var}_{\text{earlier}}$ ($(\text{MJy / sr})^2$)
  - `HDU 3 (SNR)`: Signal-to-Noise Ratio $\text{SNR} = \Delta I / \sqrt{\text{Var}_{\text{diff}}}$ (dimensionless)
  - `HDU 4 (FLAGS)`: Composite bitmask flags ($\text{FLAGS}_{\text{later}} \mid \text{FLAGS}_{\text{earlier}}$, bit 29 set for invalid pixels)
  - `HDU 5 (FOOTPRINT)`: Binary valid overlap mask ($1.0$ valid, $0.0$ invalid)

---

## 7. FastAPI Example Implementation (for Person B)

```python
# backend/routers/process.py
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict

from data.scripts.pipeline_processor import process_observation_pair

router = APIRouter(prefix="/api", tags=["pipeline"])

class ProcessRequest(BaseModel):
    earlier_obs_id: str
    later_obs_id: str
    earlier_access_url: str
    later_access_url: str
    target_id: Optional[str] = "COSMOS"
    target_coords: Optional[Dict[str, float]] = {"ra": 150.1, "dec": 2.2}
    session_id: Optional[str] = None

@router.post("/process")
async def trigger_pipeline(req: ProcessRequest):
    session_id = req.session_id or f"session_{req.earlier_obs_id}_{req.later_obs_id}"
    config = {
        "session_id": session_id,
        "output_dir": f"data/processed/sessions/{session_id}",
        "cache_dirs": ["data/raw/cache", "data/raw/selected_pair"]
    }
    
    # Run processing (or dispatch to Celery / asyncio background worker)
    result = process_observation_pair(
        earlier_obs_id=req.earlier_obs_id,
        later_obs_id=req.later_obs_id,
        earlier_access_url=req.earlier_access_url,
        later_access_url=req.later_access_url,
        target_id=req.target_id,
        target_coords=req.target_coords,
        config=config
    )
    
    if result["status"] == "FAILED":
        raise HTTPException(status_code=400, detail={"errors": result["errors"], "validation": result.get("validation_results")})
        
    return result
```
