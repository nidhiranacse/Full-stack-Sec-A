const express = require('express');
const studentStore = require('./studentStore');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Handle malformed JSON syntax errors gracefully with 400 { error: "Invalid input" }
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  next();
});

/**
 * POST /students
 * Requirements:
 * - Valid input: respond 201 with { id, name, email, age }.
 *   IDs start at 1 and increase by 1. IDs of deleted students are never reused.
 * - Invalid input: respond 400 with { "error": "Invalid input" }.
 * - Duplicate email: respond 409 with { "error": "Email already exists" }.
 */
app.post('/students', (req, res) => {
  // Validate request body
  if (!studentStore.validateInput(req.body)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const { name, email, age } = req.body;

  // Duplicate email check
  if (studentStore.isDuplicateEmail(email)) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const createdStudent = studentStore.createStudent({ name, email, age });
  return res.status(201).json(createdStudent);
});

/**
 * GET /students
 * Requirements:
 * - Responds 200 with an array of all students in insertion order.
 * - The optional query minAge returns only students with age >= minAge.
 */
app.get('/students', (req, res) => {
  const minAge = req.query.minAge;
  const students = studentStore.getAllStudents(minAge);
  return res.status(200).json(students);
});

/**
 * GET /students/:id
 * Requirements:
 * - Responds 200 with the student, or 404 with { "error": "Student not found" }.
 */
app.get('/students/:id', (req, res) => {
  const student = studentStore.getStudentById(req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  return res.status(200).json(student);
});

/**
 * DELETE /students/:id
 * Requirements:
 * - Responds 204 with an empty body, or 404 with { "error": "Student not found" }.
 */
app.delete('/students/:id', (req, res) => {
  const isDeleted = studentStore.deleteStudentById(req.params.id);
  if (!isDeleted) {
    return res.status(404).json({ error: 'Student not found' });
  }
  return res.status(204).send();
});

// Fallback for root / health check
app.get('/', (req, res) => {
  res.json({
    message: 'Student Records REST API is running',
    endpoints: {
      'POST /students': 'Create student',
      'GET /students': 'List all students (supports ?minAge=)',
      'GET /students/:id': 'Fetch student by ID',
      'DELETE /students/:id': 'Delete student by ID'
    }
  });
});

module.exports = app;
