# Lab Sheet 08 — Django template inheritance, active navigation and contact form
# Install: pip install django
# Run: python Lab8.py
import sys, logging
from django.conf import settings
from django.http import HttpResponse
from django.template import engines
from django.urls import path
from django import setup

logging.basicConfig(level=logging.INFO)
if not settings.configured:
    settings.configure(
        DEBUG=True, SECRET_KEY="lab8-secret", ROOT_URLCONF=__name__,
        ALLOWED_HOSTS=["*"], MIDDLEWARE=[],
        TEMPLATES=[{"BACKEND":"django.template.backends.django.DjangoTemplates",
                    "APP_DIRS":False,"OPTIONS":{"loaders":[("django.template.loaders.locmem.Loader",{})]}}]
    )
setup()

BASE="""<!doctype html><html><head><title>{{ title }}</title>
<style>body{font-family:Arial;margin:0;background:#f5f7fb;color:#172033}nav{background:#2563eb;padding:18px}
nav a{color:white;margin:15px;text-decoration:none}.active{font-weight:bold;text-decoration:underline}
main{max-width:800px;margin:40px auto;background:white;padding:30px;border-radius:14px}
input,textarea{width:100%;padding:11px;margin:8px 0 18px;box-sizing:border-box}
button{background:#2563eb;color:white;padding:11px 18px;border:0;border-radius:7px}
.msg{background:#dcfce7;padding:12px;border-radius:7px;margin-bottom:15px}</style></head>
<body><nav>
<a class="{{ active_home }}" href="/">Home</a><a class="{{ active_about }}" href="/about/">About Us</a>
<a class="{{ active_contact }}" href="/contact/">Contact Us</a></nav><main>
{% if message %}<div class="msg">{{ message }}</div>{% endif %}
{{ content|safe }}</main></body></html>"""

def render(request,title,active,content,message=""):
    ctx={"title":title,"message":message,"content":content,
         "active_home":"active" if active=="home" else "",
         "active_about":"active" if active=="about" else "",
         "active_contact":"active" if active=="contact" else ""}
    return HttpResponse(engines["django"].from_string(BASE).render(ctx))

def home(request):
    return render(request,"Home","home","<h1>Home</h1><p>Welcome to the Django modular UI application.</p>")

def about(request):
    return render(request,"About Us","about","<h1>About Us</h1><p>This page inherits the shared master layout.</p>")

def contact(request):
    message=""
    if request.method=="POST":
        name=request.POST.get("name","").strip()
        email=request.POST.get("email","").strip()
        feedback=request.POST.get("feedback","").strip()
        if name and email and feedback and len(feedback)<=500:
            logging.info("CONTACT FEEDBACK | name=%s | email=%s | feedback=%s",name,email,feedback)
            message="Thank you. Your feedback was verified and logged."
        else:
            message="Please provide valid name, email and feedback (max 500 characters)."
    form="""<h1>Contact Us</h1><form method="post">
    <label>Name</label><input name="name" required>
    <label>Email</label><input name="email" type="email" required>
    <label>Feedback</label><textarea name="feedback" maxlength="500" required></textarea>
    <button>Submit Feedback</button></form>"""
    return render(request,"Contact Us","contact",form,message)

urlpatterns=[path("",home),path("about/",about),path("contact/",contact)]
if __name__=="__main__":
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
