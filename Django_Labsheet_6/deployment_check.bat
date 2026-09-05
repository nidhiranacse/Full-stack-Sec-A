@echo off
echo ==========================================
echo     DJANGO DEPLOYMENT ENVIRONMENT CHECK
echo ==========================================

echo.
echo [1] Checking Python...
python --version
if errorlevel 1 (
    echo ERROR: Python is not available.
    exit /b 1
)

echo.
echo [2] Checking Python Path...
where python

echo.
echo [3] Checking Virtual Environment...
if exist ..\venv\Scripts\python.exe (
    echo OK: Virtual environment found.
) else (
    echo ERROR: Virtual environment not found.
    exit /b 1
)

echo.
echo [4] Checking Django...
python -m django --version
if errorlevel 1 (
    echo ERROR: Django is not installed.
    exit /b 1
)

echo.
echo [5] Checking Requirements File...
if exist requirements.txt (
    echo OK: requirements.txt found.
) else (
    echo ERROR: requirements.txt missing.
    exit /b 1
)

echo.
echo [6] Checking Django Project...
if exist manage.py (
    echo OK: manage.py found.
) else (
    echo ERROR: manage.py missing.
    exit /b 1
)

echo.
echo [7] Checking PATH Environment Variable...
if defined PATH (
    echo OK: PATH environment variable exists.
) else (
    echo ERROR: PATH variable not found.
)

echo.
echo ==========================================
echo       DEPLOYMENT CHECK COMPLETED
echo ==========================================

pause