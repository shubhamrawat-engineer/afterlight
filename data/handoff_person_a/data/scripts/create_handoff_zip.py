"""
AFTERLIGHT — Create Person A to Person B Handoff ZIP Package
Creates clean AFTERLIGHT_PERSON_A_HANDOFF.zip preserving directory structure
without temporary files, __pycache__, or bloated binary caches.
"""
import os
import sys
import zipfile
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
ZIP_NAME = "AFTERLIGHT_PERSON_A_HANDOFF.zip"
ZIP_PATH = PROJECT_ROOT / ZIP_NAME

def should_include_file(rel_path: str) -> bool:
    norm_path = rel_path.replace("\\", "/")

    # Exclusions
    if ".venv" in norm_path:
        return False
    if "__pycache__" in norm_path or norm_path.endswith(".pyc"):
        return False
    if norm_path.endswith(".tmp") or norm_path.endswith(".log"):
        return False
    if "api_test_session" in norm_path:
        return False
    if norm_path.startswith("data/cache"):
        return False
    if norm_path.startswith("data/raw"):
        return False
    if norm_path.startswith("data/processed/jobs"):
        return False
    if norm_path.endswith(".fits"):
        return False
    if norm_path == ZIP_NAME or norm_path.endswith(".zip"):
        return False

    # Inclusions
    if norm_path.startswith("backend/services/"):
        return True
    if norm_path.startswith("backend/app/"):
        return True
    if norm_path.startswith("data/schemas/"):
        return True
    if norm_path.startswith("data/scripts/"):
        return True
    if norm_path.startswith("data/processed/selected_pair/"):
        return True
    if norm_path.startswith("data/processed/sessions/live_stage10_fresh_pair/"):
        return True
    if any(norm_path.startswith(f"data/{folder}/") for folder in [
        "comets", "asteroids", "dwarf_planets", "stars", "brown_dwarfs", "spherex", "neo", "reports"
    ]):
        return True

    # Root documentation and requirements
    root_files = [
        "ASTRONOMICAL_API_INTEGRATION_REPORT.md",
        "PERSON_A_BACKEND_HANDOFF.md",
        "ASTRONOMICAL_DATA_SOURCE_AUDIT.md",
        "MOVING_OBJECT_DISCOVERY_DESIGN.md",
        "OBJECT_CATALOGUE_SCHEMA.md",
        "OBJECT_CATEGORY_COVERAGE_REPORT.md",
        "README.md",
        "requirements.txt"
    ]
    if norm_path in root_files:
        return True

    return False

def build_zip():
    print(f"Creating handoff package: {ZIP_PATH}")
    if os.path.exists(ZIP_PATH):
        os.remove(ZIP_PATH)

    files_added = []
    with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(PROJECT_ROOT):
            # Prune directories we definitely don't want to descend into
            dirs[:] = [d for d in dirs if d not in [".venv", "__pycache__", ".git"]]

            for file in files:
                full_path = Path(root) / file
                rel_path = full_path.relative_to(PROJECT_ROOT)
                rel_str = str(rel_path)

                if should_include_file(rel_str):
                    arcname = rel_str.replace("\\", "/")
                    zf.write(full_path, arcname=arcname)
                    files_added.append(arcname)

    files_added.sort()
    zip_size_bytes = os.path.getsize(ZIP_PATH)
    zip_size_mb = zip_size_bytes / (1024 * 1024)

    print(f"Handoff ZIP created successfully.")
    print(f"Total files packaged: {len(files_added)}")
    print(f"ZIP Size: {zip_size_bytes:,} bytes ({zip_size_mb:.2f} MB)")

    # Verification
    print("\n--- Verifying ZIP Integrity ---")
    with zipfile.ZipFile(ZIP_PATH, "r") as zf:
        test_res = zf.testzip()
        if test_res is None:
            print("Integrity check PASSED: All CRC-32 checksums match, zero corrupted files.")
        else:
            print(f"Integrity check FAILED: Corrupted file found: {test_res}")

        infolist = zf.infolist()
        print(f"Total verified members inside archive: {len(infolist)}")

    return files_added, zip_size_bytes

if __name__ == "__main__":
    build_zip()
