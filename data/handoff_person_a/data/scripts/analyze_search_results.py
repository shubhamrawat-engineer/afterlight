#!/usr/bin/env python3
"""
AFTERLIGHT - Person A: SPHEREx Astronomical Data Pipeline
Stage 3b: Offline analysis of saved SIA2 search metadata.

Reads ONLY the JSON files previously written by search_observations.py in
data/raw/. Makes no network requests and downloads no FITS files.

What it does:
  * Lists observation IDs, dates, detectors and wavelength ranges.
  * Derives a footprint orientation proxy from the s_region polygon
    (the SIA2/ObsCore table has no roll-angle column).
  * Locates the search target inside each footprint (fractional u, v),
    which is a proxy for detector pixel position -> LVF wavelength.
  * Evaluates candidate same-detector, multi-epoch pairs against explicit
    criteria, labelling each PASS / FAIL / UNVERIFIED.

Derived quantities are approximations from footprint corners, NOT from the
FITS WCS. They must be confirmed from FITS headers before any pair is used.
"""

import argparse
import csv
import json
import os
from itertools import combinations

import numpy as np
import astropy.units as u
from astropy.coordinates import SkyCoord, SkyOffsetFrame
from astropy.time import Time

RAW_DIR = "data/raw"
FILES = {
    "spherex_dr1": "sia2_spherex_dr1_cosmos.json",
    "spherex_qr3": "sia2_spherex_qr3_cosmos.json",
    "spherex_dr1_deep": "sia2_spherex_dr1_deep_cosmos.json",
    "spherex_qr3_deep": "sia2_spherex_qr3_deep_cosmos.json",
}

# Thresholds for derived-geometry criteria
PA_TOL_DEG = 1.0        # footprint orientation difference
UV_TOL = 0.01           # fractional position difference (~20 px of 2040)
MIN_DT_DAYS = 1.0       # require genuinely different epochs


def parse_polygon(s_region):
    if not s_region:
        return None
    parts = s_region.split()
    if len(parts) < 3 or parts[0].upper() != "POLYGON":
        return None
    nums = [float(x) for x in parts[2:]]
    pts = list(zip(nums[0::2], nums[1::2]))
    if len(pts) > 1 and np.allclose(pts[0], pts[-1]):
        pts = pts[:-1]
    return pts if len(pts) == 4 else None


def footprint_geometry(poly, target):
    """Return (pa_deg, u, v) using an affine model of the 4-corner footprint.

    pa_deg : position angle (E of N) of the corner0 -> corner1 edge.
    u, v   : target position along edges c0->c1 and c0->c3 (0..1 = inside).
    """
    corners = SkyCoord([p[0] for p in poly] * u.deg, [p[1] for p in poly] * u.deg)
    pa = corners[0].position_angle(corners[1]).to(u.deg).value % 360.0
    centre = SkyCoord(np.mean([p[0] for p in poly]) * u.deg,
                      np.mean([p[1] for p in poly]) * u.deg)
    frame = SkyOffsetFrame(origin=centre)
    c = corners.transform_to(frame)
    t = target.transform_to(frame)
    xy = np.vstack([c.lon.deg, c.lat.deg]).T
    txy = np.array([t.lon.deg, t.lat.deg])
    e1, e2 = xy[1] - xy[0], xy[3] - xy[0]
    sol = np.linalg.solve(np.vstack([e1, e2]).T, txy - xy[0])
    return pa, float(sol[0]), float(sol[1])


