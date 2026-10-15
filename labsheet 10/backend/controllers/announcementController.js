const Announcement = require('../models/Announcement');

exports.createAnnouncement = (io) => async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required.' });

  const item = await Announcement.create({ title, content, createdBy: req.user.id });

  // Real-time broadcast to Students
  io.emit('new-announcement', {
    id: item._id,
    title: item.title,
    content: item.content,
    createdAt: item.createdAt
  });

  res.status(201).json(item);
};

exports.getAnnouncements = async (req, res) => {
  const items = await Announcement.find().sort({ createdAt: -1 }).limit(20);
  res.json(items);
};