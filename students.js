const express = require("express");
const mongoose = require("mongoose");
const Student = require("../models/Student");

const router = express.Router();

// Reject malformed ids early (avoids a CastError)
const checkId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id)
    ? next()
    : res.status(400).json({ error: "Invalid student id" });

// Convert Mongoose errors into clean HTTP responses
function handleError(err, res) {
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(", ") });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: "A student with this Roll No. already exists" });
  }
  console.error(err);
  return res.status(500).json({ error: "Server error" });
}

// POST /students - create
router.post("/", async (req, res) => {
  try {
    const { name, rollNo, course, marks } = req.body;
    const student = await Student.create({ name, rollNo, course, marks });
    res.status(201).json(student);
  } catch (err) { handleError(err, res); }
});

// GET /students - list all
router.get("/", async (req, res) => {
  try {
    res.json(await Student.find().sort({ createdAt: -1 }));
  } catch (err) { handleError(err, res); }
});

// GET /students/:id - read one
router.get("/:id", checkId, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) { handleError(err, res); }
});

// PUT /students/:id - update
router.put("/:id", checkId, async (req, res) => {
  try {
    const { name, rollNo, course, marks } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, rollNo, course, marks },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) { handleError(err, res); }
});

// DELETE /students/:id - delete
router.delete("/:id", checkId, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted", id: student._id });
  } catch (err) { handleError(err, res); }
});

module.exports = router;
