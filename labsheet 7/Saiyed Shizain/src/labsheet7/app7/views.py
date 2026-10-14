from django.db.models import Q
from django.shortcuts import render
from .models import Fruit, Student


def fruit_list(request):
    """Task 7.1 — unordered matrix; template handles the empty case."""
    fruits = Fruit.objects.all()
    return render(request, "app7/fruit_list.html", {
        "fruits": fruits,
        "page_title": "Fruits (Unordered Item Matrix)",
    })


def student_list(request):
    """Tasks 7.1+7.2 — ordered list with whitelisted dynamic sorting."""
    allowed = {"position", "name", "event", "-name", "-event", "-position"}
    sort_field = request.GET.get("sort", "position")
    if sort_field not in allowed:
        sort_field = "position"
    students = Student.objects.all().order_by(sort_field)
    return render(request, "app7/student_list.html", {
        "students": students,
        "page_title": "Selected Event Students (Ordered Indices)",
        "current_sort": sort_field,
    })


def student_search(request):
    """Task 7.3 — name/event substring filtering, position-ordered."""
    query = request.GET.get("q", "").strip()
    event_query = request.GET.get("event", "").strip()
    students = Student.objects.all()
    if query:
        students = students.filter(Q(name__icontains=query))
    if event_query:
        students = students.filter(Q(event__icontains=event_query))
    students = students.order_by("position")
    return render(request, "app7/student_search.html", {
        "students": students,
        "page_title": "Search Selected Event Students",
        "query": query,
        "event_query": event_query,
        "result_count": students.count(),
    })
