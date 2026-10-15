

from django.contrib import messages
from django.shortcuts import redirect, render


def home(request):

    return render(
        request,
        "home.html",
        {
            "active_page": "home"
        }
    )


def about(request):

    return render(
        request,
        "about.html",
        {
            "active_page": "about"
        }
    )


def contact(request):

    if request.method == "POST":

        name = request.POST.get(
            "name",
            ""
        ).strip()

        email = request.POST.get(
            "email",
            ""
        ).strip()

        feedback = request.POST.get(
            "message",
            ""
        ).strip()


        # Server-side verification

        if name and email and feedback:

            print()
            print("======================================")
            print("       CONTACT FEEDBACK RECEIVED      ")
            print("======================================")

            print(f"Name     : {name}")
            print(f"Email    : {email}")
            print(f"Feedback : {feedback}")

            print("======================================")
            print()


            messages.success(
                request,
                "Thank you! Your feedback "
                "has been submitted successfully."
            )


            return redirect("contact")


        messages.error(
            request,
            "Please fill in all the fields."
        )


    return render(
        request,
        "contact.html",
        {
            "active_page": "contact"
        }
    )