from django.shortcuts import redirect, render
from .models import Student


# Task 7.1 - Empty Array Check
def fruits_view(request):

    default_fruits = ["Apple", "Banana", "Mango", "Orange", "Ananas"]
    fruits = request.session.get('fruits', default_fruits)

    if request.method == 'POST':
        fruit = request.POST.get('fruit', '').strip()
        if fruit and fruit.casefold() not in {item.casefold() for item in fruits}:
            fruits.append(fruit)
            request.session['fruits'] = fruits
        return redirect('fruits')

    return render(
        request,
        'records/fruits.html',
        {'fruits': fruits, 'fruit_count': len(fruits)}
    )


# Task 8.2 and 8.3
def students_view(request):

    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        course = request.POST.get('course', '').strip()

        if name and course:
            Student.objects.create(name=name, course=course)
            return redirect('students')

        add_error = 'Both student name and course are required.'
    else:
        add_error = ''

    search = request.GET.get('search', '').strip()
    sort = request.GET.get('sort', 'name')
    direction = 'desc' if request.GET.get('direction') == 'desc' else 'asc'

    sort_fields = {
        'name': 'name',
        'course': 'course',
    }
    sort_field = sort_fields.get(sort, 'name')
    sort_prefix = '' if direction == 'asc' else '-'

    students = Student.objects.all()

    # Task 8.3 Search Functionality
    if search:
        students = students.filter(
            name__icontains=search
        )

    # Task 7.2 Sorting by a safe, selected field
    students = students.order_by(f'{sort_prefix}{sort_field}')

    return render(
        request,
        'records/student.html',
        {
            'students': students,
            'search': search,
            'sort': sort,
            'direction': direction,
            'total_students': students.count(),
            'add_error': add_error,
        }
    )