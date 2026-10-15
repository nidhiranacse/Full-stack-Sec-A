const express = require("express");

const app = express();
app.use(express.json());

// In-memory storage
const students = [];
let nextId = 1; // never decremented, so IDs of deleted students are never reused

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidStudent(body) {
  if (!body || typeof body !== "object") return false;
  const { name, email, age } = body;
  if (typeof name !== "string" || name.trim() === "") return false;
  if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) return false;
  if (typeof age !== "number" || !Number.isInteger(age) || age < 0 || age > 150) return false;
  return true;
}

// POST /students
app.post("/students", (req, res) => {
  if (!isValidStudent(req.body)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const name = req.body.name.trim();
  const email = req.body.email.trim();
  const { age } = req.body;

  const duplicate = students.some(
    (s) => s.email.toLowerCase() === email.toLowerCase()
  );
  if (duplicate) {
    return res.status(409).json({ error: "Email already exists" });
  }

  const student = { id: nextId++, name, email, age };
  students.push(student);
  return res.status(201).json(student);
});

// GET /students?minAge=
app.get("/students", (req, res) => {
  const { minAge } = req.query;

  if (minAge !== undefined) {
    const min = Number(minAge);
    if (typeof minAge !== "string" || minAge.trim() === "" || Number.isNaN(min)) {
      return res.status(400).json({ error: "Invalid input" });
    }
    return res.status(200).json(students.filter((s) => s.age >= min));
  }

  return res.status(200).json(students);
});

// GET /students/:id
app.get("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const student = students.find((s) => s.id === id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }
  return res.status(200).json(student);
});

// DELETE /students/:id
app.delete("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }
  students.splice(index, 1);
  return res.status(204).send();
});

// Malformed JSON body -> 400 Invalid input
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({ error: "Invalid input" });
  }
  return res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
