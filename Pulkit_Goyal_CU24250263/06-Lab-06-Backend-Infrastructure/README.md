# Lab Sheet 6: Backend Infrastructure, Django Setup & Tooling Configuration

**Student Name:** Pulkit Goyal  
**CUID:** CU24250263  
**Roll Number:** 40  
**Section:** A  
**Course:** Full Stack Web Development (B.Tech CSE)  

---

## 1. Objective & Lab Tasks
1. **Task 6.1 - Django Architecture & Setup:**
   - Initialize a robust Django backend project (`myproject`).
   - Configure critical production/development flags in `settings.py` (`DEBUG`, `ALLOWED_HOSTS`, static file roots, database).
   - Implement custom system status and health check endpoints in `urls.py`.
2. **Task 6.2 - Professional Developer Tooling (VS Code & Python):**
   - Configure automated formatting (Black/autopep8), linting (Flake8/Pylance), and interpreter selection in `.vscode/settings.json`.
   - Provide custom developer keybindings for running tests, migrations, and servers.
   - Showcase PEP8-compliant Python code with type annotations in `example.py`.
3. **Task 6.3 - Pre-Flight Deployment Automation:**
   - Script automated environment checks verifying Python runtime versions, Django dependencies, pending database migrations, and static asset collection.
   - Provide both Windows (`.bat`) and cross-platform (`.sh` / `.py`) verification scripts.

---

## 2. Directory Structure
```
06-Lab-06-Backend-Infrastructure/
├── README.md                              # Lab documentation, instructions & viva notes
├── .vscode/
│   ├── settings.json                      # VS Code Python workspace settings
│   └── keybindings.json                   # Custom productivity shortcut bindings
├── task6.1-django/                        # Django core project
│   ├── manage.py                          # Django management CLI utility
│   ├── requirements.txt                   # Pinned backend dependencies
│   └── myproject/
│       ├── __init__.py
│       ├── settings.py                    # Configured Django settings
│       ├── urls.py                        # Healthcheck & root routing
│       ├── wsgi.py                        # Web Server Gateway Interface
│       └── asgi.py                        # Asynchronous Server Gateway Interface
├── task6.2-vscode/
│   ├── example.py                         # Clean typed Python sample
│   └── settings.json                      # Task-specific editor config
└── task6.3-deployment-check/
    ├── deployment_check.bat               # Windows batch verification script
    ├── deployment_check.sh                # Linux/macOS bash verification script
    └── verify_environment.py              # Platform-independent Python verifier
```

---

## 3. How to Run Locally
```bash
# 1. Navigate to task 6.1
cd 06-Lab-06-Backend-Infrastructure/task6.1-django

# 2. Create virtual environment & activate
python3 -m venv venv
# On Windows: venv\Scripts\activate
# On Linux/Mac: source venv/bin/activate

# 3. Install requirements
pip install -r requirements.txt

# 4. Run database migrations & start server
python manage.py migrate
python manage.py runserver

# 5. Run automated pre-flight checks
python ../task6.3-deployment-check/verify_environment.py
```

---

## 4. Key Concepts & Viva Answers (For Self-Demonstration)

### Q1: What is the security risk of having `DEBUG = True` in production?
- If an unhandled exception occurs with `DEBUG = True`, Django exposes an interactive traceback revealing internal database credentials, server file paths, settings environment variables, and source code. In production, `DEBUG` must always be `False`.

### Q2: What is the difference between WSGI and ASGI?
- **WSGI (Web Server Gateway Interface):** Synchronous request-response standard (e.g., Gunicorn, uWSGI). Handles traditional HTTP requests sequentially.
- **ASGI (Asynchronous Server Gateway Interface):** Asynchronous standard (e.g., Uvicorn, Daphne). Handles long-lived WebSocket connections, HTTP/2, and background asynchronous tasks.

### Q3: Why is `manage.py check --deploy` essential before deploying?
- It inspects security-critical settings (such as `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, and `X_FRAME_OPTIONS`) and warns the developer of dangerous configurations before going live.
