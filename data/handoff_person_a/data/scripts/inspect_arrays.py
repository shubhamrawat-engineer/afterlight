import os
import json
import numpy as np
import astropy.io.fits as fits
from astropy.wcs import WCS

f1_path = "data/raw/selected_pair/level2_2025W17_4B_0486_3D5_spx_l2b-v27-2026-196.fits"
f2_path = "data/raw/selected_pair/level2_2026W19_2A_0619_1D5_spx_l2b-v27-2026-245.fits"

for name, path in [("F1 (Earlier)", f1_path), ("F2 (Later)", f2_path)]:
    print(f"==================== {name} ====================")
    with fits.open(path) as hdul:
        hdul.info()
        for idx in range(len(hdul)):
            hdu = hdul[idx]
            hdr = hdu.header
            dtype = hdu.data.dtype if hdu.data is not None else None
            shape = hdu.data.shape if hdu.data is not None else None
            bunit = hdr.get("BUNIT", "N/A")
            print(f"HDU {idx} [{hdu.name}]: shape={shape}, dtype={dtype}, BUNIT={bunit}")
            if hdu.data is not None and isinstance(hdu.data, np.ndarray) and hdu.data.ndim == 2:
                valid = np.isfinite(hdu.data)
                print(f"   min={np.nanmin(hdu.data):.5f}, max={np.nanmax(hdu.data):.5f}, mean={np.nanmean(hdu.data):.5f}, median={np.nanmedian(hdu.data):.5f}, finite={np.sum(valid)}/{hdu.data.size}")

print("Done inspection.")
