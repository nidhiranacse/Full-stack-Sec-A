require("dotenv").config();

const express = require("express");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Secure Task Manager API is running"
    });
});

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

// Handle malformed JSON without crashing the server.
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            message: "Invalid JSON body"
        });
    }

    return res.status(500).json({
        message: "Internal server error"
    });
});

module.exports = app;

// Tests can import the app without opening a network port.
if (require.main === module) {
    const PORT = process.env.PORT || 3000;

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is missing from the environment");
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Secure Task Manager API running on port ${PORT}`);
    });
}