
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;

// In-memory user storage for this lab
const users = [];

// Use an environment variable in real deployments
const JWT_SECRET =
  process.env.JWT_SECRET || "lab_secret_key_change_this";

app.use(express.json());

// POST /register
app.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== "string" ||
    username.trim() === "" ||
    typeof password !== "string" ||
    password.length < 6
  ) {
    return res.status(400).json({
      error: "Invalid input",
    });
  }

  const existingUser = users.find(
    (user) => user.username === username
  );

  if (existingUser) {
    return res.status(409).json({
      error: "Username already exists",
    });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: "User registered",
  });
});

// POST /login
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
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return res.status(200).json({ token });
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const token = authHeader.slice(7);

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded || typeof decoded.username !== "string") {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    req.user = decoded;
    next();
  });
}

// GET /profile
app.get("/profile", authenticateToken, (req, res) => {
  return res.status(200).json({
    username: req.user.username,
  });
});

// Handle invalid JSON request bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      error: "Invalid input",
    });
  }

  next(err);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
