import hashlib
import json
import os
import tempfile
import threading
import time
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from fastapi import HTTPException
from models import CaseCreate, ConfidenceLevel, ScientificAudit

BASE_DIR = Path(__file__).resolve().parent
BUNDLE_DIR = BASE_DIR / "data" / "bundle"
CASES_DIR = BASE_DIR / "data" / "cases"
LIVE_CACHE_DIR = BASE_DIR / "data" / "live_cache"

for d in (BUNDLE_DIR, CASES_DIR, LIVE_CACHE_DIR):
    d.mkdir(parents=True, exist_ok=True)


def raise_api_error(status_code: int, code: str, message: str):
    raise HTTPException(status_code=status_code, detail={"code": code, "message": message})


class SafeStorage:
    def __init__(self, ttl_seconds: int = 300):
        self._lock = threading.RLock()
        self._cache: Dict[str, tuple[float, Any]] = {}
        self._ttl = ttl_seconds

    def safe_path(self, base: Path, *parts: str) -> Path:
        resolved = base.joinpath(*parts).resolve()
        if not str(resolved).startswith(str(base.resolve())):
            raise_api_error(400, "INVALID_PATH", "Malformed resource path.")
        return resolved

    def read_json(self, path: Path, cache_key: Optional[str] = None) -> Dict[str, Any]:
        with self._lock:
            if cache_key and cache_key in self._cache:
                exp, val = self._cache[cache_key]
                if time.time() < exp:
                    return val
                del self._cache[cache_key]

            if not path.exists():
                raise_api_error(404, "NOT_FOUND", f"Resource '{path.name}' does not exist")

            try:
                data = json.loads(path.read_text(encoding="utf-8"))
            except json.JSONDecodeError as exc:
                raise_api_error(500, "CORRUPT_JSON", f"Invalid JSON in {path.name}: {exc}")

            if cache_key:
                self._cache[cache_key] = (time.time() + self._ttl, data)
            return data

    def atomic_write_json(self, path: Path, data: Dict[str, Any]) -> None:
        with self._lock:
            path.parent.mkdir(parents=True, exist_ok=True)
            fd, tmp_name = tempfile.mkstemp(dir=str(path.parent), suffix=".tmp")
            try:
                with os.fdopen(fd, "w", encoding="utf-8") as tmp_file:
                    json.dump(data, tmp_file, indent=2, ensure_ascii=False)
                os.replace(tmp_name, path)
            except Exception:
                if os.path.exists(tmp_name):
                    os.remove(tmp_name)
                raise

    def image_checksums(self, target_id: str) -> Dict[str, str]:
        target_dir = self.safe_path(BUNDLE_DIR, target_id)
        hashes = {}
        for fname in ("earlier.png", "later.png", "difference.png"):
            fpath = target_dir / fname
            if fpath.exists():
                hashes[fname] = f"sha256:{hashlib.sha256(fpath.read_bytes()).hexdigest()[:16]}"
        return hashes


class ScientificAuditor:
    APPROVED_RELEASES = {"DR1", "QR3"}
    DEPRECATED_RELEASES = {"QR2"}
    OVERCLAIM_TERMS = {"planet x", "confirmed discovery", "100% proof", "alien", "definitely a new planet"}

    @classmethod
    def audit(cls, payload: CaseCreate, manifest: Dict[str, Any]) -> ScientificAudit:
        notes: List[str] = []
        score = 50.0

        valid_ids = set()
        releases = set()
        for item in manifest.get("observations", []):
            if isinstance(item, dict):
                if "id" in item:
                    valid_ids.add(str(item["id"]))
                if "release" in item:
                    releases.add(str(item["release"]).upper())
            elif isinstance(item, str):
                valid_ids.add(item)

        matched = [oid for oid in payload.observations if oid in valid_ids]
        unverified = [oid for oid in payload.observations if oid not in valid_ids]
        provenance_ok = len(unverified) == 0 and len(matched) >= 2

        if provenance_ok:
            score += 20.0
        else:
            score -= 15.0
            notes.append(f"Observation IDs {unverified} not found in target manifest.")

        if releases & cls.DEPRECATED_RELEASES:
            if releases & cls.APPROVED_RELEASES:
                rel_status = "MIXED_CALIBRATION_WARNING"
                score -= 15.0
                notes.append("Mixes QR2 with DR1/QR3 releases; calibration shifts may cause false deltas.")
            else:
                rel_status = "LEGACY_QR2"
                score -= 5.0
                notes.append("Uses legacy QR2 release; verify against DR1/QR3.")
        else:
            rel_status = "COMPATIBLE_DR1_QR3"
            score += 10.0

        pq = manifest.get("pair_quality")
        pq_status = str(pq.get("status", "") if isinstance(pq, dict) else pq or "").lower()
        if pq_status in {"degraded", "preliminary", "poor"} and payload.confidence == ConfidenceLevel.HIGH:
            score -= 15.0
            notes.append("High confidence claimed on a preliminary/degraded observation pair.")

        text_blob = f"{payload.title} {payload.what_i_observed} {payload.possible_explanation}".lower()
        found_overclaims = [kw for kw in cls.OVERCLAIM_TERMS if kw in text_blob]
        if found_overclaims:
            score -= 20.0
            notes.append(
                f"Guardrail warning ({', '.join(found_overclaims)}): Measured difference is a candidate change, not proof."
            )
        else:
            score += 10.0

        if len(payload.uncertainty) >= 30:
            score += 10.0

        if not notes:
            notes.append("All provenance, calibration, and scientific restraint checks passed.")

        return ScientificAudit(
            provenance_verified=provenance_ok,
            matched_observation_ids=matched,
            unverified_observation_ids=unverified,
            release_compatibility=rel_status,
            rigor_score=round(max(0.0, min(100.0, score)), 1),
            guardrail_notes=notes,
        )


