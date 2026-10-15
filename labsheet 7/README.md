# Lab Sheet 7: Array Atlas

A beginner-friendly Django app for practicing template conditionals, dynamic ordering, and GET-backed search.

## Exercises covered

- **7.1 Fallback conditions:** `{% if fruits %}` and `{% if students %}` render a visible alert when a filtered collection is empty.
- **7.2 Dynamic sorting:** the student table accepts `sort=name`, `sort=event`, or `sort=year` and uses a server-side whitelist.
- **7.3 Search form:** the `q` query parameter filters both the fruit matrix and selected event students.

## Run it

```powershell
C:/Python314/python.exe manage.py migrate
C:/Python314/python.exe manage.py runserver
```

Open `http://127.0.0.1:8000/` in a browser. Run the tests with:

```powershell
C:/Python314/python.exe manage.py test
```

The sample records are intentionally in-memory arrays so the template and request-processing concepts stay visible. SQLite is included for Django's default project setup.
