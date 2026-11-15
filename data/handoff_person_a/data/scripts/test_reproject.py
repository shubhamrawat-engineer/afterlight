import numpy as np
import astropy.io.fits as fits
from astropy.wcs import WCS
from reproject import reproject_interp

f1_path = "data/raw/selected_pair/level2_2025W17_4B_0486_3D5_spx_l2b-v27-2026-196.fits"
f2_path = "data/raw/selected_pair/level2_2026W19_2A_0619_1D5_spx_l2b-v27-2026-245.fits"

with fits.open(f1_path) as h1, fits.open(f2_path) as h2:
    w1 = WCS(h1[1].header)
    w2 = WCS(h2[1].header)
    
    ra_tgt, dec_tgt = 150.1, 2.2
    x1, y1 = w1.world_to_pixel_values(ra_tgt, dec_tgt)
    x2, y2 = w2.world_to_pixel_values(ra_tgt, dec_tgt)
    
    print(f"Target (RA={ra_tgt}, Dec={dec_tgt}):")
    print(f"  F1 pixel (0-indexed): x={x1:.3f}, y={y1:.3f}")
    print(f"  F2 pixel (0-indexed): x={x2:.3f}, y={y2:.3f}")
    
    # Check values at target integer pixel
    ix1, iy1 = int(round(float(x1))), int(round(float(y1)))
    ix2, iy2 = int(round(float(x2))), int(round(float(y2)))
    
    print(f"  F1 at [{iy1}, {ix1}]: IMAGE={h1[1].data[iy1, ix1]:.5f}, ZODI={h1[4].data[iy1, ix1]:.5f}, SUB={h1[1].data[iy1, ix1]-h1[4].data[iy1, ix1]:.5f}, FLAGS={h1[2].data[iy1, ix1]}")
    print(f"  F2 at [{iy2}, {ix2}]: IMAGE={h2[1].data[iy2, ix2]:.5f}, ZODI={h2[4].data[iy2, ix2]:.5f}, SUB={h2[1].data[iy2, ix2]-h2[4].data[iy2, ix2]:.5f}, FLAGS={h2[2].data[iy2, ix2]}")
    
    # Test reprojection of small test or full frame
    print("Testing reproject_interp of F2 IMAGE onto F1 WCS...")
    f2_reproj, footprint = reproject_interp((h2[1].data, w2), w1, shape_out=h1[1].data.shape)
    print(f"Reprojected shape: {f2_reproj.shape}")
    print(f"Footprint valid pixels: {np.sum(footprint == 1.0)} / {footprint.size} ({np.sum(footprint == 1.0)/footprint.size*100:.2f}%)")
    print(f"F2 reprojected at F1 target pixel [{iy1}, {ix1}]: {f2_reproj[iy1, ix1]:.5f}")
