#!/usr/bin/env bash
# Task 6.1 - create an isolated virtual environment (venv) and install Django.
# Usage: ./setup_env.sh [venv_dir]        (Linux / macOS / Git Bash)
set -euo pipefail

VENV_DIR="${1:-venv}"
PYTHON_BIN="${PYTHON_BIN:-python3}"

echo "==> Checking Python..."
if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
    echo "ERROR: $PYTHON_BIN not found on PATH. Install Python 3 first." >&2
    exit 1
fi
"$PYTHON_BIN" --version

echo "==> Creating virtual environment in '$VENV_DIR'..."
"$PYTHON_BIN" -m venv "$VENV_DIR"

# shellcheck disable=SC1091
if [ -f "$VENV_DIR/bin/activate" ]; then
    source "$VENV_DIR/bin/activate"
else
    source "$VENV_DIR/Scripts/activate"      # Git Bash on Windows
fi

echo "==> Upgrading pip..."
python -m pip install --upgrade pip

if [ -f requirements.txt ]; then
    echo "==> Installing from requirements.txt..."
    pip install -r requirements.txt
else
    echo "==> No requirements.txt found; installing Django and piping the"
    echo "    installed package list into requirements.txt"
    pip install django
    pip freeze > requirements.txt
fi

echo "==> Saving an exact snapshot (requirements.lock.txt)..."
pip freeze > requirements.lock.txt

echo "==> Django version:"
python -m django --version

echo
echo "Done. Activate later with:"
echo "  source $VENV_DIR/bin/activate        (Linux/macOS)"
echo "  $VENV_DIR\\Scripts\\activate           (Windows CMD/PowerShell)"
