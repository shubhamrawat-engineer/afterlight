#!/usr/bin/env python3
"""
AFTERLIGHT - Person A: SPHEREx Astronomical Data Pipeline
Stage 4: FITS Header Validation - Download Script

Downloads the two selected SPHEREx FITS files from the official IRSA archive URLs
into data/raw/selected_pair/, preserving original filenames, recording timestamps,
source URLs, and validating FITS integrity.
"""

import os
import sys
import json
import time
import hashlib
from datetime import datetime, timezone
import requests
import certifi
from astropy.io import fits

PAIR_URLS = {
    "earlier": "https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/level2/2025W17_4B/l2b-v27-2026-196/5/level2_2025W17_4B_0486_3D5_spx_l2b-v27-2026-196.fits",
    "later": "https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/level2/2026W19_2A/l2b-v27-2026-245/5/level2_2026W19_2A_0619_1D5_spx_l2b-v27-2026-245.fits"
}

OUTPUT_DIR = "data/raw/selected_pair"


def download_file(url: str, dest_path: str) -> dict:
    print(f"\nInitiating download:")
    print(f"  URL : {url}")
    print(f"  Dest: {dest_path}")
    
    start_time = datetime.now(timezone.utc)
    t0 = time.time()
    
    headers = {"User-Agent": "AFTERLIGHT-Pipeline/1.0 (SPHEREx Research; Person A)"}
    
    # Use requests with certifi CA bundle
    with requests.get(url, headers=headers, stream=True, verify=certifi.where(), timeout=60) as resp:
        resp.raise_for_status()
        total_len = resp.headers.get("Content-Length")
        total_bytes = int(total_len) if total_len else None
        downloaded = 0
        chunk_size = 1024 * 1024  # 1 MB
        
        with open(dest_path, "wb") as out_f:
            for chunk in resp.iter_content(chunk_size=chunk_size):
                if chunk:
                    out_f.write(chunk)
                    downloaded += len(chunk)
                    if total_bytes:
                        pct = (downloaded / total_bytes) * 100
                        sys.stdout.write(f"\r  Progress: {downloaded / 1024 / 1024:.2f} MB / {total_bytes / 1024 / 1024:.2f} MB ({pct:.1f}%)")
                    else:
                        sys.stdout.write(f"\r  Progress: {downloaded / 1024 / 1024:.2f} MB")
                    sys.stdout.flush()
            
    elapsed = time.time() - t0
    end_time = datetime.now(timezone.utc)
    print(f"\n  Completed in {elapsed:.2f}s ({downloaded / 1024 / 1024 / max(elapsed, 0.01):.2f} MB/s)")
    
    # Calculate checksum
    md5 = hashlib.md5()
    sha256 = hashlib.sha256()
    with open(dest_path, "rb") as f:
        for block in iter(lambda: f.read(65536), b""):
            md5.update(block)
            sha256.update(block)
            
    # Verify FITS structure
    print("  Verifying FITS integrity...")
    with fits.open(dest_path) as hdul:
        hdul.verify('exception')
        info = [(h.name, h.header.get('XTENSION', 'PRIMARY')) for h in hdul]
    print(f"  Integrity verified! Found {len(info)} HDUs: {info}")
    
    return {
        "source_url": url,
        "local_path": dest_path,
        "filename": os.path.basename(dest_path),
        "file_size_bytes": os.path.getsize(dest_path),
        "download_started_utc": start_time.isoformat(),
        "download_completed_utc": end_time.isoformat(),
        "elapsed_seconds": round(elapsed, 2),
        "md5": md5.hexdigest(),
        "sha256": sha256.hexdigest(),
        "fits_verified": True,
        "hdu_count": len(info)
    }


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    metadata = {}
    
    for key, url in PAIR_URLS.items():
        fname = os.path.basename(url)
        dest = os.path.join(OUTPUT_DIR, fname)
        info = download_file(url, dest)
        info["pair_role"] = key
        metadata[key] = info
        
    meta_path = os.path.join(OUTPUT_DIR, "download_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"\nAll downloads completed and verified. Saved metadata to {meta_path}")


if __name__ == "__main__":
    main()
