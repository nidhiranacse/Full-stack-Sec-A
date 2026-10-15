const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.json());

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
}

// ================= IN-MEMORY STORAGE =================

const users = new Map();
const tasks = new Map();

let userIdCounter = 1;
let taskIdCounter = 1;

const loginAttempts = new Map();

const VALID_STATUS = ["todo", "doing", "done"];

// ================= HOME ROUTE =================

app.get("/", (req, res) => {
    res.send("Secure Task Manager API is running!");
});

// ================= RATE LIMIT =================

function checkRateLimit(email) {
    const now = Date.now();
    const record = loginAttempts.get(email);

    if (!record) {
        return {
            limited: false
        };
    }

    // Keep only attempts from the last 1 minute
    record.timestamps = record.timestamps.filter(
        time => now - time < 60000
    );

    if (record.timestamps.length >= 5) {
        const oldest = record.timestamps[0];

        const retryAfter = Math.ceil(
            (60000 - (now - oldest)) / 1000
        );

        return {
            limited: true,
            retryAfter
        };
    }

    return {
        limited: false
    };
}

function recordFailedLogin(email) {
    const now = Date.now();

    let record = loginAttempts.get(email);

    if (!record) {
        record = {
            timestamps: []
        };

        loginAttempts.set(email, record);
    }

    record.timestamps = record.timestamps.filter(
        time => now - time < 60000
    );

    record.timestamps.push(now);
}

// ================= AUTH MIDDLEWARE =================

function authenticate(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    const token = header.substring(7);

    if (!token) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );

        const user = users.get(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

// ================= REGISTER =================

app.post("/auth/register", async (req, res) => {
    try {
        const {
            email,
            password,
            role = "user"
        } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Invalid input"
            });
        }

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        // Check duplicate email
        for (const user of users.values()) {
            if (user.email === normalizedEmail) {
                return res.status(409).json({
                    message: "Email already exists"
                });
            }
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = {
            id: String(userIdCounter++),
            email: normalizedEmail,
            password: hashedPassword,
            role
        };

        users.set(user.id, user);

        return res.status(201).json({
            id: user.id,
            email: user.email,
            role: user.role
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
});

// ================= LOGIN =================

app.post("/auth/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(401).json({
                message: "Wrong credentials"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        // Rate limit is checked BEFORE password verification
        const limit =
            checkRateLimit(normalizedEmail);

        if (limit.limited) {
            res.set(
                "Retry-After",
                String(limit.retryAfter)
            );

            return res.status(429).json({
                message:
                    "Too many failed login attempts"
            });
        }

        let user = null;

        for (const u of users.values()) {
            if (u.email === normalizedEmail) {
                user = u;
                break;
            }
        }

        if (!user) {
            recordFailedLogin(normalizedEmail);

            return res.status(401).json({
                message: "Wrong credentials"
            });
        }

        const validPassword =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!validPassword) {
            recordFailedLogin(normalizedEmail);

            return res.status(401).json({
                message: "Wrong credentials"
            });
        }

        // Successful login resets failed attempts
        loginAttempts.delete(normalizedEmail);

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        return res.status(200).json({
            token
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
});

// ================= CREATE TASK =================

app.post("/tasks", authenticate, (req, res) => {
    const {
        title,
        status
    } = req.body;

    if (
        typeof title !== "string" ||
        !title.trim() ||
        !VALID_STATUS.includes(status)
    ) {
        return res.status(400).json({
            message: "Invalid input"
        });
    }

    const task = {
        id: String(taskIdCounter++),
        title: title.trim(),
        status,
        ownerId: req.user.id
    };

    tasks.set(task.id, task);

    return res.status(201).json(task);
});

// ================= GET TASKS =================

app.get("/tasks", authenticate, (req, res) => {
    let userTasks =
        Array.from(tasks.values()).filter(
            task => task.ownerId === req.user.id
        );

    const {
        status
    } = req.query;

    if (status) {
        if (!VALID_STATUS.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        userTasks =
            userTasks.filter(
                task => task.status === status
            );
    }

    let page =
        parseInt(req.query.page, 10) || 1;

    let limit =
        parseInt(req.query.limit, 10) || 10;

    if (page < 1) {
        page = 1;
    }

    if (limit < 1) {
        limit = 10;
    }

    const total = userTasks.length;

    const start =
        (page - 1) * limit;

    const data =
        userTasks.slice(
            start,
            start + limit
        );

    return res.status(200).json({
        data,
        page,
        total
    });
});

// ================= UPDATE TASK =================

app.patch(
    "/tasks/:id",
    authenticate,
    (req, res) => {

        const task =
            tasks.get(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const isOwner =
            task.ownerId === req.user.id;

        const isAdmin =
            req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: "Not allowed"
            });
        }

        const {
            title,
            status
        } = req.body;

        if (
            title === undefined &&
            status === undefined
        ) {
            return res.status(400).json({
                message: "Nothing to update"
            });
        }

        if (
            title !== undefined &&
            (
                typeof title !== "string" ||
                !title.trim()
            )
        ) {
            return res.status(400).json({
                message: "Invalid title"
            });
        }

        if (
            status !== undefined &&
            !VALID_STATUS.includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        if (title !== undefined) {
            task.title = title.trim();
        }

        if (status !== undefined) {
            task.status = status;
        }

        tasks.set(task.id, task);

        return res.status(200).json(task);
    }
);

// ================= DELETE TASK =================

app.delete(
    "/tasks/:id",
    authenticate,
    (req, res) => {

        const task =
            tasks.get(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const isOwner =
            task.ownerId === req.user.id;

        const isAdmin =
            req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: "Not allowed"
            });
        }

        tasks.delete(task.id);

        return res.status(204).send();
    }
);

// ================= START SERVER =================

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(
            `Server running on http://localhost:${PORT}`
        );
    });
}

// ================= EXPORT APP =================

module.exports = app;