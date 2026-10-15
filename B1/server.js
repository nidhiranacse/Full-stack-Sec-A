const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

// In-memory user storage for this practical
const users = new Map();

// POST /register
app.post("/register", async (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== "string" ||
    username.trim() === "" ||
    typeof password !== "string" ||
    password.length < 6
  ) {
    return res.status(400).json({ error: "Invalid input" });
  }

  if (users.has(username)) {
    return res.status(409).json({
      error: "Username already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users.set(username, {
    username,
    password: hashedPassword,
  });

  return res.status(201).json({
    message: "User registered",
  });
});

// POST /login
app.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  const user =
    typeof username === "string" ? users.get(username) : undefined;

  if (
    !user ||
    typeof password !== "string" ||
    !(await bcrypt.compare(password, user.password))
  ) {
    return res.status(401).json({
      error: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    { username: user.username },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return res.status(200).json({ token });
});

// GET /profile
app.get("/profile", (req, res) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authorization.slice(7).trim();

  try {
    if (!token) {
      throw new Error("Missing token");
    }

    const payload = jwt.verify(token, JWT_SECRET);

    if (
      typeof payload === "string" ||
      typeof payload.username !== "string"
    ) {
      throw new Error("Invalid token payload");
    }

    return res.status(200).json({
      username: payload.username,
    });
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
});

const PORT = process.env.PORT || 3000;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from .env");
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;