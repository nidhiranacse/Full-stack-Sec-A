from django.shortcuts import render, redirect
from django.contrib import messages


# -------------------------
# LAB 7.1
# -------------------------
def home(request):
    fruits = ["Apple", "Banana", "Orange", "Mango"]

    students = [
        {"name": "Vanshika", "event": "Coding Competition"},
        {"name": "Rahul", "event": "Web Development"},
        {"name": "Aman", "event": "Hackathon"},
        {"name": "Riya", "event": "Tech Quiz"},
    ]

    return render(request, "students/home.html", {
        "fruits": fruits,
        "students": students,
        "active_page": "home"
    })


# -------------------------
# LAB 7.2
# -------------------------
def student_list(request):
    students = [
        {"name": "Vanshika", "roll": 101},
        {"name": "Rahul", "roll": 102},
        {"name": "Aman", "roll": 103},
        {"name": "Riya", "roll": 104},
    ]

    sort_by = request.GET.get("sort", "name")

    if sort_by not in ["name", "roll"]:
        sort_by = "name"

    students = sorted(
        students,
        key=lambda x: x[sort_by]
    )

    return render(request, "students/students.html", {
        "students": students
    })


# -------------------------
# LAB 7.3
# -------------------------
def student_search(request):
    students = [
        {"name": "Vanshika", "roll": 101},
        {"name": "Rahul", "roll": 102},
        {"name": "Aman", "roll": 103},
        {"name": "Riya", "roll": 104},
        {"name": "Ankit", "roll": 105},
    ]

    search = request.GET.get("search", "")

    filtered_students = [
        student for student in students
        if search.lower() in student["name"].lower()
    ]

    return render(request, "students/search.html", {
        "students": filtered_students,
        "search": search
    })


# -------------------------
# LAB 8.1 + 8.2
# -------------------------
def about(request):
    return render(request, "students/about.html", {
        "active_page": "about"
    })


# -------------------------
# LAB 8.3
# -------------------------
def contact(request):

    if request.method == "POST":

        name = request.POST.get("name", "").strip()
        email = request.POST.get("email", "").strip()
        message = request.POST.get("message", "").strip()

        if name and email and message:

            print("----- CONTACT FORM SUBMISSION -----")
            print("Name:", name)
            print("Email:", email)
            print("Message:", message)
            print("-----------------------------------")

            messages.success(
                request,
                "Your feedback has been submitted successfully!"
            )

            return redirect("contact")

        else:

            messages.error(
                request,
                "Please fill in all fields."
            )

    return render(request, "students/contact.html", {
        "active_page": "contact"
    })