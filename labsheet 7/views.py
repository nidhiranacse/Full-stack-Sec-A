from django.shortcuts import render
from .models import Fruit, Student


def home(request):

    # Get arrays from database
    fruits = Fruit.objects.all()
    students = Student.objects.all()

    # Search
    search = request.GET.get("search", "").strip()

    if search:
        fruits = fruits.filter(name__icontains=search)

        students = students.filter(
            name__icontains=search
        )

    # Sorting
    sort = request.GET.get("sort", "name")

    allowed_sort_fields = {
        "name": "name",
        "roll": "roll_no",
        "event": "event",
    }

    sort_field = allowed_sort_fields.get(sort, "name")

    students = students.order_by(sort_field)

    context = {
        "fruits": fruits,
        "students": students,
        "search": search,
        "sort": sort,
    }

    return render(request, "records/index.html", context)