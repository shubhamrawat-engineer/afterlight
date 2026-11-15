import os, sys, re, json
import numpy as np
from astropy.wcs import WCS
from astropy.io import fits
import pyvo

IRSA_SIA2_URL = "https://irsa.ipac.caltech.edu/SIA?"
svc = pyvo.dal.SIA2Service(IRSA_SIA2_URL)

dr1_res = svc.search(pos=(150.1, 2.2, 0.08), collection="spherex_dr1")
qr3_res = svc.search(pos=(150.1, 2.2, 0.08), collection="spherex_qr3")

print(f"Loaded {len(dr1_res)} DR1 and {len(qr3_res)} QR3.")

# Check all pairs in QR3 vs DR1 that cover RA=150.1, Dec=2.2
# Look for same detector and close spatial pointing
target_ra, target_dec = 150.1, 2.2

# Let's inspect QR3 products
qr3_list = []
for r in qr3_res:
    url = str(r.get("access_url"))
    qr3_list.append({
        "obs_id": str(r.get("obs_id")),
        "access_url": url,
        "filename": os.path.basename(url),
        "s_ra": float(r.get("s_ra")),
        "s_dec": float(r.get("s_dec")),
        "t_min": float(r.get("t_min"))
    })

print("QR3 products available:")
for q in qr3_list:
    print(f"  {q['filename']} (Center: {q['s_ra']:.3f}, {q['s_dec']:.3f})")

# Look at DR1 products that have center within 0.1 deg of each QR3 product
candidates = []
for q in qr3_list:
    # extract detector e.g. 1D5 -> D5
    m_q = re.search(r'_(\d)D(\d)_', q["filename"])
    det_q = int(m_q.group(2)) if m_q else None
    dith_q = int(m_q.group(1)) if m_q else None
    
    for d in dr1_res:
        url_d = str(d.get("access_url"))
        fn_d = os.path.basename(url_d)
        m_d = re.search(r'_(\d)D(\d)_', fn_d)
        det_d = int(m_d.group(2)) if m_d else None
        dith_d = int(m_d.group(1)) if m_d else None
        
        if det_d == det_q:
            ra_d = float(d.get("s_ra"))
            dec_d = float(d.get("s_dec"))
            # Separation between pointing centers
            dist = np.hypot(ra_d - q["s_ra"], dec_d - q["s_dec"])
            if dist < 0.05: # within 3 arcmin pointing
                candidates.append({
                    "earlier_obs_id": str(d.get("obs_id")),
                    "earlier_url": url_d,
                    "earlier_fn": fn_d,
                    "later_obs_id": q["obs_id"],
                    "later_url": q["access_url"],
                    "later_fn": q["filename"],
                    "detector": det_q,
                    "dither_earlier": dith_d,
                    "dither_later": dith_q,
                    "pointing_dist_deg": dist,
                    "pointing_dist_arcsec": dist * 3600
                })

print(f"\nFound {len(candidates)} close-pointing candidate pairs:")
for c in candidates:
    print(f"  Det D{c['detector']}: {c['earlier_fn']} vs {c['later_fn']} (Pointing offset: {c['pointing_dist_arcsec']:.1f} arcsec)")
