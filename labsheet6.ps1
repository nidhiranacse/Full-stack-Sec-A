# ============================================================
# LAB SHEET 06
# BACK-END INFRASTRUCTURE PREPARATION & SHELL SCRIPTING
# ============================================================

Write-Host "================================================"
Write-Host "       LAB SHEET 06 - BACK-END SETUP"
Write-Host "================================================"
Write-Host ""

# ============================================================
# TASK 6.1
# DJANGO VIRTUAL ENVIRONMENT + REQUIREMENTS
# ============================================================

Write-Host "-----------------------------------------------"
Write-Host "TASK 6.1 : Django Virtual Environment Setup"
Write-Host "-----------------------------------------------"
Write-Host ""

# Check Python installation

$pythonCommand = Get-Command python -ErrorAction SilentlyContinue

if ($null -eq $pythonCommand) {

    Write-Host "ERROR: Python is not installed or not added to PATH."
    exit 1

}

Write-Host "Python found:"
python --version

Write-Host ""


# Create virtual environment

if (!(Test-Path "venv")) {

    Write-Host "Creating Django virtual environment..."

    python -m venv venv

}
else {

    Write-Host "Virtual environment already exists."

}

Write-Host ""


# Python inside virtual environment

$venvPython = ".\venv\Scripts\python.exe"

if (!(Test-Path $venvPython)) {

    Write-Host "ERROR: Virtual environment could not be created."
    exit 1

}


# Upgrade pip

Write-Host "Upgrading pip..."

& $venvPython -m pip install --upgrade pip

Write-Host ""


# Create requirements.txt

Write-Host "Creating project requirements..."

@"
Django>=5.0,<6.0
django-cors-headers
black
flake8
"@ | Set-Content "requirements.txt"


# Install requirements

Write-Host "Installing project requirements..."

& $venvPython -m pip install -r requirements.txt

Write-Host ""

Write-Host "Task 6.1 completed successfully."
Write-Host ""


# ============================================================
# TASK 6.2
# VS CODE PYTHON PROFILE + PEP8 CONFIGURATION
# ============================================================

Write-Host "-----------------------------------------------"
Write-Host "TASK 6.2 : VS Code Python / PEP8 Configuration"
Write-Host "-----------------------------------------------"
Write-Host ""


# Create VS Code configuration directory

if (!(Test-Path ".vscode")) {

    New-Item -ItemType Directory -Path ".vscode" | Out-Null

}


# VS Code settings

@"
{
    "python.defaultInterpreterPath": ".\\venv\\Scripts\\python.exe",
    "python.analysis.typeCheckingMode": "basic",
    "python.analysis.autoImportCompletions": true,
    "python.analysis.completeFunctionParens": true,
    "editor.formatOnSave": true,
    "editor.tabSize": 4,
    "editor.insertSpaces": true,
    "files.trimTrailingWhitespace": true,
    "files.insertFinalNewline": true,
    "python.formatting.provider": "black"
}
"@ | Set-Content ".vscode\settings.json"


# VS Code keyboard shortcuts

@"
[
    {
        "key": "ctrl+shift+f",
        "command": "editor.action.formatDocument",
        "when": "editorTextFocus"
    },
    {
        "key": "ctrl+shift+i",
        "command": "editor.action.organizeImports",
        "when": "editorTextFocus"
    }
]
"@ | Set-Content ".vscode\keybindings.json"


Write-Host "VS Code Python profile configured."
Write-Host "PEP8-compatible formatting configured."
Write-Host "Format-on-save enabled."
Write-Host "Custom keyboard shortcuts configured."
Write-Host ""

Write-Host "Task 6.2 completed successfully."
Write-Host ""


# ============================================================
# TASK 6.3
# AUTOMATED DEPLOYMENT ENVIRONMENT CHECK
# ============================================================

Write-Host "-----------------------------------------------"
Write-Host "TASK 6.3 : Automated Deployment Check"
Write-Host "-----------------------------------------------"
Write-Host ""


# Check Python

Write-Host "[1] Checking Python..."

if (Test-Path $venvPython) {

    & $venvPython --version

}
else {

    Write-Host "ERROR: Virtual environment Python not found."

}

Write-Host ""


# Check pip

Write-Host "[2] Checking pip..."

& $venvPython -m pip --version

Write-Host ""


# Check Django

Write-Host "[3] Checking Django..."

try {

    $djangoVersion = & $venvPython -c "import django; print(django.get_version())"

    Write-Host "Django version: $djangoVersion"

}
catch {

    Write-Host "ERROR: Django is not installed."

}

Write-Host ""


# Check requirements

Write-Host "[4] Checking requirements.txt..."

if (Test-Path "requirements.txt") {

    Write-Host "requirements.txt found."

}
else {

    Write-Host "ERROR: requirements.txt not found."

}

Write-Host ""


# Check virtual environment

Write-Host "[5] Checking virtual environment..."

if (Test-Path "venv") {

    Write-Host "Virtual environment found."

}
else {

    Write-Host "ERROR: venv not found."

}

Write-Host ""


# Check project path

Write-Host "[6] Checking project path..."

Write-Host "Current project path:"
Write-Host (Get-Location)

Write-Host ""


# Check PATH environment variable

Write-Host "[7] Checking environment variables..."

if ($env:PATH) {

    Write-Host "PATH environment variable: AVAILABLE"

}
else {

    Write-Host "PATH environment variable: NOT AVAILABLE"

}


# Check PYTHONPATH

if ($env:PYTHONPATH) {

    Write-Host "PYTHONPATH: AVAILABLE"

}
else {

    Write-Host "PYTHONPATH: NOT SET"

}

Write-Host ""


# Check Django package

Write-Host "[8] Checking framework dependency..."

$djangoCheck = & $venvPython -c "import django; print('Django dependency: OK')" 2>$null

if ($djangoCheck) {

    Write-Host $djangoCheck

}
else {

    Write-Host "Django dependency: NOT FOUND"

}

Write-Host ""


# ============================================================
# FINAL RESULT
# ============================================================

Write-Host "================================================"
Write-Host "       LAB SHEET 06 COMPLETED"
Write-Host "================================================"
Write-Host ""

Write-Host "Task 6.1 : Django virtual environment - DONE"
Write-Host "Task 6.2 : VS Code / PEP8 configuration - DONE"
Write-Host "Task 6.3 : Deployment environment check - DONE"

Write-Host ""
Write-Host "Environment preparation and validation completed."
Write-Host ""

Write-Host "================================================"