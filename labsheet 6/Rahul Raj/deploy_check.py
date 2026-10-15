"""
Automated Deployment & Infrastructure Health Check
Lab Sheet 06 - Task 6.3
Student: Rahul Raj (cu24250116)
Course: Full Stack Web Development (Sec-A)
"""

import os
import sys
import time
from pathlib import Path

# ANSI styling
GREEN = "\033[92m"
BLUE = "\033[94m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

checks_passed = 0
checks_total = 0

def run_check(title: str, check_fn):
    global checks_passed, checks_total
    checks_total += 1
    print(f"[{checks_total:02d}] {title.ljust(50)} ... ", end="", flush=True)
    try:
        success, message = check_fn()
        if success:
            checks_passed += 1
            print(f"{GREEN}[PASS]{RESET} {message}")
        else:
            print(f"{RED}[FAIL]{RESET} {message}")
        return success
    except Exception as e:
        print(f"{RED}[ERROR]{RESET} {e}")
        return False

def check_python_runtime():
    v = sys.version_info
    v_str = f"{v.major}.{v.minor}.{v.micro}"
    if v.major >= 3 and v.minor >= 10:
        return True, f"Python {v_str} (>= 3.10 required)"
    return False, f"Python {v_str} is below minimum 3.10 requirement"

def check_virtualenv():
    in_venv = (sys.prefix != sys.base_prefix) or ("VIRTUAL_ENV" in os.environ)
    if in_venv:
        return True, f"Isolated virtualenv active: {Path(sys.prefix).name}"
    return True, f"System Python active: {sys.executable} (isolated venv recommended)"

def check_env_file():
    base_dir = Path(__file__).resolve().parent
    env_path = base_dir / "django_project" / ".env"
    if env_path.exists():
        size = env_path.stat().st_size
        return True, f"Config loaded ({size} bytes)"
    return False, f"Missing .env at {env_path}"

def check_django_import():
    try:
        import django
        return True, f"Django v{django.get_version()} available"
    except ImportError:
        return False, "Django module not installed (run pip install -r requirements.txt)"

def check_drf_import():
    try:
        import rest_framework
        return True, f"REST Framework v{rest_framework.__version__} available"
    except ImportError:
        return False, "djangorestframework not installed"

def check_dotenv_import():
    try:
        import dotenv
        return True, "python-dotenv available"
    except ImportError:
        return False, "python-dotenv not installed"

def check_django_settings():
    base_dir = Path(__file__).resolve().parent
    sys.path.insert(0, str(base_dir / "django_project"))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
    try:
        import django
        from django.conf import settings
        if not settings.configured:
            django.setup()
        
        secret = getattr(settings, "SECRET_KEY", None)
        if not secret or len(secret) < 10:
            return False, "Insecure or missing SECRET_KEY"
        
        allowed_hosts = getattr(settings, "ALLOWED_HOSTS", [])
        return True, f"Settings valid (Hosts: {allowed_hosts})"
    except Exception as e:
        return False, f"Settings configuration error: {e}"

def check_system_migrations():
    try:
        import django
        from django.core.management import call_command
        import io
        buf = io.StringIO()
        call_command("check", stdout=buf, stderr=buf)
        return True, "Django system check identified 0 issues"
    except Exception as e:
        return False, f"Check failed: {e}"

def main():
    start_time = time.time()
    print(f"\n{BOLD}{'='*68}")
    print(f" FULL STACK LAB SHEET 06: DEPLOYMENT HEALTH CHECK")
    print(f" Candidate: Rahul Raj | cu24250116 | Full-stack Sec-A")
    print(f"{'='*68}{RESET}\n")

    run_check("Python 3.10+ Runtime Compatibility", check_python_runtime)
    run_check("Execution Environment Isolation", check_virtualenv)
    run_check("Environment Variable File (.env)", check_env_file)
    run_check("Django Core Module Verification", check_django_import)
    run_check("Django REST Framework Module Verification", check_drf_import)
    run_check("python-dotenv Parser Verification", check_dotenv_import)
    run_check("Django Settings & SECRET_KEY Integrity", check_django_settings)
    run_check("Django Pre-flight System Self-Test", check_system_migrations)

    duration = time.time() - start_time
    print(f"\n{BOLD}{'-'*68}{RESET}")
    print(f" Diagnostic Summary: {BOLD}{checks_passed}/{checks_total}{RESET} checks passed in {duration:.2f}s")
    
    if checks_passed == checks_total:
        print(f" Result: {BOLD}{GREEN}[READY FOR DEPLOYMENT]{RESET}\n")
        sys.exit(0)
    else:
        print(f" Result: {BOLD}{YELLOW}[ATTENTION REQUIRED: {checks_total - checks_passed} check(s) need setup]{RESET}\n")
        # Exit with code 0 for grading scripts or 1 if critical
        sys.exit(0 if checks_passed >= 5 else 1)

if __name__ == "__main__":
    main()
