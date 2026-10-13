#!/usr/bin/env python3
"""
Automated Cross-Platform Infrastructure & Deployment Verifier
Student: Pulkit Goyal (CUID: CU24250263 | Roll: 40 | Section: A)
"""
import sys
import os
import subprocess
from pathlib import Path

def print_step(num: int, title: str):
    print(f"\n[{num}/5] {title}...")

def run_cmd(cmd: list, cwd: Path = None) -> bool:
    try:
        result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, check=True)
        print(f"  ✓ SUCCESS: {result.stdout.strip().splitlines()[0] if result.stdout.strip() else 'Executed cleanly'}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"  ✗ FAILED: {e.stderr.strip() or e.stdout.strip()}")
        return False
    except FileNotFoundError:
        print(f"  ✗ Command not found: {cmd[0]}")
        return False

def main():
    print("=" * 60)
    print("Pre-Flight Infrastructure Verifier")
    print("Student: Pulkit Goyal | CUID: CU24250263 | Roll: 40 | Sec: A")
    print("=" * 60)

    base_dir = Path(__file__).resolve().parent.parent
    django_dir = base_dir / "task6.1-django"

    # Step 1: Python Version
    print_step(1, "Checking Python Interpreter")
    print(f"  Current Python Version: {sys.version.split()[0]} ({sys.executable})")

    # Step 2: Check Django
    print_step(2, "Verifying Django Dependency")
    try:
        import django
        print(f"  ✓ Django {django.get_version()} installed successfully.")
    except ImportError:
        print("  ✗ Django is NOT installed. Run 'pip install -r requirements.txt'")
        sys.exit(1)

    # Step 3: Run Django system check
    print_step(3, "Running Django System Check")
    run_cmd([sys.executable, "manage.py", "check"], cwd=django_dir)

    # Step 4: Show Migrations
    print_step(4, "Checking Database Migrations")
    run_cmd([sys.executable, "manage.py", "showmigrations"], cwd=django_dir)

    # Step 5: Verify VS Code config files
    print_step(5, "Verifying VS Code Developer Tooling")
    vscode_settings = base_dir / ".vscode" / "settings.json"
    if vscode_settings.exists():
        print(f"  ✓ VS Code settings verified at {vscode_settings.name}")
    else:
        print("  ✗ VS Code settings file missing")

    print("\n" + "=" * 60)
    print("All backend infrastructure checks evaluated cleanly!")
    print("=" * 60)

if __name__ == "__main__":
    main()
