// ─── Task Routes (/tasks) ────────────────────────────────────────────
// All routes require the authenticate middleware (attached in app.js).
// POST   /tasks      — create a task for the logged-in user
// GET    /tasks      — list the caller's tasks (with pagination & filter)
// PATCH  /tasks/:id  — update title/status (owner or admin only)
// DELETE /tasks/:id  — delete a task       (owner or admin only)

const express = require("express");
const { tasks, generateTaskId } = require("../store");

const router = express.Router();

const VALID_STATUSES = ["todo", "doing", "done"];

// ── POST /tasks ──────────────────────────────────────────────────────
router.post("/", (req, res) => {
  const { title, status } = req.body;

  if (!title || !status) {
    return res.status(400).json({ error: "Title and status are required" });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Status must be todo, doing or done" });
  }

  const id = generateTaskId();
  const task = { id, title, status, ownerId: req.user.id };
  tasks.set(id, task);

  return res.status(201).json(task);
});

// ── GET /tasks ───────────────────────────────────────────────────────
router.get("/", (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);

  // Get only the caller's tasks
  let userTasks = [...tasks.values()].filter(
    (t) => t.ownerId === req.user.id
  );

  // Optional status filter
  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid status filter" });
    }
    userTasks = userTasks.filter((t) => t.status === status);
  }

  const total = userTasks.length;
  const start = (pageNum - 1) * limitNum;
  const data = userTasks.slice(start, start + limitNum);

  return res.status(200).json({ data, page: pageNum, total });
});

// ── PATCH /tasks/:id ─────────────────────────────────────────────────
router.patch("/:id", (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const task = tasks.get(taskId);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Permission: owner or admin
  if (task.ownerId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: not the owner" });
  }

  const { title, status } = req.body;

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Status must be todo, doing or done" });
  }

  if (title === undefined && status === undefined) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  if (title !== undefined) task.title = title;
  if (status !== undefined) task.status = status;

  tasks.set(taskId, task);
  return res.status(200).json(task);
});

// ── DELETE /tasks/:id ────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const task = tasks.get(taskId);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Permission: owner or admin
  if (task.ownerId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: not the owner" });
  }

  tasks.delete(taskId);
  return res.sendStatus(204);
});

module.exports = router;
