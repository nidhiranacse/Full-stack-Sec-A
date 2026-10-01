#!/usr/bin/env bash
# Task 6.1 - isolated Django environment using venv + generated requirements
# Usage: ./setup_django_env.sh [project_name]
set -euo pipefail

PROJECT="${1:-mysite}"
VENV_DIR=".venv"

echo "==> Checking Python"
command -v python3 >/dev/null || { echo "python3 not found. Install Python 3.8+ first."; exit 1; }
python3 --version

echo "==> Creating virtual environment in $VENV_DIR"
python3 -m venv "$VENV_DIR"
# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

echo "==> Upgrading pip and installing packages"
python -m pip install --upgrade pip
python -m pip install "Django>=4.2,<5.3" flake8 autopep8 python-dotenv

echo "==> Piping installed packages into requirements.txt"
pip freeze > requirements.txt
cat requirements.txt

echo "==> Writing setup.cfg (PEP8 / flake8 configuration)"
cat > setup.cfg <<'CFG'
[flake8]
max-line-length = 79
exclude = .venv,migrations,__pycache__
[pycodestyle]
max-line-length = 79
CFG

if [ ! -d "$PROJECT" ]; then
  echo "==> Creating Django project: $PROJECT"
  django-admin startproject "$PROJECT" .
fi

echo "==> Writing .env template"
[ -f .env ] || cat > .env <<'ENVF'
DJANGO_SETTINGS_MODULE=mysite.settings
SECRET_KEY=change-me
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
ENVF

echo
echo "Done. Activate with:  source $VENV_DIR/bin/activate"
echo "Run server with:      python manage.py runserver"
echo "Re-create elsewhere:  pip install -r requirements.txt"
