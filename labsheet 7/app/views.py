from django.shortcuts import render


def home(request):

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
            "id": 1,
            "name": "Rahul",
            "event": "Hackathon"
        },
        {
            "id": 2,
            "name": "Aman",
            "event": "Workshop"
        },
        {
            "id": 3,
            "name": "Riya",
            "event": "Hackathon"
        },
        {
            "id": 4,
            "name": "Simran",
            "event": "Seminar"
        },
        {
            "id": 5,
            "name": "Karan",
            "event": "Workshop"
        },
        {
            "id": 6,
            "name": "Neha",
            "event": "Hackathon"
        }
    ]

    search = request.GET.get("search", "").strip()

    if search:
        students = [
            student
            for student in students
            if search.lower() in student["name"].lower()
        ]

    sort = request.GET.get("sort", "")

    if sort == "name":
        students = sorted(
            students,
            key=lambda student: student["name"].lower()
        )

    elif sort == "name_desc":
        students = sorted(
            students,
            key=lambda student: student["name"].lower(),
            reverse=True
        )

    context = {
        "fruits": fruits,
        "students": students,
        "search": search,
        "sort": sort,
    }

    return render(request, "app/students.html", context)