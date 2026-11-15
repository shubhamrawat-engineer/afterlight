#!/usr/bin/env python3
"""
AFTERLIGHT - Person A: SPHEREx Astronomical Data Pipeline
Stage 3: SPHEREx Archive Discovery Script

Queries the NASA IPAC/IRSA SIA2 (Simple Image Access v2) service for SPHEREx
spectral image metadata without downloading FITS image payloads.

Initial search region: COSMOS field
Default center: RA = 150.1 deg, Dec = 2.2 deg, Radius = 0.1 deg
Default collections: spherex_dr1_deep, spherex_qr3_deep
Optional wide collections: spherex_dr1, spherex_qr3
"""

import os
import sys
import json
import csv
import argparse
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

import numpy as np
import pyvo
from astropy.coordinates import SkyCoord
import astropy.units as u
from astropy.time import Time

DEFAULT_ENDPOINT = "https://irsa.ipac.caltech.edu/SIA?"
DEFAULT_COLLECTIONS = ["spherex_dr1_deep", "spherex_qr3_deep"]
WIDE_COLLECTIONS = ["spherex_dr1", "spherex_qr3"]


def clean_val(val: Any) -> Any:
    """Sanitize numpy/masked values into JSON/CSV serializable types without inventing data."""
    if val is None:
        return None
    if isinstance(val, (np.ma.core.MaskedConstant,)):
        return None
    if hasattr(val, "mask") and val.mask:
        return None
    if isinstance(val, (np.floating, float)):
        if np.isnan(val) or np.isinf(val):
            return None
        return float(val)
    if isinstance(val, (np.integer, int)):
        return int(val)
    if isinstance(val, (np.bool_, bool)):
        return bool(val)
    if isinstance(val, bytes):
        return val.decode("utf-8", errors="replace")
    if isinstance(val, (list, tuple)):
        return [clean_val(x) for x in val]
    return str(val) if not isinstance(val, (str, int, float, bool)) else val


