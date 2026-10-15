/**
 * Task Routes
 * BTCS303T Full Stack | Coding Assessment - Problem 1
 * 
 * Endpoints:
 * - POST   /tasks     -> 201 Created | 400 Invalid Input | 401 Unauthorized
 * - GET    /tasks     -> 200 OK | 401 Unauthorized ({ data, page, total })
 * - PATCH  /tasks/:id -> 200 OK | 400 Invalid | 401 Auth | 403 Not Owner | 404 Not Found
 * - DELETE /tasks/:id -> 204 No Content | 401 Auth | 403 Not Owner | 404 Not Found
 */

const express = require('express');
const store = require('../store');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply reusable authentication middleware to all /tasks routes
router.use(authenticateToken);

const VALID_STATUSES = ['todo', 'doing', 'done'];

// POST /tasks
router.post('/', (req, res) => {
  const { title, status } = req.body || {};

  // Validate title
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid input: title is required and must be non-empty' });
  }

  // Validate status
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid input: status must be one of [${VALID_STATUSES.join(', ')}]`
    });
  }

  // Create task for current authenticated user
  const task = store.createTask({
    title,
    status,
    userId: req.user.id
  });

  return res.status(201).json(task);
});

// GET /tasks
router.get('/', (req, res) => {
  const { status } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);

  // Validate status if provided in query
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid query status: must be one of [${VALID_STATUSES.join(', ')}]`
    });
  }

  // Isolation Hard Requirement: returns only caller's tasks
  const result = store.getUserTasks(req.user.id, {
    status,
    page,
    limit
  });

  return res.status(200).json(result);
});

// PATCH /tasks/:id
router.patch('/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  if (isNaN(taskId)) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const task = store.findTaskById(taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Ownership Isolation Rule: Only owner or admin may update
  if (task.userId !== Number(req.user.id) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Only the task owner or an admin may update this task' });
  }

  const { title, status } = req.body || {};

  // Must provide at least one field to update
  if (title === undefined && status === undefined) {
    return res.status(400).json({ error: 'Invalid input: Provide title or status to update' });
  }

  const updates = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid input: title must be a non-empty string' });
    }
    updates.title = title;
  }

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid input: status must be one of [${VALID_STATUSES.join(', ')}]`
      });
    }
    updates.status = status;
  }

  const updatedTask = store.updateTask(taskId, updates);
  return res.status(200).json(updatedTask);
});

// DELETE /tasks/:id
router.delete('/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  if (isNaN(taskId)) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const task = store.findTaskById(taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Ownership Isolation Rule: Only owner or admin may delete
  if (task.userId !== Number(req.user.id) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Only the task owner or an admin may delete this task' });
  }

  store.deleteTask(taskId);
  return res.status(204).send();
});

module.exports = router;
