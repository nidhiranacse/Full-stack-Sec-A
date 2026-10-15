import os
import sys

from django.conf import settings
from django.core.management import execute_from_command_line
from django.http import HttpResponse
from django.shortcuts import redirect
from django.urls import path
from django.contrib import messages


# ============================================================
# LAB SHEET 08
# TEMPLATE INHERITANCE BLUEPRINTS & MODULAR UI ENGINEERING
# ============================================================

# ============================================================
# TEMPLATE STORAGE
# ============================================================

TEMPLATES_DICT = {}


# ============================================================
# MASTER TEMPLATE
# ============================================================

TEMPLATES_DICT["base.html"] = """
<!DOCTYPE html>
<html>
<head>

    <title>{% block title %}Lab Sheet 08{% endblock %}</title>

    <style>

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #eef2ff, #f8fafc);
            color: #1e293b;
            min-height: 100vh;
        }

        nav {
            background: #172554;
            padding: 18px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            color: white;
            font-size: 22px;
            font-weight: bold;
        }

        nav ul {
            list-style: none;
            display: flex;
            gap: 12px;
        }

        nav a {
            text-decoration: none;
            color: white;
            padding: 10px 18px;
            border-radius: 8px;
            transition: 0.3s;
        }

        nav a:hover {
            background: #3b82f6;
        }

        /* =====================================================
           TASK 8.1 - ACTIVE NAVIGATION HIGHLIGHT
           ===================================================== */

        nav a.active {
            background: #60a5fa;
            font-weight: bold;
            box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
        }

        .container {
            width: 90%;
            max-width: 1000px;
            margin: 45px auto;
        }

        .card {
            background: white;
            padding: 35px;
            border-radius: 18px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }

        h1 {
            color: #172554;
            margin-bottom: 15px;
        }

        h2 {
            color: #1e40af;
            margin-bottom: 12px;
        }

        p {
            line-height: 1.7;
            margin-bottom: 15px;
        }

        /* =====================================================
           TASK 8.2 - PERSISTENT MESSAGE NOTIFICATION
           ===================================================== */

        .messages {
            margin-bottom: 20px;
        }

        .message {
            background: #dcfce7;
            color: #166534;
            padding: 14px 18px;
            border-left: 5px solid #22c55e;
            border-radius: 8px;
            margin-bottom: 10px;
            font-weight: bold;
        }

        .hero {
            text-align: center;
            padding: 50px 35px;
        }

        .hero h1 {
            font-size: 38px;
        }

        .buttons {
            margin-top: 25px;
        }

        .btn {
            display: inline-block;
            background: #2563eb;
            color: white;
            text-decoration: none;
            padding: 12px 22px;
            border-radius: 8px;
            margin: 5px;
        }

        .btn:hover {
            background: #1d4ed8;
        }

        form {
            margin-top: 20px;
        }

        label {
            display: block;
            margin-top: 15px;
            margin-bottom: 6px;
            font-weight: bold;
        }

        input,
        textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 15px;
        }

        textarea {
            min-height: 130px;
            resize: vertical;
        }

        button {
            margin-top: 20px;
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            background: #2563eb;
            color: white;
            font-size: 16px;
            cursor: pointer;
        }

        button:hover {
            background: #1d4ed8;
        }

        footer {
            text-align: center;
            padding: 25px;
            margin-top: 50px;
            color: #64748b;
        }

    </style>

</head>

<body>

    <!-- =====================================================
         MASTER TEMPLATE NAVIGATION
         ===================================================== -->

    <nav>

        <div class="logo">
            Lab Sheet 08
        </div>

        <ul>

            <!-- TASK 8.1 -->

            <li>
                <a href="{% url 'home' %}"
                   class="{% if active_page == 'home' %}active{% endif %}">
                    Home
                </a>
            </li>

            <li>
                <a href="{% url 'about' %}"
                   class="{% if active_page == 'about' %}active{% endif %}">
                    About Us
                </a>
            </li>

            <li>
                <a href="{% url 'contact' %}"
                   class="{% if active_page == 'contact' %}active{% endif %}">
                    Contact Us
                </a>
            </li>

        </ul>

    </nav>


    <div class="container">

        <!-- =================================================
             TASK 8.2
             PERSISTENT INHERITED MESSAGE
             ================================================= -->

        {% if messages %}

            <div class="messages">

                {% for message in messages %}

                    <div class="message">
                        {{ message }}
                    </div>

                {% endfor %}

            </div>

        {% endif %}


        <!-- CHILD PAGE CONTENT -->

        {% block content %}
        {% endblock %}

    </div>


    <footer>
        <p>Lab Sheet 08 | Django Template Inheritance</p>
    </footer>

</body>
</html>
"""


# ============================================================
# HOME PAGE
# ============================================================

TEMPLATES_DICT["home.html"] = """

{% extends "base.html" %}

{% block title %}
Home - Lab Sheet 08
{% endblock %}


{% block content %}

<div class="card hero">

    <h1>Welcome to Lab Sheet 08</h1>

    <p>
        This page demonstrates Django Template Inheritance
        and Modular UI Engineering.
    </p>

    <p>
        The common navigation and notification system are
        inherited from the master template.
    </p>

    <div class="buttons">

        <a class="btn" href="{% url 'about' %}">
            About Us
        </a>

        <a class="btn" href="{% url 'contact' %}">
            Contact Us
        </a>

    </div>

</div>

{% endblock %}

"""


