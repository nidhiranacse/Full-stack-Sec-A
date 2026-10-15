// ──────────────────────────────────────────────────────────────
// Task Routes  –  CRUD with ownership & admin override
// ──────────────────────────────────────────────────────────────

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const { tasks } = require('../store');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const VALID_STATUSES = ['todo', 'doing', 'done'];

// All task routes require authentication
router.use(authenticate);

// ─── CREATE ──────────────────────────────────────────────────
// POST /tasks
router.post('/', (req, res) => {
  try {
    const { title, status } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'title is required and must be a non-empty string' });
    }

    const taskStatus = status || 'todo';
    if (!VALID_STATUSES.includes(taskStatus)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const task = {
      id,
      title: title.trim(),
      status: taskStatus,
      userId: req.user.id,
      createdAt: now,
      updatedAt: now,
    };

    tasks.set(id, task);

    return res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    console.error('Create task error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── READ ALL (with pagination & status filter) ─────────────
// GET /tasks?page=1&limit=10&status=todo
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Collect tasks belonging to the user (or all for admins)
    let userTasks = [];
    for (const task of tasks.values()) {
      if (isAdmin || task.userId === userId) {
        userTasks.push(task);
      }
    }

    // ── Filter by status ──
    const { status } = req.query;
    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          error: `Invalid status filter. Must be one of: ${VALID_STATUSES.join(', ')}`,
        });
      }
      userTasks = userTasks.filter((t) => t.status === status);
    }

    // ── Sort newest first ──
    userTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // ── Pagination ──
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const totalTasks = userTasks.length;
    const totalPages = Math.ceil(totalTasks / limit) || 1;
    const startIdx = (page - 1) * limit;
    const paginatedTasks = userTasks.slice(startIdx, startIdx + limit);

    return res.status(200).json({
      page,
      limit,
      totalTasks,
      totalPages,
      tasks: paginatedTasks,
    });
  } catch (err) {
    console.error('Get tasks error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── READ ONE ────────────────────────────────────────────────
// GET /tasks/:id
router.get('/:id', (req, res) => {
  try {
    const task = tasks.get(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Ownership or admin check
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: you do not own this task' });
    }

    return res.status(200).json({ task });
  } catch (err) {
    console.error('Get task error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── UPDATE ──────────────────────────────────────────────────
// PUT /tasks/:id
router.put('/:id', (req, res) => {
  try {
    const task = tasks.get(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Ownership or admin check
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: you do not own this task' });
    }

    const { title, status } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'title must be a non-empty string' });
      }
      task.title = title.trim();
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        });
      }
      task.status = status;
    }

    task.updatedAt = new Date().toISOString();
    tasks.set(task.id, task);

    return res.status(200).json({ message: 'Task updated', task });
  } catch (err) {
    console.error('Update task error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── DELETE ──────────────────────────────────────────────────
// DELETE /tasks/:id
router.delete('/:id', (req, res) => {
  try {
    const task = tasks.get(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Ownership or admin check
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: you do not own this task' });
    }

    tasks.delete(task.id);

    return res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Delete task error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
