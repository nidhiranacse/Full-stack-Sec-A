const Announcement = require("../models/Announcement");

async function listAnnouncements(req, res) {
  const items = await Announcement.find().sort({ createdAt: -1 }).limit(50).lean();
  return res.status(200).json(items);
}

async function createAnnouncement(req, res) {
  const { title, body } = req.body;
  const item = await Announcement.create({
    title,
    body: body || "",
    createdBy: req.user.sub,
  });
  return res.status(201).json(item);
}

module.exports = { listAnnouncements, createAnnouncement };
