import logging
from django.shortcuts import render, redirect
from django.contrib import messages

# Named logger matches the LOGGING config in settings.py (Task 8.3)
contact_logger = logging.getLogger('myapp.contact')


# ─── Home ───────────────────────────────────────────────────────────────────
# Task 8.1: passes active_page='home' so base template highlights the nav item
def home(request):
    return render(request, 'myapp/home.html', {'active_page': 'home'})


# ─── About Us ────────────────────────────────────────────────────────────────
def about(request):
    return render(request, 'myapp/about.html', {'active_page': 'about'})


# ─── Contact Us ─────────────────────────────────────────────────────────────
# Task 8.3: Handles GET (show form) and POST (validate + log + redirect)
def contact(request):
    if request.method == 'POST':
        name    = request.POST.get('name', '').strip()
        email   = request.POST.get('email', '').strip()
        subject = request.POST.get('subject', '').strip()
        message = request.POST.get('message', '').strip()

        # Basic validation
        if not all([name, email, subject, message]):
            messages.error(request, 'All fields are required. Please fill in every field.')
            return render(request, 'myapp/contact.html', {
                'active_page': 'contact',
                'form_data': {'name': name, 'email': email,
                              'subject': subject, 'message': message},
            })

        # Task 8.3 – forward verified params into server logs
        contact_logger.info(
            "CONTACT FORM SUBMISSION | Name: %s | Email: %s | Subject: %s | Message: %s",
            name, email, subject, message
        )

        # Task 8.2 – success feedback notification via Django messages framework
        messages.success(
            request,
            f'Thank you, {name}! Your message has been received and logged.'
        )
        return redirect('contact')

    return render(request, 'myapp/contact.html', {'active_page': 'contact'})
