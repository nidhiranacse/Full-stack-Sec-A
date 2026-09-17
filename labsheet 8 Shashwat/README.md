# Labsheet 8 – Template Inheritance & Modular UI Engineering
**Name:** Shashwat Saini | **Subject:** Full Stack Development

## Tasks

| Task | Description |
|------|-------------|
| **8.1** | `active_page` context var → `.nav-active` CSS class on the current nav item |
| **8.2** | `{% block notification %}` in base + Django messages framework for persistent alerts |
| **8.3** | Contact Us form → validated POST → `logging.info()` → server console logs |

## Setup & Run

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Open: http://127.0.0.1:8000/

## Pages

| URL | Page |
|-----|------|
| `/` | Home |
| `/about/` | About Us |
| `/contact/` | Contact Us (Task 8.3) |

## Template Hierarchy

```
base.html  ← master blueprint
├── home.html
├── about.html
└── contact.html
```
