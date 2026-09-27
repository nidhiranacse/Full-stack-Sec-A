@echo off
echo [Environment] Activating Python virtual environment...
call "..\venv\Scripts\activate.bat"
echo [Environment] Active Python:
python --version
where python
echo.
echo ==================================================
echo   CampusConnect - College Portal (Lab Sheet 10)
echo ==================================================
echo   npm run dev:backend   - Start Express backend (5000)
echo   npm run dev:frontend  - Start React frontend (5173)
echo   npm run test          - Run backend and frontend tests
echo   npm run benchmark     - Run Task 3 Redis benchmark
echo   npm run docker:up     - Run all containers with Docker
echo ==================================================
if not "%*"=="" (
    cmd /c "%*"
)
