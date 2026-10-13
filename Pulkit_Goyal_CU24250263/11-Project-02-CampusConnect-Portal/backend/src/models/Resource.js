const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    department: { type: String, default: 'Computer Science & Engineering' },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: 'pdf' },
    fileSizeMb: { type: Number, default: 2.5 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
