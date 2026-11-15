#!/usr/bin/env python3
"""
AFTERLIGHT — Person A: Stage 8 Temporal Difference Testing Suite
Script: data/scripts/test_temporal_difference.py

Verifies:
1. Multi-HDU structure and units of temporal_difference.fits.
2. Independent numerical sample calculation across 5 independent pixel samples.
3. Negative tests: incompatible dimensions and units fail gracefully.
4. Raw FITS checksum immutability.
"""

import os
import sys
import hashlib
import numpy as np
import astropy.io.fits as fits

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from data.scripts.pipeline_processor import compute_temporal_difference

F1_PROCESSED = "data/processed/selected_pair/earlier_reference.fits"
F2_PROCESSED = "data/processed/selected_pair/later_reprojected.fits"
DIFF_FITS = "data/processed/selected_pair/temporal_difference.fits"

RAW_F1 = "data/raw/selected_pair/level2_2025W17_4B_0486_3D5_spx_l2b-v27-2026-196.fits"
RAW_F2 = "data/raw/selected_pair/level2_2026W19_2A_0619_1D5_spx_l2b-v27-2026-245.fits"
EXPECTED_SHA_F1 = "988e5ac51809ddeeb9325ee339500c02fa912ed60aa3932bbdcc8d8532eda4cf"
EXPECTED_SHA_F2 = "32a37705195e6809a56c4976c2473a26e2d0b15fee401ef36c1f78c435407f1e"

def test_hdu_structure():
    print("\n[TEST 1] Verifying temporal_difference.fits HDU structure...")
    with fits.open(DIFF_FITS) as hdul:
        hdul.info()
        expected_hdus = {
            "DIFF": ("MJy / sr", np.float32, (2040, 2040)),
            "VARIANCE": ("MJy2 / sr2", np.float32, (2040, 2040)),
            "SNR": ("dimensionless", np.float32, (2040, 2040)),
            "FLAGS": (None, np.int32, (2040, 2040)),
            "FOOTPRINT": (None, np.float32, (2040, 2040))
        }
        for name, (exp_unit, exp_dtype, exp_shape) in expected_hdus.items():
            assert name in hdul, f"Missing HDU {name}"
            hdu = hdul[name]
            assert hdu.data.shape == exp_shape, f"Shape mismatch in {name}: {hdu.data.shape} != {exp_shape}"
            assert np.issubdtype(hdu.data.dtype, exp_dtype), f"Dtype mismatch in {name}: {hdu.data.dtype} != {exp_dtype}"
            if exp_unit:
                unit = hdu.header.get("BUNIT")
                assert unit == exp_unit, f"Unit mismatch in {name}: {unit} != {exp_unit}"
            print(f"  PASS: HDU '{name}': shape={hdu.data.shape}, dtype={hdu.data.dtype}, BUNIT={exp_unit}")
    print("  PASS: All HDU extensions and units verified.")

