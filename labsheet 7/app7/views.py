from django.db.models import Q
from django.shortcuts import render

from .models import Fruit, Student


def fruit_list(request):
    """
    Task 7.1

    Displays the unordered Fruit collection.
    """

    fruits = Fruit.objects.all()

    context = {
        'fruits': fruits,
        'page_title': 'Fruits (Unordered Item Matrix)',
    }

    return render(
        request,
        'app7/fruit_list.html',
        context
    )


def student_list(request):
    """
    Task 7.1 + Task 7.2

    Displays the ordered Student list
    and supports dynamic sorting.
    """

    allowed_sort_fields = {
        'position',
        'name',
        'event',
        '-name',
        '-event',
        '-position',
    }

    sort_field = request.GET.get(
        'sort',
        'position'
    )

    if sort_field not in allowed_sort_fields:
        sort_field = 'position'

    students = Student.objects.all().order_by(
        sort_field
    )

    context = {
        'students': students,
        'page_title': 'Selected Event Students (Ordered Indices)',
        'current_sort': sort_field,
    }

    return render(
        request,
        'app7/student_list.html',
        context
    )


def student_search(request):
    """
    Task 7.3

    Searches students by name
    and optionally by event.
    """

    query = request.GET.get(
        'q',
        ''
    ).strip()

    event_query = request.GET.get(
        'event',
        ''
    ).strip()

    students = Student.objects.all()

    if query:
        students = students.filter(
            Q(name__icontains=query)
        )

    if event_query:
        students = students.filter(
            Q(event__icontains=event_query)
        )

    students = students.order_by(
        'position'
    )

    context = {
        'students': students,
        'page_title': 'Search Selected Event Students',
        'query': query,
        'event_query': event_query,
        'result_count': students.count(),
    }

    return render(
        request,
        'app7/student_search.html',
        context
    )