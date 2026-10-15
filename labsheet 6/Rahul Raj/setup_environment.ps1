# Automated Environment Provisioner PowerShell Script
# Lab Sheet 06 - Task 6.1
# Student: Rahul Raj (cu24250116)
# Course: Full Stack Web Development (Sec-A)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Lab Sheet 06: Automated Environment Provisioner (PowerShell)" -ForegroundColor Cyan
Write-Host " Student: Rahul Raj | cu24250116 | Full-stack Sec-A" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$VenvDir = Join-Path $CurrentDir ".venv"
$ReqFile = Join-Path $CurrentDir "requirements.txt"
$EnvFile = Join-Path (Join-Path $CurrentDir "django_project") ".env"

# 1. Check Python
Write-Host "`n[1/4] Checking Python Runtime..." -ForegroundColor Yellow
$PythonVersion = & python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Python is not installed or not in PATH." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Detected: $PythonVersion" -ForegroundColor Green

# 2. Virtual Environment Creation
Write-Host "`n[2/4] Setting up Virtual Environment (.venv)..." -ForegroundColor Yellow
if (-not (Test-Path $VenvDir)) {
    & python -m venv $VenvDir
    Write-Host "[OK] Created virtual environment at $VenvDir" -ForegroundColor Green
} else {
    Write-Host "[INFO] Virtual environment already exists at $VenvDir" -ForegroundColor Cyan
}

# 3. Pip and Requirements
Write-Host "`n[3/4] Validating pip and requirements..." -ForegroundColor Yellow
$VenvPython = Join-Path (Join-Path $VenvDir "Scripts") "python.exe"
$VenvPip = Join-Path (Join-Path $VenvDir "Scripts") "pip.exe"

if (Test-Path $VenvPip) {
    Write-Host "[INFO] Upgrading pip..." -ForegroundColor Cyan
    & $VenvPip install --upgrade pip --quiet
    if (Test-Path $ReqFile) {
        Write-Host "[INFO] Installing requirements from $ReqFile..." -ForegroundColor Cyan
        & $VenvPip install -r $ReqFile --quiet
        Write-Host "[OK] Requirements installed successfully." -ForegroundColor Green
    }
}

# 4. Environment Variables (.env)
Write-Host "`n[4/4] Setting up Environment Configuration..." -ForegroundColor Yellow
if (-not (Test-Path $EnvFile)) {
    $EnvContent = @"
# Backend Environment Configuration
SECRET_KEY=django-insecure-labsheet06-rahulraj-cu24250116-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
PORT=8000
"@
    New-Item -Path (Split-Path $EnvFile -Parent) -ItemType Directory -Force | Out-Null
    Set-Content -Path $EnvFile -Value $EnvContent
    Write-Host "[OK] Created default .env at $EnvFile" -ForegroundColor Green
} else {
    Write-Host "[INFO] .env file is already configured." -ForegroundColor Green
}

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host " Setup complete! Activate your venv using:" -ForegroundColor Green
Write-Host "   .\.venv\Scripts\Activate.ps1" -ForegroundColor Yellow
Write-Host "============================================================`n" -ForegroundColor Green
