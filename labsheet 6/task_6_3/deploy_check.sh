#!/bin/bash
# ============================================================
# Task 6.3: Automated Deployment Check Script
# Validates runtime paths, framework dependencies,
# and global server environment keys before deployment.
# ============================================================

PASS=0
FAIL=0
WARN=0

echo "=========================================="
echo "  Automated Deployment Check"
echo "=========================================="
echo "  Date: $(date)"
echo "  Host: $(hostname)"
echo "  User: $(whoami)"
echo "=========================================="
echo ""

# --- Helper Functions ---
check_pass() {
    echo "  [PASS] $1"
    PASS=$((PASS + 1))
}

check_fail() {
    echo "  [FAIL] $1"
    FAIL=$((FAIL + 1))
}

check_warn() {
    echo "  [WARN] $1"
    WARN=$((WARN + 1))
}

# ==========================================
# SECTION 1: Runtime Pathway Validation
# ==========================================
echo "--- 1. Runtime Pathways ---"
echo ""

# Check Python
if command -v python3 &> /dev/null; then
    check_pass "Python3 found: $(python3 --version) at $(which python3)"
elif command -v python &> /dev/null; then
    check_pass "Python found: $(python --version) at $(which python)"
else
    check_fail "Python is NOT installed or not in PATH"
fi

# Check pip
if command -v pip3 &> /dev/null; then
    check_pass "pip3 found: $(pip3 --version)"
elif command -v pip &> /dev/null; then
    check_pass "pip found: $(pip --version)"
else
    check_fail "pip is NOT installed or not in PATH"
fi

# Check Node.js
if command -v node &> /dev/null; then
    check_pass "Node.js found: $(node --version) at $(which node)"
else
    check_warn "Node.js is not installed (optional for backend)"
fi

# Check Git
if command -v git &> /dev/null; then
    check_pass "Git found: $(git --version)"
else
    check_fail "Git is NOT installed"
fi

echo ""

# ==========================================
# SECTION 2: Framework Dependencies
# ==========================================
echo "--- 2. Framework Dependencies ---"
echo ""

# Check if virtual environment is active
if [ -n "$VIRTUAL_ENV" ]; then
    check_pass "Virtual environment active: $VIRTUAL_ENV"
else
    check_warn "No virtual environment is active"
fi

# Check Django
if python3 -c "import django; print(django.get_version())" 2>/dev/null; then
    DJANGO_VER=$(python3 -c "import django; print(django.get_version())" 2>/dev/null)
    check_pass "Django installed: v$DJANGO_VER"
else
    check_fail "Django is NOT installed in current environment"
fi

# Check Django REST Framework
if python3 -c "import rest_framework" 2>/dev/null; then
    check_pass "Django REST Framework is installed"
else
    check_warn "Django REST Framework is not installed"
fi

# Check Gunicorn
if command -v gunicorn &> /dev/null; then
    check_pass "Gunicorn found: $(gunicorn --version 2>&1)"
else
    check_warn "Gunicorn is not installed (needed for production)"
fi

# Check requirements.txt exists
if [ -f "../task_6_1/requirements.txt" ]; then
    check_pass "requirements.txt found"
else
    check_warn "requirements.txt not found in expected location"
fi

echo ""

# ==========================================
# SECTION 3: Environment Keys
# ==========================================
echo "--- 3. Server Environment Keys ---"
echo ""

# Check common env vars
ENV_VARS=("SECRET_KEY" "DEBUG" "DATABASE_URL" "ALLOWED_HOSTS")

for var in "${ENV_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        # Mask the value for security
        VALUE="${!var}"
        MASKED="${VALUE:0:4}****"
        check_pass "$var is set ($MASKED)"
    else
        check_warn "$var is NOT set (may need to configure for production)"
    fi
done

# Check .env file
if [ -f "../.env" ]; then
    check_pass ".env file found"
else
    check_warn ".env file not found (create one for local env vars)"
fi

# Check PATH includes common directories
if echo "$PATH" | grep -q "venv"; then
    check_pass "PATH includes virtual environment"
else
    check_warn "PATH does not include a virtual environment directory"
fi

echo ""

# ==========================================
# SUMMARY
# ==========================================
echo "=========================================="
echo "  Deployment Check Summary"
echo "=========================================="
echo ""
echo "  Passed:   $PASS"
echo "  Failed:   $FAIL"
echo "  Warnings: $WARN"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "  STATUS: READY FOR DEPLOYMENT"
else
    echo "  STATUS: NOT READY — fix $FAIL failure(s) above"
fi

echo ""
echo "=========================================="
