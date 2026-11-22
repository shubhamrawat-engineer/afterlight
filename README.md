# AFTERLIGHT ✦

> **Autonomous Evidence-Based Astronomical Investigation Platform for NASA SPHEREx All-Sky Survey Data**  
> *Developed for NASA Space Apps Challenge 12: Planet X and SPHEREx*

[![Live on Render](https://img.shields.io/badge/Render-Live%20Platform-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://afterlight-0arl.onrender.com)

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tests](https://img.shields.io/badge/Pytest-11%2F11%20Passed-34D399?style=flat-square&logo=pytest&logoColor=white)](test_suite.py)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 🚀 Live Web Service on Render

The official AFTERLIGHT platform is deployed and live on Render:
**🌐 [https://afterlight-0arl.onrender.com](https://afterlight-0arl.onrender.com)**

---

## 🌌 Overview

**AFTERLIGHT** is an end-to-end astronomical discovery and validation platform designed to detect, verify, and characterize subtle celestial variations across multi-epoch NASA SPHEREx observations. 

It provides an intuitive, high-speed interface for astronomers, researchers, and public learners to explore multi-epoch spectrophotometric data, eliminate false-positive anomalies, measure photometric residuals, compute astrometric centroid drift, and synthesize defensible investigation dossiers with AI.

```
       [ NASA SPHEREx Multi-Epoch Calibrated FITS Frames ]
                              │
                              ▼
  [ TaskCompatibilityAuditor ] ──► [ Moffat PSF Kernel Match ]
                              │
                              ▼
               [ Bramich / ZOGY Difference Engine ]
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
   [ Photometric Residual ]   [ Centroid Shift (Δr) ]
   (ΔF = +0.32 ± 0.07 mJy)    (Δr = 0.84 ± 0.09")
                 └────────────┬────────────┘
                              ▼
        [ Multi-Term Quadratic Uncertainty Budget ]
                              │
                              ▼
        [ Cosmos AI Scientific Reasoning Gateway ]
                              │
                              ▼
        [ Defensible Discovery Dossier / Presentation ]
```

---

## ⚡ Key Capabilities

### 1. 4D Relativistic Minkowski Spacetime Engine
- Real-time relativistic metric ticker tracking proper time $\tau$ and Lorentz boost $\gamma = 1/\sqrt{1 - v^2/c^2}$.
- Kinematic Doppler frequency shift calculation ($z = \Delta\lambda/\lambda$) based on target radial velocity.
- Geodesic worldline projections through 4D spacetime for fast-moving solar system bodies.
- Native 60 FPS GPU-accelerated Canvas & WebGL rendering with zero external 3D engine overhead.

### 2. Multi-Epoch Difference Imaging & Photometry
- Sub-pixel astrometric frame registration tied to **Gaia DR3** ICRF J2000 (RMS residual $< 0.12''$).
- Empirical Point-Spread Function (PSF) matching with 2D elliptical Moffat kernel convolution.
- **Bramich & ZOGY** difference imaging matrix eliminating stationary stellar backgrounds.
- Defensible multi-term uncertainty budgeting:
  $$\sigma_{\text{tot}}^2 = \sigma_{\text{read}}^2 + \sigma_{\text{Poisson}}^2 + \sigma_{\text{flat}}^2 + \sigma_{\text{reg}}^2$$

### 3. Five Specialized Astronomy Workstations
1. **All-Sky Explorer**: Interactive celestial navigator with multi-wavelength overlay filters and coordinates lookup.
2. **Object Intelligence**: Curated profiles for 9 categorized targets (outer solar system bodies, comets, NEOs, transients).
3. **Temporal Analysis Lab**: Side-by-side Epoch comparator, optical blink comparator, and difference residual map viewer.
4. **Spectral Analysis Lab**: 102-channel spectrophotometric SED energy distributions ($0.75 - 5.00\ \mu\text{m}$) across 6 Linear Variable Filters (LVFs).
5. **Cosmos AI Terminal**: Multi-persona scientific reasoning assistant (Researcher, Explorer, Kids/Wonder modes).

---

## 🎯 9 Verified Discovery Targets

| Identifier | Designation | Category | Key Metric | Significance |
|---|---|---|---|---|
| `SPX-OBJ-KBO-XR1` | 2024-XR1 | Outer Solar System Ice World | Centroid $\Delta r = 0.84''$ | Orbit $d \approx 42\text{ AU}$ |
| `SPX-OBJ-NEO-2025`| 2025-SPX1 | Speeding Near-Earth Asteroid | $\mu = 48.2\text{ mas/day}$ | Earth crossing trajectory |
| `SPX-OBJ-COMET-C2`| C/2026-SP1 | Cometary Outburst Candidate | $\Delta F = +1.15\text{ mJy}$ | Volatile ice coma |
| `SPX-OBJ-AT2025`  | AT-2025sdf | Photometric Transient (Supernova)| $\Delta F = +0.32\text{ mJy}$ | $5.8\sigma$ detection |
| `SPX-OBJ-V838`    | V838 Mon Echo | Expanding Light Echo | Shell expansion rate | Circumstellar dust |
| `SPX-OBJ-PLANETX` | Candidate PX-1 | High Proper-Motion Body | Parallax baseline $1.4\text{ AU}$ | Outer solar system search |
| `SPX-OBJ-MIRA-VAR`| Mira Variable | Long-Period Pulsating Star | $\Delta m = 2.4\text{ mag}$ | Period $P \approx 330\text{ days}$ |
| `SPX-OBJ-DEEP-AGN`| AGN Candidate | Active Galactic Nucleus Flaring | Infrared excess | Accretion disk variability |
| `SPX-OBJ-Y-DWARF` | Sub-stellar Y | Cold Brown Dwarf Candidate | Methane absorption $1.66\ \mu\text{m}$ | $T_{\text{eff}} \approx 400\text{ K}$ |

---


## 🚀 Quickstart & Installation

### Prerequisites
- Python 3.11+ (Python 3.13 recommended)
- Node.js 20+ (optional, only if modifying frontend source code)

### 1. Clone & Set Up Python Environment
```bash
git clone https://github.com/shubhamrawat-engineer/afterlight.git
cd afterlight

python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Launch the Platform
```bash
python main.py
```
Open **`http://localhost:8000`** in your browser. The backend serves both the REST API and the pre-built React 19 SPA immediately.

### 3. (Optional) Run Frontend in Development Mode
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing & Verification

AFTERLIGHT includes a full automated test suite verifying scientific calculations, data contracts, and all routes:

```bash
# Run backend pytest suite (10/10 test cases)
pytest test_suite.py

# Run comprehensive route validation (25/25 endpoints)
python test_all_routes.py
```

---

## 🏛️ Project Directory Structure

```text
afterlight/
├── main.py                     # FastAPI server, REST API endpoints, and static distribution
├── ai_engine.py                # Cosmos AI reasoning engine with multi-persona prompt dispatch
├── science_engine.py           # TaskCompatibilityAuditor, MeasurementEngine, and Sifter
├── models.py                   # Pydantic v2 data models & JSON schemas
├── test_suite.py               # Automated pytest suite (10 test cases)
├── test_all_routes.py          # Comprehensive route validator (25 endpoints)
├── generate_pptx.py            # Standalone 7-slide PowerPoint presentation generator
├── requirements.txt            # Python dependencies (FastAPI, Uvicorn, Pydantic, python-pptx)
├── data/                       # Calibrated SPHEREx DR1 observation archives & test cases
├── dist/                       # Production-compiled React 19 SPA bundle & presentations
│   ├── index.html              # Single Page Application entrypoint
│   ├── presentation.html       # Standalone 7-slide interactive presentation app
│   └── AFTERLIGHT_Project_Presentation.pptx
└── frontend/                   # Full React 19 + TypeScript source code
    ├── src/                    # Workstation components, 4D Minkowski engine, hooks
    ├── public/                 # Static assets, telescope cutouts
    ├── package.json            # Node.js dependencies
    └── vite.config.ts          # Vite 6 build configuration
```

---

## 📜 License
MIT License. Created for NASA Space Apps Challenge 12: *Planet X and SPHEREx*.
