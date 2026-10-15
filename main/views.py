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
        {"name": "Anshul", "event": "Coding"},
        {"name": "Afroj A.I", "event": "Quiz"},
        {"name": "Navya", "event": "Debate"},
        {"name": "Arshil", "event": "Sports"},
        {"name": "Neha", "event": "Dance"}
    ]

    # Search
    search = request.GET.get("search", "")

    if search:
        students = [
            student
            for student in students
            if search.lower() in student["name"].lower()
        ]

    # Sorting
    sort = request.GET.get("sort", "")

    if sort == "name":
        students = sorted(
            students,
            key=lambda x: x["name"]
        )

    elif sort == "event":
        students = sorted(
            students,
            key=lambda x: x["event"]
        )

    context = {
        "fruits": fruits,
        "students": students,
        "search": search
    }

    return render(
        request,
        "main/home.html",
        context
    )