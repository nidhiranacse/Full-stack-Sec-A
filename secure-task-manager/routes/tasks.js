const express = require("express");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// In-memory tasks
const tasks = [];

const VALID_STATUSES = ["todo", "doing", "done"];

function getUserId(req) {
  return Number(req.user.id);
}

function isValidStatus(status) {
  return VALID_STATUSES.includes(status);
}

// CREATE TASK
router.post("/", authenticateToken, (req, res) => {
  const { title, status } = req.body || {};

  if (
    typeof title !== "string" ||
    title.trim() === "" ||
    !isValidStatus(status)
  ) {
    return res.status(400).json({
      error: "Invalid title or status"
    });
  }

  const task = {
    id: tasks.length + 1,
    title: title.trim(),
    status,
    userId: getUserId(req)
  };

  tasks.push(task);

  return res.status(201).json(task);
});

// GET TASKS
router.get("/", authenticateToken, (req, res) => {
  const userId = getUserId(req);

  let userTasks = tasks.filter(
    task => task.userId === userId
  );

  // Optional status filter
  if (req.query.status !== undefined) {
    if (!isValidStatus(req.query.status)) {
      return res.status(400).json({
        error: "Invalid status"
      });
    }

    userTasks = userTasks.filter(
      task => task.status === req.query.status
    );
  }

  let page = Number.parseInt(req.query.page || "1", 10);
  let limit = Number.parseInt(req.query.limit || "10", 10);

  if (
    !Number.isInteger(page) ||
    !Number.isInteger(limit) ||
    page < 1 ||
    limit < 1
  ) {
    return res.status(400).json({
      error: "Invalid pagination parameters"
    });
  }

  const total = userTasks.length;

  const start = (page - 1) * limit;
  const end = start + limit;

  const data = userTasks.slice(start, end);

  return res.status(200).json({
    data,
    page,
    total
  });
});

// UPDATE TASK
router.patch("/:id", authenticateToken, (req, res) => {
  const taskId = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(taskId)) {
    return res.status(404).json({
      error: "Task not found"
    });
  }

  const task = tasks.find(
    item => item.id === taskId
  );

  if (!task) {
    return res.status(404).json({
      error: "Task not found"
    });
  }

  const isOwner = task.userId === getUserId(req);
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      error: "You do not have permission to update this task"
    });
  }

  const { title, status } = req.body || {};

  // At least one field required
  if (title === undefined && status === undefined) {
    return res.status(400).json({
      error: "Nothing to update"
    });
  }

  if (
    title !== undefined &&
    (typeof title !== "string" || title.trim() === "")
  ) {
    return res.status(400).json({
      error: "Invalid title"
    });
  }

  if (
    status !== undefined &&
    !isValidStatus(status)
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

// DELETE TASK
router.delete("/:id", authenticateToken, (req, res) => {
  const taskId = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(taskId)) {
    return res.status(404).json({
      error: "Task not found"
    });
  }

  const index = tasks.findIndex(
    task => task.id === taskId
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Task not found"
    });
  }

  const task = tasks[index];

  const isOwner = task.userId === getUserId(req);
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      error: "You do not have permission to delete this task"
    });
  }

  tasks.splice(index, 1);

  return res.status(204).send();
});

module.exports = router;
module.exports.tasks = tasks;
