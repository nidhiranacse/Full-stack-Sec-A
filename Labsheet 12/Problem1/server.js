const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.get("/", (req, res) => {
  res.json({
    message: "Secure Task Manager API is running",
    endpoints: [
      "POST /auth/register",
      "POST /auth/login",
      "POST /tasks",
      "GET /tasks",
      "PATCH /tasks/:id",
      "DELETE /tasks/:id"
    ]
  });
});
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// In-memory storage
const users = [];
const tasks = [];

let nextUserId = 1;
let nextTaskId = 1;

// Stores failed login timestamps for each email
const failedLogins = new Map();


// =====================================================
// LOGIN RATE LIMITING
// =====================================================

function getRecentAttempts(email) {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;

  const attempts = (failedLogins.get(email) || [])
    .filter((time) => time > oneMinuteAgo);

  failedLogins.set(email, attempts);

  return attempts;
}

function recordFailedLogin(email) {
  const attempts = getRecentAttempts(email);
  attempts.push(Date.now());

  failedLogins.set(email, attempts);
}


// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required"
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token"
    });
  }
}


// =====================================================
// POST /auth/register
// =====================================================

app.post("/auth/register", async (req, res) => {
  const { email, password, role = "user" } = req.body;

  // Validate input
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      error: "Invalid input"
    });
  }

  // Validate role
  if (role !== "user" && role !== "admin") {
    return res.status(400).json({
      error: "Invalid role"
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check duplicate email
  const existingUser = users.find(
    (user) => user.email === normalizedEmail
  );

  if (existingUser) {
    return res.status(409).json({
      error: "Email already exists"
    });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    id: nextUserId++,
    email: normalizedEmail,
    passwordHash,
    role
  };

  users.push(user);

  return res.status(201).json({
    id: user.id,
    email: user.email,
    role: user.role
  });
});


// =====================================================
// POST /auth/login
// =====================================================

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(401).json({
      error: "Wrong credentials"
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check rate limit BEFORE password verification
  const attempts = getRecentAttempts(normalizedEmail);

  if (attempts.length >= 5) {
    const oldestAttempt = attempts[0];

    const retryAfter = Math.max(
      1,
      Math.ceil(
        (oldestAttempt + 60 * 1000 - Date.now()) / 1000
      )
    );

    res.set("Retry-After", String(retryAfter));

    return res.status(429).json({
      error: "Too many failed login attempts"
    });
  }

  const user = users.find(
    (user) => user.email === normalizedEmail
  );

  let passwordCorrect = false;

  if (user) {
    passwordCorrect = await bcrypt.compare(
      password,
      user.passwordHash
    );
  }

  if (!user || !passwordCorrect) {
    recordFailedLogin(normalizedEmail);

    return res.status(401).json({
      error: "Wrong credentials"
    });
  }

  // Successful login clears the failed-attempt counter
  failedLogins.delete(normalizedEmail);

  // Create JWT
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
    token
  });
});


// =====================================================
// POST /tasks
// =====================================================

app.post("/tasks", authenticate, (req, res) => {
  const { title, status } = req.body;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    !["todo", "doing", "done"].includes(status)
  ) {
    return res.status(400).json({
      error: "Invalid input"
    });
  }

  const task = {
    id: nextTaskId++,
    title: title.trim(),
    status,
    ownerId: req.user.id
  };

  tasks.push(task);

  return res.status(201).json(task);
});


// =====================================================
// GET /tasks
// =====================================================

app.get("/tasks", authenticate, (req, res) => {
  const { status } = req.query;

  const page = Math.max(
    1,
    parseInt(req.query.page, 10) || 1
  );

  const limit = Math.max(
    1,
    parseInt(req.query.limit, 10) || 10
  );

  if (
    status !== undefined &&
    !["todo", "doing", "done"].includes(status)
  ) {
    return res.status(400).json({
      error: "Invalid status"
    });
  }

  // IMPORTANT:
  // Only return tasks belonging to the logged-in user.
  let userTasks = tasks.filter(
    (task) => task.ownerId === req.user.id
  );

  if (status) {
    userTasks = userTasks.filter(
      (task) => task.status === status
    );
  }

  const total = userTasks.length;

  const start = (page - 1) * limit;

  const data = userTasks.slice(
    start,
    start + limit
  );

  return res.status(200).json({
    data,
    page,
    total
  });
});


// =====================================================
// PATCH /tasks/:id
// =====================================================

app.patch("/tasks/:id", authenticate, (req, res) => {
  const id = Number(req.params.id);

  const task = tasks.find(
    (task) => task.id === id
  );

  if (!task) {
    return res.status(404).json({
      error: "Task not found"
    });
  }

  const isOwner = task.ownerId === req.user.id;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      error: "Forbidden"
    });
  }

  const { title, status } = req.body;

  // At least one field must be provided
  if (
    title === undefined &&
    status === undefined
  ) {
    return res.status(400).json({
      error: "Nothing to update"
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
      error: "Invalid title"
    });
  }

  if (
    status !== undefined &&
    !["todo", "doing", "done"].includes(status)
  ) {
    return res.status(400).json({
      error: "Invalid status"
    });
  }

  if (title !== undefined) {
    task.title = title.trim();
  }

  if (status !== undefined) {
    task.status = status;
  }

  return res.status(200).json(task);
});


// =====================================================
// DELETE /tasks/:id
// =====================================================

app.delete("/tasks/:id", authenticate, (req, res) => {
  const id = Number(req.params.id);

  const taskIndex = tasks.findIndex(
    (task) => task.id === id
  );

  if (taskIndex === -1) {
    return res.status(404).json({
      error: "Task not found"
    });
  }

  const task = tasks[taskIndex];

  const isOwner = task.ownerId === req.user.id;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      error: "Forbidden"
    });
  }

  tasks.splice(taskIndex, 1);

  return res.status(204).send();
});


// =====================================================
// START SERVER
// =====================================================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}


// Export Express app for automated tests
module.exports = app;