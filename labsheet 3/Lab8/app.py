from flask import Flask

from routes.pages import pages


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "lab8-development-key"
    app.register_blueprint(pages)
    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
