const router = require('express').Router();
const { z } = require('zod');
const Announcement = require('../models/Announcement');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

const schema = z.object({ title: z.string().min(3, 'Title must be at least 3 characters'), body: z.string().min(3, 'Body is required') });

router.get('/', authenticate, async (req, res) => {
  res.json(await Announcement.find().sort({ createdAt: -1 }).limit(20).lean());
});
router.post('/', authenticate, authorize('ADMIN'), validate(schema), async (req, res) => {
  const a = await Announcement.create({ ...req.body, createdBy: req.user.id });
  // push instantly to every connected STUDENT socket
  req.app.get('io').to('students').emit('new-announcement', { _id: a._id, title: a.title, body: a.body, createdAt: a.createdAt, by: req.user.name });
  res.status(201).json(a);
});
module.exports = router;
