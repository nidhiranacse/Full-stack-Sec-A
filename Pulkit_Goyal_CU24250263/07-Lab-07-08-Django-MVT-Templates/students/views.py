from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from .models import Student

def home(request):
    """Landing homepage highlighting student profile and overview."""
    total_students = Student.objects.count()
    context = {
        'title': 'Student Portal Home',
        'student_name': 'Pulkit Goyal',
        'cuid': 'CU24250263',
        'roll_number': 40,
        'section': 'A',
        'total_students': total_students,
    }
    return render(request, 'students/home.html', context)

def student_list(request):
    """Displays complete student roster directory."""
    students = Student.objects.all()
    context = {
        'title': 'Student Directory',
        'students': students,
        'student_count': students.count()
    }
    return render(request, 'students/students.html', context)

def search_students(request):
    """Performs dynamic search query against name, cuid, or department."""
    query = request.GET.get('q', '').strip()
    results = []
    if query:
        results = Student.objects.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(cuid__icontains=query) |
            Q(department__icontains=query)
        )
    context = {
        'title': 'Search Students',
        'query': query,
        'results': results,
        'result_count': len(results) if query else 0
    }
    return render(request, 'students/search.html', context)

def about(request):
    """Course syllabus and lab goals information."""
    return render(request, 'students/about.html', {'title': 'About Full Stack Lab'})

def contact(request):
    """Contact & feedback inquiry form."""
    return render(request, 'students/contact.html', {'title': 'Contact & Lab Support'})
