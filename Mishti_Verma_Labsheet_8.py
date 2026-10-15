import os
import sys
import logging

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "task8")

from django.conf import settings

settings.configure(
    DEBUG=True,
    SECRET_KEY="12345",
    ROOT_URLCONF=__name__,
    ALLOWED_HOSTS=["*"],
    TEMPLATES=[{
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": False,
        "OPTIONS": {}
    }]
)

import django
django.setup()

from django.http import HttpResponse
from django.template import Template, Context
from django.urls import path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE = """
<!DOCTYPE html>
<html>
<head>
    <title>{{ title }}</title>
    <style>
        body { font-family: Arial; margin: 40px; }
        nav { background: #333; padding: 15px; }
        nav a { color: white; text-decoration: none; padding: 10px 20px; }
        nav a.active { background: #007bff; }
        .message { background: #e7f3ff; border: 1px solid #007bff; padding: 12px; margin: 20px 0; }
        input, textarea { padding: 8px; margin: 5px; width: 80%; }
        button { padding: 8px 20px; }
    </style>
</head>
<body>
<nav>
    <a href="/" class="{% if active == 'home' %}active{% endif %}">Home</a>
    <a href="/contact/" class="{% if active == 'contact' %}active{% endif %}">Contact Us</a>
</nav>

{% if message %}
<div class="message">{{ message }}</div>
{% endif %}

{% block content %}{% endblock %}
</body>
</html>
"""

def home(request):
    html = BASE.replace(
        "{% block content %}{% endblock %}",
        """
        <h1>Home Page</h1>
        <p>Welcome to the Django application.</p>
        """
    )

    return HttpResponse(Template(html).render(Context({
        "title": "Home",
        "active": "home",
        "message": "Welcome to our website."
    })))

def contact(request):
    message = "Please enter your feedback."

    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        email = request.POST.get("email", "").strip()
        feedback = request.POST.get("feedback", "").strip()

        if name and email and feedback:
            logger.info(
                "Contact: Name=%s, Email=%s, Feedback=%s",
                name, email, feedback
            )
            message = "Thank you! Your feedback was submitted."
        else:
            message = "Please fill in all fields."

    html = BASE.replace(
        "{% block content %}{% endblock %}",
        """
        <h1>Contact Us</h1>
        <form method="POST">
            {% csrf_token %}
            <input type="text" name="name" placeholder="Your Name" required><br>
            <input type="email" name="email" placeholder="Your Email" required><br>
            <textarea name="feedback" placeholder="Enter your feedback" rows="5" required></textarea><br>
            <button type="submit">Submit</button>
        </form>
        """
    )

    return HttpResponse(Template(html).render(Context({
        "title": "Contact Us",
        "active": "contact",
        "message": message
    })))

urlpatterns = [
    path("", home, name="home"),
    path("contact/", contact, name="contact"),
]

if __name__ == "__main__":
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
