#!/usr/bin/env python
"""Validate runtime paths, dependencies, and deployment environment keys."""
from __future__ import annotations

import importlib
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
REQUIRED_ENV_KEYS = ("DJANGO_SETTINGS_MODULE", "DJANGO_SECRET_KEY", "DJANGO_ALLOWED_HOSTS")


def check(label: str, passed: bool, detail: str) -> bool:
    marker = "PASS" if passed else "FAIL"
    print(f"[{marker}] {label}: {detail}")
    return passed


def main() -> int:
    try:
        from dotenv import load_dotenv

        load_dotenv(PROJECT_ROOT / ".env")
    except ImportError:
        pass

    results = []
    results.append(check("Python runtime", sys.version_info >= (3, 10), sys.version.split()[0]))
    results.append(check("Active interpreter", PROJECT_ROOT / ".venv" in Path(sys.executable).parents, sys.executable))
    results.append(check("Project root", PROJECT_ROOT.is_dir(), str(PROJECT_ROOT)))
    results.append(check("Manage script", (PROJECT_ROOT / "manage.py").is_file(), "manage.py exists"))
    results.append(check("Virtual environment", (PROJECT_ROOT / ".venv").is_dir(), ".venv exists"))

    for package in ("django", "dotenv"):
        try:
            module = importlib.import_module(package)
            version = getattr(module, "__version__", "installed")
            results.append(check(f"Dependency {package}", True, str(version)))
        except ImportError:
            results.append(check(f"Dependency {package}", False, "not importable"))

    for key in REQUIRED_ENV_KEYS:
        value = os.getenv(key, "")
        present = bool(value)
        if key == "DJANGO_SECRET_KEY" and value == "replace-this-for-local-development":
            present = False
        results.append(check(f"Environment {key}", present, "set" if present else "missing or placeholder"))

    settings_module = os.getenv("DJANGO_SETTINGS_MODULE", "config.settings")
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", settings_module)
    try:
        import django
        from django.core.management import call_command

        django.setup()
        call_command("check", deploy=True, verbosity=0)
        results.append(check("Django deployment checks", True, "system check passed"))
    except Exception as exc:
        results.append(check("Django deployment checks", False, str(exc)))

    failures = results.count(False)
    print(f"\nDeployment check complete: {len(results) - failures} passed, {failures} failed.")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
