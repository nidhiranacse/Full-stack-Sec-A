# Lab Sheet 06 - Back-end Infrastructure & Shell Scripting

## Folder layout
| File | Task |
|---|---|
| `setup_env.sh` / `setup_env.bat` | 6.1 - create venv, install requirements |
| `requirements.txt` | 6.1 - project requirement definitions |
| `.vscode/settings.json`, `.flake8` | 6.2 - PEP 8 settings |
| `.vscode/user_profile/keybindings.json` | 6.2 - custom shortcuts |
| `.vscode/tasks.json`, `extensions.json` | 6.2 - lint/run tasks, extensions |
| `install_vscode_profile.sh` | 6.2 - copies config into VS Code user dir |
| `check_deploy.sh`, `.env.example` | 6.3 - deployment validation |

## 0. Installation (workspace setup)
1. **Python**: download from https://www.python.org/downloads/ . On Windows tick
   "Add python.exe to PATH". Verify: `python --version` (or `python3 --version`).
2. **VS Code**: https://code.visualstudio.com/ . Verify: `code --version`.
3. **Django**: installed inside the venv by Task 6.1 (not globally).

## Task 6.1 - virtual environment
    chmod +x *.sh
    ./setup_env.sh              # Linux/macOS/Git Bash
    setup_env.bat               # Windows CMD
    source venv/bin/activate    # Windows: venv\Scripts\activate

`pip freeze > requirements.txt` pipes the installed packages into the
requirements file; `requirements.lock.txt` stores an exact snapshot.

## Task 6.2 - VS Code PEP 8 profile
    ./install_vscode_profile.sh
Shortcuts: Ctrl+Alt+L format | Ctrl+Alt+O organize imports |
Ctrl+Alt+T flake8 lint | Ctrl+Alt+R run server | Ctrl+Alt+D deployment check.
Windows manual copy: put `settings.json` and `keybindings.json` into
`%APPDATA%\Code\User`.
On Windows change `python.defaultInterpreterPath` to
`${workspaceFolder}/venv/Scripts/python.exe`.

## Task 6.3 - deployment check
    set -a; source .env.example; set +a     # or your real .env
    ./check_deploy.sh
Exit code 0 = ready, 1 = failures found.
