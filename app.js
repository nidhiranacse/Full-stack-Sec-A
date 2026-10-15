
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const SECRET_KEY = "my_secret_key_change_this";
const users = [];

app.post("/register", (req, res) => {
    const { username, password } = req.body || {};

    if (
        typeof username !== "string" ||
        !username.trim() ||
        typeof password !== "string" ||
        password.length < 6
    ) {
        return res.status(400).json({ error: "Invalid input" });
    }

    if (users.some((user) => user.username === username)) {
        return res.status(409).json({
            error: "Username already exists",
        });
    }

    users.push({ username, password });

    return res.status(201).json({
        message: "User registered",
    });
});

app.post("/login", (req, res) => {
    const { username, password } = req.body || {};

    const user = users.find(
        (u) => u.username === username && u.password === password
    );

    if (!user) {
        return res.status(401).json({
            error: "Invalid credentials",
        });
    }

    const token = jwt.sign(
        { username: user.username },
        SECRET_KEY,
        { expiresIn: "1h" }
    );

    return res.status(200).json({ token });
});

app.get("/profile", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.slice(7);

    try {
        const decoded = jwt.verify(token, SECRET_KEY);

        return res.status(200).json({
            username: decoded.username,
        });
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
