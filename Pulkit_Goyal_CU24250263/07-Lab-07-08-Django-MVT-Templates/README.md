# Lab Sheet 7 & 8: Django MVT Pattern, Template Inheritance & Student Directory

**Student Name:** Pulkit Goyal  
**CUID:** CU24250263  
**Roll Number:** 40  
**Section:** A  
**Course:** Full Stack Web Development (B.Tech CSE)  

---

## 1. Objective & Lab Questions
1. Understand and implement Django's **Model-View-Template (MVT)** architectural design pattern.
2. Build a modular Django App (`students`) within a Django project (`myproject`).
3. Define database entities using Django **ORM Models** (`Student` model with CUID, Roll Number, Name, Department, GPA, Enrollment Date).
4. Utilize **Django Template Inheritance**:
   - Master layout template `base.html` with navigation, breadcrumbs, student identity attribution, and block placeholders (`{% block content %}`, `{% block title %}`).
   - Child page templates: `home.html`, `students.html`, `search.html`, `about.html`, and `contact.html`.
5. Implement search filtering via GET query parameters (`?q=...`) to filter student records dynamically by name, CUID, or department.
6. Register models in Django Admin (`admin.py`) with search fields and list displays.

---

## 2. Directory Structure
```
07-Lab-07-08-Django-MVT-Templates/
├── README.md                      # Lab documentation & viva notes
├── manage.py                      # Django management script
├── requirements.txt               # Dependencies (Django, sqlparse)
├── myproject/
│   ├── __init__.py
│   ├── settings.py                # Configured apps & templates
│   ├── urls.py                    # Root URL router
│   └── wsgi.py
└── students/
    ├── __init__.py
    ├── apps.py
    ├── admin.py                   # Admin registration
    ├── models.py                  # Student database schema
    ├── views.py                   # View functions & ORM queries
    ├── urls.py                    # App-level routing
    └── templates/students/
        ├── base.html              # Master layout with navbar & footer
        ├── home.html              # Welcome portal & student bio
        ├── students.html          # Dynamic student table & cards
        ├── search.html            # Real-time search filter interface
        ├── about.html             # Academic course details
        └── contact.html           # Lab inquiry form
```

---

## 3. How to Run Locally
```bash
# 1. Navigate to directory
cd 07-Lab-07-08-Django-MVT-Templates

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply database migrations
python manage.py makemigrations students
python manage.py migrate

# 4. Start the Django development server
python manage.py runserver
```
Visit `http://localhost:8000` in your web browser.

---

## 4. Key Concepts & Viva Answers (For Self-Demonstration)

### Q1: How does Django's MVT pattern compare to traditional MVC?
- **Model:** Corresponds to the database layer (handled by Django ORM).
- **View:** In Django, the View corresponds to the *Controller* in classic MVC (it contains business logic, processes requests, queries models, and selects templates).
- **Template:** Corresponds to the *View* in classic MVC (it handles HTML presentation and formatting using the Django Template Language).

### Q2: What is the DRY principle in Django Templates?
- "Don't Repeat Yourself". By using `{% extends 'students/base.html' %}`, common markup (header, CSS imports, navigation, student badges, and footer) is defined in a single file. Sub-templates only provide their specific page content within `{% block content %}`.

### Q3: How does the ORM perform search filtering?
- Using Django's QuerySet filter lookups:
  ```python
  Student.objects.filter(
      Q(first_name__icontains=query) |
      Q(cuid__icontains=query) |
      Q(department__icontains=query)
  )
  ```
  The `__icontains` lookup generates case-insensitive `LIKE '%query%'` SQL statements automatically.
