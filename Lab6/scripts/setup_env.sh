#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r requirements.txt

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

.venv/bin/python -c 'from pathlib import Path; import secrets; p=Path(".env"); text=p.read_text(); text=text.replace("replace-this-for-local-development", secrets.token_urlsafe(50)); p.write_text(text)'
.venv/bin/python manage.py migrate
printf '%s\n' 'Environment ready. Activate with: source .venv/bin/activate'
