#!/usr/bin/env python3
"""
AFTERLIGHT Backend Server Runner
Cross-platform entry point for Windows, macOS, and Linux.
"""
import sys
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

def main():
    print("=" * 60)
    print("       AFTERLIGHT BACKEND API - ASTRION Challenge 12")
    print("       'The universe leaves clues.'")
    print("=" * 60)
    print(f"Python: {sys.version.split()[0]} ({sys.platform})")
    print(f"Base Directory: {BASE_DIR}")

    bundle_dir = BASE_DIR / "data" / "bundle"
    index_file = bundle_dir / "index.json"
    if not index_file.exists():
        print(f"[!] Warning: Data bundle index not found at {index_file}")
    else:
        print(f"[✓] Data bundle found: {bundle_dir}")

    cases_dir = BASE_DIR / "data" / "cases"
    cases_dir.mkdir(parents=True, exist_ok=True)
    print(f"[✓] Case storage ready: {cases_dir}")

    host = os.getenv("AFTERLIGHT_HOST", "0.0.0.0")
    port = int(os.getenv("AFTERLIGHT_PORT", "8000"))

    print("-" * 60)
    print(f"Starting server at: http://{host}:{port}")
    print(f"Interactive Swagger Docs: http://{host}:{port}/docs")
    print(f"Health Check: http://{host}:{port}/api/health")
    print("-" * 60)

    try:
        import uvicorn
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=True,
            log_level="info",
        )
    except ImportError:
        print("\n[ERROR] 'uvicorn' is not installed in this Python environment.")
        print("Please install requirements first:")
        print("    pip install -r requirements.txt")
        sys.exit(1)

if __name__ == "__main__":
    main()
