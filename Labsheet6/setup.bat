@echo off

echo ==========================================
echo Django Environment Setup
echo ==========================================

echo Checking Python...
python --version

echo.
echo Creating virtual environment...
python -m venv venv

echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Upgrading pip...
python -m pip install --upgrade pip

echo.
echo Installing project requirements...
pip install -r requirements.txt

echo.
echo ==========================================
echo Setup completed successfully!
echo ==========================================

pause