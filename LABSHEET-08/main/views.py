from django.shortcuts import render
from django.contrib import messages


def home(request):
    return render(request, "main/home.html", {"active_page": "home"})


def about(request):
    return render(request, "main/about.html", {"active_page": "about"})


def contact(request):
    if request.method == "POST":
        feedback = request.POST.get("message", "")

        print("User Feedback:", feedback)

        messages.success(request, "Feedback submitted successfully!")

    return render(request, "main/contact.html", {"active_page": "contact"})
