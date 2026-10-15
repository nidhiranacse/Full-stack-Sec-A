from django.shortcuts import render

def home(request):
    return render(
        request,
        'website/home.html',
        {
            'active_page': 'home',
            'message': 'Welcome to the Home Page'
        }
    )

def about(request):
    return render(
        request,
        'website/about.html',
        {
            'active_page': 'about',
            'message': 'Learn more about our organization'
        }
    )

def contact(request):

    context = {
        'active_page': 'contact',
        'submitted': False,
    }

    if request.method == "POST":

        name = request.POST.get('name', '').strip()
        feedback = request.POST.get('feedback', '').strip()

        if name and feedback:
            print("\n===== FEEDBACK RECEIVED =====")
            print("Name:", name)
            print("Feedback:", feedback)
            print("=============================\n")

            context['message'] = "Thank you! Your feedback has been submitted successfully."
            context['submitted'] = True
        else:
            context['message'] = "Please complete your name and feedback."
            context['error'] = True

    return render(
        request,
        'website/contact.html',
        context
    )