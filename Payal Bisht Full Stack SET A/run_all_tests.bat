@echo off
echo ========================================================
echo Running Practical Test Set A Tests for Payal Bisht
echo ========================================================
echo.
echo [1/2] Running Practical A1 (Student Records REST API) Tests...
cd /d "%~dp0\Practical A1 - Student Records REST API"
call npm test
echo.
echo [2/2] Running Practical A2 (Feedback Form with Validation) Tests...
cd /d "%~dp0\Practical A2 - Feedback Form with Validation"
call npm test
echo.
echo ========================================================
echo All Tests Completed!
echo ========================================================
pause
