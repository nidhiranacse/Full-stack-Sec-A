Write-Host "Django Environment Setup" -ForegroundColor Cyan

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python is not installed or not available in PATH." -ForegroundColor Red
    exit 1
}

Write-Host "Python found:"
python --version

if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

Write-Host "Installing project requirements..."
& ".\venv\Scripts\python.exe" -m pip install -r requirements.txt

Write-Host "Checking Django installation..."
& ".\venv\Scripts\python.exe" -m django --version

Write-Host "Running Django system check..."
Set-Location "django_project"
& "..\venv\Scripts\python.exe" manage.py check

Write-Host "Django environment setup completed successfully." -ForegroundColor Green