#!/usr/bin/env python3
"""
AFTERLIGHT - Person A: SPHEREx Astronomical Data Pipeline
Stage 3c: Candidate-pair ranking (metadata only, no FITS downloads).

Inputs (all local, produced by earlier stages):
  data/raw/derived_cosmos_candidate_pairs.csv   (pairs + derived geometry)
  data/raw/derived_cosmos_observation_table.csv (per-image derived table)
  data/raw/sia2_spherex_{dr1,qr3}_cosmos.json   (original SIA2 metadata, joined
                                                  by access_url for s_ra/s_dec,
                                                  s_resolution, em_res_power)

Every criterion gets exactly one status:
  VERIFIED   - passes, checked directly against archive metadata values
  APPROX     - passes, but only via a quantity derived from s_region corners
  FAIL       - checked and does not pass (archive or derived value)
  CAUTION    - values differ but the scientific impact cannot be judged yet
  UNKNOWN    - required information is not in the metadata (needs FITS)

A pair is "scientifically verified" ONLY if every essential criterion is
VERIFIED. With metadata alone this is impossible, because the effective
wavelength at the target, pixel quality flags and ePSF are UNKNOWN.
"""

import csv
import json
import os
from collections import Counter

RAW = "data/raw"
PAIRS_CSV = os.path.join(RAW, "derived_cosmos_candidate_pairs.csv")
OBS_CSV = os.path.join(RAW, "derived_cosmos_observation_table.csv")
SIA_JSON = [os.path.join(RAW, "sia2_spherex_dr1_cosmos.json"),
            os.path.join(RAW, "sia2_spherex_qr3_cosmos.json")]
OUT_CSV = os.path.join(RAW, "candidate_pair_ranking.csv")
OUT_JSON = os.path.join(RAW, "candidate_pair_ranking.json")

DETECTOR_NPIX = 2040          # s_xel1 = s_xel2 = 2040 in the archive metadata
PA_TOL_DEG = 1.0
PIX_TOL = DETECTOR_NPIX * 0.01  # ~20 px, same threshold as the previous stage

# (criterion, ranking category, essential?)
CRITERIA = [
    ("same_detector",                 "Detector compatibility",               True),
    ("same_band_limits",              "Effective wavelength compatibility",   True),
    ("same_pixel_position",           "Effective wavelength compatibility",   True),
    ("effective_wavelength_at_target","Effective wavelength compatibility",   True),
    ("roll_angle_match",              "Roll-angle compatibility",             True),
    ("footprint_orientation_match",   "Roll-angle compatibility",             False),
    ("same_calib_level",              "Calibration/reduction compatibility",  True),
    ("same_pipeline_version",         "Calibration/reduction compatibility",  True),
    ("same_processing_date",          "Calibration/reduction compatibility",  False),
    ("same_exptime",                  "Exposure/PSF compatibility",           True),
    ("same_nominal_resolution",       "Exposure/PSF compatibility",           False),
    ("epsf_match",                    "Exposure/PSF compatibility",           True),
    ("different_epoch",               "Time separation",                      True),
    ("target_in_both_footprints",     "Data quality/metadata",                True),
    ("key_metadata_complete",         "Data quality/metadata",                True),
    ("pixel_quality_flags",           "Data quality/metadata",                True),
]

KEY_FIELDS = ["obs_id", "energy_bandpassname", "t_min", "t_max", "em_min", "em_max",
              "t_exptime", "calib_level", "s_region", "s_ra", "s_dec",
              "s_resolution", "access_url"]