def query_sia2_collection(
    service_url: str,
    collection: str,
    ra_deg: float,
    dec_deg: float,
    radius_deg: float,
    maxrec: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Query the IRSA SIA2 service for a given collection and region.
    Returns structured metadata dictionary preserving all raw fields.
    """
    print(f"\n{'='*70}")
    print(f"Querying Collection: {collection}")
    print(f"Endpoint          : {service_url}")
    print(f"Search Target     : RA={ra_deg:.4f} deg, Dec={dec_deg:.4f} deg, Radius={radius_deg:.4f} deg")
    print(f"{'='*70}")

    sia_service = pyvo.dal.SIA2Service(service_url)
    pos_param = (ra_deg, dec_deg, radius_deg)

    query_metadata = {
        "collection": collection,
        "endpoint": service_url,
        "ra_deg": ra_deg,
        "dec_deg": dec_deg,
        "radius_deg": radius_deg,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "status": "pending",
        "result_count": 0,
        "available_fields": [],
        "records": [],
        "error_message": None,
    }

    try:
        kwargs = {}
        if maxrec:
            kwargs["maxrec"] = maxrec

        results = sia_service.search(pos=pos_param, collection=collection, **kwargs)
        available_fields = list(results.fieldnames) if hasattr(results, "fieldnames") and results.fieldnames else []
        query_metadata["available_fields"] = available_fields
        query_metadata["result_count"] = len(results)
        query_metadata["status"] = "success"

        print(f"-> Query successful. Matching observations: {len(results)}")
        print(f"-> Available metadata fields ({len(available_fields)}):")
        print("   " + ", ".join(available_fields[:12]) + ("..." if len(available_fields) > 12 else ""))

        records = []
        for rec in results:
            rec_dict = {}
            for col in available_fields:
                raw_v = rec.get(col)
                rec_dict[col] = clean_val(raw_v)

            # Enrich with standardized time ISO string if t_min/t_max exist (MJD)
            t_min = rec_dict.get("t_min")
            if t_min is not None and isinstance(t_min, (float, int)):
                try:
                    rec_dict["t_min_iso"] = Time(t_min, format="mjd").utc.iso
                except Exception:
                    rec_dict["t_min_iso"] = None

            t_max = rec_dict.get("t_max")
            if t_max is not None and isinstance(t_max, (float, int)):
                try:
                    rec_dict["t_max_iso"] = Time(t_max, format="mjd").utc.iso
                except Exception:
                    rec_dict["t_max_iso"] = None

            # Add wavelength in micrometers if em_min / em_max exist (meters)
            em_min = rec_dict.get("em_min")
            if em_min is not None and isinstance(em_min, (float, int)):
                rec_dict["em_min_um"] = round(em_min * 1e6, 4)
            em_max = rec_dict.get("em_max")
            if em_max is not None and isinstance(em_max, (float, int)):
                rec_dict["em_max_um"] = round(em_max * 1e6, 4)

            records.append(rec_dict)

        query_metadata["records"] = records

    except pyvo.dal.DALServiceError as e:
        query_metadata["status"] = "service_error"
        query_metadata["error_message"] = str(e)
        print(f"[ERROR] Service error querying {collection}: {e}")
    except pyvo.dal.DALQueryError as e:
        query_metadata["status"] = "query_error"
        query_metadata["error_message"] = str(e)
        print(f"[ERROR] Query syntax error querying {collection}: {e}")
    except Exception as e:
        query_metadata["status"] = "error"
        query_metadata["error_message"] = f"{type(e).__name__}: {str(e)}"
        print(f"[ERROR] Unexpected error querying {collection}: {e}")

    return query_metadata


def save_results(query_metadata: Dict[str, Any], output_dir: str) -> Dict[str, str]:
    """Save results as JSON and CSV in output_dir preserving raw metadata."""
    os.makedirs(output_dir, exist_ok=True)
    collection = query_metadata["collection"]
    base_name = f"sia2_{collection}_cosmos"

    json_path = os.path.join(output_dir, f"{base_name}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(query_metadata, f, indent=2)

    csv_path = os.path.join(output_dir, f"{base_name}.csv")
    records = query_metadata["records"]
    fields = query_metadata["available_fields"]
    if not fields and records:
        fields = list(records[0].keys())

    # Include enriched helper columns in CSV if present
    extended_fields = list(fields)
    for extra in ["t_min_iso", "t_max_iso", "em_min_um", "em_max_um"]:
        if extra not in extended_fields:
            extended_fields.append(extra)

    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=extended_fields, extrasaction="ignore")
        writer.writeheader()
        for rec in records:
            writer.writerow(rec)

    print(f"-> Saved JSON metadata : {json_path}")
    print(f"-> Saved CSV table     : {csv_path}")

    return {"json": json_path, "csv": csv_path}


def analyze_records(collection: str, records: List[Dict[str, Any]]) -> None:
    """Print scientific overview of observations in a collection."""
    if not records:
        print(f"[{collection}] No observations found in this region.")
        return

    print(f"\n--- Scientific Metadata Summary: {collection} ({len(records)} observations) ---")
    
    # Dates
    dates = [r.get("t_min_iso") for r in records if r.get("t_min_iso")]
    mjds = [r.get("t_min") for r in records if r.get("t_min") is not None]
    if dates:
        print(f"Date Range (UTC)  : {min(dates)}  to  {max(dates)}")
        print(f"MJD Range         : {min(mjds):.3f} to {max(mjds):.3f}")

    # Bands / Detectors
    bands = sorted(list(set(r.get("energy_bandpassname") for r in records if r.get("energy_bandpassname"))))
    print(f"Bands / Detectors : {', '.join(bands) if bands else 'N/A'}")

    # Wavelength coverage
    em_mins = [r.get("em_min_um") for r in records if r.get("em_min_um") is not None]
    em_maxs = [r.get("em_max_um") for r in records if r.get("em_max_um") is not None]
    if em_mins and em_maxs:
        print(f"Wavelength Span   : {min(em_mins):.3f} µm to {max(em_maxs):.3f} µm")

    # Grouping by band and obs_id
    obs_ids = sorted(list(set(r.get("obs_id") for r in records if r.get("obs_id"))))
    print(f"Unique Obs IDs    : {len(obs_ids)} distinct visits/exposures")

    # Sample observations
    print("\nSample Observations (first 3):")
    for i, r in enumerate(records[:3]):
        print(f"  [{i+1}] ObsID: {r.get('obs_id')} | Band: {r.get('energy_bandpassname')} | "
              f"Date: {r.get('t_min_iso', 'N/A')} | ExpTime: {r.get('t_exptime')}s | "
              f"URL: {r.get('access_url')}")


def main():
    parser = argparse.ArgumentParser(description="SPHEREx SIA2 Observation Discovery")
    parser.add_argument("--ra", type=float, default=150.1, help="Right Ascension in degrees (default: 150.1)")
    parser.add_argument("--dec", type=float, default=2.2, help="Declination in degrees (default: 2.2)")
    parser.add_argument("--radius", type=float, default=0.1, help="Search radius in degrees (default: 0.1)")
    parser.add_argument("--endpoint", type=str, default=DEFAULT_ENDPOINT, help="SIA2 service endpoint")
    parser.add_argument("--collections", nargs="+", default=DEFAULT_COLLECTIONS, help="Collections to search")
    parser.add_argument("--include-wide", action="store_true", help="Also search wide survey collections (spherex_dr1, spherex_qr3)")
    parser.add_argument("--output-dir", type=str, default="data/raw", help="Output directory for metadata")
    parser.add_argument("--maxrec", type=int, default=None, help="Maximum records per collection")
    args = parser.parse_args()

    # Validate coordinate with Astropy SkyCoord
    coord = SkyCoord(ra=args.ra * u.deg, dec=args.dec * u.deg, frame="icrs")
    print(f"Search Center Coordinate (ICRS): {coord.to_string('hmsdms')} ({args.ra:.4f} deg, {args.dec:.4f} deg)")

    target_collections = list(args.collections)
    if args.include_wide:
        for c in WIDE_COLLECTIONS:
            if c not in target_collections:
                target_collections.append(c)

    all_results = {}
    saved_files = {}

    for col in target_collections:
        meta = query_sia2_collection(
            service_url=args.endpoint,
            collection=col,
            ra_deg=args.ra,
            dec_deg=args.dec,
            radius_deg=args.radius,
            maxrec=args.maxrec,
        )
        all_results[col] = meta
        files = save_results(meta, args.output_dir)
        saved_files[col] = files
        analyze_records(col, meta["records"])

    # High-level Summary
    print("\n" + "=" * 70)
    print("STAGE 3 ARCHIVE DISCOVERY SUMMARY")
    print("=" * 70)
    for col, meta in all_results.items():
        print(f"Collection: {col:<20} | Status: {meta['status']:<12} | Observations Found: {meta['result_count']}")

    # Diagnostic check if deep collections returned 0
    deep_counts = sum(all_results[c]["result_count"] for c in args.collections if c in all_results)
    if deep_counts == 0:
        print("\n[DIAGNOSTIC NOTE]")
        print("Both specified deep survey collections (spherex_dr1_deep, spherex_qr3_deep) returned 0 results.")
        print("Scientific Reason: The SPHEREx 'Deep Survey' collections are geographically confined to the")
        print("North Ecliptic Pole (NEP, Dec ~ +66.5 deg) and South Ecliptic Pole (SEP, Dec ~ -66.5 deg).")
        print("The COSMOS field (Dec = +2.2 deg) is located near the celestial equator, outside the deep calibration poles.")
        if not args.include_wide:
            print("To discover observations in the COSMOS field, query the wide survey collections:")
            print("  --include-wide  (searches spherex_dr1 and spherex_qr3)")

    print("\nSaved Metadata Files:")
    for col, paths in saved_files.items():
        print(f"  {col}:")
        print(f"    JSON -> {paths['json']}")
        print(f"    CSV  -> {paths['csv']}")
    print("=" * 70)


if __name__ == "__main__":
    main()
