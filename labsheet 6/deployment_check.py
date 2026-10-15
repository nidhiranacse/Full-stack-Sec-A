import os
import sys
import importlib.util
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
REQUIREMENTS_FILE = BASE_DIR / "requirements.txt"
VENV_DIR = BASE_DIR / ".venv"

checks = [
    ("Python runtime", sys.version_info >= (3, 10)),
    ("Python executable", Path(sys.executable).exists()),
    ("Virtual environment", sys.prefix != sys.base_prefix),
    ("Project venv directory", VENV_DIR.exists()),
    ("Django installed", importlib.util.find_spec("django") is not None),
    ("Requirements file", REQUIREMENTS_FILE.exists()),
    ("DJANGO_SETTINGS_MODULE", bool(os.getenv("DJANGO_SETTINGS_MODULE"))),
    ("SECRET_KEY configured", bool(os.getenv("SECRET_KEY"))),
    ("DEBUG configured", os.getenv("DEBUG") in {"True", "False"}),
]

print("\nDEPLOYMENT ENVIRONMENT CHECK")
print("=" * 35)

failed = 0

for name, passed in checks:
    status = "PASS" if passed else "FAIL"
    print(f"{name}: {status}")

    if not passed:
        failed += 1

print("=" * 35)

if failed:
    print(f"Deployment check completed with {failed} issue(s).")
    sys.exit(1)

print("All deployment checks passed.")