from django.shortcuts import render
from .models import Student


def student_list(request):

    # Fruit collection
    fruits = [
        "Apple",
        "Banana",
        "Mango",
        "Orange",
        "Grapes",
        "Pineapple"
    ]

    # Get all students
    students = Student.objects.all()

    # =========================
    # TASK 8.3 - SEARCH
    # =========================

    search = request.GET.get("search", "")

    if search:
        students = students.filter(
            name__icontains=search
        )

    # =========================
    # TASK 8.2 - SORTING
    # =========================

    sort = request.GET.get("sort", "name")

    allowed_fields = [
        "name",
        "roll_number",
        "event",
        "email"
    ]

    if sort in allowed_fields:
        students = students.order_by(sort)

    context = {
        "fruits": fruits,
        "students": students,
        "search": search,
        "sort": sort,
    }

    return render(
        request,
        "main/index.html",
        context
    )