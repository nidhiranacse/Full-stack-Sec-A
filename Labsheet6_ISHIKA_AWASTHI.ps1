# Lab Sheet 06 — Windows PowerShell setup script
# Run in PowerShell from the folder where you want the Django project.
# This single script creates a venv, requirements.txt, VS Code settings,
# PEP8-friendly editor settings, and a deployment_check.py file.

$ErrorActionPreference = "Stop"
$Project = "django_lab6"
$Venv = ".venv"

Write-Host "=== Django Lab 6 Setup ===" -ForegroundColor Cyan

if (!(Test-Path $Venv)) {
    python -m venv $Venv
}

& ".\$Venv\Scripts\python.exe" -m pip install --upgrade pip
@"
Django>=5.0,<6.0
black
flake8
"@ | Set-Content requirements.txt

& ".\$Venv\Scripts\python.exe" -m pip install -r requirements.txt

if (!(Test-Path ".vscode")) { New-Item -ItemType Directory .vscode | Out-Null }

@'
{
    "python.defaultInterpreterPath": "${workspaceFolder}\\.venv\\Scripts\\python.exe",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": "explicit"
    },
    "[python]": {
        "editor.defaultFormatter": "ms-python.black-formatter"
    },
    "python.analysis.typeCheckingMode": "basic"
}
'@ | Set-Content .vscode/settings.json

@'
{
    "PEP8: Format Python": {
        "prefix": "pep8",
        "body": [
            "def ${1:function_name}(${2:args}):",
            "    ${3:pass}"
        ],
        "description": "PEP8-friendly Python function template"
    }
}
'@ | Set-Content .vscode/python.code-snippets

@"
import os, sys, shutil, subprocess

print("=== Deployment Environment Check ===")
print("Python:", sys.version.split()[0])
print("Executable:", sys.executable)
print("Working directory:", os.getcwd())
print("Python path OK:", os.path.exists(sys.executable))
print("Django command:", shutil.which("django-admin") or "Not found")

try:
    import django
    print("Django:", django.get_version())
except Exception as e:
    print("Django import failed:", e)

for key in ["PATH", "PYTHONPATH"]:
    print(f"{key}:", os.environ.get(key, "<not set>"))

result = subprocess.run(
    [sys.executable, "-m", "django", "--version"],
    capture_output=True, text=True
)
print("Django CLI check:", result.stdout.strip() or result.stderr.strip())
"@ | Set-Content deployment_check.py

if (!(Test-Path $Project)) {
    & ".\$Venv\Scripts\django-admin.exe" startproject $Project .
}

Write-Host "`nSetup complete." -ForegroundColor Green
Write-Host "Activate with: .\.venv\Scripts\Activate.ps1"
Write-Host "Run check with: .\.venv\Scripts\python.exe deployment_check.py"
Write-Host "PEP8 format: .\.venv\Scripts\python.exe -m black ."
