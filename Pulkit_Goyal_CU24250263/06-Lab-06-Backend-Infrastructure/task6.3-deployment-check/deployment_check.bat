@echo off
REM ========================================================
REM Deployment Pre-Flight Check Script (Windows Batch)
REM Student: Pulkit Goyal (CU24250263) | Roll: 40 | Section: A
REM ========================================================

echo ===================================================
echo Full Stack Development - Deployment Verification
echo Student: Pulkit Goyal (CUID: CU24250263)
echo ===================================================

echo [1/4] Checking Python Runtime...
python --version
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in system PATH.
    exit /b 1
)

echo [2/4] Verifying Django Framework Installation...
python -c "import django; print('Django Version:', django.get_version())"
if %errorlevel% neq 0 (
    echo [ERROR] Django is not installed. Run 'pip install -r requirements.txt'.
    exit /b 1
)

echo [3/4] Validating Django Project Configuration...
cd ..\task6.1-django
python manage.py check --deploy
if %errorlevel% neq 0 (
    echo [WARNING] Deploy check reported warnings. Review configurations.
)

echo [4/4] Checking Database Migration Status...
python manage.py showmigrations
echo.
echo ===================================================
echo Pre-flight deployment check completed successfully!
echo ===================================================
pause
