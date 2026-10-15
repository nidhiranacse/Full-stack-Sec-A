# Anshika_labsheet7.py
# LAB SHEET 7
# Django Arrays, Sorting and Searching

import os
import sys

from django.conf import settings
from django.http import HttpResponse
from django.urls import path
from django.core.management import execute_from_command_line
from django.template import engines


# ==========================================
# DJANGO SETTINGS
# ==========================================

if not settings.configured:
    settings.configure(
        DEBUG=True,
        SECRET_KEY="anshika-labsheet7-secret-key",
        ROOT_URLCONF=__name__,
        ALLOWED_HOSTS=["*"],
        MIDDLEWARE=[],

        TEMPLATES=[
            {
                "BACKEND": "django.template.backends.django.DjangoTemplates",
                "DIRS": [],
                "APP_DIRS": False,
                "OPTIONS": {
                    "loaders": [
                        (
                            "django.template.loaders.locmem.Loader",
                            {
                                "home.html": """
<!DOCTYPE html>
<html>
<head>

    <title>Anshika - Lab Sheet 7</title>

    <style>

        body {
            font-family: Arial, sans-serif;
            background: #f4f6f8;
            margin: 0;
            padding: 30px;
        }

        .container {
            max-width: 1000px;
            margin: auto;
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        h1 {
            text-align: center;
            color: #333;
        }

        h2 {
            color: #444;
            border-bottom: 2px solid #ddd;
            padding-bottom: 8px;
        }

        .section {
            margin-top: 30px;
            padding: 20px;
            background: #fafafa;
            border-radius: 10px;
        }

        .alert {
            background: #ffe0e0;
            color: #a00000;
            padding: 12px;
            border-radius: 8px;
            font-weight: bold;
        }

        .success {
            background: #e0ffe8;
            color: #08752b;
            padding: 12px;
            border-radius: 8px;
        }

        input {
            padding: 10px;
            width: 60%;
            border: 1px solid #bbb;
            border-radius: 6px;
        }

        button,
        select {
            padding: 10px 15px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            margin-left: 5px;
        }

        button {
            background: #333;
            color: white;
        }

        select {
            background: white;
            border: 1px solid #aaa;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: center;
        }

        th {
            background: #333;
            color: white;
        }

        tr:nth-child(even) {
            background: #f2f2f2;
        }

        .fruit-list {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 15px;
        }

        .fruit {
            background: #eee;
            padding: 10px 15px;
            border-radius: 20px;
        }

        .info {
            color: #555;
        }

    </style>

</head>

<body>

<div class="container">

    <h1>LAB SHEET 7</h1>

    <p class="info">
        <b>Name:</b> Anshika
        &nbsp; | &nbsp;
        <b>Topic:</b> Django Arrays, Sorting and Searching
    </p>


    <!-- ======================================
         TASK 7.1
         ====================================== -->

    <div class="section">

        <h2>Task 7.1 - Fallback Condition Logic</h2>

        {% if fruits %}

            <div class="success">
                Fruits array contains data.
            </div>

            <div class="fruit-list">

                {% for fruit in fruits %}

                    <div class="fruit">
                        {{ fruit }}
                    </div>

                {% endfor %}

            </div>

        {% else %}

            <div class="alert">
                Alert: The fruits array is empty!
            </div>

        {% endif %}

    </div>


    <!-- ======================================
         TASK 7.2
         ====================================== -->

    <div class="section">

        <h2>Task 7.2 - Dynamic Student Table Sorting</h2>

        <form method="get">

            <label>
                <b>Sort by:</b>
            </label>

            <select name="sort">

                <option value="name"
                    {% if sort_field == "name" %}selected{% endif %}>
                    Student Name
                </option>

                <option value="marks"
                    {% if sort_field == "marks" %}selected{% endif %}>
                    Marks
                </option>

                <option value="age"
                    {% if sort_field == "age" %}selected{% endif %}>
                    Age
                </option>

            </select>

            <button type="submit">
                Sort
            </button>

        </form>


        {% if students %}

            <table>

                <tr>
                    <th>Roll No.</th>
                    <th>Student Name</th>
                    <th>Age</th>
                    <th>Marks</th>
                </tr>

                {% for student in students %}

                    <tr>

                        <td>{{ student.roll }}</td>

                        <td>{{ student.name }}</td>

                        <td>{{ student.age }}</td>

                        <td>{{ student.marks }}</td>

                    </tr>

                {% endfor %}

            </table>

        {% else %}

            <div class="alert">
                No student records available.
            </div>

        {% endif %}

    </div>


    <!-- ======================================
         TASK 7.3
         ====================================== -->

    <div class="section">

        <h2>Task 7.3 - Search and Filter</h2>

        <form method="get">

            <input
                type="text"
                name="search"
                placeholder="Search student or fruit..."
                value="{{ search }}"
            >

            <button type="submit">
                Search
            </button>

        </form>


        <h3>Filtered Students</h3>

        {% if filtered_students %}

            <table>

                <tr>
                    <th>Roll No.</th>
                    <th>Student Name</th>
                    <th>Age</th>
                    <th>Marks</th>
                </tr>

                {% for student in filtered_students %}

                    <tr>

                        <td>{{ student.roll }}</td>

                        <td>{{ student.name }}</td>

                        <td>{{ student.age }}</td>

                        <td>{{ student.marks }}</td>

                    </tr>

                {% endfor %}

            </table>

        {% else %}

            {% if search %}

                <div class="alert">
                    No matching student found.
                </div>

            {% endif %}

        {% endif %}


        <h3>Filtered Fruits</h3>

        {% if filtered_fruits %}

            <div class="fruit-list">

                {% for fruit in filtered_fruits %}

                    <div class="fruit">
                        {{ fruit }}
                    </div>

                {% endfor %}

            </div>

        {% else %}

            {% if search %}

                <div class="alert">
                    No matching fruit found.
                </div>

            {% endif %}

        {% endif %}

    </div>

</div>

</body>
</html>
"""
                            }
                        )
                    ]
                }
            }
        ]
    )


