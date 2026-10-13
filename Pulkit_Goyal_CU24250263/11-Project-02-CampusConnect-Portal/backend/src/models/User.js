const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin', 'faculty'], default: 'student' },
    cuid: { type: String, default: 'CU24250263' },
    rollNumber: { type: Number, default: 40 },
    department: { type: String, default: 'Computer Science & Engineering' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
