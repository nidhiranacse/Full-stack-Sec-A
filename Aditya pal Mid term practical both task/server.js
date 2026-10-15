
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET || "my_secret_key";
const users = new Map();

// POST /register
app.post("/register", (req, res) => {
    const { username, password } = req.body || {};

    if (
        typeof username !== "string" ||
        username.trim() === "" ||
        typeof password !== "string" ||
        password.length < 6
    ) {
        return res.status(400).json({ error: "Invalid input" });
    }

    const name = username.trim();

    if (users.has(name)) {
        return res.status(409).json({
            error: "Username already exists"
        });
    }

    users.set(name, password);

    return res.status(201).json({
        message: "User registered"
    });
});

// POST /login
app.post("/login", (req, res) => {
    const { username, password } = req.body || {};

    if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        !users.has(username.trim()) ||
        users.get(username.trim()) !== password
    ) {
        return res.status(401).json({
            error: "Invalid credentials"
        });
    }

    const token = jwt.sign(
        { username: username.trim() },
        SECRET_KEY,
        { expiresIn: "1h" }
    );

    return res.status(200).json({ token });
});

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    const token = authHeader.slice(7);

    if (!token) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err || !decoded || typeof decoded.username !== "string") {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        req.user = decoded;
        next();
    });
}

// GET /profile (protected route)
app.get("/profile", authenticateToken, (req, res) => {
    return res.status(200).json({
        username: req.user.username
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
