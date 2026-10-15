from django.shortcuts import render


def fruits(request):
    fruits_list = ["Apple", "Banana", "Mango", "Orange", "Grapes"]

    return render(request, "fruits.html", {"fruits": fruits_list})


def students(request):
    students_list = [
        {"name": "Rahul", "event": "Tech Fest"},
        {"name": "Ananya", "event": "Cultural Fest"},
        {"name": "Priya", "event": "Sports Meet"},
        {"name": "Aman", "event": "Tech Fest"},
        {"name": "Neha", "event": "Cultural Fest"},
    ]

    search_query = request.GET.get("search", "")
    sort_by = request.GET.get("sort", "")

    if search_query:
        students_list = [
            student
            for student in students_list
            if search_query.lower() in student["name"].lower()
        ]

    if sort_by == "name":
        students_list = sorted(students_list, key=lambda student: student["name"])

    return render(
        request,
        "students.html",
        {
            "students": students_list,
            "search_query": search_query,
        },
    )
