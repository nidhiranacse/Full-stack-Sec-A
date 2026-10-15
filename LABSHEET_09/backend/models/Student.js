const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    rollNo: {
      type: String,
      required: [true, "Roll No. is required"],
      unique: true,
      trim: true,
    },
    course: {
      type: String,
      required: [true, "Course is required"],
      trim: true,
    },
    marks: {
      type: Number,
      required: [true, "Marks are required"],
      min: [0, "Marks cannot be less than 0"],
      max: [100, "Marks cannot exceed 100"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
