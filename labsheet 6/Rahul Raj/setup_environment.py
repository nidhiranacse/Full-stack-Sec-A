"""
Automated Backend Environment Setup Script
Lab Sheet 06 - Task 6.1
Student: Rahul Raj (cu24250116)
Course: Full Stack Web Development (Sec-A)
"""

import os
import sys
import subprocess
import shutil
import venv
from pathlib import Path

# ANSI Color codes for clean terminal output
GREEN = "\033[92m"
BLUE = "\033[94m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

def print_step(step: str):
    print(f"\n{BOLD}{BLUE}[STEP]{RESET} {step}")

def print_success(msg: str):
    print(f"{GREEN}[SUCCESS] {msg}{RESET}")

def print_warning(msg: str):
    print(f"{YELLOW}[WARNING] {msg}{RESET}")

def print_error(msg: str):
    print(f"{RED}[ERROR] {msg}{RESET}")

def check_python_version():
    print_step("Validating Python Runtime Version...")
    major, minor = sys.version_info.major, sys.version_info.minor
    print(f"Detected Python {major}.{minor}.{sys.version_info.micro}")
    if major < 3 or (major == 3 and minor < 10):
        print_error("Python 3.10 or higher is required. Please upgrade your Python runtime.")
        sys.exit(1)
    print_success(f"Python version {major}.{minor} meets minimum requirements (>=3.10).")

def create_virtual_environment(venv_path: Path):
    print_step(f"Setting up isolated virtual environment at '{venv_path}'...")
    if venv_path.exists():
        print_warning(f"Virtual environment directory '{venv_path}' already exists. Skipping creation.")
    else:
        builder = venv.EnvBuilder(with_pip=True, upgrade_deps=True)
        builder.create(venv_path)
        print_success(f"Virtual environment successfully initialized at '{venv_path}'.")

def get_venv_executables(venv_path: Path):
    if os.name == "nt":
        python_bin = venv_path / "Scripts" / "python.exe"
        pip_bin = venv_path / "Scripts" / "pip.exe"
    else:
        python_bin = venv_path / "bin" / "python"
        pip_bin = venv_path / "bin" / "pip"
    return python_bin, pip_bin

def install_requirements(pip_bin: Path, req_file: Path):
    print_step(f"Installing dependencies from '{req_file.name}'...")
    if not req_file.exists():
        print_error(f"Requirements file '{req_file}' not found.")
        sys.exit(1)
    
    # Upgrade pip first
    try:
        subprocess.run([str(pip_bin), "install", "--upgrade", "pip"], check=True)
        # Install packages
        subprocess.run([str(pip_bin), "install", "-r", str(req_file)], check=True)
        print_success("All project dependencies successfully installed.")
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to install dependencies: {e}")
        sys.exit(1)

def setup_env_file(project_dir: Path):
    print_step("Configuring Environment Variables (.env)...")
    env_file = project_dir / "django_project" / ".env"
    env_example = project_dir / "django_project" / ".env.example"
    
    if not env_file.exists():
        if env_example.exists():
            shutil.copy(env_example, env_file)
            print_success(f"Created '{env_file}' from template.")
        else:
            env_file.parent.mkdir(parents=True, exist_ok=True)
            with open(env_file, "w", encoding="utf-8") as f:
                f.write(
                    "# Backend Environment Configuration\n"
                    "SECRET_KEY=django-insecure-labsheet06-rahulraj-cu24250116-key\n"
                    "DEBUG=True\n"
                    "ALLOWED_HOSTS=127.0.0.1,localhost\n"
                    "PORT=8000\n"
                )
            print_success(f"Created default configuration at '{env_file}'.")
    else:
        print_success(f"Configuration file '{env_file}' is already present.")

def main():
    print(f"\n{BOLD}{'='*60}")
    print(f" Full Stack Lab Sheet 06: Automated Environment Provisioner")
    print(f" Developer: Rahul Raj | cu24250116 | Full-stack Sec-A")
    print(f"{'='*60}{RESET}\n")

    base_dir = Path(__file__).resolve().parent
    venv_dir = base_dir / ".venv"
    req_file = base_dir / "requirements.txt"

    check_python_version()
    create_virtual_environment(venv_dir)
    python_bin, pip_bin = get_venv_executables(venv_dir)
    setup_env_file(base_dir)

    print(f"\n{BOLD}{GREEN}Virtual environment configured:{RESET}")
    print(f" - Python Binary: {python_bin}")
    print(f" - Pip Binary:    {pip_bin}")
    print(f"\nTo install packages into this environment, run:")
    print(f"  {pip_bin} install -r {req_file}\n")
    print(f"{BOLD}{GREEN}Environment provisioning completed successfully!{RESET}\n")

if __name__ == "__main__":
    main()
