from django.shortcuts import render
import logging

logger = logging.getLogger(__name__)


def home(request):
    return render(request, "pages/home.html", {
        "active_page": "home",
        "message": "Welcome to our Django Lab 8 website! 🎉"
    })


def about(request):
    return render(request, "pages/about.html", {
        "active_page": "about",
        "message": "Explore the architecture and features of this project. ℹ️"
    })


def contact(request):
    message = "Send us your feedback using the form below. 📩"

    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        email = request.POST.get("email", "").strip()
        feedback = request.POST.get("feedback", "").strip()

        if name and email and feedback:

            logger.info(
                "VERIFIED CONTACT FEEDBACK | Name: %s | Email: %s | Message: %s",
                name, email, feedback
            )

            print(
                f"VERIFIED CONTACT FEEDBACK | "
                f"Name: {name} | Email: {email} | Message: {feedback}"
            )

            message = "Feedback submitted successfully! Thank you. ✅"

        else:
            message = "Please fill in all fields correctly. ⚠️"

    return render(request, "pages/contact.html", {
        "active_page": "contact",
        "message": message
    })