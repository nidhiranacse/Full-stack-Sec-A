const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const { createClient } = require("redis");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
cors: {
origin: process.env.FRONTEND_URL || "http://localhost:5173",
credentials: true
}
});

app.set("io", io);

app.use(helmet());
app.use(cors({
origin: process.env.FRONTEND_URL || "http://localhost:5173",
credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/announcements", require("./routes/announcements"));

app.get("/", (req, res) => {
res.json({ message: "CampusConnect API is running" });
});

const redisClient = createClient({
url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
socket: { reconnectStrategy: false }
});

redisClient.on("error", () => {});

app.get("/api/health", (req, res) => {
res.json({
server: "running",
database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
redis: redisClient.isOpen ? "connected" : "using local cache"
});
});

io.use((socket, next) => {
const token = socket.handshake.auth?.token;

if (!token) return next(new Error("Authentication required"));

try {
socket.user = jwt.verify(token, process.env.JWT_SECRET);
next();
} catch {
next(new Error("Invalid token"));
}
});

io.on("connection", (socket) => {
socket.join(socket.user.role);
console.log("Authenticated socket connected:", socket.id);

socket.on("disconnect", () => {
console.log("Socket disconnected:", socket.id);
});
});

const PORT = process.env.PORT || 5000;

async function startServer() {
try {
await mongoose.connect(process.env.MONGO_URI);
console.log("MongoDB connected");


try {
  await redisClient.connect();
  console.log("Redis connected");
} catch {
  console.log("Redis unavailable. Using local cache instead.");
}

server.listen(PORT, () => {
  console.log(`CampusConnect server running on port ${PORT}`);
});


} catch (error) {
console.error("Startup error:", error.message);
process.exit(1);
}
}

startServer();

module.exports = { app, server, io, redisClient };
