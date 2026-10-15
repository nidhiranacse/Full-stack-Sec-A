import os
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "task7")

from django.conf import settings

settings.configure(
    DEBUG=True,
    SECRET_KEY="12345",
    ROOT_URLCONF=__name__,
    ALLOWED_HOSTS=["*"],
    TEMPLATES=[{
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": False,
        "OPTIONS": {}
    }]
)

import django
django.setup()

from django.http import HttpResponse
from django.template import Template, Context
from django.urls import path

students_data = [
    {"name": "Aarav", "roll": 101, "course": "B.Tech", "marks": 85},
    {"name": "Ishika", "roll": 102, "course": "B.Tech", "marks": 92},
    {"name": "Rahul", "roll": 103, "course": "BCA", "marks": 78},
    {"name": "Priya", "roll": 104, "course": "BCA", "marks": 88},
    {"name": "Karan", "roll": 105, "course": "B.Tech", "marks": 75},
]

def student_view(request):
    search = request.GET.get("search", "").strip()
    students = [s for s in students_data if search.lower() in s["name"].lower()]

    sort = request.GET.get("sort", "name")
    if sort in ["name", "roll", "course", "marks"]:
        students.sort(key=lambda s: s[sort])

    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Lab Sheet 7</title>
        <style>
            body { font-family: Arial; margin: 40px; }
            table { border-collapse: collapse; width: 80%; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 10px; text-align: center; }
            th { background: lightgray; }
            .alert { color: red; font-weight: bold; }
            form { margin: 15px 0; }
        </style>
    </head>
    <body>
        <h1>Student Records</h1>

        <form method="GET">
            <input type="text" name="search" placeholder="Search student name" value="{{ search }}">
            <button type="submit">Search</button>
        </form>

        <form method="GET">
            <input type="hidden" name="search" value="{{ search }}">
            <label>Sort By:</label>
            <select name="sort">
                <option value="name">Name</option>
                <option value="roll">Roll Number</option>
                <option value="course">Course</option>
                <option value="marks">Marks</option>
            </select>
            <button type="submit">Sort</button>
        </form>

        {% if students %}
        <table>
            <tr>
                <th>Name</th>
                <th>Roll Number</th>
                <th>Course</th>
                <th>Marks</th>
            </tr>
            {% for student in students %}
            <tr>
                <td>{{ student.name }}</td>
                <td>{{ student.roll }}</td>
                <td>{{ student.course }}</td>
                <td>{{ student.marks }}</td>
            </tr>
            {% endfor %}
        </table>
        {% else %}
        <p class="alert">No student records found.</p>
        {% endif %}
    </body>
    </html>
    """

    template = Template(html)
    return HttpResponse(template.render(Context({
        "students": students,
        "search": search,
        "sort": sort
    })))

urlpatterns = [
    path("", student_view, name="students"),
]

if __name__ == "__main__":
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
