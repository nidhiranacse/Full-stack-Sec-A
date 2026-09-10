@echo off

echo ==============================================
echo       DJANGO DEPLOYMENT ENVIRONMENT CHECK
echo ==============================================

echo.

echo [1] Checking Python runtime...
python --version

if %errorlevel% neq 0 (
    echo ERROR: Python is not available.
    goto FAILED
)

echo Python check: PASSED

echo.
echo [2] Checking Python PATH...
where python

if %errorlevel% neq 0 (
    echo ERROR: Python PATH is not configured.
    goto FAILED
)

echo Python PATH check: PASSED

echo.
echo [3] Checking PIP...
python -m pip --version

if %errorlevel% neq 0 (
    echo ERROR: PIP is not available.
    goto FAILED
)

echo PIP check: PASSED

echo.
echo [4] Checking Django...
python -m django --version

if %errorlevel% neq 0 (
    echo ERROR: Django is not installed.
    goto FAILED
)

echo Django check: PASSED

echo.
echo [5] Checking Django project...
if exist "..\task6.1-django\manage.py" (
    echo manage.py found.
) else (
    echo ERROR: Django manage.py not found.
    goto FAILED
)

echo Django project check: PASSED

echo.
echo [6] Checking virtual environment...
if exist "..\task6.1-django\venv\Scripts\python.exe" (
    echo Virtual environment found.
) else (
    echo ERROR: Virtual environment not found.
    goto FAILED
)

echo Virtual environment check: PASSED

echo.
echo [7] Checking environment variables...

if defined PATH (
    echo PATH: SET
) else (
    echo PATH: NOT SET
)

if defined DJANGO_SETTINGS_MODULE (
    echo DJANGO_SETTINGS_MODULE: SET
) else (
    echo DJANGO_SETTINGS_MODULE: NOT SET
)

if defined SECRET_KEY (
    echo SECRET_KEY: SET
) else (
    echo SECRET_KEY: NOT SET
)

echo.
echo ==============================================
echo       DEPLOYMENT CHECK COMPLETED
echo ==============================================

pause
exit /b 0

:FAILED

echo.
echo ==============================================
echo       DEPLOYMENT CHECK FAILED
echo ==============================================

pause
exit /b 1