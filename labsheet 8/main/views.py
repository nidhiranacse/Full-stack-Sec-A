from django.shortcuts import render


def home(request):
    return render(request, 'home.html')


def about(request):
    return render(request, 'about.html')


def contact(request):

    if request.method == 'POST':

        name = request.POST.get('name')
        email = request.POST.get('email')
        subject = request.POST.get('subject')
        message = request.POST.get('message')

        print("\n")
        print("==========================================")
        print("       CONTACT FORM SUBMISSION")
        print("==========================================")
        print(f"Name    : {name}")
        print(f"Email   : {email}")
        print(f"Subject : {subject}")
        print(f"Message : {message}")
        print("==========================================")
        print("\n")

        return render(
            request,
            'contact.html',
            {
                'success':
                'Your message has been submitted successfully!'
            }
        )

    return render(request, 'contact.html')