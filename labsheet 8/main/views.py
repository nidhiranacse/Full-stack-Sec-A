import logging
from django.shortcuts import render, redirect
from django.contrib import messages

logger = logging.getLogger(__name__)

def home(request):
    return render(request, 'main/home.html')

def about(request):
    return render(request, 'main/about.html')

def contact(request):
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        email = request.POST.get('email', '').strip()
        message = request.POST.get('message', '').strip()

        if name and email and message:
            if len(name) > 100 or len(email) > 254 or len(message) > 2000:
                messages.error(request, 'Input exceeds the allowed length.')
            else:
                logger.info('Contact submission received: name=%s, email=%s', name, email)
                messages.success(request, 'Your message has been submitted successfully.')
                return redirect('contact')
        else:
            messages.error(request, 'Please fill in all fields.')

    return render(request, 'main/contact.html')