def pipeline_version(url):
    try:
        return url.split("/")[-3]
    except Exception:
        return None


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw-dir", default=RAW_DIR)
    ap.add_argument("--top", type=int, default=15)
    args = ap.parse_args()

    rows = []
    print("=" * 78)
    print("COLLECTION RESULT COUNTS (from saved metadata)")
    print("=" * 78)
    meta_by_col = {}
    for col, fn in FILES.items():
        p = os.path.join(args.raw_dir, fn)
        if not os.path.exists(p):
            print(f"{col:<18} file missing: {p}")
            continue
        d = load(p)
        meta_by_col[col] = d
        print(f"{col:<18} status={d['status']:<8} records={d['result_count']:<4} file={fn}")

    target = None
    for col in ("spherex_dr1", "spherex_qr3"):
        d = meta_by_col.get(col)
        if not d:
            continue
        if target is None:
            target = SkyCoord(d["ra_deg"] * u.deg, d["dec_deg"] * u.deg)
        for r in d["records"]:
            poly = parse_polygon(r.get("s_region"))
            pa = uu = vv = None
            if poly:
                try:
                    pa, uu, vv = footprint_geometry(poly, target)
                except Exception:
                    pass
            rows.append({
                "collection": col,
                "obs_id": r.get("obs_id"),
                "detector": r.get("energy_bandpassname"),
                "t_min_mjd": r.get("t_min"),
                "t_min_utc": r.get("t_min_iso"),
                "em_min_um": r.get("em_min_um"),
                "em_max_um": r.get("em_max_um"),
                "t_exptime": r.get("t_exptime"),
                "calib_level": r.get("calib_level"),
                "pixel_scale": r.get("s_pixel_scale"),
                "pipeline": pipeline_version(r.get("access_url") or ""),
                "footprint_pa_deg": None if pa is None else round(pa, 3),
                "target_u": None if uu is None else round(uu, 4),
                "target_v": None if vv is None else round(vv, 4),
                "target_inside": None if uu is None else (0 <= uu <= 1 and 0 <= vv <= 1),
                "access_url": r.get("access_url"),
            })

    # ---------- per-collection overview ----------
    for col in ("spherex_dr1", "spherex_qr3"):
        sub = [r for r in rows if r["collection"] == col]
        if not sub:
            continue
        print("\n" + "=" * 78)
        print(f"{col}: {len(sub)} records, {len({r['obs_id'] for r in sub})} unique obs_id")
        print("=" * 78)
        dets = sorted({r["detector"] for r in sub})
        for dname in dets:
            ds = [r for r in sub if r["detector"] == dname]
            print(f"  {dname}: {len(ds):>3} records | {ds[0]['em_min_um']}-{ds[0]['em_max_um']} um")
        mj = [r["t_min_mjd"] for r in sub]
        print(f"  Date range: {Time(min(mj), format='mjd').iso} -> {Time(max(mj), format='mjd').iso}")
        pas = sorted({round(r['footprint_pa_deg']) % 360 for r in sub if r['footprint_pa_deg'] is not None})
        print(f"  Distinct footprint PA values (deg, rounded): {pas}")
        print(f"  Pipeline versions: {sorted({r['pipeline'] for r in sub})}")
        print(f"  Target inside footprint: {sum(1 for r in sub if r['target_inside'])}/{len(sub)}")

    # ---------- per-record table ----------
    rows.sort(key=lambda r: (r["collection"], r["t_min_mjd"], r["detector"]))
    out_rec = os.path.join(args.raw_dir, "derived_cosmos_observation_table.csv")
    with open(out_rec, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    # ---------- pair evaluation ----------
    pairs = []
    for a, b in combinations(rows, 2):
        if a["detector"] != b["detector"]:
            continue
        dt = abs(a["t_min_mjd"] - b["t_min_mjd"])
        if dt < MIN_DT_DAYS:
            continue
        if not (a["target_inside"] and b["target_inside"]):
            continue
        dpa = abs(((a["footprint_pa_deg"] - b["footprint_pa_deg"]) + 180) % 360 - 180)
        du = abs(a["target_u"] - b["target_u"])
        dv = abs(a["target_v"] - b["target_v"])
        crit = {
            "same_detector": "PASS",
            "different_epoch(>1d)": "PASS",
            "target_in_both_footprints": "PASS",
            "same_band_limits": "PASS" if (a["em_min_um"], a["em_max_um"]) == (b["em_min_um"], b["em_max_um"]) else "FAIL",
            "same_exptime": "PASS" if a["t_exptime"] == b["t_exptime"] else "FAIL",
            "same_calib_level": "PASS" if a["calib_level"] == b["calib_level"] else "FAIL",
            # access_url token looks like 'l2b-v27-2026-196' = product-version-processing date
            "same_pipeline_version": "PASS" if a["pipeline"].split("-")[:2] == b["pipeline"].split("-")[:2] else "FAIL",
            "same_processing_date": "PASS" if a["pipeline"] == b["pipeline"] else "DIFFERS (calibration impact UNVERIFIED)",
            "orientation_match(derived)": "PASS" if dpa <= PA_TOL_DEG else "FAIL",
            "same_pixel_position(derived)": "PASS" if (du <= UV_TOL and dv <= UV_TOL) else "FAIL",
            "wavelength_at_target(spectral WCS)": "UNVERIFIED",
            "pixel_flags/quality": "UNVERIFIED",
            "PSF/ePSF match": "UNVERIFIED",
        }
        n_fail = sum(v == "FAIL" for v in crit.values())
        pairs.append({
            "detector": a["detector"],
            "obs_a": a["obs_id"], "coll_a": a["collection"], "date_a": a["t_min_utc"],
            "obs_b": b["obs_id"], "coll_b": b["collection"], "date_b": b["t_min_utc"],
            "dt_days": round(dt, 3),
            "dpa_deg": round(dpa, 3), "du": round(du, 4), "dv": round(dv, 4),
            "n_fail": n_fail,
            **crit,
            "url_a": a["access_url"], "url_b": b["access_url"],
        })

    pairs.sort(key=lambda p: (p["n_fail"], p["du"] + p["dv"], p["dpa_deg"]))
    out_pairs = os.path.join(args.raw_dir, "derived_cosmos_candidate_pairs.csv")
    if pairs:
        with open(out_pairs, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(pairs[0].keys()))
            w.writeheader()
            w.writerows(pairs)

    print("\n" + "=" * 78)
    print("CANDIDATE PAIR EVALUATION")
    print("=" * 78)
    print(f"Same-detector, >1 day apart, target in both footprints: {len(pairs)} pairs")
    print(f"Pairs with 0 FAIL criteria: {sum(1 for p in pairs if p['n_fail'] == 0)}")
    fail_counts = {}
    for p in pairs:
        for k in ("same_pipeline_version", "same_band_limits", "same_exptime",
                  "orientation_match(derived)", "same_pixel_position(derived)"):
            if p[k] == "FAIL":
                fail_counts[k] = fail_counts.get(k, 0) + 1
    print(f"Failure counts on discriminating criteria: {fail_counts}")
    print(f"\nTop {args.top} pairs (fewest failures, closest pixel position):")
    for p in pairs[: args.top]:
        print(f"  {p['detector']} | {p['obs_a']} ({p['date_a'][:10]}) <-> {p['obs_b']} ({p['date_b'][:10]}) "
              f"| dt={p['dt_days']}d dPA={p['dpa_deg']} du={p['du']} dv={p['dv']} "
              f"| ver={p['same_pipeline_version']} procdate={p['same_processing_date'][:7]} fails={p['n_fail']}")

    print("\nSaved:")
    print(f"  {out_rec}")
    if pairs:
        print(f"  {out_pairs}")


if __name__ == "__main__":
    main()
