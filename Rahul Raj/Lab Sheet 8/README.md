# Lab Sheet 08: Template Inheritance Blueprints & Modular UI Engineering

**Student Name:** Rahul Raj  
**Roll / Student ID:** cu24250116  
**Course:** Full Stack Web Development (Sec-A)  

---

## Project Overview

This Django application implements modern template inheritance architectures and modular UI engineering following the curriculum specifications:

1. **Master Layout Blueprint (`core/templates/base.html`)**:
   - Central source of truth defining responsive layout nodes, glassmorphic headers, accessible navigation structures, message notification containers, and semantic footers.
2. **Specialized Views Inclusions**:
   - `home.html`: Landing blueprint demonstrating inheritance overrides.
   - `about.html`: Architectural specifications of modular UI engineering.
   - `contact.html`: Professional contact and verification form.
3. **Task 8.1: Programmatic Active Navigation Item Markers**:
   - Custom programmatic markers (`active_page='home'|'about'|'contact'`) embedded across view contexts.
   - Dynamically binds context-specific CSS structural active utility highlights (`nav-link active`) without client-side DOM latency.
4. **Task 8.2: Persistent User Message Feedback Notification Box**:
   - Inherited placeholder hook (`{% block messages %}`) across all child screens.
   - Renders animated alert boxes for `success`, `warning`, `error`, and `info` messages.
5. **Task 8.3: Professional Contact Us Form & Server Logging**:
   - Standard Django form validation (`forms.Form`).
   - Forwards verified feedback text parameters directly into the server logs (`server.log`) using Python's `logging` framework (`[VERIFIED FEEDBACK LOGGED]`).

---

## Directory Architecture

```
Lab Sheet 8/
├── manage.py                  # Administrative entrypoint
├── verify_lab8.py             # Automated test suite (5/5 tests passed)
├── server.log                 # Server log output destination (Task 8.3)
├── README.md                  # Comprehensive documentation
├── lab8_project/
│   ├── __init__.py
│   ├── settings.py            # SQLite database & logging configuration
│   ├── urls.py                # Root routing
│   └── wsgi.py
└── core/
    ├── __init__.py
    ├── apps.py
    ├── forms.py               # ContactForm validation schema
    ├── urls.py                # Modular view routes
    ├── views.py               # Active markers, messages & feedback logging
    └── templates/
        ├── base.html          # Master blueprint layout
        ├── home.html          # Specialized child view
        ├── about.html         # Specialized child view
        └── contact.html       # Specialized child view
```

---

## How to Run & Verify

### Run Automated Test Suite
```bash
python verify_lab8.py
```

### Run Development Server
```bash
python manage.py runserver 8000
```
Open `http://127.0.0.1:8000/` in your browser.
