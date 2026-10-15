from django.shortcuts import render
from .models import Fruit, Student


def fruit_list(request):
    fruits = Fruit.objects.all()

    return render(
        request,
        "students/fruit_list.html",
        {"fruits": fruits}
    )


def student_list(request):
    sort_by = request.GET.get(
        "sort_by",
        "registration_order"
    )

    allowed_fields = {
        "name",
        "roll_no",
        "event_name",
        "registration_order"
    }

    field_name = sort_by.lstrip("-")

    if field_name not in allowed_fields:
        sort_by = "registration_order"

    students = Student.objects.all().order_by(sort_by)

    context = {
        "students": students,
        "current_sort": sort_by,
    }

    return render(
        request,
        "students/student_list.html",
        context
    )


def search_students(request):
    query = request.GET.get("q", "").strip()

    if query:
        results = (
            Student.objects.filter(
                name__icontains=query
            )
            | Student.objects.filter(
                event_name__icontains=query
            )
        )

        results = results.distinct().order_by(
            "registration_order"
        )
    else:
        results = Student.objects.none()

    context = {
        "query": query,
        "results": results,
        "searched": bool(query),
    }

    return render(
        request,
        "students/search.html",
        context
    )