const express = require('express');
const router = express.Router();
const { tasks } = require('../store');
const { authenticateToken } = require('../middleware/auth');

// All task routes require authentication
router.use(authenticateToken);

// GET /tasks (filtered by query ?status=...)
router.get('/', (req, res) => {
  const { status } = req.query;
  let userTasks = tasks.filter((t) => t.userId === req.user.id);

  if (status) {
    userTasks = userTasks.filter((t) => t.status === status.toUpperCase());
  }

  res.status(200).json({
    success: true,
    count: userTasks.length,
    data: userTasks
  });
});

// POST /tasks
router.post('/', (req, res) => {
  const { title, description } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Task title is required' });
  }

  const newTask = {
    id: `task_${Date.now()}`,
    userId: req.user.id,
    title: title.trim(),
    description: description ? description.trim() : '',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: newTask
  });
});

// PUT /tasks/:id
router.put('/:id', (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id && t.userId === req.user.id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found or access unauthorized' });
  }

  const { title, description, status } = req.body;
  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description.trim();
  if (status !== undefined) task.status = status.toUpperCase();

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
});

// DELETE /tasks/:id
router.delete('/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id === req.params.id && t.userId === req.user.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Task not found or access unauthorized' });
  }

  const deleted = tasks.splice(index, 1)[0];

  res.status(200).json({
    success: true,
    message: `Task "${deleted.title}" deleted successfully`
  });
});

module.exports = router;
