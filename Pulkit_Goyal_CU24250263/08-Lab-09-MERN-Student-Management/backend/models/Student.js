const mongoose = require('mongoose');

/**
 * Student Mongoose Schema
 * Author: Pulkit Goyal (CUID: CU24250263 | Roll: 40 | Section: A)
 */
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    cuid: {
      type: String,
      required: [true, 'CUID is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    rollNumber: {
      type: Number,
      required: [true, 'Roll number is required'],
      min: [1, 'Roll number must be positive']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    course: {
      type: String,
      required: [true, 'Course title is required'],
      default: 'B.Tech Computer Science & Engineering'
    },
    marks: {
      type: Number,
      required: [true, 'Academic marks/percentage is required'],
      min: [0, 'Marks cannot be negative'],
      max: [100, 'Marks cannot exceed 100']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Student', studentSchema);
