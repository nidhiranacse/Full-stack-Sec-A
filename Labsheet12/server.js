const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

// In-memory storage
const users = [];
const tasks = [];

let nextUserId = 1;
let nextTaskId = 1;

// Failed login attempts:
// email -> { attempts: [timestamps] }
const failedLogins = new Map();


// ===============================
// Authentication Middleware
// ===============================

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;
        next();
    } catch (error) {
        // Handles malformed and expired tokens safely
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}


// ===============================
// Login Rate Limiter
// ===============================

function checkRateLimit(email) {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    let record = failedLogins.get(email);

    if (!record) {
        record = { attempts: [] };
    }

    // Remove attempts older than one minute
    record.attempts = record.attempts.filter(
        timestamp => timestamp > oneMinuteAgo
    );

    failedLogins.set(email, record);

    return record;
}

function recordFailedLogin(email) {
    const record = checkRateLimit(email);

    record.attempts.push(Date.now());

    failedLogins.set(email, record);
}


// ===============================
// Register
// ===============================

app.post("/auth/register", async (req, res) => {
    try {
        const { email, password, role = "user" } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            password.length === 0 ||
            !["user", "admin"].includes(role)
        ) {
            return res.status(400).json({ error: "Invalid input" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            return res.status(400).json({ error: "Invalid input" });
        }

        const existingUser = users.find(
            user => user.email === normalizedEmail
        );

        if (existingUser) {
            return res.status(409).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
            id: nextUserId++,
            email: normalizedEmail,
            password: hashedPassword,
            role
        };

        users.push(user);

        return res.status(201).json({
            id: user.id,
            email: user.email,
            role: user.role
        });

    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
});


// ===============================
// Login
// ===============================

app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(401).json({ error: "Wrong credentials" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check rate limit BEFORE password verification
        const record = checkRateLimit(normalizedEmail);

        if (record.attempts.length >= 5) {
            const oldestAttempt = Math.min(...record.attempts);
            const retryAfterSeconds = Math.max(
                1,
                Math.ceil((oldestAttempt + 60000 - Date.now()) / 1000)
            );

            res.set("Retry-After", String(retryAfterSeconds));

            return res.status(429).json({
                error: "Too many failed login attempts"
            });
        }

        const user = users.find(
            user => user.email === normalizedEmail
        );

        if (!user) {
            recordFailedLogin(normalizedEmail);

            return res.status(401).json({
                error: "Wrong credentials"
            });
        }

        const passwordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordCorrect) {
            recordFailedLogin(normalizedEmail);

            return res.status(401).json({
                error: "Wrong credentials"
            });
        }

        // Successful login
        // Clear failed attempts
        failedLogins.delete(normalizedEmail);

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        return res.status(200).json({ token });

    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
});


// ===============================
// Create Task
// ===============================

app.post("/tasks", authenticate, (req, res) => {
    const { title, status } = req.body;

    const validStatuses = ["todo", "doing", "done"];

    if (
        typeof title !== "string" ||
        !title.trim() ||
        !validStatuses.includes(status)
    ) {
        return res.status(400).json({
            error: "Invalid input"
        });
    }

    const task = {
        id: nextTaskId++,
        title: title.trim(),
        status,
        ownerId: req.user.id
    };

    tasks.push(task);

    return res.status(201).json(task);
});


// ===============================
// Get Tasks
// ===============================

app.get("/tasks", authenticate, (req, res) => {
    const { status } = req.query;

    let page = parseInt(req.query.page || "1", 10);
    let limit = parseInt(req.query.limit || "10", 10);

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    let userTasks;

    // User sees only own tasks
    // Admin can see all tasks
    if (req.user.role === "admin") {
        userTasks = [...tasks];
    } else {
        userTasks = tasks.filter(
            task => task.ownerId === req.user.id
        );
    }

    if (status) {
        const validStatuses = ["todo", "doing", "done"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: "Invalid status"
            });
        }

        userTasks = userTasks.filter(
            task => task.status === status
        );
    }

    const total = userTasks.length;

    const start = (page - 1) * limit;
    const data = userTasks.slice(start, start + limit);

    return res.status(200).json({
        data,
        page,
        total
    });
});


// ===============================
// Update Task
// ===============================

app.patch("/tasks/:id", authenticate, (req, res) => {
    const id = Number(req.params.id);

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    const isOwner = task.ownerId === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            error: "Not allowed"
        });
    }

    const { title, status } = req.body;

    const validStatuses = ["todo", "doing", "done"];

    if (
        title === undefined &&
        status === undefined
    ) {
        return res.status(400).json({
            error: "Nothing to update"
        });
    }

    if (
        title !== undefined &&
        (typeof title !== "string" || !title.trim())
    ) {
        return res.status(400).json({
            error: "Invalid title"
        });
    }

    if (
        status !== undefined &&
        !validStatuses.includes(status)
    ) {
        return res.status(400).json({
            error: "Invalid status"
        });
    }

    if (title !== undefined) {
        task.title = title.trim();
    }

    if (status !== undefined) {
        task.status = status;
    }

    return res.status(200).json(task);
});


// ===============================
// Delete Task
// ===============================

app.delete("/tasks/:id", authenticate, (req, res) => {
    const id = Number(req.params.id);

    const index = tasks.findIndex(
        task => task.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    const task = tasks[index];

    const isOwner = task.ownerId === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            error: "Not allowed"
        });
    }

    tasks.splice(index, 1);

    return res.status(204).send();
});


// ===============================
// Start Server
// ===============================

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}


// Export Express app for tests
module.exports = app;


