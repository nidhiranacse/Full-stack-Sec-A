param(
    [string]$PythonCommand = "py",
    [string]$VenvPath = ".venv",
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$requirementsPath = Join-Path $projectRoot "requirements.txt"

if (-not (Test-Path $requirementsPath)) {
    throw "requirements.txt was not found at $requirementsPath"
}

$pythonCommandInfo = Get-Command $PythonCommand -ErrorAction Stop
$pythonExecutable = $pythonCommandInfo.Source
$pythonArguments = @()
if ([System.IO.Path]::GetFileNameWithoutExtension($pythonExecutable) -eq "py") {
    $pythonArguments = @("-3")
}

if ([System.IO.Path]::IsPathRooted($VenvPath)) {
    $resolvedVenvPath = [System.IO.Path]::GetFullPath($VenvPath)
} else {
    $resolvedVenvPath = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $VenvPath))
}

$venvPython = Join-Path $resolvedVenvPath "Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    Write-Host "Creating virtual environment at $resolvedVenvPath"
    & $pythonExecutable @pythonArguments -m venv $resolvedVenvPath
    if ($LASTEXITCODE -ne 0) {
        throw "Python failed to create the virtual environment."
    }
}

if (-not $SkipInstall) {
    Write-Host "Installing project requirements into the virtual environment"
    & $venvPython -m pip install --upgrade pip
    if ($LASTEXITCODE -ne 0) {
        throw "Could not upgrade pip in the virtual environment."
    }
    & $venvPython -m pip install -r $requirementsPath
    if ($LASTEXITCODE -ne 0) {
        throw "Could not install requirements.txt."
    }
}

Write-Host "Environment ready: $venvPython"
Write-Host "Activate with: .\.venv\Scripts\Activate.ps1"