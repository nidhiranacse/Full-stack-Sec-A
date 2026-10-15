require("dotenv").config();

const express = require("express");
const http = require("http");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");

const authRoutes = require("./routes/authRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

connectDB();
connectRedis();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.get("/", (req, res) => {
    res.json({
        message: "CampusConnect API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/events", eventRoutes);


// Socket authentication
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(
                new Error("Authentication token required")
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

        socket.user = decoded;

        next();

    } catch (error) {
        next(new Error("Invalid or expired token"));
    }
});


// Socket connection
io.on("connection", (socket) => {

    console.log(
        `User connected: ${socket.user.id}`
    );

    if (socket.user.role === "STUDENT") {

        socket.join("students");

        console.log(
            "Student joined students room"
        );
    }

    socket.on("disconnect", () => {

        console.log(
            `User disconnected: ${socket.user.id}`
        );

    });
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});