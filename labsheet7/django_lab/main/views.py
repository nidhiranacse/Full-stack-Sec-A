from django.shortcuts import render


def home(request):

    # ---------------- FRUITS ----------------
    fruits = [
        "Apple",
        "Banana",
        "Mango",
        "Orange",
        "Grapes",
        "Pineapple"
    ]


    # ---------------- STUDENTS ----------------
    students = [
        {"name": "Rahul", "age": 21, "course": "B.Tech"},
        {"name": "Aman", "age": 20, "course": "BCA"},
        {"name": "Janvee", "age": 21, "course": "B.Tech"},
        {"name": "Priya", "age": 22, "course": "MCA"},
        {"name": "Riya", "age": 20, "course": "B.Tech"}
    ]

    # Sorting
    sort_by = request.GET.get("sort", "name")

    if sort_by == "name":
        students = sorted(
            students,
            key=lambda x: x["name"].lower()
        )

    elif sort_by == "age":
        students = sorted(
            students,
            key=lambda x: x["age"]
        )

    elif sort_by == "course":
        students = sorted(
            students,
            key=lambda x: x["course"].lower()
        )


    # ---------------- STUDENT SEARCH ----------------
    all_students = [
        {"name": "Rahul", "age": 21, "course": "B.Tech"},
        {"name": "Aman", "age": 20, "course": "BCA"},
        {"name": "Janvee", "age": 21, "course": "B.Tech"},
        {"name": "Priya", "age": 22, "course": "MCA"},
        {"name": "Riya", "age": 20, "course": "B.Tech"},
        {"name": "Karan", "age": 23, "course": "BCA"},
        {"name": "Anjali", "age": 21, "course": "B.Tech"}
    ]

    search = request.GET.get("q", "")

    search_students = all_students

    if search:
        search_students = [
            student
            for student in all_students
            if search.lower() in student["name"].lower()
        ]


    # ---------------- ONE HOME PAGE ----------------
    return render(
        request,
        "home.html",
        {
            "fruits": fruits,
            "students": students,
            "sort_by": sort_by,
            "search_students": search_students,
            "search": search
        }
    )

