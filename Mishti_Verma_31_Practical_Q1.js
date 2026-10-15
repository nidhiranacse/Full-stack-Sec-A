
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.use(express.json({ limit: "10kb" }));

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || "change_this_secret_before_deployment";
const USERS_FILE = path.join(__dirname, "users.json");

const revokedTokens = new Set();

if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, "[]");
}

function readUsers() {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function authenticateToken(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Access denied. Please provide a JWT token."
        });
    }

    const token = header.substring(7);

    if (revokedTokens.has(token)) {
        return res.status(401).json({
            success: false,
            message: "Token has been revoked. Please log in again."
        });
    }

    try {
        req.user = jwt.verify(token, SECRET_KEY);
        req.token = token;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
}

// Home route
app.get("/", (req, res) => {
    res.json({
        application: "JWT Authentication API",
        endpoints: {
            register: "POST /register",
            login: "POST /login",
            profile: "GET /profile",
            logout: "POST /logout"
        }
    });
});

// Register a new user
app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body || {};

        if (
            typeof username !== "string" ||
            typeof password !== "string" ||
            username.trim().length < 3 ||
            username.trim().length > 30 ||
            !/^[a-zA-Z0-9_.-]+$/.test(username.trim()) ||
            password.length < 8 ||
            password.length > 72
        ) {
            return res.status(400).json({
                success: false,
                message: "Username must be 3-30 characters using letters, numbers, _, . or -. Password must be 8-72 characters."
            });
        }

        const cleanUsername = username.trim();
        const users = readUsers();

        const existingUser = users.find(
            user => user.username.toLowerCase() === cleanUsername.toLowerCase()
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = {
            id: crypto.randomUUID(),
            username: cleanUsername,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        res.status(201).json({
            success: true,
            message: "Registration successful. You can now log in.",
            user: {
                id: newUser.id,
                username: newUser.username,
                createdAt: newUser.createdAt
            }
        });
    } catch (error) {
        console.error("Registration error:", error.message);
        res.status(500).json({
            success: false,
            message: "Unable to register user."
        });
    }
});

// Log in and generate JWT
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body || {};

        if (
            typeof username !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });
        }

        const users = readUsers();

        const user = users.find(
            item => item.username.toLowerCase() === username.trim().toLowerCase()
        );

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        const token = jwt.sign(
            {
                sub: user.id,
                username: user.username
            },
            SECRET_KEY,
            {
                expiresIn: "1h",
                jwtid: crypto.randomUUID()
            }
        );

        res.json({
            success: true,
            message: "Login successful.",
            token,
            expiresIn: "1h",
            user: {
                id: user.id,
                username: user.username
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({
            success: false,
            message: "Unable to log in."
        });
    }
});

// Access the protected profile
app.get("/profile", authenticateToken, (req, res) => {
    const users = readUsers();
    const user = users.find(item => item.id === req.user.sub);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "User account no longer exists."
        });
    }

    res.json({
        success: true,
        message: "Protected profile accessed successfully.",
        user: {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt
        }
    });
});

// Log out by revoking the current token
app.post("/logout", authenticateToken, (req, res) => {
    revokedTokens.add(req.token);

    res.json({
        success: true,
        message: "Logged out successfully. This token is now revoked."
    });
});

// Handle invalid JSON and unexpected errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON request body."
        });
    }

    console.error(err);
    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log("JWT Authentication API is ready.");
});
