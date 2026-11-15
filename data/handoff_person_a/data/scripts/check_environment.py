"""
AFTERLIGHT - Person A: SPHEREx Astronomical Data Pipeline
Environment Verification Script

Checks Python version, verifies critical astronomical and scientific package imports,
and prints their installed versions.
"""

import sys
import importlib

REQUIRED_PACKAGES = [
    "astropy",
    "numpy",
    "scipy",
    "matplotlib",
    "reproject",
    "pyvo",
]


def check_environment() -> bool:
    print("=" * 60)
    print("AFTERLIGHT - Astronomical Data Pipeline Environment Check")
    print("=" * 60)
    print(f"Python Version    : {sys.version.split()[0]} ({sys.platform})")
    print(f"Python Executable : {sys.executable}")
    print("-" * 60)
    print(f"{'Package':<20} | {'Status':<10} | {'Version'}")
    print("-" * 60)

    all_passed = True
    for pkg in REQUIRED_PACKAGES:
        try:
            mod = importlib.import_module(pkg)
            version = getattr(mod, "__version__", "unknown")
            print(f"{pkg:<20} | {'PASSED':<10} | v{version}")
        except ImportError as e:
            all_passed = False
            print(f"{pkg:<20} | {'FAILED':<10} | Error: {e}")
        except Exception as e:
            all_passed = False
            print(f"{pkg:<20} | {'ERROR':<10} | {type(e).__name__}: {e}")

    print("=" * 60)
    if all_passed:
        print("[SUCCESS] All required astronomical packages are installed and functional.")
    else:
        print("[FAILURE] One or more package imports failed. Please check the log above.")
    print("=" * 60)

    return all_passed


if __name__ == "__main__":
    success = check_environment()
    sys.exit(0 if success else 1)
