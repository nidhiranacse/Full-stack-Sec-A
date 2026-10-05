import { Announcement } from '../models/Announcement.js';
import { emitNewAnnouncement } from '../socket/index.js';

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private (Student or Admin)
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      data: announcements
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve announcements',
      error: error.message
    });
  }
};

// @desc    Create new announcement & emit real-time Socket.io event (ADMIN only)
// @route   POST /api/announcements
// @access  Private (ADMIN)
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, priority } = req.body;

    const announcement = await Announcement.create({
      title,
      message,
      priority: priority || 'MEDIUM',
      createdBy: req.user._id
    });

    // Populate creator info
    const populated = await Announcement.findById(announcement._id).populate('createdBy', 'name email role');

    // Broadcast in real-time to all connected students via Socket.io
    emitNewAnnouncement(populated);

    return res.status(201).json({
      success: true,
      message: 'Announcement published and broadcasted successfully',
      data: populated
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create announcement',
      error: error.message
    });
  }
};

// @desc    Delete an announcement (ADMIN only)
// @route   DELETE /api/announcements/:id
// @access  Private (ADMIN)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Announcement removed successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete announcement',
      error: error.message
    });
  }
};
