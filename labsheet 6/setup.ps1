[CmdletBinding()]
param(
    [switch]$UpgradePip
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$VenvPath = Join-Path $ProjectRoot '.venv'
$Python = Join-Path $VenvPath 'Scripts\python.exe'
$Requirements = Join-Path $ProjectRoot 'requirements.txt'

if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    throw 'Python Launcher (py) was not found on PATH.'
}

if (-not (Test-Path $Python)) {
    Write-Host 'Creating isolated virtual environment at .venv...'
    py -m venv $VenvPath
}

if ($UpgradePip) {
    & $Python -m pip install --upgrade pip
}

Write-Host 'Installing project requirements...'
& $Python -m pip install --requirement $Requirements
Write-Host "Environment ready. Interpreter: $Python"
