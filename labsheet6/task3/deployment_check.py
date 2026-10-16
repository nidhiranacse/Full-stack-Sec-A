#!/usr/bin/env python3
"""
Lab Sheet 06 - Task 6.3: Automated Deployment Integrity Check
Validates system paths, framework dependencies, and critical environment variables.
"""

import sys
import os
import shutil

def log_status(test_name, status, details=""):
    symbol = "✓" if status else "✗"
    color_code = "\033[92m" if status else "\033[91m"
    reset_code = "\033[0m"
    print(f"[{color_code}{symbol}{reset_code}] {test_name}: {details}")

def validate_runtime_pathways():
    print("\n--- 1. Checking Systemic Runtime Pathways ---")
    
    # Check Python version (>= 3.10)
    version_ok = sys.version_info >= (3, 10)
    log_status("Python Engine Version", version_ok, f"Detected Python {sys.version.split()[0]}")
    
    # Verify Virtual Environment execution context
    in_venv = sys.prefix != sys.base_prefix
    log_status("Isolated Venv Pathway", in_venv, f"Active Prefix: {sys.prefix}")
    
    # Check binary path availability
    pip_path = shutil.which("pip")
    log_status("Pip Binary Resolution", bool(pip_path), f"Path: {pip_path}")

def validate_framework_dependencies():
    print("\n--- 2. Checking Framework Dependencies ---")
    
    # Django Validation
    try:
        import django
        log_status("Django Framework", True, f"Installed Version {django.get_version()}")
    except ImportError:
        log_status("Django Framework", False, "Module 'django' not resolved in current runtime.")

    # Dotenv Validation
    try:
        import dotenv
        log_status("Python-Dotenv Integration", True, "Module available.")
    except ImportError:
        log_status("Python-Dotenv Integration", False, "Module 'python-dotenv' missing.")

def validate_environment_keys():
    print("\n--- 3. Checking Global Environment Keys ---")
    
    # Optionally load .env file if present
    if os.path.exists(".env"):
        from dotenv import load_dotenv
        load_dotenv()
        print("[INFO] Loaded environment configuration from local .env file.")

    required_keys = ["SECRET_KEY", "DEBUG", "ALLOWED_HOSTS"]
    all_keys_valid = True

    for key in required_keys:
        val = os.getenv(key)
        if val is not None:
            log_status(f"Env Key [{key}]", True, "Configured")
        else:
            log_status(f"Env Key [{key}]", False, "MISSING/UNSET")
            all_keys_valid = False

    return all_keys_valid

if __name__ == "__main__":
    print("==================================================")
    print("      DEPLOYSPEC: SYSTEMIC INFRASTRUCTURE CHECK   ")
    print("==================================================")
    
    validate_runtime_pathways()
    validate_framework_dependencies()
    keys_ok = validate_environment_keys()
    
    print("\n==================================================")
    if keys_ok:
        print("RESULT: All infrastructure pathways ready for execution.")
        sys.exit(0)
    else:
        print("RESULT: Validation failed due to missing configuration settings.")
        sys.exit(1)