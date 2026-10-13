const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Emergency'], default: 'Medium' },
    department: { type: String, default: 'Computer Science & Engineering' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
