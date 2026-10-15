from django.contrib import messages
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.shortcuts import render, redirect
import logging

logger = logging.getLogger(__name__)


def home(request):
    return render(request, "home.html", {
        "active_page": "home"
    })


def about(request):
    return render(request, "about.html", {
        "active_page": "about"
    })


def contact(request):
    if request.method == "POST":

        name = request.POST.get("name", "").strip()
        email = request.POST.get("email", "").strip()
        feedback = request.POST.get("feedback", "").strip()

        if not name or not email or not feedback:
            messages.error(request, "Please fill all fields.")
            return redirect("contact")

        try:
            validate_email(email)
        except ValidationError:
            messages.error(request, "Please enter a valid email.")
            return redirect("contact")

        if len(feedback) > 1000:
            messages.error(request, "Feedback is too long.")
            return redirect("contact")

        logger.info(
            "CONTACT FEEDBACK | Name=%s | Email=%s | Feedback=%s",
            name,
            email,
            feedback
        )

        messages.success(
            request,
            "Thank you! Your feedback has been submitted."
        )

        return redirect("contact")

    return render(request, "contact.html", {
        "active_page": "contact"
    })