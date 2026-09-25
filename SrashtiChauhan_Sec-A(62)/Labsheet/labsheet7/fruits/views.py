from django.shortcuts import render
from .models import Fruit, Student


def home(request):
    # Get all fruits
    fruits = Fruit.objects.all()

    # Get search text from the URL
    search = request.GET.get("search", "")

    # Get sorting option from the URL
    sort = request.GET.get("sort", "name")

    # Search students
    students = Student.objects.all()

    if search:
        students = students.filter(name__icontains=search)

    # Sort students
    if sort == "name":
        students = students.order_by("name")
    elif sort == "-name":
        students = students.order_by("-name")
    elif sort == "event":
        students = students.order_by("event")
    elif sort == "-event":
        students = students.order_by("-event")

    context = {
        "fruits": fruits,
        "students": students,
        "search": search,
        "sort": sort,
    }

    return render(request, "fruits/home.html", context)