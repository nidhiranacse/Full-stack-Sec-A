@echo off

echo ==========================================
echo Django Environment Deployment Check
echo ==========================================

echo.

echo [1] Checking Python...
python --version

if errorlevel 1 (
    echo ERROR: Python is not installed.
) else (
    echo Python is available.
)

echo.
echo [2] Checking pip...
pip --version

if errorlevel 1 (
    echo ERROR: pip is not available.
) else (
    echo pip is available.
)

echo.
echo [3] Checking virtual environment...

if exist "venv\Scripts\python.exe" (
    echo Virtual environment found.
) else (
    echo ERROR: Virtual environment not found.
)

echo.
echo [4] Checking Django...

python -c "import django; print('Django version:', django.get_version())"

if errorlevel 1 (
    echo ERROR: Django is not installed.
) else (
    echo Django installation verified.
)

echo.
echo [5] Checking Django project...

if exist "manage.py" (
    echo manage.py found.
) else (
    echo ERROR: manage.py not found.
)

echo.
echo [6] Checking environment PATH...

if defined PATH (
    echo PATH environment variable is available.
) else (
    echo ERROR: PATH variable is missing.
)

echo.
echo ==========================================
echo Environment check completed.
echo ==========================================

pause 