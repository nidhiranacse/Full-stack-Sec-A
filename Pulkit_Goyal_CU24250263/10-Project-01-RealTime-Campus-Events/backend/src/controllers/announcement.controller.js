const Announcement = require('../models/Announcement');
const { broadcastAnnouncement } = require('../socket');

exports.getAnnouncements = async (req, res) => {
  try {
    const list = await Announcement.find().populate('createdBy', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority, department } = req.body;
    const item = await Announcement.create({
      title,
      content,
      priority: priority || 'Medium',
      department: department || 'Computer Science & Engineering',
      createdBy: req.user.id
    });

    // Instant WebSocket broadcast across all connected clients
    broadcastAnnouncement(item);

    res.status(201).json({ success: true, message: 'Announcement broadcasted', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
