# AFTERLIGHT — Known Technical & Scientific Limitations

**Document**: System Limitations & Epistemic Boundaries  
**Project**: AFTERLIGHT (NASA SPHEREx Exploration & Scientific Investigation Platform)  
**Author**: Principal Software Architect (Team ASTRION)  
**Date**: November 14, 2026  
**Status**: VERIFIED & DOCUMENTED  

---

## 1. Scientific & Astrometric Limitations

1. **Two-Epoch Motion Boundedness**:
   - Two observation epochs separated in time provide only linear apparent angular shift or parallax baseline.
   - AFTERLIGHT intentionally **does not** compute or display 3D Keplerian orbital elements from two images, as doing so without multi-epoch orbit fitting is unphysical.
2. **Differential Photometric Subtraction**:
   - Difference frames are derived using PSF matching (Alard-Lupton method). Residual flux can occasionally arise from optical diffraction spikes or slight centroiding jitter rather than astrophysical variability.
3. **Spectrophotometric Resolution**:
   - SPHEREx provides low-resolution linear variable filter spectroscopy ($R \sim 40 - 130$). Fine atomic emission line hyperfine splitting cannot be resolved; profiles indicate broad molecular bands (e.g. $\text{H}_2\text{O}$ ice, $\text{CO}_2$, PAH features).

---

## 2. Backend & Architectural Limitations

1. **Backend LLM Provider Inference Gateway**:
   - The current FastAPI backend has not yet implemented the proposed `/api/ai/query` endpoint or configured API provider credentials.
   - Consequently, COSMOS AI operates in contextual staging mode, presenting verified research prompts and structural specifications while awaiting live backend model gateway deployment.
2. **Investigation Case Persistence**:
   - New investigations created in the UI persist reliably within client browser session storage and can be exported as structured JSON manifests. Writing to PostgreSQL requires a live connection to the backend `/api/cases` endpoint.
3. **Real-Time FITS Stream Processing**:
   - The browser presentation tier does not decode multi-gigabyte binary FITS files; it relies on the backend scientific pipeline to render calibrated WCS cutouts (WebP/PNG/JPEG) and JSON telemetry vectors.

---

## 3. Browser & Network Considerations

1. **Offline Mode Image Resolution**:
   - High-resolution deep field cutouts in offline mode use bundled local asset representations. Connecting to a live backend provides expanded multi-scale image tiles.
2. **Hardware Acceleration**:
   - The synchronized pan/zoom viewport and Blink Mode perform optimally on devices with GPU hardware acceleration enabled.
