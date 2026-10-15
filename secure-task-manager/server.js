const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// JSON data read karne ke liye
app.use(express.json());


// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", (req, res) => {
    res.json({
        message: "Secure Task Manager API is running 🚀"
    });
});


// =====================================================
// IN-MEMORY DATA
// =====================================================

const users = [];
const tasks = [];

let nextUserId = 1;
let nextTaskId = 1;


// Login failed attempts store karne ke liye
const loginAttempts = new Map();


// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

function authenticateToken(req, res, next) {

    const authHeader = req.headers.authorization;

    // Token missing
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Missing or invalid token"
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            error: "Invalid or expired token"
        });

    }
}


// =====================================================
// REGISTER
// POST /auth/register
// =====================================================

app.post("/auth/register", async (req, res) => {

    const {
        email,
        password,
        role = "user"
    } = req.body;


    // Invalid input
    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        email.trim() === "" ||
        password.trim() === ""
    ) {

        return res.status(400).json({
            error: "Email and password are required"
        });

    }


    // Role validation
    if (
        role !== "user" &&
        role !== "admin"
    ) {

        return res.status(400).json({
            error: "Role must be user or admin"
        });

    }


    const normalizedEmail =
        email.trim().toLowerCase();


    // Check existing email
    const existingUser = users.find(
        user => user.email === normalizedEmail
    );


    if (existingUser) {

        return res.status(409).json({
            error: "Email already exists"
        });

    }


    // Hash password
    const hashedPassword =
        await bcrypt.hash(password, 10);


    const newUser = {

        id: String(nextUserId++),

        email: normalizedEmail,

        password: hashedPassword,

        role: role

    };


    users.push(newUser);


    return res.status(201).json({

        id: newUser.id,

        email: newUser.email,

        role: newUser.role

    });

});


// =====================================================
// LOGIN
// POST /auth/login
// =====================================================

app.post("/auth/login", async (req, res) => {

    const {
        email,
        password
    } = req.body;


    // Invalid input
    if (
        typeof email !== "string" ||
        typeof password !== "string"
    ) {

        return res.status(401).json({
            error: "Wrong credentials"
        });

    }


    const normalizedEmail =
        email.trim().toLowerCase();


    const now = Date.now();


    let attempt =
        loginAttempts.get(normalizedEmail);


    // -------------------------------------------------
    // Reset rate-limit after 1 minute
    // -------------------------------------------------

    if (
        attempt &&
        now - attempt.firstAttempt >= 60000
    ) {

        loginAttempts.delete(
            normalizedEmail
        );

        attempt = null;

    }


    // -------------------------------------------------
    // Rate limit check
    // -------------------------------------------------

    if (
        attempt &&
        attempt.count >= 5
    ) {

        const remaining =
            60000 -
            (now - attempt.firstAttempt);


        const retryAfter =
            Math.max(
                1,
                Math.ceil(remaining / 1000)
            );


        res.set(
            "Retry-After",
            String(retryAfter)
        );


        return res.status(429).json({

            error:
                "Too many failed login attempts"

        });

    }


    // Find user
    const user = users.find(
        user => user.email === normalizedEmail
    );


    let passwordCorrect = false;


    if (user) {

        passwordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );

    }


    // -------------------------------------------------
    // Wrong credentials
    // -------------------------------------------------

    if (
        !user ||
        !passwordCorrect
    ) {

        if (!attempt) {

            attempt = {

                count: 0,

                firstAttempt: now

            };


            loginAttempts.set(
                normalizedEmail,
                attempt
            );

        }


        attempt.count++;


        return res.status(401).json({

            error: "Wrong credentials"

        });

    }


    // -------------------------------------------------
    // Successful login
    // -------------------------------------------------

    loginAttempts.delete(
        normalizedEmail
    );


    // JWT expires in 15 minutes
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


    return res.status(200).json({

        token: token

    });

});


// =====================================================
// CREATE TASK
// POST /tasks
// =====================================================

app.post(
    "/tasks",
    authenticateToken,
    (req, res) => {

        const {
            title,
            status
        } = req.body;


        // Validate title
        if (
            typeof title !== "string" ||
            title.trim() === ""
        ) {

            return res.status(400).json({

                error: "Title is required"

            });

        }


        // Valid statuses
        const validStatuses = [
            "todo",
            "doing",
            "done"
        ];


        if (
            !validStatuses.includes(status)
        ) {

            return res.status(400).json({

                error:
                    "Status must be todo, doing or done"

            });

        }


        // Create task
        const newTask = {

            id: String(nextTaskId++),

            title: title.trim(),

            status: status,

            ownerId: req.user.id

        };


        tasks.push(newTask);


        return res.status(201).json(
            newTask
        );

    }
);


