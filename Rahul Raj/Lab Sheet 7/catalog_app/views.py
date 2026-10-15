from django.shortcuts import render
from .models import Fruit, EventStudent

# Default in-memory seed records for seamless standalone execution
SEED_FRUITS = [
    {"id": 1, "name": "Alphonso Mango", "category": "Tropical", "origin": "Ratnagiri, India", "color": "#f59e0b", "in_stock": True},
    {"id": 2, "name": "Kashmiri Apple", "category": "Pome", "origin": "Kashmir, India", "color": "#ef4444", "in_stock": True},
    {"id": 3, "name": "Nagpur Orange", "category": "Citrus", "origin": "Maharashtra, India", "color": "#f97316", "in_stock": True},
    {"id": 4, "name": "Cavendish Banana", "category": "Tropical", "origin": "Tamil Nadu, India", "color": "#eab308", "in_stock": False},
    {"id": 5, "name": "Thompson Grapes", "category": "Berry", "origin": "Nashik, India", "color": "#84cc16", "in_stock": True},
    {"id": 6, "name": "Pomegranate (Anar)", "category": "Pome", "origin": "Solapur, India", "color": "#dc2626", "in_stock": True},
    {"id": 7, "name": "Sweet Papaya", "category": "Tropical", "origin": "Karnataka, India", "color": "#fb923c", "in_stock": True},
    {"id": 8, "name": "Fresh Guava", "category": "Tropical", "origin": "Uttar Pradesh, India", "color": "#10b981", "in_stock": False},
]

SEED_STUDENTS = [
    {"rank": 1, "name": "Rahul Raj", "roll_no": "cu24250116", "event_category": "Full Stack Web Hackathon", "score": 98.5},
    {"rank": 2, "name": "Aarav Sharma", "roll_no": "cu24250101", "event_category": "Algorithmic Code Sprint", "score": 94.0},
    {"rank": 3, "name": "Diya Patel", "roll_no": "cu24250145", "event_category": "UI/UX Design Jam", "score": 91.5},
    {"rank": 4, "name": "Ishaan Verma", "roll_no": "cu24250189", "event_category": "Cloud Architecture Sprint", "score": 88.0},
    {"rank": 5, "name": "Ananya Sengupta", "roll_no": "cu24250212", "event_category": "Cybersecurity Capture The Flag", "score": 85.5},
    {"rank": 6, "name": "Karan Malhotra", "roll_no": "cu24250230", "event_category": "Data Science Modeling", "score": 82.0},
    {"rank": 7, "name": "Sneha Kulkarni", "roll_no": "cu24250278", "event_category": "Mobile App Development", "score": 79.5},
]

def index(request):
    """
    Main catalog view supporting:
    - Task 7.1: Fallback condition logic filters inside the template layer ({% if %}).
    - Task 7.2: Dynamic table sorting based on specific field properties.
    - Task 7.3: User search input form that screens long array matrices dynamically.
    """
    search_query = request.GET.get('q', '').strip().lower()
    sort_field = request.GET.get('sort', 'rank')
    sort_order = request.GET.get('order', 'asc')
    simulate_empty_fruits = request.GET.get('empty_fruits') == '1'
    simulate_empty_students = request.GET.get('empty_students') == '1'

    # 1. Processing Fruits (Unordered Matrix)
    fruits = [] if simulate_empty_fruits else list(SEED_FRUITS)
    if search_query and fruits:
        fruits = [
            f for f in fruits
            if search_query in f['name'].lower() or search_query in f['category'].lower() or search_query in f['origin'].lower()
        ]

    # 2. Processing Selected Event Students (Ordered Indices)
    students = [] if simulate_empty_students else list(SEED_STUDENTS)
    if search_query and students:
        students = [
            s for s in students
            if search_query in s['name'].lower() or search_query in s['roll_no'].lower() or search_query in s['event_category'].lower()
        ]

    # Dynamic Table Sorting (Task 7.2)
    valid_sort_keys = {
        'rank': lambda s: s['rank'],
        'name': lambda s: s['name'].lower(),
        'roll_no': lambda s: s['roll_no'].lower(),
        'score': lambda s: s['score'],
        'event': lambda s: s['event_category'].lower(),
    }
    key_func = valid_sort_keys.get(sort_field, valid_sort_keys['rank'])
    is_reverse = (sort_order == 'desc')
    students = sorted(students, key=key_func, reverse=is_reverse)

    context = {
        'student_name': 'Rahul Raj',
        'student_id': 'cu24250116',
        'course': 'Full Stack Web Development (Sec-A)',
        'fruits': fruits,
        'students': students,
        'search_query': request.GET.get('q', ''),
        'sort_field': sort_field,
        'sort_order': sort_order,
        'empty_fruits_active': simulate_empty_fruits,
        'empty_students_active': simulate_empty_students,
        'total_fruits': len(fruits),
        'total_students': len(students),
    }
    return render(request, 'catalog_app/index.html', context)