# ==========================================
# DATA ARRAYS
# ==========================================

fruits = [
    "Apple",
    "Banana",
    "Mango",
    "Orange",
    "Grapes",
    "Pineapple"
]


students = [
    {
        "roll": 1,
        "name": "Anshika",
        "age": 20,
        "marks": 88
    },

    {
        "roll": 2,
        "name": "Riya",
        "age": 21,
        "marks": 92
    },

    {
        "roll": 3,
        "name": "Priya",
        "age": 20,
        "marks": 76
    },

    {
        "roll": 4,
        "name": "Neha",
        "age": 22,
        "marks": 85
    },

    {
        "roll": 5,
        "name": "Kavya",
        "age": 21,
        "marks": 95
    }
]


# ==========================================
# VIEW FUNCTION
# ==========================================

def home(request):

    # --------------------------------------
    # TASK 7.2 - SORTING
    # --------------------------------------

    sort_field = request.GET.get("sort", "name")

    if sort_field not in ["name", "marks", "age"]:
        sort_field = "name"

    sorted_students = sorted(
        students,
        key=lambda x: x[sort_field]
    )


    # --------------------------------------
    # TASK 7.3 - SEARCH
    # --------------------------------------

    search = request.GET.get("search", "").strip()

    if search:

        search_lower = search.lower()

        filtered_students = [
            student
            for student in sorted_students
            if search_lower in student["name"].lower()
        ]

        filtered_fruits = [
            fruit
            for fruit in fruits
            if search_lower in fruit.lower()
        ]

    else:

        filtered_students = sorted_students

        filtered_fruits = fruits


    # --------------------------------------
    # LOAD TEMPLATE
    # --------------------------------------

    template = engines["django"].get_template("home.html")

    return HttpResponse(
        template.render(
            {
                "fruits": fruits,
                "students": sorted_students,
                "filtered_students": filtered_students,
                "filtered_fruits": filtered_fruits,
                "search": search,
                "sort_field": sort_field,
            },
            request
        )
    )


# ==========================================
# URL
# ==========================================

urlpatterns = [
    path("", home),
]


# ==========================================
# START DJANGO SERVER
# ==========================================

if __name__ == "__main__":

    os.environ.setdefault(
        "DJANGO_SETTINGS_MODULE",
        "__main__"
    )

    execute_from_command_line(sys.argv)
