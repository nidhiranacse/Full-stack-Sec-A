from django.db.models import Q
from django.shortcuts import render

from .models import EventStudent, Fruit


STUDENT_SORT_FIELDS = {
    "name": "name",
    "event": "event",
    "roll_number": "roll_number",
}


def collection_index(request):
    query = request.GET.get("q", "").strip()
    sort_by = request.GET.get("sort", "name")
    direction = request.GET.get("direction", "asc")

    fruits = Fruit.objects.all()
    students = EventStudent.objects.all()

    if query:
        fruits = fruits.filter(
            Q(name__icontains=query)
            | Q(color__icontains=query)
            | Q(season__icontains=query)
        )
        students = students.filter(
            Q(name__icontains=query)
            | Q(event__icontains=query)
            | Q(roll_number__icontains=query)
        )

    sort_field = STUDENT_SORT_FIELDS.get(sort_by, "name")
    if direction not in {"asc", "desc"}:
        direction = "asc"
    ordering = sort_field if direction == "asc" else f"-{sort_field}"
    students = students.order_by(ordering, "pk")

    return render(
        request,
        "catalog/index.html",
        {
            "fruits": fruits,
            "students": students,
            "query": query,
            "sort_by": sort_by if sort_by in STUDENT_SORT_FIELDS else "name",
            "direction": direction,
            "fruit_count": fruits.count(),
            "student_count": students.count(),
        },
    )