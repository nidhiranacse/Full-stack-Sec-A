// app.js — User registration, login and a JWT-protected route (Express)
//
// Install:  npm install express jsonwebtoken
// Run:      node app.js          (listens on PORT or 3000)
// Test:     const app = require("./app");  // works with supertest, no port opened

const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";
const TOKEN_TTL = "1h";

const app = express();
app.use(express.json());

// In-memory user store: username -> { salt, hash }
const users = new Map();

// ---------- password helpers (scrypt, no native dependencies) ----------
const hashPassword = (password, salt) =>
  crypto.scryptSync(password, salt, 64);

const createPasswordRecord = (password) => {
  const salt = crypto.randomBytes(16);
  return { salt, hash: hashPassword(password, salt) };
};

const verifyPassword = (password, record) => {
  const candidate = hashPassword(password, record.salt);
  return crypto.timingSafeEqual(candidate, record.hash);
};

// ---------- auth middleware ----------
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (typeof header !== "string") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const match = header.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // verify() rejects bad signatures, malformed tokens and expired tokens
    const payload = jwt.verify(match[1], JWT_SECRET, { algorithms: ["HS256"] });
    if (!payload || typeof payload.username !== "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = { username: payload.username };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// ---------- routes ----------
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

  if (users.has(username)) {
    return res.status(409).json({ error: "Username already exists" });
  }

  users.set(username, createPasswordRecord(password));
  return res.status(201).json({ message: "User registered" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  const record =
    typeof username === "string" && typeof password === "string"
      ? users.get(username)
      : undefined;

  if (!record || !verifyPassword(password, record)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: TOKEN_TTL,
  });
  return res.status(200).json({ token });
});

app.get("/profile", requireAuth, (req, res) => {
  return res.status(200).json({ username: req.user.username });
});

// ---------- error handling ----------
// Malformed JSON bodies etc. are treated as invalid input.
app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid input" });
  }
  return res.status(500).json({ error: "Internal server error" });
});

// Start the server only when run directly (so tests can import `app`).
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

module.exports = app;
