from flask import Flask, jsonify

app = Flask(__name__)


# 200 - Successful request
@app.route("/success")
def success():
    return jsonify({
        "status": 200,
        "message": "Request successful"
    }), 200


# 201 - Resource created
@app.route("/create", methods=["POST"])
def create():
    return jsonify({
        "status": 201,
        "message": "Resource created successfully"
    }), 201


# 400 - Bad Request
@app.route("/bad-request")
def bad_request():
    return jsonify({
        "status": 400,
        "error": "Bad Request",
        "message": "The request is invalid"
    }), 400


# 401 - Unauthorized
@app.route("/unauthorized")
def unauthorized():
    return jsonify({
        "status": 401,
        "error": "Unauthorized",
        "message": "Authentication is required"
    }), 401


# 403 - Forbidden
@app.route("/forbidden")
def forbidden():
    return jsonify({
        "status": 403,
        "error": "Forbidden",
        "message": "You do not have permission to access this resource"
    }), 403


# 404 - Not Found
@app.route("/not-found")
def not_found():
    return jsonify({
        "status": 404,
        "error": "Not Found",
        "message": "The requested resource was not found"
    }), 404


# 500 - Internal Server Error
@app.route("/server-error")
def server_error():
    return jsonify({
        "status": 500,
        "error": "Internal Server Error",
        "message": "Something went wrong on the server"
    }), 500


if __name__ == "__main__":
    app.run(debug=True)