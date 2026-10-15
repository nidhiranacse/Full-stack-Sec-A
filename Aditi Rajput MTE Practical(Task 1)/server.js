const express = require('express');
const path = require('node:path');

const app = express();
const students = [];
let nextId = 1;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/students', (req, res) => {
  const { name, email, age } = req.body ?? {};
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  const normalizedEmail = typeof email === 'string' ? email.trim() : '';
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  if (!normalizedName || !validEmail || !Number.isInteger(age) || age <= 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  if (students.some((student) => student.email.toLowerCase() === normalizedEmail.toLowerCase())) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const student = { id: nextId++, name: normalizedName, email: normalizedEmail, age };
  students.push(student);
  return res.status(201).json(student);
});

app.get('/students', (req, res) => {
  const minAge = req.query.minAge === undefined ? null : Number(req.query.minAge);
  const result = minAge === null
    ? students
    : students.filter((student) => student.age >= minAge);

  return res.status(200).json(result);
});

app.get('/students/:id', (req, res) => {
  const student = students.find((record) => record.id === Number(req.params.id));
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  return res.status(200).json(student);
});

app.delete('/students/:id', (req, res) => {
  const studentIndex = students.findIndex((record) => record.id === Number(req.params.id));
  if (studentIndex === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }

  students.splice(studentIndex, 1);
  return res.status(204).end();
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  return next(error);
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Student API listening on port ${port}`));
}

module.exports = app;