const Announcement = require('../models/Announcement');

async function createAnnouncement(req, res) {
  const { title, body } = req.body;

  const announcement = await Announcement.create({
    title,
    body,
    createdBy: req.user.sub
  });

  const io = req.app.get('io');

  if (io) {
    io.to('STUDENT').emit('new-announcement', {
      id: announcement._id,
      title: announcement.title,
      body: announcement.body,
      createdAt: announcement.createdAt
    });
  }

  return res.status(201).json(announcement);
}

async function listAnnouncements(req, res) {
  const announcements = await Announcement.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return res.status(200).json(announcements);
}

module.exports = {
  createAnnouncement,
  listAnnouncements
};