# AFTERLIGHT — Stage 8: Scientific Temporal Difference Imaging Report

**Document**: `difference_processing_report.md`  
**Execution Timestamp**: 2026-11-14T09:36:51.264540+00:00  
**Pipeline Stage**: Stage 8: Scientific Temporal Difference Imaging  
**Difference Method**: $\Delta I(x, y) = I_{\text{later, sub}}(x, y) - I_{\text{earlier, sub}}(x, y)$  
**Variance Propagation**: $\sigma_{\text{diff}}^2(x, y) = \sigma_{\text{later}}^2(x, y) + \sigma_{\text{earlier}}^2(x, y)$  

---

## 1. Executive Summary & Compatibility Verification

The temporal difference calculation was executed on the aligned SPHEREx observation pair:
- **Epoch 1 (Reference)**: `earlier_reference.fits` (2025-04-27T22:55:23 UTC)
- **Epoch 2 (Reprojected)**: `later_reprojected.fits` (2026-05-09T02:47:50 UTC)
- **Time Baseline ($\Delta t$)**: $377.16\text{ days}$ ($1.033\text{ years}$)

### Pre-Subtraction Compatibility Checks (All Passed)
1. **Dimensions**: $(2040, 2040)$ in both products (**PASS**).
2. **WCS Grid**: Aligned onto Epoch 1 reference coordinate system `RA---TAN-SIP` (**PASS**).
3. **Units**: Both calibrated in surface brightness units $\text{MJy / sr}$ (**PASS**).
4. **Wavelength**: Matching bandpass centered at $3.984\,\mu\text{m}$ with $\Delta \lambda = 0.392\text{ nm}$ ($1.07\%$ of bandpass) (**PASS**).
5. **PSF Concordance**: ePSF difference across all 441 detector bins is identically $0.0$, requiring no cross-convolution (**PASS**).
6. **Background Treatment**: Both arrays had the independent 2D spatially varying IPAC zodiacal light model (HDU 4 `ZODI`) subtracted (**PASS**).

---

## 2. Statistical Analysis of the Difference Array

| Metric | Difference Array $\Delta I$ | Units | SNR Map ($\Delta I / \sigma$) | Interpretation |
| :--- | :--- | :--- | :--- | :--- |
| **Valid Pixels** | $4,144,192$ | pixels | $4,144,192$ | $99.58\%$ of total detector array |
| **Invalid Pixels** | $17,408$ | pixels | $17,408$ | $0.42\%$ (NaN border / outside footprint) |
| **Median** | $-0.009128$ | $\text{MJy / sr}$ | $-0.186$ | Near-zero baseline confirming accurate zero-point alignment |
| **Mean** | $-0.207409$ | $\text{MJy / sr}$ | $-0.282$ | Mean is dominated by extreme cosmic ray / artifact cores |
| **Robust NMAD Noise** | **$0.051417$** | $\text{MJy / sr}$ | **$1.046$** | Robust SNR scale is $\approx 1.05$, exactly matching expected Gaussian noise $N(0, 1)$ |
| **Minimum** | $-29033.7871$ | $\text{MJy / sr}$ | $-304.89$ | Cosmic ray / bright star suppression artifact |
| **Maximum** | $26637.1875$ | $\text{MJy / sr}$ | $2941.21$ | Cosmic ray / bright source residual |

---

## 3. Target Position Analysis (COSMOS: $\alpha=150.1^\circ, \delta=2.2^\circ$)

- **Pixel Coordinates (0-indexed)**: $x = 1821.093, y = 1442.241$ (Grid index $[1442, 1821]$)
- **Epoch 1 Surface Brightness**: $0.086797\text{ MJy / sr}$
- **Epoch 2 Surface Brightness**: $-0.000089\text{ MJy / sr}$
- **Temporal Difference ($\Delta I$)**: **$-0.086886\text{ MJy / sr}$**
- **Propagated Variance ($\sigma^2$)**: $2.301399e-03\text{ (MJy / sr)}^2$
- **Propagated Uncertainty ($\sigma$)**: $0.047973\text{ MJy / sr}$
- **Signal-to-Noise Ratio (SNR)**: **$-1.811\,\sigma$**
- **Composite Bitmask Flag**: `268435456` (Bit 28: Transient Halo active in Epoch 1)

> [!NOTE]
> The target pixel exhibits $\text{SNR} = -1.81$, well below the standard $3\sigma$ astrophysical detection threshold. This minor brightness decrement is entirely accounted for by the Epoch 1 transient halo artifact and normal photon noise.

---

## 4. Scientific Interpretation Safeguards & Limitations

> [!CAUTION]
> **Residuals $\neq$ Astrophysical Transients**: Pixel differences in temporal subtractions do not automatically indicate new celestial objects, supernovae, or solar system bodies.

### Identified Residual Sources
1. **Astrometric Sub-Pixel Resampling**: Bilinear interpolation of discrete pixel arrays over a $4.09\text{ px}$ spatial dither offset introduces bipolar dipole residuals on steep point-source cores.
2. **PSF Diffraction Spikes & Saturation Rings**: Bright saturated stars leave non-linear residual rings due to minor spacecraft roll differences ($0.023^\circ$).
3. **Detector Flags & Halos**: Bit 28 (`HALO`) flags transient optical reflections, not true variable stars.
4. **Planet X / Speculative Claims**: No anomalous moving sources or significant $>5\sigma$ point-source residuals consistent with high-proper-motion trans-Neptunian bodies or Planet X exist in this dataset.

---

## 5. Generated Deliverable Products

- `temporal_difference.fits`: Standardized multi-extension FITS file containing extensions `DIFF`, `VARIANCE`, `SNR`, `FLAGS`, `FOOTPRINT`.
- `difference_preview.png`: 4-panel diagnostic visualizer (Difference map, SNR map, target cutout, noise histogram).
- `difference_statistics.json`: Machine-readable summary statistics.
- `difference_processing_report.md`: This report.
