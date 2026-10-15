const express = require('express');

const app = express();
app.use(express.json());

// In-memory store. nextId only ever increases, so deleted IDs are never reused.
let students = [];
let nextId = 1;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValid(body) {
  if (!body || typeof body !== 'object') return false;
  const { name, email, age } = body;
  if (typeof name !== 'string' || name.trim() === '') return false;
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) return false;
  if (typeof age !== 'number' || !Number.isInteger(age) || age < 1 || age > 120) return false;
  return true;
}

// Create a student
app.post('/students', (req, res) => {
  if (!isValid(req.body)) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const name = req.body.name.trim();
  const email = req.body.email.trim();
  const { age } = req.body;

  const exists = students.some((s) => s.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const student = { id: nextId++, name, email, age };
  students.push(student);
  return res.status(201).json(student);
});

// List students (optional ?minAge=)
app.get('/students', (req, res) => {
  let result = students;
  if (req.query.minAge !== undefined && req.query.minAge !== '') {
    const minAge = Number(req.query.minAge);
    if (!Number.isNaN(minAge)) {
      result = students.filter((s) => s.age >= minAge);
    }
  }
  return res.status(200).json(result);
});

// Fetch one student
app.get('/students/:id', (req, res) => {
  const id = Number(req.params.id);
  const student = students.find((s) => s.id === id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  return res.status(200).json(student);
});

// Delete a student
app.delete('/students/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Student not found' });
  students.splice(index, 1);
  return res.status(204).send();
});

// Malformed JSON body -> 400 Invalid input
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid input' });
  }
  return next(err);
});
app.get('/', (req, res) => {
  res.send('Student Records API is running. Try /students');
});
module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Student API listening on port ${PORT}`));
}
