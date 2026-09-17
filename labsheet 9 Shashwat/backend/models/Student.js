// models/Student.js - Mongoose Schema for Student
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    rollNo: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      min: [0, 'Marks cannot be less than 0'],
      max: [100, 'Marks cannot exceed 100'],
    },
    grade: {
      type: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Pre-save hook to auto-calculate grade
studentSchema.pre('save', function (next) {
  this.grade = calculateGrade(this.marks);
  next();
});

// Pre-update hook to auto-calculate grade
studentSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.marks !== undefined) {
    update.grade = calculateGrade(update.marks);
    this.setUpdate(update);
  }
  next();
});

function calculateGrade(marks) {
  if (marks >= 90) return 'O';
  if (marks >= 80) return 'A+';
  if (marks >= 70) return 'A';
  if (marks >= 60) return 'B+';
  if (marks >= 50) return 'B';
  if (marks >= 40) return 'C';
  return 'F';
}

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
