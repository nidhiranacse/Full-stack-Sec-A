import logging
import re

from flask import Blueprint, flash, redirect, render_template, request, url_for


pages = Blueprint("pages", __name__)
logger = logging.getLogger(__name__)


@pages.get("/")
def home():
    return render_template("home.html", active_page="home")


@pages.get("/about")
def about():
    return render_template("about.html", active_page="about")


@pages.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip()
        message = request.form.get("message", "").strip()

        email_is_valid = re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email)
        if not name or not email_is_valid or not message:
            flash("Please complete every field before sending your message.", "error")
            return render_template(
                "contact.html",
                active_page="contact",
                form_data={"name": name, "email": email, "message": message},
            ), 400

        logger.info(
            "Verified contact feedback received | name=%s | email=%s | message=%s",
            name,
            email,
            message,
        )
        flash("Your message has been verified and sent to our team.", "success")
        return redirect(url_for("pages.contact"))

    return render_template("contact.html", active_page="contact", form_data={})
