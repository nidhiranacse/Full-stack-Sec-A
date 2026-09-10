$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    throw "Python launcher 'py' was not found. Install Python 3.12 or add it to PATH."
}

if (-not (Test-Path ".venv\Scripts\python.exe")) {
    py -3.12 -m venv .venv
}

& ".venv\Scripts\python.exe" -m pip install --upgrade pip
& ".venv\Scripts\python.exe" -m pip install -r requirements.txt

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
}

& ".venv\Scripts\python.exe" -c "from pathlib import Path; import secrets; p=Path('.env'); text=p.read_text(); text=text.replace('replace-this-for-local-development', secrets.token_urlsafe(50)); p.write_text(text)"
& ".venv\Scripts\python.exe" manage.py migrate
Write-Host "Environment ready. Activate with .venv\Scripts\Activate.ps1"
