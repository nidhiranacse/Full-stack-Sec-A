#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_PATH="$PROJECT_ROOT/.venv"
PYTHON="$VENV_PATH/bin/python"
REQUIREMENTS="$PROJECT_ROOT/requirements.txt"

command -v python3 >/dev/null 2>&1 || {
  echo "Python 3 was not found on PATH." >&2
  exit 1
}

if [[ ! -x "$PYTHON" ]]; then
  echo "Creating isolated virtual environment at .venv..."
  python3 -m venv "$VENV_PATH"
fi

"$PYTHON" -m pip install --requirement "$REQUIREMENTS"
echo "Environment ready. Interpreter: $PYTHON"
