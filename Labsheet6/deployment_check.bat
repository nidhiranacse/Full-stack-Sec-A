@echo off

echo ==========================================
echo DEPLOYMENT ENVIRONMENT CHECK
echo ==========================================

echo.

echo [1] Checking Python...
python --version

if errorlevel 1 (
    echo ERROR: Python is not available.
    goto FAILED
) else (
    echo OK: Python is available.
)

echo.
echo [2] Checking pip...
pip --version

if errorlevel 1 (
    echo ERROR: pip is not available.
    goto FAILED
) else (
    echo OK: pip is available.
)

echo.
echo [3] Checking virtual environment...

if exist "venv\Scripts\python.exe" (
    echo OK: Virtual environment found.
) else (
    echo ERROR: Virtual environment not found.
    goto FAILED
)

echo.
echo [4] Checking Django...

venv\Scripts\python.exe -c "import django; print('Django version:', django.get_version())"

if errorlevel 1 (
    echo ERROR: Django is not installed.
    goto FAILED
) else (
    echo OK: Django is installed.
)

echo.
echo [5] Checking requirements.txt...

if exist "requirements.txt" (
    echo OK: requirements.txt found.
) else (
    echo ERROR: requirements.txt not found.
    goto FAILED
)

echo.
echo [6] Checking environment variables...

if "%PATH%"=="" (
    echo ERROR: PATH environment variable is missing.
    goto FAILED
) else (
    echo OK: PATH environment variable available.
)

echo.
echo [7] Checking Django project...

if exist "manage.py" (
    echo OK: Django manage.py found.
) else (
    echo WARNING: manage.py not found.
)

echo.
echo ==========================================
echo DEPLOYMENT CHECK PASSED
echo ==========================================

goto END

:FAILED

echo.
echo ==========================================
echo DEPLOYMENT CHECK FAILED
echo Please fix the errors above.
echo ==========================================

:END
pause