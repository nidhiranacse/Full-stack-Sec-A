# Full Stack Web Development Lab Submissions (Labs 01 &ndash; 12)

**Student Name:** Rahul Raj  
**Roll / Student ID:** cu24250116  
**Course:** Full Stack Web Development Laboratory (Sec-A)  
**Submissions Included:** Lab Sheet 01 through Lab Sheet 12  

---

## 📁 Repository Directory Structure

```text
Rahul Raj/
├── index.html                                 # Central Evaluation & Showcase Hub (Labs 1-10)
├── README.md                                  # Complete Technical Guide & Documentation
│
├── Lab Sheet 1/                               # LAB SHEET 01: Core Web Structures Using Semantic HTML
│   ├── task1_resume/ (index.html, style.css)  # Task 1.1: Semantic HTML5 Resume Page (A11y, WCAG 2.1)
│   ├── task2_nested_nav/ (index.html, style.css) # Task 1.2: Nested Navigation Menu with Absolute URLs
│   └── task3_catalog/ (index.html, style.css) # Task 1.3: Itemized Web Catalog (<dl>, <dt>, <dd>)
│
├── Lab Sheet 2/                               # LAB SHEET 02: Dynamic Interface Styling & Interactivity
│   ├── task1_dark_mode/ (index.html, style.css, script.js) # Task 2.1: CSS Variables Dark Mode
│   ├── task2_photo_grid/ (index.html, style.css)           # Task 2.2: Flexbox Photo Grid (Fluid Wrapping)
│   └── task3_todo_app/ (index.html, style.css, script.js)  # Task 2.3: Validation Flags Todo App
│
├── Lab Sheet 3/                               # LAB SHEET 03: Introduction to React.js
│   ├── package.json, vite.config.js           # Vite + React 18 configuration
│   ├── dist/                                  # Production built preview bundle
│   └── src/ (App.jsx, TaskList, TaskItem, AddTaskForm, FilterTabs, TaskMetrics, ComponentTree)
│
├── Lab Sheet 4/                               # LAB SHEET 04: React Routing & State Management
│   ├── package.json, vite.config.js           # Vite + React + react-router-dom
│   ├── dist/                                  # Production built preview bundle
│   └── src/ (StoreContext, Home, Products, ProductDetails, NotFound, CartDrawer, Navbar)
│
├── Lab Sheet 5/                               # LAB SHEET 05: Form Validation & Controlled Inputs in React
│   ├── package.json, vite.config.js           # Vite + React 18 configuration
│   ├── dist/                                  # Production built preview bundle
│   └── src/ (LoginForm regex, PasswordStrengthMeter entropy, OnboardingWizard 4-step)
│
├── Lab Sheet 6/                               # LAB SHEET 06: Backend Infrastructure & Shell Scripting
│   ├── requirements.txt, setup_environment.py, setup_environment.ps1 (Task 6.1)
│   ├── .vscode/ (settings.json, keybindings.json, python.code-snippets - Task 6.2)
│   ├── deploy_check.py (Task 6.3 - 8/8 Passed)
│   └── django_project/ (manage.py, .env, core/settings.py, urls.py, wsgi.py)
│
├── Lab Sheet 7/                               # LAB SHEET 07: Django Model Collections & Filtering
│   ├── manage.py, lab7_project/
│   ├── catalog_app/ (models.py, views.py, urls.py, templates/catalog_app/index.html)
│   │   ├── Unordered Item Matrix (Fruits Collection)
│   │   ├── Ordered Indices (Selected Event Students Table)
│   │   ├── Task 7.1: Fallback Condition Logic ({% if %})
│   │   ├── Task 7.2: Dynamic Table Sorting (?sort=...&order=...)
│   │   └── Task 7.3: Search Input Query Screening (?q=...)
│   └── verify_lab7.py                         # Automated test suite (4/4 passed)
│
├── Lab Sheet 8/                               # LAB SHEET 08: Template Inheritance Blueprints
│   ├── manage.py, lab8_project/
│   ├── server.log                             # Task 8.3 Server log output
│   ├── core/ (forms.py, views.py, urls.py)
│   │   ├── templates/base.html                # Master blueprint layout
│   │   ├── templates/home.html                # Specialized view override
│   │   ├── templates/about.html               # Specialized view override
│   │   └── templates/contact.html             # Contact Us verification view
│   │       ├── Task 8.1: Programmatic Active Nav Markers (active utility highlight)
│   │       ├── Task 8.2: Inherited Message Feedback Hook ({% block messages %})
│   │       └── Task 8.3: Verified Feedback Text Logger (logging framework)
│   └── verify_lab8.py                         # Automated test suite (5/5 passed)
│
├── Lab Sheet 9/                               # LAB SHEET 09: Student Record Management CRUD
│   ├── package.json, server.js                # Express.js REST API
│   ├── models/Student.js                      # Built-in SQLite persistence
│   ├── students.sqlite                        # Pre-seeded database
│   ├── api_test.js                            # Automated endpoint test runner (6/6 passed)
│   └── public/index.html                      # Interactive CRUD single-page interface
│       ├── POST /students (Add record with validation)
│       ├── GET /students (Fetch all records)
│       ├── GET /students/:id (Fetch single record)
│       ├── PUT /students/:id (Update record)
│       └── DELETE /students/:id (Delete record)
│
├── Lab Sheet 10/                              # LAB SHEET 10: CampusConnect Enterprise Portal
│   ├── docker-compose.yml                     # Multi-container orchestration
│   ├── benchmark.js                           # Redis latency benchmark (6.49x speedup)
│   ├── backend/                               # Express + Socket.io + JWT + Redis
│   │   ├── Dockerfile
│   │   ├── src/ (server.js, authRoutes, eventRoutes, announcementRoutes)
│   │   │   ├── Task 1: JWT Auth & RBAC (Admin, Student, 403 rejection)
│   │   │   ├── Task 2: Real-time WebSockets (Socket.io broadcasts)
│   │   │   ├── Task 3: Redis Caching (60s TTL & auto-invalidation)
│   │   │   └── Task 5: Security Hardening (Helmet, rate-limit 5/15min)
│   │   └── tests/integration.test.js          # Automated backend integration tests (6/6 passed)
│   └── frontend/                              # React 18 + Vite SPA
│       ├── Dockerfile (Multi-stage build)
│       ├── dist/ (Pre-compiled production bundle)
│       └── src/ (App.jsx, App.css, live notifications badge counter)
│
└── Lab Sheet 11/                              # LAB SHEET 11: CampusConnect Student Event & Resource Portal
    ├── docker-compose.yml                     # Multi-container orchestration
    ├── benchmark_indexing.js                  # Database query indexing benchmark (10k records)
    ├── postman_collection.json                # Full Postman v2.1.0 API collection
    ├── DEMO_WALKTHROUGH.md                    # 3-5 Minute demo video presentation script
    ├── README.md                              # Comprehensive technical guide & ER diagram
    ├── backend/                               # Express RESTful API + SQLite + JWT + RBAC
    │   ├── Dockerfile
    │   ├── server.js, package.json
    │   ├── src/ (auth, events, resources, dashboards, benchmarks, uploads)
    │   └── tests/unit.test.js                 # 7 automated unit tests (7/7 passed)
    └── frontend/                              # React 18 + Vite SPA
        ├── dist/                              # Pre-compiled production bundle
        └── src/ (App.jsx, App.css, main.jsx)
│
└── Lab Sheet 12/                              # LAB SHEET 12: Coding Assessment (All 4 Problems)
    ├── backend/                               # Problem 1: Secure Task Manager REST API (JWT, bcrypt, rate limit)
    │   ├── server.js, package.json
    │   ├── src/ (store.js, app.js, routes/, middleware/)
    │   └── tests/api.test.js                  # 16 automated backend tests (16/16 passed)
    ├── answers.sql                            # Problem 2: SQL Analytics (DENSE_RANK, Jan-Mar 2025, Atomic transaction)
    ├── test_sql.js                            # Automated SQLite verification script (node:sqlite)
    ├── frontend/                              # Problem 3: React Product Search with Cart (Vite, Debounce, AbortController)
    │   ├── dist/                              # Pre-compiled production bundle
    │   ├── src/ (App.jsx, App.css, CartContext, mockProducts, ProductCard, CartDrawer)
    │   └── src/test/ProductSearchCart.test.jsx # 8 automated tests (8/8 passed)
    ├── .github/workflows/ci.yml               # Problem 4(a): Matrix CI/CD workflow (Node 18 & 20, deploy on push)
    ├── GIT_CICD_SOLUTIONS.md                  # Problem 4(a) & (b): Force-push recovery with git reflog & branch rules
    └── README.md                              # Master assessment report

---

## 🧪 Comprehensive Verification Summary

| Lab Sheet | Title | Key Technology | Automated Test Suite | Test Result |
| :--- | :--- | :--- | :--- | :--- |
| **Lab 01** | Semantic HTML5 & A11y | HTML5 / CSS3 / W3C | Manual / Static Audit | ✅ 100% Passed |
| **Lab 02** | Styling & Interactivity | CSS Variables, Flexbox, JS | Local Verification | ✅ 100% Passed |
| **Lab 03** | Intro to React.js | React 18 + Vite | `npm run build` | ✅ Built in `dist/` |
| **Lab 04** | SPA Routing & State | react-router-dom v6 | `npm run build` | ✅ Built in `dist/` |
| **Lab 05** | Form Validation & Wizard | React Controlled Inputs | `npm run build` | ✅ Built in `dist/` |
| **Lab 06** | Backend Tooling & PEP8 | Python, Django, Flake8 | `deploy_check.py` | ✅ **8/8 Passed** |
| **Lab 07** | Model Collections & Sort | Django 6.0 Templates | `verify_lab7.py` | ✅ **4/4 Passed** |
| **Lab 08** | Template Inheritance | Django Blueprints & Logging | `verify_lab8.py` | ✅ **5/5 Passed** |
| **Lab 09** | Student Record CRUD | Express.js + SQLite REST | `api_test.js` | ✅ **6/6 Passed** |
| **Lab 10** | CampusConnect Portal | JWT, Socket.io, Redis, Docker | `integration.test.js` + `benchmark.js` | ✅ **6/6 Passed (6.49x speedup)** |
| **Lab 11** | CampusConnect Full Portal | React 18, SQLite, JWT, RBAC, B-Tree Indexing | `unit.test.js` + `benchmark_indexing.js` | ✅ **7/7 Passed (10k index speedup)** |
| **Lab 12** | Coding Assessment (Problems 1-4) | Express JWT, SQL Window/Concurrency, React Cart SPA, Git CI/CD | Node Test Runner + SQLite + Vitest | ✅ **100% Verified (24/24 Tests Passed)** |
| **Practical Test (Set A)** | Student Records API & React Feedback Form | Node/Express In-Memory + React 18 Form Validation | `node:test` (15/15) + Vitest RTL (8/8) | ✅ **100% Verified (23/23 Tests Passed)** |

---

## 🚀 How to Run & Verify Any Lab

### Open Central Portal Hub
Open `Rahul Raj/index.html` in your web browser to launch and test any of the 11 lab deliverables.

### Testing Django Labs (Lab 7 & Lab 8)
```bash
# Lab 7
cd "Rahul Raj/Lab Sheet 7"
python verify_lab7.py

