import logging

from django.contrib import messages
from django.shortcuts import redirect, render

from .forms import ContactForm

feedback_logger = logging.getLogger("labapp.feedback")

# ------------------------- LAB 8 pages -------------------------
def home(request):
    return render(request, "labapp/home.html")


def about(request):
    return render(request, "labapp/about.html")


def contact(request):
    """Task 8.3: validated feedback is written to the server log."""
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            d = form.cleaned_data
            feedback_logger.info(
                "FEEDBACK | name=%s | email=%s | subject=%s | message=%s",
                d["name"], d["email"], d["subject"], d["message"],
            )
            # Task 8.2: flash message shown by base.html on the next page
            messages.success(request, "Thank you! Your feedback has been received.")
            return redirect("contact")
        messages.error(request, "Please correct the errors below.")
    else:
        form = ContactForm()
    return render(request, "labapp/contact.html", {"form": form})
