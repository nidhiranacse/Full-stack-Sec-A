from django.shortcuts import render

# ---------------------------------------------------------------
# LAB 7 data
# Fruits  -> a set (unordered collection, no index, no duplicates)
# Students -> a list of dicts (ordered, index-based collection)
# ---------------------------------------------------------------
FRUITS = {"Apple", "Banana", "Mango", "Orange", "Grapes", "Papaya", "Guava"}

STUDENTS = [
    {"roll": 101, "name": "Aarav Sharma", "department": "CSE"},
    {"roll": 102, "name": "Diya Verma", "department": "IT"},
    {"roll": 103, "name": "Rohan Mehta", "department": "ECE"},
    {"roll": 104, "name": "Ananya Gupta", "department": "CSE"},
    {"roll": 105, "name": "Kabir Singh", "department": "ME"},
    {"roll": 106, "name": "Meera Joshi", "department": "IT"},
]


# ------------------------- LAB 7 pages -------------------------
def fruits(request):
    """Task 7.1 (empty fallback) + Task 8.3 (search) on an unordered set."""
    q = request.GET.get("q", "").strip()
    items = FRUITS
    if q:
        items = {f for f in items if q.lower() in f.lower()}
    # ?empty=1 lets you demo the fallback alert for an empty collection
    if request.GET.get("empty") == "1":
        items = set()
    return render(request, "labapp/fruits.html", {"fruits": items, "q": q})


def students(request):
    """Task 7.1 (empty fallback), Task 8.2 (sorting), Task 8.3 (search)."""
    q = request.GET.get("q", "").strip()
    sort = request.GET.get("sort", "roll")
    order = request.GET.get("order", "asc")

    data = list(STUDENTS)

    # search (back-end filtering on name or department)
    if q:
        data = [s for s in data
                if q.lower() in s["name"].lower() or q.lower() in s["department"].lower()]

    # sorting (whitelist fields so arbitrary keys can't be passed in)
    if sort not in ("roll", "name", "department"):
        sort = "roll"
    data.sort(key=lambda s: str(s[sort]).lower() if sort != "roll" else s[sort],
              reverse=(order == "desc"))

    if request.GET.get("empty") == "1":
        data = []

    return render(request, "labapp/students.html", {
        "students": data,
        "q": q,
        "sort": sort,
        "order": order,
        "next_order": "desc" if order == "asc" else "asc",
    })
