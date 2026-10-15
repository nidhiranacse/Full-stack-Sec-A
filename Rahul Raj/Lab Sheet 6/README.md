# Lab Sheet 06: Back-End Infrastructure Preparation & Shell Scripting Environments

**Student Name:** Rahul Raj  
**Roll / Student ID:** cu24250116  
**Course:** Full Stack Web Development (Sec-A)  

---

## Project Overview

This laboratory exercise provisions production-grade Python/Django back-end infrastructure, automated shell scripting environments, PEP8/Black formatting guardrails in VS Code, and pre-flight deployment health diagnostics.

### Key Objectives & Deliverables

1. **Task 6.1: Cross-Platform Environment Automation**
   - **`setup_environment.py`**: Automated Python provisioner that checks Python version compatibility (>=3.10), provisions isolated virtual environment `.venv/`, upgrades pip, installs required dependencies, and sets up `.env`.
   - **`setup_environment.ps1`**: Native PowerShell automation script with execution policies, virtual environment initialization, dependency installation, and `.env` initialization.

2. **Task 6.2: Professional IDE Quality Guardrails & PEP8 Compliance**
   - **`.vscode/settings.json`**: Automatic formatting on save via `black`, line-length enforced at 88 characters, `flake8` linting enabled, automatic trailing whitespace removal, and terminal default interpreter binding.
   - **`.vscode/keybindings.json`**: Custom productivity key shortcuts:
     - `Ctrl+Shift+D`: Execute deployment diagnostic check (`deploy_check.py`).
     - `Ctrl+Alt+R`: Run Django development server.
     - `Shift+Alt+F`: Auto-format current Python file using Black.
   - **`.vscode/python.code-snippets`**: Production snippets for Django Model (`djmodel`), DRF ModelSerializer (`drfser`), DRF APIView (`drfview`), and Healthcheck Endpoint (`djhealth`).

3. **Task 6.3: Pre-Flight Deployment Diagnostic Health Check**
   - **`deploy_check.py`**: Automated diagnostic script verifying 8 critical deployment criteria:
     - Python runtime version (>=3.10)
     - Virtual environment isolation
     - `.env` configuration file presence & size
     - Django core module availability
     - Django REST framework module availability
     - `python-dotenv` parser availability
     - Django settings & `SECRET_KEY` entropy check
     - Django system migration & configuration check (`call_command('check')`)

---

## Directory Architecture

```
Lab Sheet 6/
├── requirements.txt           # Python dependency specifications
├── setup_environment.py       # Python environment automation
├── setup_environment.ps1      # PowerShell one-click setup script
├── deploy_check.py            # Automated pre-flight health diagnostics
├── README.md                  # Comprehensive documentation
├── .vscode/
│   ├── settings.json          # PEP8, Black formatter & Flake8 linter configuration
│   ├── keybindings.json       # Productivity shortcuts
│   └── python.code-snippets   # Django & DRF reusable templates
└── django_project/
    ├── manage.py              # Django administrative entrypoint
    ├── .env                   # Local active environment variables
    ├── .env.example           # Environment template
    └── core/
        ├── __init__.py
        ├── settings.py        # Django core settings with dotenv integration
        ├── urls.py            # Route definitions with /api/health/ endpoint
        ├── wsgi.py            # WSGI application callable
        └── asgi.py            # ASGI application callable
```

---

## How to Run & Verify

### Automated Environment Setup
```bash
python setup_environment.py
```
*Or via PowerShell:*
```powershell
.\setup_environment.ps1
```

### Run Pre-Flight Diagnostics
```bash
python deploy_check.py
```

### Run Django Development Server
```bash
python django_project/manage.py runserver
```
Navigate to `http://127.0.0.1:8000/api/health/` to view JSON health status.
