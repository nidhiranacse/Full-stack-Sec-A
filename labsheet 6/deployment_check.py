"""Validate the Python, Django, and deployment environment."""

from __future__ import annotations

import argparse
import importlib.util
import os
import sys
from pathlib import Path

REQUIRED_ENVIRONMENT = ("DJANGO_SETTINGS_MODULE", "SECRET_KEY", "ALLOWED_HOSTS")
OPTIONAL_ENVIRONMENT = ("DATABASE_URL", "DEBUG")


def check_python() -> tuple[bool, str]:
    supported = sys.version_info >= (3, 11)
    version = ".".join(str(part) for part in sys.version_info[:3])
    return supported, f"Python {version} (requires >= 3.11)"


def check_module(module_name: str) -> tuple[bool, str]:
    available = importlib.util.find_spec(module_name) is not None
    return available, f"{module_name} {'installed' if available else 'not installed'}"


def check_project_root() -> tuple[bool, str]:
    root = Path(__file__).resolve().parents[1]
    requirements = root / "requirements.txt"
    return requirements.is_file(), f"requirements.txt {'found' if requirements.is_file() else 'missing'}"


def check_environment() -> list[tuple[bool, str]]:
    results = []
    for name in REQUIRED_ENVIRONMENT:
        present = bool(os.getenv(name))
        results.append((present, f"{name} {'set' if present else 'missing'}"))
    for name in OPTIONAL_ENVIRONMENT:
        results.append((True, f"{name} {'set' if os.getenv(name) else 'not set (optional)'}"))
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--strict",
        action="store_true",
        help="also fail when optional deployment variables are not set",
    )
    args = parser.parse_args()

    checks = [check_python(), check_module("django"), check_project_root()]
    environment = check_environment()
    checks.extend(environment)

    failures = 0
    for passed, message in checks:
        label = "PASS" if passed else "FAIL"
        print(f"[{label}] {message}")
        failures += not passed

    if args.strict:
        missing_optional = [name for name in OPTIONAL_ENVIRONMENT if not os.getenv(name)]
        if missing_optional:
            print(f"[FAIL] Optional variables required in strict mode: {', '.join(missing_optional)}")
            failures += 1

    return int(failures > 0)


if __name__ == "__main__":
    raise SystemExit(main())