// =====================================================
// GET TASKS
// GET /tasks
// =====================================================

app.get(
    "/tasks",
    authenticateToken,
    (req, res) => {

        const {
            status,
            page = "1",
            limit = "10"
        } = req.query;


        // ------------------------------------------------
        // IMPORTANT:
        // User can ONLY see their own tasks
        // ------------------------------------------------

        let userTasks = tasks.filter(

            task =>
                task.ownerId === req.user.id

        );


        // ------------------------------------------------
        // Status filter
        // ------------------------------------------------

        if (status !== undefined) {

            const validStatuses = [
                "todo",
                "doing",
                "done"
            ];


            if (
                !validStatuses.includes(status)
            ) {

                return res.status(400).json({

                    error: "Invalid status"

                });

            }


            userTasks =
                userTasks.filter(

                    task =>
                        task.status === status

                );

        }


        // ------------------------------------------------
        // Pagination
        // ------------------------------------------------

        const pageNumber =
            Number(page);

        const limitNumber =
            Number(limit);


        if (
            !Number.isInteger(pageNumber) ||
            !Number.isInteger(limitNumber) ||
            pageNumber < 1 ||
            limitNumber < 1
        ) {

            return res.status(400).json({

                error:
                    "Invalid page or limit"

            });

        }


        const total =
            userTasks.length;


        const startIndex =
            (pageNumber - 1) *
            limitNumber;


        const endIndex =
            startIndex +
            limitNumber;


        const data =
            userTasks.slice(
                startIndex,
                endIndex
            );


        return res.status(200).json({

            data: data,

            page: pageNumber,

            total: total

        });

    }
);


// =====================================================
// UPDATE TASK
// PATCH /tasks/:id
// =====================================================

app.patch(
    "/tasks/:id",
    authenticateToken,
    (req, res) => {

        const taskId =
            req.params.id;


        // Find task
        const task =
            tasks.find(
                task =>
                    task.id === taskId
            );


        // Task not found
        if (!task) {

            return res.status(404).json({

                error: "Task not found"

            });

        }


        // ------------------------------------------------
        // Owner OR Admin
        // ------------------------------------------------

        const isOwner =
            task.ownerId === req.user.id;


        const isAdmin =
            req.user.role === "admin";


        if (
            !isOwner &&
            !isAdmin
        ) {

            return res.status(403).json({

                error:
                    "You do not have permission to update this task"

            });

        }


        const {
            title,
            status
        } = req.body;


        // Nothing to update
        if (
            title === undefined &&
            status === undefined
        ) {

            return res.status(400).json({

                error:
                    "Provide title or status"

            });

        }


        // Update title
        if (title !== undefined) {

            if (
                typeof title !== "string" ||
                title.trim() === ""
            ) {

                return res.status(400).json({

                    error:
                        "Invalid title"

                });

            }


            task.title =
                title.trim();

        }


        // Update status
        if (status !== undefined) {

            const validStatuses = [
                "todo",
                "doing",
                "done"
            ];


            if (
                !validStatuses.includes(status)
            ) {

                return res.status(400).json({

                    error:
                        "Invalid status"

                });

            }


            task.status =
                status;

        }


        return res.status(200).json(
            task
        );

    }
);


// =====================================================
// DELETE TASK
// DELETE /tasks/:id
// =====================================================

app.delete(
    "/tasks/:id",
    authenticateToken,
    (req, res) => {

        const taskId =
            req.params.id;


        // Find task index
        const taskIndex =
            tasks.findIndex(

                task =>
                    task.id === taskId

            );


        // Not found
        if (
            taskIndex === -1
        ) {

            return res.status(404).json({

                error:
                    "Task not found"

            });

        }


        const task =
            tasks[taskIndex];


        // ------------------------------------------------
        // Owner OR Admin
        // ------------------------------------------------

        const isOwner =
            task.ownerId === req.user.id;


        const isAdmin =
            req.user.role === "admin";


        if (
            !isOwner &&
            !isAdmin
        ) {

            return res.status(403).json({

                error:
                    "You do not have permission to delete this task"

            });

        }


        // Delete task
        tasks.splice(
            taskIndex,
            1
        );


        // 204 No Content
        return res.status(204).send();

    }
);


// =====================================================
// START SERVER
// =====================================================

if (require.main === module) {

    app.listen(
        PORT,
        () => {

            console.log(
                `Server running on http://localhost:${PORT}`
            );

        }
    );

}


// =====================================================
// EXPORT EXPRESS APP
// Hidden tests can import this
// =====================================================

module.exports = app;