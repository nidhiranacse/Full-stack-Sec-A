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
        {"name": "Arshil", "event": "Coding Competition"},
        {"name": "Rahul", "event": "Hackathon"},
        {"name": "Aman", "event": "Quiz Competition"},
        {"name": "Priya", "event": "Debate"},
        {"name": "Neha", "event": "Coding Competition"},
    ]

    search_query = request.GET.get("search", "")

    if search_query:
        students = [
            student for student in students
            if search_query.lower() in student["name"].lower()
        ]

    sort_order = request.GET.get("sort", "asc")

    students.sort(
        key=lambda student: student["name"],
        reverse=(sort_order == "desc")
    )

    context = {
        "fruits": fruits,
        "students": students,
        "sort_order": sort_order,
    }

    return render(request, "students/home.html", context)
