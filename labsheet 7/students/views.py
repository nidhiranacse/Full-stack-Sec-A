from django.shortcuts import render
from .models import Student

def fruits_view(request):
    fruits = ["Apple", "Banana", "Mango", "Orange", "Grapes"]
    return render(request, "students/fruits.html", {"fruits": fruits})

def students_view(request):
    students = Student.objects.all()
    search_query = request.GET.get("search", "")
    sort_by = request.GET.get("sort", "name")

    if search_query:
        students = students.filter(name__icontains=search_query)

    if sort_by == "name":
        students = students.order_by("name")
    elif sort_by == "-name":
        students = students.order_by("-name")
    elif sort_by == "event":
        students = students.order_by("event")

    return render(request, "students/students.html", {
        "students": students,
        "search_query": search_query,
        "sort_by": sort_by
    })