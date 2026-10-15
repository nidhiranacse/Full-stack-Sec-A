# Lab Sheet 06: Back-End Infrastructure Preparation & Shell Scripting

Windows PowerShell scripts for creating an isolated Django environment, configuring Python PEP 8 workflows in VS Code, and checking deployment prerequisites.

## Task 6.1: Django virtual environment

From this folder, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-django.ps1
```

The script creates `.venv` with the Python 3 runtime selected by the `py` launcher, upgrades pip, and installs the packages in `requirements.txt`. To select a different Python executable, pass `-PythonCommand python` or its full path. To create the environment without installing packages, pass `-SkipInstall`.

Activate the environment in a PowerShell session with:

```powershell
.\.venv\Scripts\Activate.ps1
```

## Task 6.2: VS Code Python PEP 8 workflow

Workspace settings in `.vscode/settings.json` select the project interpreter, Black formatting, format-on-save, import organization, and a 79-character ruler. Install the Microsoft Python, Black Formatter, and Ruff extensions in VS Code.

To add the same settings and a `Ctrl+Alt+L` Python format shortcut to the VS Code profile, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\configure-vscode-profile.ps1
```

The script defaults to `%APPDATA%\Code\User`. Supply `-ProfileDirectory` for another VS Code profile directory. Existing profile entries are retained, and existing JSON files are backed up before they are changed.

## Task 6.3: Deployment preflight

Set the server environment variables, then run:

```powershell
$env:DJANGO_SECRET_KEY = "replace-with-a-secure-random-value"
$env:DJANGO_DEBUG = "False"
$env:DJANGO_ALLOWED_HOSTS = "example.com,www.example.com"
powershell -ExecutionPolicy Bypass -File .\deployment-check.ps1
```

The preflight checks the configured virtual environment's Python runtime, confirms Django is importable, and validates that the secret key is non-placeholder, debug mode is off, and allowed hosts are defined without a wildcard. It exits with code `1` if any check fails. Set production secrets through the hosting environment or secret manager rather than saving them in this project.