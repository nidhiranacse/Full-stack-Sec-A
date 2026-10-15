# Lab Sheet 7: Django Collections

A small Django app demonstrating two collection patterns: an unordered fruit matrix and an ordered index of students selected for events. Search filters both collections on the server, and the student register supports field-based ascending or descending sorting.

## Run locally

```powershell
c:/python314/python.exe -m pip install -r requirements.txt
c:/python314/python.exe manage.py migrate
c:/python314/python.exe manage.py runserver
```

Open http://127.0.0.1:8000/ to use the collection browser. The tables start empty so the template fallback alerts are visible immediately. To add records, create an admin account with `c:/python314/python.exe manage.py createsuperuser`, then use `/admin/`.

## Checks

```powershell
c:/python314/python.exe manage.py test
```

The `Fruit` model has no default ordering, while `EventStudent` defaults to name order. The view validates sort keys against an allowlist before constructing an `order_by()` clause. The shared search uses case-insensitive matching across each model's display fields.