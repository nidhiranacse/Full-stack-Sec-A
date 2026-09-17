from django.shortcuts import render
from .models import Fruit, Student


# ─── Task 7.1 ───────────────────────────────────────────────────────────────
# Show fruits (unordered list) and students (ordered list).
# Template uses {% if %} to show an alert when either list is empty.
def index(request):
    fruits = Fruit.objects.all()
    students = Student.objects.all().order_by('roll_number')
    return render(request, 'myapp/index.html', {
        'fruits': fruits,
        'students': students,
    })


# ─── Task 7.2 ───────────────────────────────────────────────────────────────
# Dynamic table sorting: sort students by name / event / roll_number
# via GET param  ?sort=<field>  (default: name).
VALID_SORT_FIELDS = ['name', 'event', 'roll_number']

def students_sorted(request):
    sort_by = request.GET.get('sort', 'name')
    if sort_by not in VALID_SORT_FIELDS:
        sort_by = 'name'
    students = Student.objects.all().order_by(sort_by)
    return render(request, 'myapp/students_sorted.html', {
        'students': students,
        'sort_by': sort_by,
    })


# ─── Task 7.3 ───────────────────────────────────────────────────────────────
# Search form: filter students by name or event using GET ?q=<query>.
def search(request):
    query = request.GET.get('q', '').strip()
    if query:
        students = Student.objects.filter(name__icontains=query) | \
                   Student.objects.filter(event__icontains=query)
        students = students.distinct()
    else:
        students = Student.objects.all()
    return render(request, 'myapp/search.html', {
        'students': students,
        'query': query,
    })
