const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/db');
const { getIo } = require('../services/socketService');

function getAnnouncements(_req, res) {
  const db = getDb();
  const announcements = db.get('announcements')
    .map((ann) => {
      const creator = db.get('users').find({ id: ann.createdBy }).value();
      return { ...ann, creatorName: creator?.name || 'Unknown' };
    })
    .sortBy((a) => new Date(a.createdAt))
    .reverse()
    .take(30)
    .value();
  res.json(announcements);
}

function createAnnouncement(req, res) {
  const { title, content } = req.body;
  const db  = getDb();
  const id  = uuidv4();
  const now = new Date().toISOString();

  const creator = db.get('users').find({ id: req.user.id }).value();
  const ann = { id, title, content, createdBy: req.user.id, createdAt: now };
  db.get('announcements').push(ann).write();

  const enriched = { ...ann, creatorName: creator?.name || 'Unknown' };

  // 🔔 Real-time broadcast to ALL connected clients
  const io = getIo();
  if (io) io.emit('new_announcement', enriched);

  res.status(201).json(enriched);
}

function deleteAnnouncement(req, res) {
  const db       = getDb();
  const existing = db.get('announcements').find({ id: req.params.id }).value();
  if (!existing) return res.status(404).json({ error: 'Announcement not found' });

  db.get('announcements').remove({ id: req.params.id }).write();
  res.json({ message: 'Announcement deleted successfully' });
}

module.exports = { getAnnouncements, createAnnouncement, deleteAnnouncement };
