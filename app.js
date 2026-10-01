const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const authMiddleware = require("./middleware/auth");

dotenv.config();

const app = express();

app.use(express.json());

const users = [];
const tasks = [];

let nextTaskId = 1;

// Login rate-limit storage
const loginAttempts = new Map();


// =========================
// REGISTER
// =========================

app.post("/auth/register", async (req, res) => {
    try {
        const { email, password, role = "user" } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                error: "Invalid input"
            });
        }

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({
                error: "Invalid role"
            });
        }

        const existingUser = users.find(
            user => user.email === email
        );

        if (existingUser) {
            return res.status(409).json({
                error: "Email already exists"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        users.push({
            email,
            passwordHash,
            role
        });

        return res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});


// =========================
// LOGIN
// =========================

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        return res.status(401).json({
            error: "Wrong credentials"
        });
    }

    const now = Date.now();
    const windowMs = 60 * 1000;

    let attempts = loginAttempts.get(email) || [];

    // Remove attempts older than one minute
    attempts = attempts.filter(
        timestamp => now - timestamp < windowMs
    );

    // Check rate limit BEFORE checking password
    if (attempts.length >= 5) {
        const oldestAttempt = attempts[0];

        const retryAfterSeconds = Math.ceil(
            (windowMs - (now - oldestAttempt)) / 1000
        );

        loginAttempts.set(email, attempts);

        return res
            .status(429)
            .set("Retry-After", retryAfterSeconds.toString())
            .json({
                error: "Too many failed login attempts"
            });
    }

    const user = users.find(
        user => user.email === email
    );

    if (!user) {
        attempts.push(now);
        loginAttempts.set(email, attempts);

        return res.status(401).json({
            error: "Wrong credentials"
        });
    }

    const passwordCorrect = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!passwordCorrect) {
        attempts.push(now);
        loginAttempts.set(email, attempts);

        return res.status(401).json({
            error: "Wrong credentials"
        });
    }

    // Successful login resets failed attempts
    loginAttempts.delete(email);

    const token = jwt.sign(
        {
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    );

    return res.status(200).json({
        token
    });
});


// =========================
// CREATE TASK
// =========================

app.post("/tasks", authMiddleware, (req, res) => {
    const { title, status } = req.body;

    if (
        typeof title !== "string" ||
        !title.trim() ||
        !["todo", "doing", "done"].includes(status)
    ) {
        return res.status(400).json({
            error: "Invalid input"
        });
    }

    const task = {
        id: nextTaskId++,
        title: title.trim(),
        status,
        owner: req.user.email
    };

    tasks.push(task);

    return res.status(201).json(task);
});


// =========================
// GET TASKS
// =========================

app.get("/tasks", authMiddleware, (req, res) => {
    const {
        status,
        page = 1,
        limit = 10
    } = req.query;

    let userTasks;

    if (req.user.role === "admin") {
        userTasks = [...tasks];
    } else {
        userTasks = tasks.filter(
            task => task.owner === req.user.email
        );
    }

    if (status) {
        if (!["todo", "doing", "done"].includes(status)) {
            return res.status(400).json({
                error: "Invalid status"
            });
        }

        userTasks = userTasks.filter(
            task => task.status === status
        );
    }

    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const limitNumber = Math.max(parseInt(limit) || 10, 1);

    const total = userTasks.length;

    const start = (pageNumber - 1) * limitNumber;
    const end = start + limitNumber;

    const data = userTasks.slice(start, end);

    return res.status(200).json({
        data,
        page: pageNumber,
        total
    });
});


// =========================
// UPDATE TASK
// =========================

app.patch("/tasks/:id", authMiddleware, (req, res) => {
    const id = Number(req.params.id);

    const task = tasks.find(
        task => task.id === id
    );

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    const isOwner =
        task.owner === req.user.email;

    const isAdmin =
        req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            error: "Forbidden"
        });
    }

    const { title, status } = req.body;

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
        !["todo", "doing", "done"].includes(status)
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


// =========================
// DELETE TASK
// =========================

app.delete("/tasks/:id", authMiddleware, (req, res) => {
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

    const isOwner =
        task.owner === req.user.email;

    const isAdmin =
        req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            error: "Forbidden"
        });
    }

    tasks.splice(index, 1);

    return res.status(204).send();
});


module.exports = app;