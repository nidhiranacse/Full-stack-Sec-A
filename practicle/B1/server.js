const path = require("path");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
const SECRET_KEY = "my_secret_key_change_this";
const users = [];

// Register
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (
        typeof username !== "string" ||
        !username.trim() ||
        typeof password !== "string" ||
        password.length < 6
    ) {
        return res.status(400).json({
            error: "Invalid input"
        });
    }

    const existingUser = users.find(
        user => user.username === username.trim()
    );

    if (existingUser) {
        return res.status(409).json({
            error: "Username already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({
        username: username.trim(),
        password: hashedPassword
    });

    res.status(201).json({ message: "User registered" });
});

// Login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(user => user.username === username);

    if (
        !user ||
        typeof password !== "string" ||
        !(await bcrypt.compare(password, user.password))
    ) {
        return res.status(401).json({
            error: "Invalid credentials"
        });
    }

    const token = jwt.sign(
        { username: user.username },
        SECRET_KEY,
        { expiresIn: "1h" }
    );

    res.status(200).json({ token });
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

    try {
        req.user = jwt.verify(token, SECRET_KEY);
        next();
    } catch (error) {
        res.status(401).json({ error: "Unauthorized" });
    }
}

// Protected profile
app.get("/profile", authenticateToken, (req, res) => {
    res.status(200).json({
        username: req.user.username
    });
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
