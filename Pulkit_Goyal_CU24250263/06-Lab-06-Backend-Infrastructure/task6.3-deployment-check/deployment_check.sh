#!/usr/bin/env bash
# ========================================================
# Deployment Pre-Flight Check Script (Bash / POSIX)
# Student: Pulkit Goyal (CU24250263) | Roll: 40 | Section: A
# ========================================================
set -e

echo "==================================================="
echo "Full Stack Development - Deployment Verification"
echo "Student: Pulkit Goyal (CUID: CU24250263)"
echo "==================================================="

echo "[1/4] Checking Python Runtime..."
python3 --version || python --version

echo "[2/4] Verifying Django Framework..."
python3 -c "import django; print('Django Version:', django.get_version())"

echo "[3/4] Validating Django Project..."
cd "$(dirname "$0")/../task6.1-django"
python3 manage.py check

echo "[4/4] Checking Migration Readiness..."
python3 manage.py showmigrations

echo "==================================================="
echo "All backend infrastructure pre-flight checks passed!"
echo "==================================================="
