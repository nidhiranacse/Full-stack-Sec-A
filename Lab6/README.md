# Lab Sheet 06: Back-End Infrastructure

This workspace demonstrates a Django runtime environment, VS Code PEP8 automation, and a deployment readiness check.

## 6.1 Isolated Django environment

On Windows PowerShell:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\setup_env.ps1
& .venv\Scripts\Activate.ps1
python manage.py runserver
```

On macOS/Linux:

```bash
chmod +x scripts/setup_env.sh
./scripts/setup_env.sh
source .venv/bin/activate
python manage.py runserver
```

The setup script creates `.venv`, installs `requirements.txt`, copies `.env.example` to `.env`, and applies migrations. Open `http://127.0.0.1:8000/health/` to verify the server.

## 6.2 VS Code profile automation

The `.vscode` directory provides:

- `settings.json`: the project interpreter, format-on-save, Black, import organization, and an 88-character ruler.
- `keybindings.json`: `Ctrl+Alt+L` formats Python and `Ctrl+Alt+O` organizes imports.
- `python.code-snippets`: reusable PEP8-compatible Django and Python entry-point snippets.
- `extensions.json`: recommended Python, environment, Black, and isort extensions.

## 6.3 Deployment check

After setup, replace the placeholder secret in `.env`, then run:

```powershell
python scripts\deployment_check.py
```

The check validates the Python version, project paths, virtual environment, importable dependencies, required environment keys, and Django deployment checks. It returns exit code `1` until all deployment requirements are satisfied.

For a real deployment, set `DJANGO_DEBUG=False`, use a unique secret, and provide the production host names in `DJANGO_ALLOWED_HOSTS`.