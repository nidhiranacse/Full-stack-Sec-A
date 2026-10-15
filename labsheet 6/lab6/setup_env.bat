@echo off
REM Task 6.1 - Windows version of setup_env.sh
REM Usage: setup_env.bat [venv_dir]
setlocal
set VENV_DIR=%1
if "%VENV_DIR%"=="" set VENV_DIR=venv

echo ==^> Checking Python...
python --version || (echo ERROR: Python not found on PATH & exit /b 1)

echo ==^> Creating virtual environment in %VENV_DIR%...
python -m venv %VENV_DIR% || exit /b 1
call %VENV_DIR%\Scripts\activate.bat

echo ==^> Upgrading pip...
python -m pip install --upgrade pip

if exist requirements.txt (
    echo ==^> Installing from requirements.txt...
    pip install -r requirements.txt
) else (
    echo ==^> No requirements.txt; installing Django and piping list into it
    pip install django
    pip freeze > requirements.txt
)

pip freeze > requirements.lock.txt
echo ==^> Django version:
python -m django --version

echo Done. Activate later with: %VENV_DIR%\Scripts\activate
endlocal
