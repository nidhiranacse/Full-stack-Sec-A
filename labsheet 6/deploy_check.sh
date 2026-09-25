#!/usr/bin/env bash

# deploy_check.sh -- validates runtime paths, dependencies, and env keys

echo "===== DEPLOYMENT VALIDATION CHECK ====="

PASS=0
FAIL=0

check() {
    if eval "$2" > /dev/null 2>&1; then
        echo "[ PASS ] $1"
        PASS=$((PASS + 1))
    else
        echo "[ FAIL ] $1"
        FAIL=$((FAIL + 1))
    fi
}

# 1. Runtime pathway validation
check "Python 3 interpreter reachable" "command -v python3"
check "Virtual environment (django_env) exists" "[ -d django_env ]"

# 2. Framework dependency validation
check "Django importable in django_env" \
    "django_env/bin/python -c 'import django'"

check "requirements.txt present" "[ -f requirements.txt ]"

# 3. Global server environment key validation
for key in SECRET_KEY DEBUG ALLOWED_HOSTS DATABASE_URL; do
    check "Env key set: $key" "[ -n \"${!key}\" ]"
done

echo "========================================"

echo "PASS: $PASS FAIL: $FAIL"

[ "$FAIL" -eq 0 ] && echo "STATUS: READY FOR DEPLOYMENT"

[ "$FAIL" -ne 0 ] && echo "STATUS: DEPLOYMENT BLOCKED"