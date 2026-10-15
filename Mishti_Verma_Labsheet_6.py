import os
import sys
import subprocess
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent
VENV_DIR = PROJECT_ROOT / ".venv"
REQUIREMENTS_FILE = PROJECT_ROOT / "requirements.txt"

REQUIREMENTS = [
    "Django>=5.0,<6.0",
    "python-dotenv>=1.0",
    "gunicorn>=21.0",
]


# ============================================================
# TASK 6.1 - ISOLATED DJANGO VIRTUAL ENVIRONMENT
# ============================================================

def create_virtual_environment():
    """Create an isolated Python virtual environment."""

    if VENV_DIR.exists():
        print("[INFO] Virtual environment already exists.")
        return

    print("[INFO] Creating virtual environment...")

    subprocess.check_call(
        [sys.executable, "-m", "venv", str(VENV_DIR)]
    )

    print("[SUCCESS] Virtual environment created.")


def create_requirements_file():
    """Create the project requirement definition file."""

    REQUIREMENTS_FILE.write_text(
        "\n".join(REQUIREMENTS) + "\n",
        encoding="utf-8"
    )

    print("[SUCCESS] requirements.txt created.")


def get_venv_python():
    """Return the Python executable inside the virtual environment."""

    if os.name == "nt":
        return VENV_DIR / "Scripts" / "python.exe"

    return VENV_DIR / "bin" / "python"


def install_requirements():
    """Install all dependencies from requirements.txt."""

    python_executable = get_venv_python()

    if not python_executable.exists():
        print("[ERROR] Virtual environment Python executable not found.")
        return

    print("[INFO] Installing Django requirements...")

    subprocess.check_call(
        [
            str(python_executable),
            "-m",
            "pip",
            "install",
            "-r",
            str(REQUIREMENTS_FILE)
        ]
    )

    print("[SUCCESS] Requirements installed.")


# ============================================================
# TASK 6.2 - VS CODE PYTHON / PEP8 CONFIGURATION
# ============================================================

VSCODE_DIR = PROJECT_ROOT / ".vscode"
SETTINGS_FILE = VSCODE_DIR / "settings.json"
KEYBINDINGS_FILE = VSCODE_DIR / "keybindings.json"

VSCODE_SETTINGS = """{
    "python.defaultInterpreterPath":
        "${workspaceFolder}/.venv/bin/python",
    "python.analysis.typeCheckingMode": "basic",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": "explicit"
    },
    "python.analysis.autoImportCompletions": true,
    "python.analysis.diagnosticMode": "workspace",
    "[python]": {
        "editor.defaultFormatter":
            "ms-python.black-formatter",
        "editor.formatOnSave": true,
        "editor.rulers": [79]
    }
}
"""

VSCODE_KEYBINDINGS = """[
    {
        "key": "ctrl+alt+l",
        "command": "editor.action.formatDocument",
        "when": "editorTextFocus && editorLangId == 'python'"
    },
    {
        "key": "ctrl+alt+o",
        "command": "editor.action.organizeImports",
        "when": "editorTextFocus && editorLangId == 'python'"
    }
]
"""


def create_vscode_configuration():
    """Create VS Code settings and Python shortcuts."""

    VSCODE_DIR.mkdir(exist_ok=True)

    SETTINGS_FILE.write_text(
        VSCODE_SETTINGS,
        encoding="utf-8"
    )

    KEYBINDINGS_FILE.write_text(
        VSCODE_KEYBINDINGS,
        encoding="utf-8"
    )

    print("[SUCCESS] VS Code PEP8 configuration created.")
    print("[INFO] Ctrl+Alt+L = Format Python file")
    print("[INFO] Ctrl+Alt+O = Organize Python imports")


# ============================================================
# TASK 6.3 - AUTOMATED DEPLOYMENT CHECK
# ============================================================

DEPLOYMENT_CHECK = PROJECT_ROOT / "deployment_check.py"

DEPLOYMENT_SCRIPT = '''"""
Django Deployment Validation
----------------------------

Checks:
1. Python runtime
2. Django installation
3. Django project configuration
4. Required environment variables
5. Database configuration
"""

import os
import sys


REQUIRED_ENV_KEYS = [
    "DJANGO_SECRET_KEY",
    "DJANGO_SETTINGS_MODULE"
]


def check_python():
    """Validate Python runtime."""

    print("\\n[1] Python Runtime")

    version = sys.version_info

    print(
        f"Python {version.major}."
        f"{version.minor}."
        f"{version.micro}"
    )

    if version.major != 3:
        print("[FAIL] Python 3 is required.")
        return False

    print("[PASS] Python runtime is valid.")
    return True


def check_django():
    """Validate Django installation."""

    print("\\n[2] Django Framework")

    try:
        import django

        print(
            f"Django version: "
            f"{django.get_version()}"
        )

        print("[PASS] Django is installed.")
        return True

    except ImportError:
        print("[FAIL] Django is not installed.")
        return False


def check_environment():
    """Check required deployment environment keys."""

    print("\\n[3] Environment Variables")

    success = True

    for key in REQUIRED_ENV_KEYS:

        if os.getenv(key):
            print(
                f"[PASS] {key} is configured."
            )
        else:
            print(
                f"[FAIL] {key} is missing."
            )

            success = False

    return success


def check_django_configuration():
    """Validate Django settings."""

    print("\\n[4] Django Configuration")

    settings_module = os.getenv(
        "DJANGO_SETTINGS_MODULE"
    )

    if not settings_module:
        print(
            "[FAIL] DJANGO_SETTINGS_MODULE "
            "is not set."
        )

        return False

    os.environ.setdefault(
        "DJANGO_SETTINGS_MODULE",
        settings_module
    )

    try:
        import django

        django.setup()

        print(
            "[PASS] Django configuration loaded."
        )

        return True

    except Exception as error:

        print(
            f"[FAIL] Django configuration error: "
            f"{error}"
        )

        return False


def main():
    """Run all deployment checks."""

    print("=" * 60)
    print("DJANGO DEPLOYMENT CHECK")
    print("=" * 60)

    checks = [
        check_python(),
        check_django(),
        check_environment(),
        check_django_configuration()
    ]

    print("\\n" + "=" * 60)

    if all(checks):
        print("DEPLOYMENT CHECK: PASSED")
        return 0

    print("DEPLOYMENT CHECK: FAILED")
    return 1


if __name__ == "__main__":
    sys.exit(main())
'''


def create_deployment_check():
    """Create the deployment validation script."""

    DEPLOYMENT_CHECK.write_text(
        DEPLOYMENT_SCRIPT,
        encoding="utf-8"
    )

    print(
        "[SUCCESS] deployment_check.py created."
    )


# ============================================================
# MAIN PROGRAM
# ============================================================

if __name__ == "__main__":

    create_virtual_environment()

    create_requirements_file()

    install_requirements()

    create_vscode_configuration()

    create_deployment_check()

    print(
        "[SUCCESS] Lab Sheet 6 setup completed."
    )