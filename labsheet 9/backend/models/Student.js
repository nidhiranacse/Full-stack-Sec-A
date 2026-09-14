const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  rollNo: String,
  course: String,
  marks: Number,
});

module.exports = mongoose.model("Student", studentSchema);