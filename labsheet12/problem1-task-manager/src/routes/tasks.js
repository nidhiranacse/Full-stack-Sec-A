const express = require("express");

const authenticateToken = require("../middleware/auth");
const { tasks, createTaskId } = require("../data/store");

const router = express.Router();

const allowedStatuses = ["todo", "doing", "done"];

// POST /tasks
router.post("/", authenticateToken, (req, res) => {
  const { title, status } = req.body;

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({
      error: "Title is required",
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      error: "Status must be todo, doing, or done",
    });
  }

  const task = {
    id: createTaskId(),
    title: title.trim(),
    status,
    ownerId: req.user.userId,
  };

  tasks.push(task);

  return res.status(201).json(task);
});

// GET /tasks
router.get("/", authenticateToken, (req, res) => {
  const { status } = req.query;

  const page = Math.max(
    parseInt(req.query.page, 10) || 1,
    1
  );

  const limit = Math.max(
    parseInt(req.query.limit, 10) || 10,
    1
  );

  let userTasks = tasks.filter(
    (task) => task.ownerId === req.user.userId
  );

  if (status) {
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Status must be todo, doing, or done",
      });
    }

    userTasks = userTasks.filter(
      (task) => task.status === status
    );
  }

  const total = userTasks.length;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedTasks = userTasks.slice(
    startIndex,
    endIndex
  );

  return res.status(200).json({
    data: paginatedTasks,
    page,
    total,
  });
});

// PATCH /tasks/:id
router.patch("/:id", authenticateToken, (req, res) => {
  const task = tasks.find(
    (item) => item.id === req.params.id
  );

  if (!task) {
    return res.status(404).json({
      error: "Task not found",
    });
  }

  const isOwner = task.ownerId === req.user.userId;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      error: "Forbidden",
    });
  }

  const { title, status } = req.body;

  if (title !== undefined) {
    if (
      typeof title !== "string" ||
      title.trim() === ""
    ) {
      return res.status(400).json({
        error: "Title must be a non-empty string",
      });
    }

    task.title = title.trim();
  }

  if (status !== undefined) {
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Status must be todo, doing, or done",
      });
    }

    task.status = status;
  }

  return res.status(200).json(task);
});

// DELETE /tasks/:id
router.delete("/:id", authenticateToken, (req, res) => {
  const taskIndex = tasks.findIndex(
    (item) => item.id === req.params.id
  );

  if (taskIndex === -1) {
    return res.status(404).json({
      error: "Task not found",
    });
  }

  const task = tasks[taskIndex];

  const isOwner = task.ownerId === req.user.userId;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      error: "Forbidden",
    });
  }

  tasks.splice(taskIndex, 1);

  return res.status(204).send();
});

module.exports = router;