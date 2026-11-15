# AFTERLIGHT — Scientific Demonstration & Evaluation Guide

**Document**: Evaluation Walkthrough & Offline Demo Guide  
**Project**: AFTERLIGHT (NASA SPHEREx Exploration & Scientific Investigation Platform)  
**Author**: Lead Product Architect & Scientific Interface Designer (Team ASTRION)  
**Date**: November 14, 2026  
**Status**: VERIFIED & REPRODUCIBLE  

---

## 1. Demonstration Philosophy

AFTERLIGHT is built with dual-mode operational resilience:
1. **Live Backend Mode**: When the FastAPI service is active, queries are fetched from the live database and NASA/IPAC IRSA pipeline.
2. **Offline Demonstration Mode**: If disconnected from network or backend, the frontend seamlessly engages high-fidelity, verified cached astronomical bundles with explicit visual badges (`DEMO / CACHED ARCHIVE`).

---

## 2. Step-by-Step Evaluator Walkthrough (5-Minute Tour)

### Step 1: Landing Experience (`/`)
- Open the application at root `/`.
- Observe the astronomical typography, high-resolution deep field imagery, mission phase banner, and Cosmos AI natural language search bar.
- Click **"Explore Universe"** or navigate via the top bar to **Explore**.

### Step 2: Target Discovery in Universe Explorer (`/explore`)
- View the catalog of curated SPHEREx deep fields, galaxies, and transient candidates.
- Filter by category (`Deep Field`, `Galaxy`, `Transient Candidate`).
- Click on **SPHEREx Deep Field South (SDFS)** (`/explore/SPX-TGT-SDFS-01`).
- Test the interactive **Astronomical Cutout Viewer**: pan and zoom into the $3.25\,\mu\text{m}$ infrared field. Note the astrometric coordinates in decimal degrees and sexagesimal format.
- Click **"VIEW OBSERVATIONS"** to transition to Phase 3.

### Step 3: Observation Catalogue & Compatibility Engine (`/observations/SPX-TGT-SDFS-01`)
- Review the chronological observation timeline spanning multiple survey passes.
- Inspect the passband selector ($0.75 - 5.00\,\mu\text{m}$).
- Notice the **Pair Quality Indicator**:
  - Selecting two observations with identical or near-identical passbands ($\Delta\lambda = 0.01\,\mu\text{m}$) yields a **GOOD** compatibility score.
- Click **"PROCEED TO TEMPORAL ANALYSIS"** to launch the analysis lab.

### Step 4: Temporal Analysis Lab (`/temporal-analysis/SPX-TGT-SDFS-01`)
- Experience the flagship scientific comparison suite:
  1. **Then / Now Switcher**: Toggle between Epoch T0 (March 2024) and Epoch T1 (September 2024).
  2. **Blink Mode**: Activate the automatic comparator to spot subtle flux shifts via visual persistence of vision. Adjust the blink frequency slider.
  3. **Difference View**: Switch to the PSF-matched difference image showing the extracted $1.87\,\mu\text{Jy}$ residual transient source.
  4. **Synchronized Pan/Zoom**: Drag or zoom either viewport; observe locked astrometric synchronization.
- Click **"EVALUATE SCIENTIFIC EVIDENCE"** in the command toolbar.

### Step 5: Scientific Evidence & Investigation (`/evidence/SPX-TGT-SDFS-01`)
- Inspect quantitative photometry curves, signal-to-noise ratio ($4.2\sigma$), and epistemic uncertainties.
- Review the candidate classification list and alternative hypotheses (e.g. obscured supernova vs. AGB variable).
- Click **"INITIATE FORMAL CASE FILE"** to create an investigation.

### Step 6: Case Authoring & Submission (`/investigations/new` -> `/investigations/:caseId`)
- Enter a title and scientific hypothesis. Select a confidence rating (**MEDIUM** or **HIGH**).
- Submit the case file. Inspect the generated investigation record and test **"EXPORT CASE JSON"** to download the structured scientific manifest.

### Step 7: Advanced Modules
- **Spectral Lab (`/spectral-lab/SPX-TGT-SDFS-01`)**: Explore 96-channel continuous spectroscopy across $0.75 - 5.00\,\mu\text{m}$.
- **Object Intelligence (`/objects`)**: Browse catalogued transient candidates, variable stars, and moving solar system bodies with Gaia DR3 cross-matches.
- **COSMOS AI (`/ai`)**: Ingest contextual research queries with full disclosure of epistemic limitations.
