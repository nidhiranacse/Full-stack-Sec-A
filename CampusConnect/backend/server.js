require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Health Check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "CampusConnect API is running smoothly",
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 Route Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.originalUrl} not found on this server`
    });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Export app for unit testing, and start server if not imported
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
    });
}

module.exports = app;
