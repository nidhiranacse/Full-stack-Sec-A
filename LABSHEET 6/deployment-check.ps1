param(
    [string]$PythonPath = ".venv\Scripts\python.exe"
)

$ErrorActionPreference = "Continue"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$failures = [System.Collections.Generic.List[string]]::new()

if ([System.IO.Path]::IsPathRooted($PythonPath)) {
    $python = [System.IO.Path]::GetFullPath($PythonPath)
} else {
    $python = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $PythonPath))
}

if (-not (Test-Path $python)) {
    $failures.Add("Python runtime not found: $python")
} else {
    $runtimeVersion = & $python --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        $failures.Add("Python runtime could not start: $runtimeVersion")
    } else {
        Write-Host "PASS Python runtime: $runtimeVersion ($python)"
    }

    $isVirtualEnvironment = & $python -c "import sys; print(sys.prefix != sys.base_prefix)"
    if ($LASTEXITCODE -ne 0 -or $isVirtualEnvironment.Trim() -ne "True") {
        $failures.Add("The configured Python runtime is not an active venv interpreter.")
    } else {
        Write-Host "PASS Isolated virtual environment"
    }

    $djangoVersion = & $python -c "import django; print(django.get_version())" 2>&1
    if ($LASTEXITCODE -ne 0) {
        $failures.Add("Django is not importable from this runtime: $djangoVersion")
    } else {
        Write-Host "PASS Django dependency: $djangoVersion"
    }
}

$secretKey = [Environment]::GetEnvironmentVariable("DJANGO_SECRET_KEY")
if ([string]::IsNullOrWhiteSpace($secretKey) -or $secretKey.Length -lt 32 -or $secretKey -match "(?i)change.?me|your.?secret|insecure") {
    $failures.Add("DJANGO_SECRET_KEY must be set to a non-placeholder value of at least 32 characters.")
} else {
    Write-Host "PASS DJANGO_SECRET_KEY is configured"
}

$debugValue = [Environment]::GetEnvironmentVariable("DJANGO_DEBUG")
if ($debugValue -notmatch "^(?i:false)$") {
    $failures.Add("DJANGO_DEBUG must be set to False for deployment.")
} else {
    Write-Host "PASS DJANGO_DEBUG is False"
}

$allowedHostsValue = [Environment]::GetEnvironmentVariable("DJANGO_ALLOWED_HOSTS")
$allowedHosts = @($allowedHostsValue -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ })
if ($allowedHosts.Count -eq 0 -or $allowedHosts -contains "*") {
    $failures.Add("DJANGO_ALLOWED_HOSTS must contain one or more comma-separated hosts and cannot contain '*'.")
} else {
    Write-Host "PASS DJANGO_ALLOWED_HOSTS: $($allowedHosts -join ', ')"
}

if ($failures.Count -gt 0) {
    Write-Error "Deployment preflight failed with $($failures.Count) issue(s):`n - $($failures -join "`n - ")"
    exit 1
}

Write-Host "Deployment preflight passed."
exit 0