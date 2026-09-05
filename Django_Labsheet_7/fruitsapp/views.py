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
        {"name": "Afroj", "event": "Coding"},
        {"name": "Aman", "event": "Quiz"},
        {"name": "Zoya", "event": "Dance"},
        {"name": "Neha", "event": "Coding"},
        {"name": "Karan", "event": "Quiz"},
    ]

    # Search
    query = request.GET.get("search", "")

    if query:
        students = [
            student for student in students
            if query.lower() in student["name"].lower()
        ]

    # Sorting
    sort = request.GET.get("sort")

    if sort == "name":
        students = sorted(
            students,
            key=lambda student: student["name"]
        )

    return render(request, "fruitsapp/home.html", {
        "fruits": fruits,
        "students": students,
        "query": query
    })