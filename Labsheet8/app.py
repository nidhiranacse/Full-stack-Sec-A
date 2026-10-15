from flask import Flask, render_template, request, flash
app = Flask(__name__)
app.secret_key = "lab_sheet_08_secret"
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
        if name and email and message:
            app.logger.info(
                "Verified Contact Feedback | Name: %s | Email: %s | Message: %s",
                name,
                email,
                message
            )
            flash("Your message has been submitted successfully!", "success")
        else:
            flash("Please fill in all fields.", "error")
    return render_template("contact.html", active_page="contact")
if __name__ == "__main__":
    app.run(debug=True)
