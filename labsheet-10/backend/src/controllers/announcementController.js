const Announcement = require('../models/Announcement');

// @route   GET /api/announcements
// @desc    Get recent announcements (authenticated users)
const getAnnouncements = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const announcements = await Announcement.find()
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({ success: true, count: announcements.length, announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

// @route   POST /api/announcements (Admin only)
// @desc    Create new announcement and broadcast via Socket.io to Students
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority, category } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      priority: priority || 'NORMAL',
      category: category || 'General',
      createdBy: req.user.id,
    });

    const populated = await announcement.populate('createdBy', 'name email role');

    // Real-time socket emission to connected STUDENT room & broadcast
    const io = req.app.get('io');
    if (io) {
      // Emit to 'STUDENT' room as specified in Task 2
      io.to('STUDENT').emit('new-announcement', populated);
      // Also emit to all connected clients so admins can also see the live update
      io.emit('announcement-broadcast', populated);
      console.log(`[Socket.io] Emitted "new-announcement" for "${announcement.title}"`);
    } else {
      console.warn('[Socket.io] io instance not found on app');
    }

    return res.status(201).json({
      message: 'Announcement published successfully and broadcasted in real-time',
      announcement: populated,
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

// @route   DELETE /api/announcements/:id (Admin only)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: 'Not Found', message: 'Announcement not found' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Announcement deleted successfully', id: req.params.id });
  } catch (error) {
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
};
