const http = require("http");
const { Server } = require("socket.io");
const setupSocket = require("./sockets/socket");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const { connectRedis } = require("./config/redis");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

setupSocket(io);

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

// Helmet adds security-related HTTP headers
app.use(helmet());

// Allow requests from the frontend
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

// Parse JSON request bodies
app.use(express.json());

// Read cookies
app.use(cookieParser());

// ============================================================
// LOGIN RATE LIMITER
// Maximum 5 login attempts in 15 minutes per IP
// ============================================================

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many login attempts. Please try again later."
    }
});

// ============================================================
// ROUTES
// ============================================================

app.use("/api/auth/login", loginLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// Basic API test
app.get("/", (req, res) => {
    res.json({
        message: "CampusConnect API is running"
    });
});

// ============================================================
// DATABASE + REDIS + SERVER
// ============================================================

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("MongoDB connected successfully");

        // Redis is optional during local development
        await connectRedis();

        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });