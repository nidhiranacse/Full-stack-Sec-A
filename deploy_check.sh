#!/usr/bin/env bash
# Task 6.3 - automated deployment readiness check
# Exit code 0 = all good, 1 = at least one check failed
PASS=0; FAIL=0
ok()   { echo "  [PASS] $1"; PASS=$((PASS+1)); }
bad()  { echo "  [FAIL] $1"; FAIL=$((FAIL+1)); }

echo "== 1. Runtime pathways =="
if command -v python3 >/dev/null; then
  ok "python3 found at $(command -v python3)"
  python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)' \
    && ok "Python version >= 3.8 ($(python3 --version 2>&1))" || bad "Python 3.8+ required"
else bad "python3 not on PATH"; fi
command -v pip >/dev/null || command -v pip3 >/dev/null && ok "pip available" || bad "pip not found"
command -v git >/dev/null && ok "git available" || bad "git not found"

echo "== 2. Virtual environment =="
if [ -n "${VIRTUAL_ENV:-}" ]; then ok "venv active: $VIRTUAL_ENV"
elif [ -d .venv ]; then bad ".venv exists but is not activated (source .venv/bin/activate)"
else bad "no virtual environment found"; fi

echo "== 3. Framework dependencies =="
PY=python3; [ -x .venv/bin/python ] && PY=.venv/bin/python
if $PY -c 'import django' 2>/dev/null; then ok "Django $($PY -c 'import django;print(django.get_version())')"
else bad "Django not importable"; fi
if [ -f requirements.txt ]; then
  ok "requirements.txt present"
  $PY -m pip check >/dev/null 2>&1 && ok "pip check: no broken dependencies" || bad "pip check reported conflicts"
else bad "requirements.txt missing"; fi
[ -f manage.py ] && ok "manage.py present" || bad "manage.py missing"

echo "== 4. Global environment keys =="
[ -f .env ] && set -a && . ./.env && set +a
for key in DJANGO_SETTINGS_MODULE SECRET_KEY ALLOWED_HOSTS; do
  [ -n "${!key:-}" ] && ok "$key is set" || bad "$key is NOT set"
done
[ "${SECRET_KEY:-}" = "change-me" ] && bad "SECRET_KEY still has the default placeholder"
[ "${DEBUG:-}" = "True" ] && echo "  [WARN] DEBUG=True (disable in production)"

echo "== 5. Django system check =="
if [ -f manage.py ]; then
  $PY manage.py check >/dev/null 2>&1 && ok "manage.py check passed" || bad "manage.py check failed"
fi

echo; echo "Result: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