# ============================================================
# ABOUT PAGE
# ============================================================

TEMPLATES_DICT["about.html"] = """

{% extends "base.html" %}

{% block title %}
About Us - Lab Sheet 08
{% endblock %}


{% block content %}

<div class="card">

    <h1>About Us</h1>

    <p>
        This is the About Us page of the Django application.
    </p>

    <p>
        It inherits the master template containing the common
        navigation menu, styling and message notification area.
    </p>

    <h2>Template Inheritance</h2>

    <p>
        The child page extends the base template and overrides
        the content block.
    </p>

</div>

{% endblock %}

"""


# ============================================================
# CONTACT PAGE
# ============================================================

TEMPLATES_DICT["contact.html"] = """

{% extends "base.html" %}

{% block title %}
Contact Us - Lab Sheet 08
{% endblock %}


{% block content %}

<div class="card">

    <h1>Contact Us</h1>

    <p>
        Send your feedback using the form below.
    </p>

    <!-- =====================================================
         TASK 8.3 - CONTACT FORM
         ===================================================== -->

    <form method="POST" action="{% url 'contact' %}">

        {% csrf_token %}

        <label for="name">
            Name
        </label>

        <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your name"
            required
        >

        <label for="email">
            Email
        </label>

        <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            required
        >

        <label for="feedback">
            Feedback
        </label>

        <textarea
            id="feedback"
            name="feedback"
            placeholder="Enter your feedback"
            required
        ></textarea>

        <button type="submit">
            Submit Feedback
        </button>

    </form>

</div>

{% endblock %}

"""


# ============================================================
# DJANGO SETTINGS
# ============================================================

if not settings.configured:

    settings.configure(

        DEBUG=True,

        SECRET_KEY="anshika-labsheet8-secret-key",

        ROOT_URLCONF="__main__",

        ALLOWED_HOSTS=[
            "127.0.0.1",
            "localhost"
        ],

        MIDDLEWARE=[

            "django.middleware.security.SecurityMiddleware",

            "django.contrib.sessions.middleware.SessionMiddleware",

            "django.contrib.messages.middleware.MessageMiddleware",

        ],

        INSTALLED_APPS=[

            "django.contrib.sessions",

            "django.contrib.messages",

        ],

        # Cookie based sessions
        # No database required

        SESSION_ENGINE="django.contrib.sessions.backends.signed_cookies",

        TEMPLATES=[

            {

                "BACKEND":
                    "django.template.backends.django.DjangoTemplates",

                "DIRS": [],

                "APP_DIRS": False,

                "OPTIONS": {

                    "loaders": [

                        (
                            "django.template.loaders.locmem.Loader",
                            TEMPLATES_DICT
                        )

                    ],

                    "context_processors": [

                        "django.template.context_processors.request",

                        "django.contrib.messages.context_processors.messages",

                    ],

                },

            }

        ],

    )


# ============================================================
# RENDER HELPER
# ============================================================

def render_page(request, template_name, context):

    from django.template.loader import render_to_string

    html = render_to_string(
        template_name,
        context,
        request=request
    )

    return HttpResponse(html)


# ============================================================
# HOME VIEW
# ============================================================

def home(request):

    return render_page(

        request,

        "home.html",

        {
            "active_page": "home"
        }

    )


# ============================================================
# ABOUT VIEW
# ============================================================

def about(request):

    return render_page(

        request,

        "about.html",

        {
            "active_page": "about"
        }

    )


# ============================================================
# CONTACT VIEW
# ============================================================

def contact(request):

    if request.method == "POST":

        name = request.POST.get("name", "").strip()

        email = request.POST.get("email", "").strip()

        feedback = request.POST.get("feedback", "").strip()


        # ====================================================
        # TASK 8.3 - VERIFIED FEEDBACK
        # ====================================================

        if name and email and feedback:

            # Forward verified feedback to server logs

            print("\n" + "=" * 60)

            print("LAB SHEET 08 - CONTACT FEEDBACK")

            print("=" * 60)

            print("Name     :", name)

            print("Email    :", email)

            print("Feedback :", feedback)

            print("=" * 60 + "\n")


            # =================================================
            # TASK 8.2 - PERSISTENT MESSAGE
            # =================================================

            messages.success(

                request,

                "Thank you! Your feedback has been submitted successfully."

            )

            return redirect("contact")


        else:

            messages.error(

                request,

                "Please fill in all the fields."

            )


    return render_page(

        request,

        "contact.html",

        {
            "active_page": "contact"
        }

    )


# ============================================================
# URLS
# ============================================================

urlpatterns = [

    path(
        "",
        home,
        name="home"
    ),

    path(
        "about/",
        about,
        name="about"
    ),

    path(
        "contact/",
        contact,
        name="contact"
    ),

]


# ============================================================
# RUN DJANGO SERVER
# ============================================================

if __name__ == "__main__":

    os.environ.setdefault(
        "DJANGO_SETTINGS_MODULE",
        "__main__"
    )

    execute_from_command_line(sys.argv)
