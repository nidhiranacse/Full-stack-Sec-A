# Labsheet 7 – Django Array Collections
**Name:** Shashwat Saini | **Subject:** Full Stack Development

## Tasks

| Task | Description |
|------|-------------|
| **7.1** | Fruits (unordered list) + Students (ordered list) with `{% if %}` empty-state alerts |
| **7.2** | Sortable student table — click column headers to sort by Name / Event / Roll No. |
| **7.3** | Search form filters students by name or event via GET request |

## Setup & Run

```bash
# 1. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply migrations (creates DB + seeds sample data)
python manage.py migrate

# 4. Run the development server
python manage.py runserver
```

Then open: http://127.0.0.1:8000/

## URLs

| URL | Task |
|-----|------|
| `/` | Task 7.1 – Collections (Fruits + Students) |
| `/sort/?sort=name` | Task 7.2 – Sorted Table |
| `/search/?q=cricket` | Task 7.3 – Search Form |
| `/admin/` | Django Admin Panel |

## Models

**Fruit** — `name`, `color`  
**Student** — `name`, `event`, `roll_number`