# Lab 8
cd "Rahul Raj/Lab Sheet 8"
python verify_lab8.py
```

### Testing Node / Express Labs (Lab 9 & Lab 10)
```bash
# Lab 9
cd "Rahul Raj/Lab Sheet 9"
npm test

# Lab 10
cd "Rahul Raj/Lab Sheet 10"
cd backend && npm test
cd .. && node benchmark.js
```

### Testing Lab 11 (CampusConnect Student Event & Resource Portal)
```bash
# Unit Tests (7/7 Passed)
cd "Rahul Raj/Lab Sheet 11/backend"
npm test

# Database Indexing Benchmark (10,000 Records)
cd "Rahul Raj/Lab Sheet 11"
node benchmark_indexing.js

# Launch Full-Stack Application
cd "Rahul Raj/Lab Sheet 11/backend"
npm start
# Open http://localhost:5000 in your browser
```

### Testing Lab Sheet 12 (Coding Assessment - Problems 1 to 4)
```bash
# Problem 1: Secure Task Manager API Tests (16/16 Passed)
cd "labsheet 12/Rahul Raj/backend"
npm test

# Problem 2: SQL Analytics & Concurrency Verification
cd "labsheet 12/Rahul Raj"
node test_sql.js

# Problem 3: React Product Search & Cart Tests (8/8 Passed)
cd "labsheet 12/Rahul Raj/frontend"
npm test
npm run build
```
