from django.shortcuts import render

# Create your views here.
from django.shortcuts import render


def home(request):

    fruits = [
        "Apple",
        "Banana",
        "Mango",
        "Orange",
        "Grapes"
    ]

    students = [
        {
            "id": 1,
            "name": "Priya",
            "course": "B.Tech CSE",
            "event": "Coding Competition"
        },
        {
            "id": 2,
            "name": "Aman",
            "course": "B.Tech IT",
            "event": "Hackathon"
        },
        {
            "id": 3,
            "name": "Rahul",
            "course": "B.Tech CSE",
            "event": "Quiz Competition"
        },
        {
            "id": 4,
            "name": "Neha",
            "course": "BCA",
            "event": "Coding Competition"
        },
        {
            "id": 5,
            "name": "Simran",
            "course": "B.Tech CSE",
            "event": "Hackathon"
        }
    ]

    # Task 8.2 - Sorting
    sort_by = request.GET.get("sort", "")

    if sort_by == "name":
        students = sorted(
            students,
            key=lambda student: student["name"].lower()
        )

    # Task 8.3 - Search
    search_query = request.GET.get("search", "").strip()

    if search_query:
        students = [
            student
            for student in students
            if search_query.lower() in student["name"].lower()
        ]

    context = {
        "fruits": fruits,
        "students": students,
        "search_query": search_query,
    }

    return render(request, "students/index.html", context)