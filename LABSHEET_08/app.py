import logging
from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = "lab08-secret-key"

# Server log configuration
logger = logging.getLogger("feedback_logger")
logger.setLevel(logging.INFO)

handler = logging.FileHandler("feedback.log")
handler.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(message)s"))
logger.addHandler(handler)

console = logging.StreamHandler()
console.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(message)s"))
logger.addHandler(console)


@app.route("/")
def home():
    return render_template("home.html", active_page="home")


@app.route("/about")
def about():
    return render_template("about.html", active_page="about")


@app.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip()
        message = request.form.get("message", "").strip()

        if not name or not email or not message:
            flash("Please fill in every field before submitting.", "error")
            return render_template(
                "contact.html",
                active_page="contact"
            ), 400

        if "@" not in email or "." not in email:
            flash("Please enter a valid email address.", "error")
            return render_template(
                "contact.html",
                active_page="contact"
            ), 400

        logger.info(
            "New feedback received | name=%s | email=%s | message=%s",
            name,
            email,
            message
        )

        flash(f"Thanks {name}! Your feedback has been received.", "success")
        return redirect(url_for("contact"))

    return render_template("contact.html", active_page="contact")


if __name__ == "__main__":
    app.run(debug=True)
