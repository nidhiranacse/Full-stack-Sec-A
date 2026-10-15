from django.shortcuts import render


FRUITS = [
	{'name': 'Apple', 'color': 'Ruby red', 'origin': 'Himachal Pradesh', 'season': 'Autumn'},
	{'name': 'Banana', 'color': 'Sun yellow', 'origin': 'Tamil Nadu', 'season': 'Year-round'},
	{'name': 'Dragon fruit', 'color': 'Magenta', 'origin': 'Maharashtra', 'season': 'Summer'},
	{'name': 'Kiwi', 'color': 'Leaf green', 'origin': 'Arunachal Pradesh', 'season': 'Winter'},
	{'name': 'Mango', 'color': 'Golden', 'origin': 'Uttar Pradesh', 'season': 'Summer'},
	{'name': 'Orange', 'color': 'Citrus orange', 'origin': 'Maharashtra', 'season': 'Winter'},
]

SELECTED_EVENT_STUDENTS = [
	{'name': 'Aarav Mehta', 'event': 'Hackathon', 'year': 2026, 'status': 'Confirmed'},
	{'name': 'Diya Sharma', 'event': 'Design sprint', 'year': 2026, 'status': 'Waitlisted'},
	{'name': 'Kabir Rao', 'event': 'Hackathon', 'year': 2025, 'status': 'Confirmed'},
	{'name': 'Meera Iyer', 'event': 'Code relay', 'year': 2026, 'status': 'Confirmed'},
	{'name': 'Rohan Das', 'event': 'Design sprint', 'year': 2025, 'status': 'Confirmed'},
]

SORT_OPTIONS = {
	'name': ('name', 'Name'),
	'event': ('event', 'Event'),
	'year': ('year', 'Year'),
}


def dashboard(request):
	query = request.GET.get('q', '').strip()
	sort = request.GET.get('sort', 'name')
	sort_key, sort_label = SORT_OPTIONS.get(sort, SORT_OPTIONS['name'])

	filtered_fruits = [
		fruit for fruit in FRUITS
		if not query or query.casefold() in ' '.join(fruit.values()).casefold()
	]
	filtered_students = [
		student for student in SELECTED_EVENT_STUDENTS
		if not query or query.casefold() in ' '.join(str(value) for value in student.values()).casefold()
	]
	filtered_students.sort(key=lambda student: str(student[sort_key]).casefold())

	return render(request, 'fruits/dashboard.html', {
		'fruits': filtered_fruits,
		'students': filtered_students,
		'query': query,
		'sort': sort,
		'sort_label': sort_label,
		'sort_options': SORT_OPTIONS,
	})

# Create your views here.
