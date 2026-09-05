from django.shortcuts import render

def home(request):
    return render(request, "mainapp/home.html", {
        "active_page": "home"
    })

def about(request):
    return render(request, "mainapp/about.html", {
        "active_page": "about"
    })

def contact(request):

    message = ""

    if request.method == "POST":

        name = request.POST.get("name", "")
        feedback = request.POST.get("feedback", "")

        print("CONTACT FORM SUBMISSION")
        print("Name:", name)
        print("Feedback:", feedback)

        message = "Thank you! Your feedback has been received."

    return render(request, "mainapp/contact.html", {
        "active_page": "contact",
        "message": message
    })