const express = require("express");
const app = express();
const PORT = 3000;

// Parse JSON bodies
app.use(express.json());

// In-memory storage
let students = [];
let nextId = 1;

// ---------- POST /students ----------
app.post("/students", (req, res) => {
  const { name, email, age } = req.body;

  // Validate input
  if (
    !name || typeof name !== "string" ||
    !email || typeof email !== "string" ||
    age === undefined || typeof age !== "number" || age < 1
  ) {
    return res.status(400).json({ error: "Invalid input" });
  }

  // Check duplicate email
  const duplicate = students.find((s) => s.email === email);
  if (duplicate) {
    return res.status(409).json({ error: "Email already exists" });
  }

  // Create student
  const student = { id: nextId++, name, email, age };
  students.push(student);

  return res.status(201).json(student);
});

// ---------- GET /students ----------
app.get("/students", (req, res) => {
  let result = students;

  // Optional minAge filter
  if (req.query.minAge) {
    const minAge = Number(req.query.minAge);
    result = students.filter((s) => s.age >= minAge);
  }

  return res.status(200).json(result);
});

// ---------- GET /students/:id ----------
app.get("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const student = students.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  return res.status(200).json(student);
});

// ---------- DELETE /students/:id ----------
app.delete("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  students.splice(index, 1);
  return res.status(204).send();
});

// Start server
app.listen(PORT, () => {
  console.log(`Student API running on http://localhost:${PORT}`);
});

module.exports = app;
