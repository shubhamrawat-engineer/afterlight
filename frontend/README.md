# AFTERLIGHT — NASA SPHEREx Astronomical Exploration & Scientific Investigation Platform

**Developed by**: Team ASTRION  
**Mission Alignment**: NASA SPHEREx (Spectro-Photometer for the History of the Universe, Epoch of Reionization, and Ices Explorer)  
**Technology Stack**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Oxlint  

---

## 1. Project Overview

**AFTERLIGHT** is an astronomical exploration and scientific investigation platform developed by Team ASTRION. It enables professional researchers, students, and citizen scientists to explore NASA SPHEREx multi-epoch infrared survey data, discover transient candidates and variable stars, conduct high-precision temporal image comparisons, inspect continuous spectrophotometric profiles, and author collaborative scientific case dossiers.

---

## 2. Core Scientific Modules

1. **Homepage & Landing Experience (`/`)**: Mission briefing, visual galaxy assets, live telemetry counters, and natural language search.
2. **Universe Explorer (`/explore`, `/explore/:targetId`)**: Catalog discovery, interactive pan/zoom astronomical cutout viewer, coordinate reference in decimal and sexagesimal formats.
3. **Observation Catalogue (`/observations/:targetId`)**: Multi-epoch chronological observation timelines and passband compatibility engine ($\Delta\lambda$ match scoring).
4. **Temporal Analysis Lab (`/temporal-analysis/:targetId`)**: Flagship comparison workstation featuring Then/Now switching, Blink Mode with frequency tuning, and PSF-matched Difference View.
5. **Scientific Evidence Panel (`/evidence/:targetId`)**: Quantitative photometry, signal-to-noise ratio ($4.2\sigma$), candidate measurement curves, and alternative hypothesis evaluation.
6. **Investigation Management (`/investigations`, `/investigations/new`, `/investigations/:caseId`)**: Formal scientific dossier creation, hypothesis documentation, confidence ratings, and JSON export.
7. **Spectral Analysis Lab (`/spectral-lab/:targetId`)**: Continuous spectrophotometric profiles across 96 channels spanning $0.75 - 5.00\,\mu\text{m}$.
8. **Object Intelligence (`/objects`, `/objects/:objectId`)**: Astrometric tracking, proper motion measurements ($\text{mas/day}$), and Gaia DR3 cross-identifications.
9. **COSMOS AI (`/ai`)**: Context-aware astronomical research assistant bounded by strict scientific safeguards and verified provenance.

---

## 3. Technology Stack & Architecture

- **UI Framework**: React 19.3.1 with StrictMode
- **Type System**: TypeScript ~7.0.2 with strict configuration
- **Build System**: Vite 8.3.8 with route-level dynamic code-splitting (`React.lazy`)
- **Styling**: Tailwind CSS v4 with custom astronomical design tokens
- **Icons**: Lucide React 1.73.0 (granular tree-shaking)
- **Linter**: Oxlint 1.93.0
- **Testing**: Node.js native test runner (`node scripts/run-tests.mjs`)

---

## 4. Getting Started & Installation

### Prerequisites
- **Node.js**: v20+ or v22+ (tested on Node v24.18.0)
- **Package Manager**: npm v10+

### Installation
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
# Backend API Base URL (empty uses relative proxy; set to URL in production)
VITE_API_BASE_URL=

# Platform Brand
VITE_APP_TITLE=AFTERLIGHT — NASA SPHEREx Exploration Platform
```

---

## 5. Development & Verification Commands

```bash
# Start Vite development server (http://localhost:5173)
npm run dev

# Run automated verification test suite
npm run test

# Run Oxlint high-speed linter (0 warnings, 0 errors)
npm run lint

# Compile TypeScript and generate optimized production bundle
npm run build

# Preview the production build locally (http://localhost:4173)
npm run preview
```

---

## 6. Backend Integration & Offline Demonstration

### Live Backend Mode
When connected to the AFTERLIGHT FastAPI service (`afterlight-backend`), the platform dynamically synchronizes with PostgreSQL, runs real-time health checks via `/api/health`, and loads live IRSA archive telemetry.

### Offline Demonstration Mode
If disconnected from the network or backend, AFTERLIGHT automatically engages its **cached astronomical bundle** with clear visual indicators (`DEMO / CACHED ARCHIVE`). Evaluators can test the entire workflow—from discovery to temporal subtraction and case file generation—without an active internet connection.

---

## 7. Known Scientific Limitations

- **Two-Epoch Baseline Boundedness**: Two observation epochs represent apparent linear motion or parallax baseline; they do **not** constitute a 3D Keplerian orbital solution.
- **PSF Difference Artifacts**: Subtle residuals in difference imaging can originate from optical diffraction spikes or slight centroiding jitter.
- **Backend AI Status**: COSMOS AI operates in contextual staging mode, providing verified research prompts and structural specifications while awaiting live backend model gateway deployment.

---

## 8. Technical Documentation Directory

Comprehensive architectural specifications are located in [`frontend/docs/`](file:///c:/Users/Himadri/Desktop/frontend%20nasa/frontend/docs/):
- [`FINAL_PROJECT_AUDIT.md`](file:///c:/Users/Himadri/Desktop/frontend%20nasa/frontend/docs/FINAL_PROJECT_AUDIT.md): Complete module status and technical debt inventory.
- [`RELEASE_READINESS_REPORT.md`](file:///c:/Users/Himadri/Desktop/frontend%20nasa/frontend/docs/RELEASE_READINESS_REPORT.md): Final production readiness assessment across 17 domains.
- [`SCIENTIFIC_VALIDATION_AUDIT.md`](file:///c:/Users/Himadri/Desktop/frontend%20nasa/frontend/docs/SCIENTIFIC_VALIDATION_AUDIT.md): Astrometric, photometric, and spectral verification.
- [`PERFORMANCE_AUDIT.md`](file:///c:/Users/Himadri/Desktop/frontend%20nasa/frontend/docs/PERFORMANCE_AUDIT.md): Bundle optimization, memory, and code-splitting metrics.
- [`SECURITY_AUDIT.md`](file:///c:/Users/Himadri/Desktop/frontend%20nasa/frontend/docs/SECURITY_AUDIT.md): Credential isolation, CSP, and threat assessment.
- [`TESTING_REPORT.md`](file:///c:/Users/Himadri/Desktop/frontend%20nasa/frontend/docs/TESTING_REPORT.md): Automated verification suite execution log.
- [`DEPLOYMENT_GUIDE.md`](file:///c:/Users/Himadri/Desktop/frontend%20nasa/frontend/docs/DEPLOYMENT_GUIDE.md): Vercel, Netlify, and Render deployment blueprint.
- [`DEMO_GUIDE.md`](file:///c:/Users/Himadri/Desktop/frontend%20nasa/frontend/docs/DEMO_GUIDE.md): Step-by-step evaluator walkthrough.
- [`KNOWN_LIMITATIONS.md`](file:///c:/Users/Himadri/Desktop/frontend%20nasa/frontend/docs/KNOWN_LIMITATIONS.md): Transparent boundary disclosures.
- [`AI_BACKEND_REQUIREMENTS.md`](file:///c:/Users/Himadri/Desktop/frontend%20nasa/frontend/docs/AI_BACKEND_REQUIREMENTS.md): Proposed FastAPI AI gateway contract.
