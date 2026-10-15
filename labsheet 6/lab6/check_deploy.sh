#!/usr/bin/env bash
# Task 6.3 - automated deployment check.
# Validates: runtime paths, framework dependencies, environment variables.
# Exit code 0 = all required checks passed, 1 = at least one FAIL.
# Usage: ./check_deploy.sh            (optionally: set -a; source .env; set +a)

PASS=0; FAIL=0; WARN=0
ok()   { echo "  [PASS] $1"; PASS=$((PASS+1)); }
bad()  { echo "  [FAIL] $1"; FAIL=$((FAIL+1)); }
warn() { echo "  [WARN] $1"; WARN=$((WARN+1)); }

PY="$(command -v python3 || command -v python || true)"

echo "== 1. Runtime pathways =="
if [ -n "$PY" ]; then
    ok "Python found at $PY ($($PY --version 2>&1))"
    if "$PY" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)'; then
        ok "Python version is 3.10 or newer"
    else
        bad "Python 3.10+ required"
    fi
else
    bad "Python not found on PATH"
fi

if [ -n "$PY" ] && "$PY" -m pip --version >/dev/null 2>&1; then
    ok "pip is available"
else
    bad "pip is not available"
fi

if [ -n "${VIRTUAL_ENV:-}" ]; then
    ok "Virtual environment active: $VIRTUAL_ENV"
    case ":$PATH:" in
        *":$VIRTUAL_ENV/bin:"*|*":$VIRTUAL_ENV/Scripts:"*)
            ok "Virtual environment is on PATH" ;;
        *) bad "VIRTUAL_ENV set but not on PATH" ;;
    esac
elif [ -d venv ]; then
    warn "venv/ exists but is not activated (run: source venv/bin/activate)"
else
    bad "No virtual environment (run ./setup_env.sh)"
fi

if [ -f manage.py ]; then ok "manage.py found"; else warn "manage.py not in current directory"; fi

echo "== 2. Framework dependencies =="
if [ -n "$PY" ] && DJV="$("$PY" -c 'import django; print(django.get_version())' 2>/dev/null)"; then
    ok "Django $DJV importable"
else
    bad "Django is not installed in this interpreter"
fi

if [ -f requirements.txt ] && [ -n "$PY" ]; then
    while IFS= read -r line; do
        line="${line%%#*}"
        pkg="$(echo "$line" | sed 's/[<>=!~; ].*//' | tr -d '[:space:]')"
        [ -z "$pkg" ] && continue
        if "$PY" -m pip show "$pkg" >/dev/null 2>&1; then
            ok "requirement installed: $pkg"
        else
            bad "requirement missing: $pkg"
        fi
    done < requirements.txt
else
    warn "requirements.txt not found, skipping package check"
fi

if [ -n "$PY" ] && "$PY" -m pip check >/dev/null 2>&1; then
    ok "pip check: no broken dependencies"
else
    warn "pip check reported problems (or pip unavailable)"
fi

echo "== 3. Global environment keys =="
for key in DJANGO_SETTINGS_MODULE SECRET_KEY ALLOWED_HOSTS; do
    if [ -n "${!key:-}" ]; then ok "$key is set"; else bad "$key is NOT set"; fi
done

if [ -z "${DEBUG:-}" ]; then
    bad "DEBUG is NOT set"
elif [ "${DEBUG}" = "True" ] || [ "${DEBUG}" = "1" ]; then
    warn "DEBUG is enabled - must be False in production"
else
    ok "DEBUG is disabled"
fi

if [ -n "${SECRET_KEY:-}" ]; then
    if [ "${SECRET_KEY}" = "change-me-to-a-long-random-string" ] || [ "${#SECRET_KEY}" -lt 20 ]; then
        warn "SECRET_KEY looks weak/default"
    fi
fi

echo "== 4. Django system check =="
if [ -f manage.py ] && [ -n "$PY" ] && [ -n "${DJANGO_SETTINGS_MODULE:-}" ]; then
    if "$PY" manage.py check >/dev/null 2>&1; then
        ok "manage.py check passed"
    else
        bad "manage.py check failed (run it manually for details)"
    fi
else
    warn "Skipped manage.py check (needs manage.py and DJANGO_SETTINGS_MODULE)"
fi

echo
echo "Summary: $PASS passed, $FAIL failed, $WARN warnings"
if [ "$FAIL" -gt 0 ]; then
    echo "RESULT: NOT READY FOR DEPLOYMENT"
    exit 1
fi
echo "RESULT: READY"
exit 0