class NASALiveClient:
    IRSA_SIA2_URL = "https://irsa.ipac.caltech.edu/SIA"
    SKYVIEW_URL = "https://skyview.gsfc.nasa.gov/current/cgi/runquery.pl"

    def __init__(self):
        self._failures = 0
        self._open_until = 0.0

    def _circuit_open(self) -> bool:
        if self._failures >= 3 and time.time() < self._open_until:
            return True
        if time.time() >= self._open_until:
            self._failures = 0
        return False

    async def search_spherex(self, ra: float, dec: float, radius: float = 0.25) -> Dict[str, Any]:
        key = hashlib.sha256(f"{ra:.4f}:{dec:.4f}:{radius:.3f}".encode()).hexdigest()[:16]
        cache_path = LIVE_CACHE_DIR / f"irsa_{key}.json"

        if cache_path.exists() and (time.time() - cache_path.stat().st_mtime) < 900:
            cached = json.loads(cache_path.read_text(encoding="utf-8"))
            cached["source"] = "nasa_irsa_cached"
            return cached

        if self._circuit_open():
            return {"source": "circuit_breaker_fallback", "observations": [], "count": 0}

        params = {"COLLECTION": "spherex", "POS": f"CIRCLE {ra} {dec} {radius}", "RESPONSEFORMAT": "VOTABLE"}
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                resp = await client.get(self.IRSA_SIA2_URL, params=params)
                resp.raise_for_status()
                obs = self._parse_votable(resp.text, ra, dec)
                self._failures = 0
        except Exception as exc:
            self._failures += 1
            if self._failures >= 3:
                self._open_until = time.time() + 30.0
            return {"source": "nasa_irsa_unavailable", "observations": [], "count": 0, "error": str(exc)}

        payload = {"source": "nasa_irsa_live", "ra": ra, "dec": dec, "observations": obs, "count": len(obs)}
        cache_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return payload

    async def fetch_sky_cutout(self, ra: float, dec: float, survey: str = "2MASS-K") -> Optional[Path]:
        safe_survey = "".join(c for c in survey if c.isalnum() or c in "-_") or "2MASS-K"
        key = hashlib.sha256(f"{ra:.4f}:{dec:.4f}:{safe_survey}".encode()).hexdigest()[:16]
        img_path = LIVE_CACHE_DIR / f"cutout_{key}.png"

        if img_path.exists() and img_path.stat().st_size > 200:
            return img_path
        if self._circuit_open():
            return None

        params = {"Position": f"{ra},{dec}", "Survey": safe_survey, "Return": "PNG", "Pixels": "400", "Size": "0.15"}
        try:
            async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
                resp = await client.get(self.SKYVIEW_URL, params=params)
                if resp.status_code == 200 and resp.headers.get("content-type", "").startswith("image/"):
                    img_path.write_bytes(resp.content)
                    self._failures = 0
                    return img_path
        except Exception:
            self._failures += 1
            if self._failures >= 3:
                self._open_until = time.time() + 30.0
        return None

    @staticmethod
    def _parse_votable(xml_text: str, default_ra: float, default_dec: float) -> List[Dict[str, Any]]:
        try:
            root = ET.fromstring(xml_text)
        except ET.ParseError:
            return []
        for elem in root.iter():
            if "}" in elem.tag:
                elem.tag = elem.tag.split("}", 1)[1]

        fields = [f.attrib.get("name", f"c{i}") for i, f in enumerate(root.findall(".//FIELD"))]
        out = []
        for idx, tr in enumerate(root.findall(".//TABLEDATA/TR")):
            row = dict(zip(fields, [td.text or "" for td in tr.findall("TD")]))
            release = str(row.get("obs_release", "DR1")).upper()
            if "QR2" in release:
                continue
            out.append(
                {
                    "id": row.get("obs_id") or f"spherex-live-{idx}",
                    "observation_time": row.get("t_min") or "unknown",
                    "release": release,
                    "centre_ra": float(row.get("s_ra") or default_ra),
                    "centre_dec": float(row.get("s_dec") or default_dec),
                    "access_url": row.get("access_url") or "",
                }
            )
        return out


storage = SafeStorage()
nasa_client = NASALiveClient()
