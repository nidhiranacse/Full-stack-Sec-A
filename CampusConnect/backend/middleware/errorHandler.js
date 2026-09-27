// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || "Internal Server Error";

    // Handle Mongoose duplicate key error (code 11000)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `An account with that ${field} already exists.`;
    }

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
    }

    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Resource not found with id of ${err.value}`;
    }

    // Handle Multer upload errors
    if (err.code === "LIMIT_FILE_SIZE") {
        statusCode = 400;
        message = "File too large. Maximum allowed size is 25MB.";
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack
    });
};

module.exports = errorHandler;
