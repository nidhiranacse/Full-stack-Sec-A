# Lab Sheet 07: Django Model Collection Mapping, Dynamic Sorting & Search

**Student Name:** Rahul Raj  
**Roll / Student ID:** cu24250116  
**Course:** Full Stack Web Development (Sec-A)  

---

## Project Overview

This Django web application maps model array collections out to unordered item matrices (Fruit Collections) alongside ordered indices (Selected Event Students), fully adhering to the syllabus requirements:

1. **Unordered Item Matrix (Fruits)**:
   - Dynamic cards representing fruits, category badges, origin, and stock availability (`in_stock`).
2. **Ordered Indices (Selected Event Students)**:
   - Ranked index table displaying selected student event candidates with rank indices, candidate names, university roll numbers, event categories, and scores.
3. **Task 7.1: Robust Fallback Condition Logic Filters**:
   - Implemented inside Django's template layer (`{% if fruits %} ... {% else %} ... {% endif %}`) to display prominent warning alerts whenever array collections arrive empty.
   - Includes simulator toggles (`?empty_fruits=1`, `?empty_students=1`) allowing immediate grading and validation.
4. **Task 7.2: Dynamic Table Sorting**:
   - Implemented via template header anchors and server-side view ordering.
   - Supports bi-directional sorting across any field property: `rank`, `name`, `roll_no`, `event`, and `score` via `?sort=<field>&order=<asc|desc>`.
5. **Task 7.3: User Search Input Form**:
   - Interactive search toolbar screening long array matrices and dynamically subsetting list results using backend request query filtering (`?q=<keyword>`).

---

## Directory Architecture

```
Lab Sheet 7/
├── manage.py                  # Administrative entrypoint
├── verify_lab7.py             # Automated Django test client test suite (4/4 tests passed)
├── README.md                  # Technical documentation
├── lab7_project/
│   ├── __init__.py
│   ├── settings.py            # SQLite database & application settings
│   ├── urls.py                # Root routing
│   └── wsgi.py
└── catalog_app/
    ├── __init__.py
    ├── apps.py
    ├── models.py              # Fruit & EventStudent model definitions
    ├── urls.py                # Catalog routes
    ├── views.py               # Sorting, searching & fallback logic
    └── templates/
        └── catalog_app/
            └── index.html     # Glassmorphic matrix & table UI
```

---

## How to Run & Verify

### Run Automated Test Suite
```bash
python verify_lab7.py
```

### Run Django Development Server
```bash
python manage.py runserver 8000
```
Open `http://127.0.0.1:8000/` in your browser.
