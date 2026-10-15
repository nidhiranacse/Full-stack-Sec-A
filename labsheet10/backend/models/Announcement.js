const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Announcement", announcementSchema);