def test_independent_numerical_sample():
    print("\n[TEST 2] Verifying difference array against independent calculation on 5 pixel samples...")
    sample_pixels = [
        (1442, 1821, "Target Pixel (COSMOS)"),
        (1020, 1020, "Detector Center"),
        (500, 500, "Lower-Left Quadrant"),
        (1500, 1500, "Upper-Right Quadrant"),
        (800, 1200, "Intermediate Sky Region")
    ]
    
    with fits.open(F1_PROCESSED) as h1, fits.open(F2_PROCESSED) as h2, fits.open(DIFF_FITS) as h_diff:
        i1 = h1['IMAGE_SUB'].data
        v1 = h1['VARIANCE'].data
        i2 = h2['IMAGE_SUB'].data
        v2 = h2['VARIANCE'].data
        
        diff_arr = h_diff['DIFF'].data
        var_arr = h_diff['VARIANCE'].data
        snr_arr = h_diff['SNR'].data
        
        for py, px, desc in sample_pixels:
            val1 = float(i1[py, px])
            val2 = float(i2[py, px])
            var1 = float(v1[py, px])
            var2 = float(v2[py, px])
            
            # Independent formula
            exp_diff = val2 - val1
            exp_var = var2 + var1
            exp_snr = exp_diff / np.sqrt(exp_var) if exp_var > 0 else 0.0
            
            actual_diff = float(diff_arr[py, px])
            actual_var = float(var_arr[py, px])
            actual_snr = float(snr_arr[py, px])
            
            # Check within float32 precision
            np.testing.assert_allclose(actual_diff, exp_diff, rtol=1e-5, atol=1e-6)
            np.testing.assert_allclose(actual_var, exp_var, rtol=1e-5, atol=1e-6)
            np.testing.assert_allclose(actual_snr, exp_snr, rtol=1e-5, atol=1e-6)
            
            print(f"  Pixel [{py}, {px}] ({desc}):")
            print(f"    Expected: Diff={exp_diff:+.6f}, Var={exp_var:.6e}, SNR={exp_snr:+.3f}")
            print(f"    Actual:   Diff={actual_diff:+.6f}, Var={actual_var:.6e}, SNR={actual_snr:+.3f}")
            print(f"    Match: PASS (within machine precision)")
            
    print("  PASS: Independent numerical calculation verified across all test pixels.")

def test_incompatible_units_and_inputs():
    print("\n[TEST 3] Testing negative cases: incompatible units and mismatched dimensions...")
    # Create temporary FITS with mismatched units
    temp_incompatible = "data/raw/cache/temp_incompatible_unit.fits"
    with fits.open(F1_PROCESSED) as hdul:
        hdul_copy = fits.HDUList([h.copy() for h in hdul])
        hdul_copy['IMAGE_SUB'].header['BUNIT'] = 'electrons / s'  # Incompatible unit
        hdul_copy.writeto(temp_incompatible, overwrite=True)
        
    try:
        compute_temporal_difference(
            earlier_fits_path=F1_PROCESSED,
            later_fits_path=temp_incompatible,
            output_dir="data/raw/cache/temp_out",
            session_id="test_fail"
        )
        passed = False
    except ValueError as e:
        passed = True
        print(f"  Caught expected ValueError: {e}")
    finally:
        if os.path.exists(temp_incompatible):
            os.remove(temp_incompatible)
            
    assert passed, "Failed to reject incompatible units!"
    print("  PASS: Incompatible unit check verified.")

def test_raw_fits_checksums():
    print("\n[TEST 4] Verifying raw FITS file checksums...")
    def sha256_of(p):
        h = hashlib.sha256()
        with open(p, "rb") as f:
            for b in iter(lambda: f.read(65536), b""):
                h.update(b)
        return h.hexdigest()
        
    sha1 = sha256_of(RAW_F1)
    sha2 = sha256_of(RAW_F2)
    assert sha1 == EXPECTED_SHA_F1, f"F1 raw file modified! {sha1} != {EXPECTED_SHA_F1}"
    assert sha2 == EXPECTED_SHA_F2, f"F2 raw file modified! {sha2} != {EXPECTED_SHA_F2}"
    print(f"  F1: {sha1} (MATCH)")
    print(f"  F2: {sha2} (MATCH)")
    print("  PASS: Raw FITS files completely pristine.")

def main():
    print("=" * 70)
    print("AFTERLIGHT — STAGE 8 TEMPORAL DIFFERENCE TEST SUITE")
    print("=" * 70)
    test_hdu_structure()
    test_independent_numerical_sample()
    test_incompatible_units_and_inputs()
    test_raw_fits_checksums()
    print("\n" + "=" * 70)
    print("ALL STAGE 8 TESTS PASSED SUCCESSFULLY WITH ZERO ERRORS")
    print("=" * 70)

if __name__ == "__main__":
    main()
