@echo off
echo ========================================================
echo Installing Dependencies for Practical Test Set A
echo ========================================================
echo.
echo [1/2] Installing Practical A1 Dependencies...
cd /d "%~dp0\Practical A1 - Student Records REST API"
call npm install
echo.
echo [2/2] Installing Practical A2 Dependencies...
cd /d "%~dp0\Practical A2 - Feedback Form with Validation"
call npm install
echo.
echo ========================================================
echo Installation Completed Successfully!
echo ========================================================
pause
