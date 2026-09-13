Write-Host "======================================" -ForegroundColor Cyan
Write-Host " Django Deployment Environment Check" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

$allChecksPassed = $true

Write-Host "`n[1] Checking Python runtime..."

if (Test-Path ".\venv\Scripts\python.exe") {
    $pythonVersion = & ".\venv\Scripts\python.exe" --version
    Write-Host "Python: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "Virtual environment Python not found." -ForegroundColor Red
    $allChecksPassed = $false
}

Write-Host "`n[2] Checking Django..."

if (Test-Path ".\venv\Scripts\python.exe") {
    $djangoVersion = & ".\venv\Scripts\python.exe" -m django --version 2>$null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Django: $djangoVersion" -ForegroundColor Green
    } else {
        Write-Host "Django is not installed." -ForegroundColor Red
        $allChecksPassed = $false
    }
}

Write-Host "`n[3] Checking requirements.txt..."

if (Test-Path ".\requirements.txt") {
    Write-Host "requirements.txt found." -ForegroundColor Green
} else {
    Write-Host "requirements.txt not found." -ForegroundColor Red
    $allChecksPassed = $false
}

Write-Host "`n[4] Checking Django project..."

if (Test-Path ".\django_project\manage.py") {
    Write-Host "Django manage.py found." -ForegroundColor Green
} else {
    Write-Host "Django project not found." -ForegroundColor Red
    $allChecksPassed = $false
}

Write-Host "`n[5] Checking DJANGO_SETTINGS_MODULE..."

if ($env:DJANGO_SETTINGS_MODULE) {
    Write-Host "DJANGO_SETTINGS_MODULE = $env:DJANGO_SETTINGS_MODULE" -ForegroundColor Green
} else {
    Write-Host "DJANGO_SETTINGS_MODULE is not set globally." -ForegroundColor Yellow
    Write-Host "Using project settings for deployment check." -ForegroundColor Yellow
}

Write-Host "`n[6] Running Django system check..."

if (Test-Path ".\django_project\manage.py") {
    Push-Location ".\django_project"

    & "..\venv\Scripts\python.exe" manage.py check

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Django system check passed." -ForegroundColor Green
    } else {
        Write-Host "Django system check failed." -ForegroundColor Red
        $allChecksPassed = $false
    }

    Pop-Location
}

Write-Host "`n======================================" -ForegroundColor Cyan

if ($allChecksPassed) {
    Write-Host "DEPLOYMENT CHECK PASSED" -ForegroundColor Green
} else {
    Write-Host "DEPLOYMENT CHECK FAILED" -ForegroundColor Red
}

Write-Host "======================================"