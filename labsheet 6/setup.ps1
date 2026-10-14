$ErrorActionPreference = "Stop"

Write-Host "Checking Python installation..."

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python is not installed or is not available in PATH."
    exit 1
}

python --version

if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv .venv
}

$PythonPath = Join-Path $PWD ".venv\Scripts\python.exe"

Write-Host "Upgrading pip..."
& $PythonPath -m pip install --upgrade pip

if ($LASTEXITCODE -ne 0) {
    Write-Host "Pip upgrade failed."
    exit 1
}

Write-Host "Installing project dependencies..."
& $PythonPath -m pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "Dependency installation failed."
    exit 1
}

Write-Host "Verifying Django installation..."
& $PythonPath -m django --version

Write-Host "Environment setup completed successfully."
Write-Host "Activate the environment using:"
Write-Host ".\.venv\Scripts\Activate.ps1"