# PowerShell script to activate user's virtual environment and execute commands
$venvPath = Join-Path $PSScriptRoot "..\venv\Scripts\Activate.ps1"

if (Test-Path $venvPath) {
    Write-Host "[Environment] Activating Python virtual environment from: $venvPath" -ForegroundColor Green
    & $venvPath
    Write-Host "[Environment] Python version: $(python --version)" -ForegroundColor Cyan
    Write-Host "[Environment] Executable: $(Get-Command python | Select-Object -ExpandProperty Source)" -ForegroundColor Cyan
} else {
    Write-Host "[Environment] Virtual environment not found at $venvPath" -ForegroundColor Yellow
}

if ($args.Count -gt 0) {
    Invoke-Expression ($args -join " ")
} else {
    Write-Host "`nCampusConnect is ready! Try one of the following commands:" -ForegroundColor Magenta
    Write-Host "  npm run dev:backend       - Start Express API server (port 5000)"
    Write-Host "  npm run dev:frontend      - Start Vite React client (port 5173)"
    Write-Host "  npm run test              - Run backend and frontend automated tests"
    Write-Host "  npm run benchmark         - Run Node.js Redis caching benchmark"
    Write-Host "  npm run benchmark:py      - Run Python Redis caching benchmark in venv"
    Write-Host "  npm run docker:up         - Start entire stack via Docker Compose"
}