def fnum(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def main():
    pairs = list(csv.DictReader(open(PAIRS_CSV, encoding="utf-8")))
    obs = {r["access_url"]: r for r in csv.DictReader(open(OBS_CSV, encoding="utf-8"))}
    sia = {}
    for p in SIA_JSON:
        for r in json.load(open(p, encoding="utf-8"))["records"]:
            sia[r["access_url"]] = r

    ranked = []
    for p in pairs:
        A, B = obs.get(p["url_a"]), obs.get(p["url_b"])
        SA, SB = sia.get(p["url_a"]), sia.get(p["url_b"])
        if not (A and B and SA and SB):
            continue
        # order earlier -> later
        if fnum(A["t_min_mjd"]) > fnum(B["t_min_mjd"]):
            A, B, SA, SB = B, A, SB, SA

        dpa = fnum(p["dpa_deg"])
        du_px = fnum(p["du"]) * DETECTOR_NPIX
        dv_px = fnum(p["dv"]) * DETECTOR_NPIX
        pix_off = max(du_px, dv_px)
        dt = fnum(p["dt_days"])
        miss_a = [k for k in KEY_FIELDS if SA.get(k) in (None, "")]
        miss_b = [k for k in KEY_FIELDS if SB.get(k) in (None, "")]

        st = {
            "same_detector": "VERIFIED" if SA["energy_bandpassname"] == SB["energy_bandpassname"] else "FAIL",
            "same_band_limits": "VERIFIED" if (SA["em_min"], SA["em_max"]) == (SB["em_min"], SB["em_max"]) else "FAIL",
            "same_pixel_position": "APPROX" if pix_off <= PIX_TOL else "FAIL",
            "effective_wavelength_at_target": "UNKNOWN",
            "roll_angle_match": "UNKNOWN",
            "footprint_orientation_match": "APPROX" if dpa <= PA_TOL_DEG else "FAIL",
            "same_calib_level": "VERIFIED" if SA["calib_level"] == SB["calib_level"] else "FAIL",
            "same_pipeline_version": "VERIFIED" if A["pipeline"].split("-")[:2] == B["pipeline"].split("-")[:2] else "FAIL",
            "same_processing_date": "VERIFIED" if A["pipeline"] == B["pipeline"] else "CAUTION",
            "same_exptime": "VERIFIED" if SA["t_exptime"] == SB["t_exptime"] else "FAIL",
            "same_nominal_resolution": "VERIFIED" if SA["s_resolution"] == SB["s_resolution"] else "FAIL",
            "epsf_match": "UNKNOWN",
            "different_epoch": "VERIFIED" if dt >= 1.0 else "FAIL",
            "target_in_both_footprints": "APPROX" if (A["target_inside"] == "True" and B["target_inside"] == "True") else "FAIL",
            "key_metadata_complete": "VERIFIED" if not (miss_a or miss_b) else "FAIL",
            "pixel_quality_flags": "UNKNOWN",
        }
        counts = Counter(st.values())
        essential = [c for c, _, e in CRITERIA if e]
        ess_fail = sum(st[c] == "FAIL" for c in essential)
        ess_unknown = sum(st[c] == "UNKNOWN" for c in essential)
        ess_approx = sum(st[c] == "APPROX" for c in essential)
        if ess_fail:
            overall = "INCOMPATIBLE"
        elif ess_unknown:
            overall = "CANDIDATE - NOT VERIFIED (essential criteria unknown)"
        elif ess_approx:
            overall = "APPROXIMATELY COMPATIBLE"
        else:
            overall = "VERIFIED"

        # Ranking key, applied lexicographically (lower is better):
        #   1. essential FAILs  2. any FAIL  3. CAUTION count
        #   4. pixel offset (px, rounded to 0.1)  5. orientation difference
        #   6. longer baseline preferred (negative dt)
        key = (ess_fail, counts.get("FAIL", 0), counts.get("CAUTION", 0),
               round(pix_off, 1), round(dpa, 3), -dt)

        ranked.append({
            "_key": key,
            "overall_status": overall,
            "detector": SA["energy_bandpassname"],
            "earlier_obs_id": SA["obs_id"], "earlier_collection": SA["obs_collection"],
            "earlier_date_utc": A["t_min_utc"], "earlier_t_min_mjd": SA["t_min"],
            "earlier_s_ra": SA["s_ra"], "earlier_s_dec": SA["s_dec"],
            "later_obs_id": SB["obs_id"], "later_collection": SB["obs_collection"],
            "later_date_utc": B["t_min_utc"], "later_t_min_mjd": SB["t_min"],
            "later_s_ra": SB["s_ra"], "later_s_dec": SB["s_dec"],
            "time_separation_days": round(dt, 3),
            "wavelength_range_um": f"{A['em_min_um']}-{A['em_max_um']}",
            "later_wavelength_range_um": f"{B['em_min_um']}-{B['em_max_um']}",
            "em_res_power": SA.get("em_res_power"),
            "roll_angle_deg": "UNKNOWN (not in SIA2 metadata)",
            "earlier_footprint_pa_deg_approx": fnum(A["footprint_pa_deg"]),
            "later_footprint_pa_deg_approx": fnum(B["footprint_pa_deg"]),
            "footprint_pa_diff_deg_approx": round(dpa, 4),
            "target_pixel_offset_px_approx": round(pix_off, 2),
            "earlier_target_uv_approx": f"{A['target_u']},{A['target_v']}",
            "later_target_uv_approx": f"{B['target_u']},{B['target_v']}",
            "earlier_calibration": f"calib_level={SA['calib_level']}; {A['pipeline']}",
            "later_calibration": f"calib_level={SB['calib_level']}; {B['pipeline']}",
            "earlier_exptime_s": SA["t_exptime"], "later_exptime_s": SB["t_exptime"],
            "nominal_resolution_arcsec": f"{SA['s_resolution']} / {SB['s_resolution']} (catalogue constant, not per-image PSF)",
            "pixel_scale_arcsec": f"{SA['s_pixel_scale']} / {SB['s_pixel_scale']}",
            **{f"crit_{c}": st[c] for c, _, _ in CRITERIA},
            "n_verified": counts.get("VERIFIED", 0), "n_approx": counts.get("APPROX", 0),
            "n_caution": counts.get("CAUTION", 0), "n_fail": counts.get("FAIL", 0),
            "n_unknown": counts.get("UNKNOWN", 0),
            "earlier_access_url": SA["access_url"], "later_access_url": SB["access_url"],
        })

    ranked.sort(key=lambda r: r["_key"])
    for i, r in enumerate(ranked, 1):
        r["rank"] = i

    # ---- summary statistics ----
    total = len(ranked)
    per_crit = {}
    for c, cat, ess in CRITERIA:
        cnt = Counter(r[f"crit_{c}"] for r in ranked)
        per_crit[c] = {"category": cat, "essential": ess, **dict(cnt)}
    no_fail = [r for r in ranked if r["n_fail"] == 0]
    verified = [r for r in ranked if r["overall_status"] == "VERIFIED"]

    # ---- recommendations: best pair from each independent exposure-pair group ----
    recs, seen = [], set()
    for r in ranked:
        if r["n_fail"]:
            break
        grp = (r["earlier_obs_id"].rsplit("_", 1)[0], r["later_obs_id"].rsplit("_", 1)[0])
        if grp in seen:
            continue
        seen.add(grp)
        recs.append(r)
        if len(recs) == 3:
            break

    cols = ["rank"] + [k for k in ranked[0] if k not in ("_key", "rank")]
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(ranked)

    report = {
        "generated_from": [PAIRS_CSV, OBS_CSV] + SIA_JSON,
        "fits_downloaded": False,
        "status_definitions": {
            "VERIFIED": "passes; checked directly against archive metadata values",
            "APPROX": "passes; based on a quantity derived from s_region footprint corners",
            "CAUTION": "values differ; scientific impact cannot be judged from metadata",
            "FAIL": "checked and does not pass",
            "UNKNOWN": "required information not present in SIA2 metadata (needs FITS headers)",
        },
        "thresholds": {"pixel_offset_px": PIX_TOL, "footprint_pa_deg": PA_TOL_DEG,
                       "min_time_separation_days": 1.0},
        "ranking_order": ["essential FAIL count", "total FAIL count", "CAUTION count",
                          "target pixel offset (px)", "footprint PA difference (deg)",
                          "longer time separation preferred"],
        "summary": {
            "total_candidate_pairs": total,
            "pairs_with_zero_FAIL": len(no_fail),
            "pairs_scientifically_verified": len(verified),
            "reason_none_verified": "effective_wavelength_at_target, roll_angle_match, epsf_match and "
                                    "pixel_quality_flags are UNKNOWN for every pair (not in SIA2 metadata)",
            "per_criterion_status_counts": per_crit,
        },
        "top10": [{k: v for k, v in r.items() if k != "_key"} for r in ranked[:10]],
        "recommended_top3": [{k: v for k, v in r.items() if k != "_key"} for r in recs],
    }
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    # ---- console output ----
    print(f"Total candidate pairs: {total}")
    print(f"Pairs with zero FAIL: {len(no_fail)}")
    print(f"Pairs scientifically VERIFIED: {len(verified)}")
    print("\nPer-criterion status counts:")
    for c, d in per_crit.items():
        tags = ", ".join(f"{k}={v}" for k, v in d.items() if k not in ("category", "essential"))
        print(f"  {'*' if d['essential'] else ' '} {c:<32} {tags}")
    print("\nTop 10:")
    for r in ranked[:10]:
        print(f"  #{r['rank']:<2} {r['detector']} {r['earlier_obs_id']} -> {r['later_obs_id']} "
              f"dt={r['time_separation_days']}d off={r['target_pixel_offset_px_approx']}px "
              f"dPA={r['footprint_pa_diff_deg_approx']} V/A/C/F/U={r['n_verified']}/{r['n_approx']}/"
              f"{r['n_caution']}/{r['n_fail']}/{r['n_unknown']}")
    print("\nRecommended (one per independent exposure group):")
    for r in recs:
        print(f"  #{r['rank']} {r['detector']} {r['earlier_obs_id']} -> {r['later_obs_id']} dt={r['time_separation_days']}d")
    print(f"\nSaved: {OUT_CSV}\nSaved: {OUT_JSON}")


if __name__ == "__main__":
    main()
