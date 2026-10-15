// routes/studentRoutes.js — CRUD using JSON file database
const express = require('express');
const router  = express.Router();
const { readAll, writeAll, generateId } = require('../db');

// ── Grade Calculator ──────────────────────────────────────
function calcGrade(marks) {
  if (marks >= 90) return 'O';
  if (marks >= 80) return 'A+';
  if (marks >= 70) return 'A';
  if (marks >= 60) return 'B+';
  if (marks >= 50) return 'B';
  if (marks >= 40) return 'C';
  return 'F';
}

// ── Validation Helper ─────────────────────────────────────
function validate(body) {
  const { name, rollNo, course, marks } = body;
  if (!name || !rollNo || !course || marks === undefined || marks === '')
    return 'All fields (name, rollNo, course, marks) are required.';
  if (String(name).trim().length < 2)
    return 'Name must be at least 2 characters.';
  if (Number(marks) < 0 || Number(marks) > 100)
    return 'Marks must be between 0 and 100.';
  return null; // no error
}

// ─────────────────────────────────────────────────────────────
// POST /students → Add a new student
// ─────────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error });

  const students = readAll();
  const { name, rollNo, course, marks } = req.body;

  // Check duplicate rollNo
  const exists = students.find(
    (s) => s.rollNo.toLowerCase() === String(rollNo).trim().toLowerCase()
  );
  if (exists)
    return res.status(409).json({ success: false, message: 'Roll number already exists.' });

  const newStudent = {
    _id:       generateId(),
    name:      String(name).trim(),
    rollNo:    String(rollNo).trim().toUpperCase(),
    course:    String(course).trim(),
    marks:     Number(marks),
    grade:     calcGrade(Number(marks)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  students.unshift(newStudent); // newest first
  writeAll(students);

  res.status(201).json({ success: true, message: 'Student added successfully!', data: newStudent });
});

// ─────────────────────────────────────────────────────────────
// GET /students → Get all students
// ─────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const students = readAll();
  res.status(200).json({ success: true, count: students.length, data: students });
});

// ─────────────────────────────────────────────────────────────
// GET /students/:id → Get one student
// ─────────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const students = readAll();
  const student  = students.find((s) => s._id === req.params.id);
  if (!student)
    return res.status(404).json({ success: false, message: 'Student not found.' });
  res.status(200).json({ success: true, data: student });
});

// ─────────────────────────────────────────────────────────────
// PUT /students/:id → Update student
// ─────────────────────────────────────────────────────────────
router.put('/:id', (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error });

  const students = readAll();
  const idx      = students.findIndex((s) => s._id === req.params.id);
  if (idx === -1)
    return res.status(404).json({ success: false, message: 'Student not found.' });

  const { name, rollNo, course, marks } = req.body;

  // Duplicate rollNo check (excluding self)
  const duplicate = students.find(
    (s) =>
      s.rollNo.toLowerCase() === String(rollNo).trim().toLowerCase() &&
      s._id !== req.params.id
  );
  if (duplicate)
    return res.status(409).json({ success: false, message: 'Roll number already exists.' });

  students[idx] = {
    ...students[idx],
    name:      String(name).trim(),
    rollNo:    String(rollNo).trim().toUpperCase(),
    course:    String(course).trim(),
    marks:     Number(marks),
    grade:     calcGrade(Number(marks)),
    updatedAt: new Date().toISOString(),
  };

  writeAll(students);
  res.status(200).json({ success: true, message: 'Student updated successfully!', data: students[idx] });
});

// ─────────────────────────────────────────────────────────────
// DELETE /students/:id → Delete student
// ─────────────────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const students = readAll();
  const idx      = students.findIndex((s) => s._id === req.params.id);
  if (idx === -1)
    return res.status(404).json({ success: false, message: 'Student not found.' });

  students.splice(idx, 1);
  writeAll(students);
  res.status(200).json({ success: true, message: 'Student deleted successfully!' });
});

module.exports = router;
