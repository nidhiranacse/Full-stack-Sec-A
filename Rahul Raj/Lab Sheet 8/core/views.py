import logging
from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import ContactForm

logger = logging.getLogger('system_feedback')

def home_view(request):
    """
    Task 8.1: Programmatic active navigation marker ('home').
    Task 8.2: Demonstrates persistent feedback hook across child views.
    """
    # Allow tester to simulate alerts
    sim_alert = request.GET.get('simulate_alert')
    if sim_alert == 'info':
        messages.info(request, "System Notification: Welcome to the modular Django UI blueprint.")
    elif sim_alert == 'warning':
        messages.warning(request, "System Warning: Cached assets will refresh on next build cycle.")

    context = {
        'student_name': 'Rahul Raj',
        'student_id': 'cu24250116',
        'course': 'Full Stack Web Development (Sec-A)',
        'active_page': 'home',
        'page_title': 'Home Layout Blueprint',
    }
    return render(request, 'home.html', context)

def about_view(request):
    """
    Task 8.1: Programmatic active navigation marker ('about').
    """
    context = {
        'student_name': 'Rahul Raj',
        'student_id': 'cu24250116',
        'course': 'Full Stack Web Development (Sec-A)',
        'active_page': 'about',
        'page_title': 'About Modular Architecture',
    }
    return render(request, 'about.html', context)

def contact_view(request):
    """
    Task 8.1: Programmatic active navigation marker ('contact').
    Task 8.2: Persistent user message feedback notification hooks.
    Task 8.3: Professional Contact Us form view forwarding verified feedback parameters into server logs.
    """
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data['name']
            email = form.cleaned_data['email']
            subject = form.cleaned_data['subject']
            message = form.cleaned_data['message']

            # Task 8.3: Forward verified feedback text parameters directly into the server logs
            log_payload = (
                f"[VERIFIED FEEDBACK LOGGED] "
                f"Student=Rahul Raj (cu24250116) | "
                f"Sender='{name}' <{email}> | "
                f"Subject='{subject}' | "
                f"Body='{message}'"
            )
            logger.info(log_payload)

            # Task 8.2: Integrate a persistent user message feedback notification
            messages.success(
                request,
                f"Verification Successful: Your message from '{name}' has been securely logged to the server logs."
            )
            return redirect('contact')
        else:
            messages.error(request, "Validation Error: Please review the form fields and re-submit.")
    else:
        form = ContactForm()

    context = {
        'student_name': 'Rahul Raj',
        'student_id': 'cu24250116',
        'course': 'Full Stack Web Development (Sec-A)',
        'active_page': 'contact',
        'page_title': 'Contact Us & Feedback Logger',
        'form': form,
    }
    return render(request, 'contact.html', context)
