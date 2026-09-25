from django.shortcuts import render
from django.contrib import messages


def home(request):
    messages.success(request, "Welcome to our website!")

    return render(request, "pages/home.html", {
        "active_page": "home"
    })


def about(request):
    return render(request, "pages/about.html", {
        "active_page": "about"
    })


def contact(request):

    if request.method == "POST":

        name = request.POST.get("name", "").strip()
        email = request.POST.get("email", "").strip()
        feedback = request.POST.get("feedback", "").strip()

        if name and email and feedback:

            # Server-side verification log
            print("----- CONTACT FORM SUBMISSION -----")
            print(f"Name: {name}")
            print(f"Email: {email}")
            print(f"Feedback: {feedback}")
            print("-----------------------------------")

            messages.success(
                request,
                "Thank you! Your feedback has been submitted successfully."
            )

        else:

            messages.error(
                request,
                "Please fill in all the fields."
            )

    return render(request, "pages/contact.html", {
        "active_page": "contact"
    })