const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const { redisClient, connectRedis } = require("./redis");

const {
    authenticate,
    authorize
} = require("./middleware/authMiddleware");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
    cors: {
        origin: true,
        credentials: true
    }
});

// Security
app.use(helmet({
    contentSecurityPolicy: false
}));

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((error) => {
        console.log("MongoDB connection error:", error.message);
    });

// Redis
connectRedis()
    .then(() => console.log("Redis connected successfully"))
    .catch((error) => {
        console.log("Redis connection error:", error.message);
    });

// Auth Routes
app.use("/api/auth", authRoutes);

// Admin Protected Route
app.get(
    "/api/admin/test",
    authenticate,
    authorize("ADMIN"),
    (req, res) => {
        res.json({
            message: "Admin access granted",
            user: req.user
        });
    }
);

// Socket.io
io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.emit("notification", {
        message: "Welcome! You are connected to CampusConnect."
    });

    socket.on("sendNotification", (data) => {

        console.log("Notification received:", data);

        io.emit("notification", {
            message: data.message
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Notification API
app.post("/api/notification", (req, res) => {

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({
            message: "Notification message is required"
        });
    }

    io.emit("notification", {
        message
    });

    res.json({
        message: "Notification sent successfully"
    });
});

// Home Route
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../frontend/index.html")
    );
});

// Start Server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
