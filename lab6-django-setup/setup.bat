@echo off

REM Create virtual environment if it does not exist
if not exist "venv" (
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Upgrade pip
python -m pip install --upgrade pip

REM Install project requirements
pip install -r requirements.txt

echo.
echo ========================================
echo Django environment setup completed.
echo ========================================
echo.

python --version
django-admin --version

pause