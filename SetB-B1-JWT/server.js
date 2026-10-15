const cors = require("cors");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;
const JWT_SECRET = "campusconnect_lab_secret_2026";

app.use(express.json());
app.use(cors());
const users = [];

app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (
        typeof username !== "string" ||
        !username.trim() ||
        typeof password !== "string" ||
        password.length < 6
    ) {
        return res.status(400).json({ error: "Invalid input" });
    }

    const existingUser = users.find(
        (user) => user.username === username.trim()
    );

    if (existingUser) {
        return res.status(409).json({
            error: "Username already exists"
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    users.push({
        username: username.trim(),
        passwordHash
    });

    res.status(201).json({ message: "User registered" });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(
        (item) => item.username === username
    );

    if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
        return res.status(401).json({
            error: "Invalid credentials"
        });
    }

    const token = jwt.sign(
        { username: user.username },
        JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.status(200).json({ token });
});

app.get("/profile", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        res.status(200).json({
            username: decoded.username
        });
    } catch (error) {
        res.status(401).json({ error: "Unauthorized" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});